import { Request, Response } from "express";
import PayrollModel from "../models/payroll.model";
import { getUserById, getOrganizationById } from "../services/core.service";
import { generatePayrollPDF } from "../utils/pdfGenerator";
import { sendPayrollEmail } from "../utils/emailService";
import logger from "../utils/logger";
import axios from "axios";
import numberToWords from "../utils/numberToWords";
import { formatDate } from "../utils/dateUtils";

/**
 * Create a new payroll
 * @route POST /api/payroll
 * @access Private
 */
export const createPayroll = async (req: Request, res: Response) => {
  try {
    // Check for authenticated user
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not authenticated" });
    }

    logger.info("Creating payroll record", {
      user_id: req.body.user_id,
      organization_id: req.body.organization_id,
      requestUser: req.user,
    });

    // Extract data from request
    const {
      user_id,
      organization_id,
      pay_period,
      paid_days,
      loss_of_pay_days,
      pay_date,
      earnings,
      deductions,
      notes,
      send_email = true, // Default to true - already set but reinforcing
    } = req.body;

    // Validate required fields
    if (!user_id || !organization_id || !pay_period || !pay_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get authenticated user as generator
    const generated_by = req.user.id;

    // Extract customer_id from token based on user role
    let customer_id;

    if (req.user.role === "customer") {
      // If user role is 'customer', the id itself is the customer_id
      customer_id = req.user.id;
      logger.info(
        `Using customer_id from token (user is customer): ${customer_id}`
      );
    } else if (req.user.role === "admin" || req.user.role === "super-admin") {
      // For admin users, prefer customer_id from request body
      customer_id = req.body.customer_id;
      if (!customer_id) {
        logger.warn(
          `Admin user without customer_id in request, using organization_id as fallback`
        );
        customer_id = organization_id;
      } else {
        logger.info(
          `Admin user using customer_id from request: ${customer_id}`
        );
      }
    } else if (req.body.customer_id) {
      // Fallback to request body if provided
      customer_id = req.body.customer_id;
      logger.info(`Using customer_id from request body: ${customer_id}`);
    } else {
      // Last resort fallback to organization_id (not ideal but maintains backward compatibility)
      customer_id = organization_id;
      logger.warn(
        `No customer_id found in token or request, using organization_id as fallback: ${customer_id}`
      );
    }

    // Check if a payroll already exists for this user and pay period
    const existingPayroll = await PayrollModel.findOne({
      user_id,
      "pay_period.start_date": new Date(pay_period.start_date),
      "pay_period.end_date": new Date(pay_period.end_date),
    });

    if (existingPayroll) {
      return res.status(409).json({
        message: "A payroll already exists for this employee and pay period",
        payroll: existingPayroll,
      });
    }

    // Calculate totals
    const gross_earnings = earnings.reduce(
      (total: number, item: any) => total + item.amount,
      0
    );
    const total_deductions = deductions.reduce(
      (total: number, item: any) => total + item.amount,
      0
    );
    const net_payable = gross_earnings - total_deductions;

    // Convert amount to words
    const amount_in_words = numberToWords(net_payable);

    // Create the month year string
    const payDate = new Date(pay_date);
    const month_year = `${payDate.toLocaleString("default", { month: "long" })} ${payDate.getFullYear()}`;

    // Fetch employee data - log everything to debug any issues
    let employeeData;
    try {
      logger.info(`Attempting to fetch user data for ID: ${user_id}`);
      employeeData = await getUserById(user_id);

      // Enhanced debugging to check exactly what data we're getting
      logger.info(`Raw user data received: ${JSON.stringify(employeeData)}`);

      // Check if the required employee fields exist
      const hasName = employeeData.first_name && employeeData.last_name;
      const hasEmail = !!employeeData.email;

      logger.info(
        `Employee data analysis - Has name: ${hasName}, Has email: ${hasEmail}, Email: ${employeeData.email || "MISSING"}`
      );

      // If name fields are missing, try to get them from other properties
      if (!hasName && employeeData.name) {
        // Some APIs return a single 'name' field instead of first_name/last_name
        const nameParts = employeeData.name.split(" ");
        employeeData.first_name = nameParts[0] || "Employee";
        employeeData.last_name = nameParts.slice(1).join(" ") || "";
        logger.info(
          `Extracted name from 'name' field: ${employeeData.first_name} ${employeeData.last_name}`
        );
      }

      // Check if we have an email
      if (!employeeData.email) {
        logger.warn(
          `User ${user_id} does not have an email address in the returned data`
        );

        // Check if email might be in another property
        if (employeeData.contact && employeeData.contact.email) {
          employeeData.email = employeeData.contact.email;
          logger.info(`Found email in nested property: ${employeeData.email}`);
        }
      } else {
        logger.info(`User ${user_id} has email: ${employeeData.email}`);
      }
    } catch (err) {
      logger.error(`Failed to fetch user data: ${err}`);
      // Default employee data for testing if needed
      employeeData = {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com", // You can replace with your test email
        employee_id: user_id,
      };
      logger.info(
        `Using fallback employee data: ${JSON.stringify(employeeData)}`
      );
    }

    // Fetch organization data
    let organizationData;
    try {
      organizationData = await getOrganizationById(organization_id);
      logger.info(
        `Successfully fetched organization data for ID: ${organization_id}`
      );
    } catch (err) {
      logger.error(`Failed to fetch organization data: ${err}`);
      // Default org data for testing
      organizationData = {
        name: "Test Organization",
        logo: "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1738649505/logo_lvrzl1.png",
        phone: "(+977) 9818984104",
        email: "contact@softified.com.np",
        website: "www.softified.com.np",
        address: "Tokha 5, Basundhara, Kathmandu",
        signature:
          "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297337/signature_ihdroh.png",
        signatory_name: "Aayush Raj Joshi",
      };
      logger.info(`Using fallback organization data`);
    }

    // Prepare the payroll data
    const payrollData = {
      user_id,
      organization_id,
      customer_id,
      pay_period,
      paid_days,
      loss_of_pay_days,
      pay_date,
      earnings,
      deductions,
      gross_earnings,
      total_deductions,
      net_payable,
      amount_in_words,
      month_year,
      notes,
      generated_by,
      email_sent: false,
    };

    // Create the payroll record
    const payroll = await PayrollModel.create(payrollData);
    logger.info(`Created payroll record with ID: ${payroll._id}`);

    // Variables to track email status
    let emailSent = false;
    let emailError = null;

    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generatePayrollPDF({
        month: payroll.month_year || "Payroll Statement",
        staffName: `${employeeData.first_name} ${employeeData.last_name}`,
        staffId: employeeData.employee_id || String(payroll.user_id),
        payPeriod: {
          start: formatDate(new Date(pay_period.start_date)),
          end: formatDate(new Date(pay_period.end_date)),
        },
        paidDays: paid_days,
        lossOfPayDays: loss_of_pay_days,
        payDate: formatDate(new Date(pay_date)),
        earnings: earnings.map((item: any) => ({
          earning_type: item.earning_type,
          amount: item.amount,
        })),
        deductions: deductions.map((item: any) => ({
          deduction_type: item.deduction_type,
          amount: item.amount,
        })),
        grossEarnings: gross_earnings,
        totalDeductions: total_deductions,
        netPayable: net_payable,
        amountInWords: amount_in_words,
        notes: notes || "",
        organization: {
          name: organizationData.name,
          logo:
            organizationData.logo ||
            "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1738649505/logo_lvrzl1.png",
          phone: organizationData.phone || "(+977) 9818984104",
          email: organizationData.email || "contact@softified.com.np",
          website: organizationData.website || "www.softified.com.np",
          address: organizationData.address || "Tokha 5, Basundhara, Kathmandu",
          signature:
            organizationData.signature ||
            "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297337/signature_ihdroh.png",
          signatureName: organizationData.signatory_name || "Aayush Raj Joshi",
        },
      });

      logger.info("Successfully generated PDF");

      // Save PDF path to payroll record if successful
      const pdfFilename = `payroll_${payroll._id}.pdf`;
      payroll.set("pdf_path", pdfFilename);
      await payroll.save();
    } catch (pdfError) {
      logger.error("Failed to generate PDF:", pdfError);
      // Continue with the payroll creation, but note the PDF error
    }

    // Send email if requested and credentials are available
    if (send_email && employeeData && employeeData.email) {
      try {
        logger.info(`Attempting to send email to ${employeeData.email}`);

        // Check if email credentials exist
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          throw new Error(
            "EMAIL_USER or EMAIL_PASS environment variables are not set"
          );
        }

        if (!pdfBuffer) {
          logger.info(
            "No PDF buffer available for email, re-generating PDF for email"
          );
          // Try to regenerate the PDF specifically for the email
          pdfBuffer = await generatePayrollPDF({
            month: payroll.month_year || "Payroll Statement",
            staffName: `${employeeData.first_name} ${employeeData.last_name}`,
            staffId: employeeData.employee_id || String(payroll.user_id),
            payPeriod: {
              start: formatDate(new Date(pay_period.start_date)),
              end: formatDate(new Date(pay_period.end_date)),
            },
            paidDays: paid_days,
            lossOfPayDays: loss_of_pay_days,
            payDate: formatDate(new Date(pay_date)),
            earnings: earnings.map((item: any) => ({
              earning_type: item.earning_type,
              amount: item.amount,
            })),
            deductions: deductions.map((item: any) => ({
              deduction_type: item.deduction_type,
              amount: item.amount,
            })),
            grossEarnings: gross_earnings,
            totalDeductions: total_deductions,
            netPayable: net_payable,
            amountInWords: amount_in_words,
            notes: notes || "",
            organization: {
              name: organizationData.name,
              logo:
                organizationData.logo ||
                "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1738649505/logo_lvrzl1.png",
              phone: organizationData.phone || "(+977) 9818984104",
              email: organizationData.email || "contact@softified.com.np",
              website: organizationData.website || "www.softified.com.np",
              address:
                organizationData.address || "Tokha 5, Basundhara, Kathmandu",
              signature:
                organizationData.signature ||
                "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297337/signature_ihdroh.png",
              signatureName:
                organizationData.signatory_name || "Aayush Raj Joshi",
            },
          });
        }

        if (pdfBuffer) {
          // Send email with the PDF attachment
          await sendPayrollEmail(
            employeeData.email,
            `${employeeData.first_name} ${employeeData.last_name}`,
            Buffer.from(pdfBuffer),
            {
              start_date: new Date(pay_period.start_date),
              end_date: new Date(pay_period.end_date),
            },
            payroll.month_year
          );

          // Update payroll record to indicate email was sent
          payroll.set("email_sent", true);
          payroll.set("email_sent_at", new Date());
          await payroll.save();

          logger.info(
            `Payroll email sent successfully to ${employeeData.email}`
          );
          emailSent = true;
        } else {
          throw new Error("No PDF available for email attachment");
        }
      } catch (error) {
        logger.error("Failed to send payroll email:", error);
        emailError = error instanceof Error ? error.message : String(error);

        // Don't fail the whole operation because of email failure
        logger.info("Continuing with payroll creation despite email failure");
      }
    } else {
      if (!send_email) {
        logger.info("Email sending skipped (send_email=false)");
      } else if (!employeeData?.email) {
        logger.warn("Email not sent: Employee has no email address");
      } else {
        logger.warn(
          `Email not sent: Unknown reason. send_email=${send_email}, employeeData.email=${employeeData?.email || "undefined"}`
        );
      }
    }

    // Return success response with email status
    return res.status(201).json({
      message: emailSent
        ? "Payroll created successfully and email sent"
        : "Payroll created successfully",
      data: payroll,
      emailSent,
      emailError: emailError || undefined,
    });
  } catch (error) {
    logger.error("Error creating payroll:", error);
    return res.status(500).json({
      message: "Failed to create payroll",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get all payrolls with filtering options
 * @route GET /api/payroll
 * @access Private
 */
export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      organization_id,
      month_year,
      start_date,
      end_date,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query filter
    const filter: any = {};

    if (user_id) filter.user_id = user_id;
    if (organization_id) filter.organization_id = organization_id;
    if (month_year) filter.month_year = month_year;

    // Date range filtering
    if (start_date || end_date) {
      filter.pay_date = {};
      if (start_date) filter.pay_date.$gte = new Date(start_date as string);
      if (end_date) filter.pay_date.$lte = new Date(end_date as string);
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await PayrollModel.countDocuments(filter);

    // Fetch payrolls
    const payrolls = await PayrollModel.find(filter)
      .sort({ pay_date: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Return payrolls with pagination info
    return res.status(200).json({
      message: "Payrolls retrieved successfully",
      data: payrolls,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error retrieving payrolls:", error);
    return res.status(500).json({
      message: "Failed to retrieve payrolls",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get a single payroll by ID
 * @route GET /api/payroll/:id
 * @access Private
 */
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find payroll by ID
    const payroll = await PayrollModel.findById(id);

    // Check if payroll exists
    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    // Return payroll data
    return res.status(200).json({
      message: "Payroll retrieved successfully",
      data: payroll,
    });
  } catch (error) {
    logger.error("Error retrieving payroll:", error);
    return res.status(500).json({
      message: "Failed to retrieve payroll",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Download a payroll PDF
 * @route GET /api/payroll/:id/download
 * @access Private
 */
export const downloadPayrollPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find payroll by ID
    const payroll = await PayrollModel.findById(id);

    // Check if payroll exists
    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    // Get the API key from request header
    const apiKey = req.headers["x-api-key"] as string;

    // Fetch employee data
    const employeeData = await fetchUserData(String(payroll.user_id));

    // Fetch organization data
    const organizationData = await fetchOrganizationData(
      String(payroll.organization_id)
    );

    // Generate PDF
    const pdfBuffer = await generatePayrollPDF({
      month: payroll.month_year || "Payroll Statement",
      staffName: `${employeeData.first_name} ${employeeData.last_name}`,
      staffId: employeeData.employee_id || String(payroll.user_id),
      payPeriod: {
        start: formatDate(new Date(payroll.pay_period.start_date)),
        end: formatDate(new Date(payroll.pay_period.end_date)),
      },
      paidDays: payroll.paid_days,
      lossOfPayDays: payroll.loss_of_pay_days,
      payDate: formatDate(new Date(payroll.pay_date)),
      earnings: payroll.earnings.map((item: any) => ({
        earning_type: item.earning_type,
        amount: item.amount,
      })),
      deductions: payroll.deductions.map((item: any) => ({
        deduction_type: item.deduction_type,
        amount: item.amount,
      })),
      grossEarnings: payroll.gross_earnings,
      totalDeductions: payroll.total_deductions,
      netPayable: payroll.net_payable,
      amountInWords: payroll.amount_in_words,
      notes: payroll.notes || "",
      organization: {
        name: organizationData.name,
        logo:
          organizationData.logo ||
          "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1738649505/logo_lvrzl1.png",
        phone: organizationData.phone || "(+977) 9818984104",
        email: organizationData.email || "contact@softified.com.np",
        website: organizationData.website || "www.softified.com.np",
        address: organizationData.address || "Tokha 5, Basundhara, Kathmandu",
        signature:
          organizationData.signature ||
          "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297337/signature_ihdroh.png",
        signatureName: organizationData.signatory_name || "Aayush Raj Joshi",
      },
    });

    // Set response headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payroll_${id}.pdf`
    );

    // Send the PDF buffer
    return res.send(pdfBuffer);
  } catch (error) {
    logger.error("Error downloading payroll PDF:", error);
    return res.status(500).json({
      message: "Failed to download payroll PDF",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Send payroll email by ID
 * @route POST /api/payroll/:id/send-email
 * @access Private
 */
export const sendPayrollEmailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find payroll by ID
    const payroll = await PayrollModel.findById(id);

    // Check if payroll exists
    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    // Get the API key from request header
    const apiKey = req.headers["x-api-key"] as string;

    // Fetch employee data
    const employeeData = await fetchUserData(String(payroll.user_id));

    // Check if employee has an email
    if (!employeeData.email) {
      return res.status(400).json({
        message: "Employee does not have an email address",
      });
    }

    // Fetch organization data
    const organizationData = await fetchOrganizationData(
      String(payroll.organization_id)
    );

    // Generate PDF
    const pdfBuffer = await generatePayrollPDF({
      month: payroll.month_year || "Payroll Statement",
      staffName: `${employeeData.first_name} ${employeeData.last_name}`,
      staffId: employeeData.employee_id || String(payroll.user_id),
      payPeriod: {
        start: formatDate(new Date(payroll.pay_period.start_date)),
        end: formatDate(new Date(payroll.pay_period.end_date)),
      },
      paidDays: payroll.paid_days,
      lossOfPayDays: payroll.loss_of_pay_days,
      payDate: formatDate(new Date(payroll.pay_date)),
      earnings: payroll.earnings.map((item: any) => ({
        earning_type: item.earning_type,
        amount: item.amount,
      })),
      deductions: payroll.deductions.map((item: any) => ({
        deduction_type: item.deduction_type,
        amount: item.amount,
      })),
      grossEarnings: payroll.gross_earnings,
      totalDeductions: payroll.total_deductions,
      netPayable: payroll.net_payable,
      amountInWords: payroll.amount_in_words,
      notes: payroll.notes || "",
      organization: {
        name: organizationData.name,
        logo:
          organizationData.logo ||
          "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1738649505/logo_lvrzl1.png",
        phone: organizationData.phone || "(+977) 9818984104",
        email: organizationData.email || "contact@softified.com.np",
        website: organizationData.website || "www.softified.com.np",
        address: organizationData.address || "Tokha 5, Basundhara, Kathmandu",
        signature:
          organizationData.signature ||
          "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297337/signature_ihdroh.png",
        signatureName: organizationData.signatory_name || "Aayush Raj Joshi",
      },
    });

    // Send email
    await sendPayrollEmail(
      employeeData.email,
      `${employeeData.first_name} ${employeeData.last_name}`,
      Buffer.from(pdfBuffer),
      {
        start_date: new Date(payroll.pay_period.start_date),
        end_date: new Date(payroll.pay_period.end_date),
      },
      payroll.month_year
    );

    // Update payroll record
    payroll.set("email_sent", true);
    payroll.set("email_sent_at", new Date());
    await payroll.save();

    // Return success response
    return res.status(200).json({
      message: "Payroll email sent successfully",
      data: {
        email_sent: true,
        email_sent_at: payroll.email_sent_at,
      },
    });
  } catch (error) {
    logger.error("Error sending payroll email:", error);
    return res.status(500).json({
      message: "Failed to send payroll email",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Update a payroll
 * @route PUT /api/payroll/:id
 * @access Private
 */
export const updatePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find payroll by ID
    const payroll = await PayrollModel.findById(id);

    // Check if payroll exists
    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    // If earnings or deductions are updated, recalculate totals
    if (updates.earnings || updates.deductions) {
      const earnings = updates.earnings || payroll.earnings;
      const deductions = updates.deductions || payroll.deductions;

      updates.gross_earnings = earnings.reduce(
        (total: number, item: any) => total + item.amount,
        0
      );
      updates.total_deductions = deductions.reduce(
        (total: number, item: any) => total + item.amount,
        0
      );
      updates.net_payable = updates.gross_earnings - updates.total_deductions;

      // Update amount in words if net payable changed
      updates.amount_in_words = numberToWords(updates.net_payable);
    }

    // Update month_year if pay_date changed
    if (updates.pay_date) {
      const payDate = new Date(updates.pay_date);
      updates.month_year = `${payDate.toLocaleString("default", { month: "long" })} ${payDate.getFullYear()}`;
    }

    // Update payroll
    const updatedPayroll = await PayrollModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    // Return updated payroll
    return res.status(200).json({
      message: "Payroll updated successfully",
      data: updatedPayroll,
    });
  } catch (error) {
    logger.error("Error updating payroll:", error);
    return res.status(500).json({
      message: "Failed to update payroll",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Delete a payroll
 * @route DELETE /api/payroll/:id
 * @access Private
 */
export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find and delete payroll
    const deletedPayroll = await PayrollModel.findByIdAndDelete(id);

    // Check if payroll existed
    if (!deletedPayroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    // Return success response
    return res.status(200).json({
      message: "Payroll deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting payroll:", error);
    return res.status(500).json({
      message: "Failed to delete payroll",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Helper to fetch user data
const fetchUserData = async (userId: string) => {
  try {
    // Use the service function instead of direct axios call
    const response = await getUserById(userId);
    return response;
  } catch (error) {
    logger.error("Error fetching user data:", error);
    throw new Error(
      `Failed to fetch user data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Helper to fetch organization data
const fetchOrganizationData = async (orgId: string) => {
  try {
    // Use the service function instead of direct axios call
    const response = await getOrganizationById(orgId);
    return response;
  } catch (error) {
    logger.error("Error fetching organization data:", error);
    throw new Error(
      `Failed to fetch organization data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
