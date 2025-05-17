import { Request, Response } from "express";
import axios from "axios";
import config from "../config/config";
import logger from "../utils/logger";
import { getCustomerById } from "../services/core.service";
import coreService from "../services/core.service";
import jwt from "jsonwebtoken";
import { sendPayrollEmail } from "../utils/emailService";
import { generatePayrollPDF } from "../utils/pdfGenerator";
import { formatDate } from "../utils/dateUtils";

// Create an axios instance with the API key from config
const coreServiceClient = axios.create({
  baseURL: config.coreServiceUrl,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": config.coreServiceApiKey,
  },
});

/**
 * Test API connection to core service by fetching a user
 */
export const testGetUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    logger.info(
      `Testing core service connection - getting user with ID: ${userId}`
    );

    // Attempt to fetch the user from the core service
    const userData = await coreService.getUserById(userId);

    // Log success
    logger.info(
      `Successfully retrieved user data from core service for user: ${userId}`
    );

    // Return success response with user data
    return res.status(200).json({
      success: true,
      message: "Successfully connected to core service and retrieved user data",
      data: userData,
    });
  } catch (error: any) {
    // Log the error
    logger.error(
      `Error in test controller while getting user: ${error.message}`
    );

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Failed to connect to core service",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Test API connection to core service by fetching a customer
 */
export const testGetCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.customerId;

    logger.info(
      `Testing core service connection - getting customer with ID: ${customerId}`
    );

    // Attempt to fetch the customer from the core service
    const customerData = await coreService.getCustomerById(customerId);

    // Log success
    logger.info(
      `Successfully retrieved customer data from core service for customer: ${customerId}`
    );

    // Return success response with customer data
    return res.status(200).json({
      success: true,
      message:
        "Successfully connected to core service and retrieved customer data",
      data: customerData,
    });
  } catch (error: any) {
    // Log the error
    logger.error(
      `Error in test controller while getting customer: ${error.message}`
    );

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Failed to connect to core service",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Test API connection to core service by fetching an organization
 */
export const testGetOrganization = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId;

    logger.info(
      `Testing core service connection - getting organization with ID: ${orgId}`
    );

    // Attempt to fetch the organization from the core service
    const organizationData = await coreService.getOrganizationById(orgId);

    // Log success
    logger.info(
      `Successfully retrieved organization data from core service for organization: ${orgId}`
    );

    // Return success response with organization data
    return res.status(200).json({
      success: true,
      message:
        "Successfully connected to core service and retrieved organization data",
      data: organizationData,
    });
  } catch (error: any) {
    // Log the error
    logger.error(
      `Error in test controller while getting organization: ${error.message}`
    );

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Failed to connect to core service",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Test core service connection with detailed diagnostics
 */
export const testCoreServiceConnection = async (
  req: Request,
  res: Response
) => {
  try {
    // Use a valid MongoDB ObjectId format for testing
    // MongoDB ObjectIds must be 24-character hex strings
    const customerId = req.params.customerId || "507f1f77bcf86cd799439011";

    logger.info(`Testing core service connection with diagnostics`);
    logger.info(`Core service URL: ${config.coreServiceUrl}`);
    logger.info(
      `Core service API key present: ${config.coreServiceApiKey ? "Yes" : "No"}`
    );

    // Try to get customer data as a test
    try {
      const customerData = await coreService.getCustomerById(customerId);
      return res.status(200).json({
        success: true,
        message: "Successfully connected to core service",
        connectionDetails: {
          coreServiceUrl: config.coreServiceUrl,
          apiKeyPresent: !!config.coreServiceApiKey,
        },
        testResult: {
          customerId,
          dataRetrieved: true,
          customerData,
        },
      });
    } catch (error: any) {
      // If we get a specific error about the customer not found, that actually means
      // the connection worked, but the customer ID was invalid
      if (error.message.includes("not found")) {
        return res.status(200).json({
          success: true,
          message:
            "Successfully connected to core service, but customer ID was not found",
          connectionDetails: {
            coreServiceUrl: config.coreServiceUrl,
            apiKeyPresent: !!config.coreServiceApiKey,
          },
          testResult: {
            customerId,
            dataRetrieved: false,
            error: error.message,
          },
        });
      }

      // If authentication failed, that's a different problem
      if (error.message.includes("Authentication failed")) {
        return res.status(401).json({
          success: false,
          message:
            "Connection to core service failed due to authentication issues",
          connectionDetails: {
            coreServiceUrl: config.coreServiceUrl,
            apiKeyPresent: !!config.coreServiceApiKey,
          },
          testResult: {
            error: "API key authentication failed",
          },
        });
      }

      // For other errors, return detailed error information
      throw error;
    }
  } catch (error: any) {
    // Log the error
    logger.error(`Error testing core service connection: ${error.message}`);

    // Return detailed error response
    return res.status(500).json({
      success: false,
      message: "Failed to connect to core service",
      connectionDetails: {
        coreServiceUrl: config.coreServiceUrl,
        apiKeyPresent: !!config.coreServiceApiKey,
      },
      error: error.message,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Test extracting customer ID from JWT token and fetching customer data
 */
export const testTokenCustomer = async (req: Request, res: Response) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or invalid",
        error:
          "Please provide a valid Bearer token in the Authorization header",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    logger.info(`Testing JWT token validation and customer fetch`);

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, config.jwtSecret) as any;

      // Log the decoded token for debugging
      logger.info(`Decoded token: ${JSON.stringify(decoded)}`);

      // Extract customer ID from token payload based on role
      let customerId;

      if (decoded.role === "customer") {
        // If role is 'customer', the id itself is the customer ID
        customerId = decoded.id;
        logger.info(
          `Using id as customer_id because role is 'customer': ${customerId}`
        );
      } else {
        // Otherwise look for explicit customer_id field or fallback to other options
        customerId = decoded.customer_id || decoded.customerId || decoded.sub;
      }

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "Token does not contain customer ID",
          decodedToken: decoded,
        });
      }

      // Fetch the customer data using the ID from the token
      const customerData = await coreService.getCustomerById(customerId);

      return res.status(200).json({
        success: true,
        message:
          "Successfully extracted customer ID from token and fetched data",
        tokenInfo: {
          customerId,
          role: decoded.role,
          tokenIssuer: decoded.iss,
          tokenSubject: decoded.sub,
          tokenExpiration: new Date(decoded.exp * 1000).toISOString(),
          tokenIssuedAt: new Date(decoded.iat * 1000).toISOString(),
        },
        customerData,
      });
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
          error: error.message,
        });
      } else if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
          error: `Token expired at ${error.expiredAt}`,
        });
      } else if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Customer ID from token is valid, but customer not found",
          error: error.message,
        });
      }

      throw error;
    }
  } catch (error: any) {
    logger.error(`Error testing token customer fetch: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Failed to test token customer fetch",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Test email sending functionality
 */
export const testSendEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    logger.info(`Testing email sending to ${email}`);

    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email configuration is missing",
        details: "EMAIL_USER or EMAIL_PASS environment variables are not set",
      });
    }

    // Generate a test PDF
    try {
      const testData = {
        month: "Test Month 2024",
        staffName: "Test Employee",
        staffId: "EMP001",
        payPeriod: {
          start: "01/01/2024",
          end: "31/01/2024",
        },
        paidDays: 31,
        lossOfPayDays: 0,
        payDate: "01/02/2024",
        earnings: [
          { earning_type: "Basic Salary", amount: 50000 },
          { earning_type: "HRA", amount: 10000 },
        ],
        deductions: [
          { deduction_type: "Income Tax", amount: 5000 },
          { deduction_type: "PF", amount: 2000 },
        ],
        grossEarnings: 60000,
        totalDeductions: 7000,
        netPayable: 53000,
        amountInWords: "Fifty-Three Thousand Only",
        notes: "This is a test email. Please ignore.",
        organization: {
          name: "Test Organization",
          logo: "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1738649505/logo_lvrzl1.png",
          phone: "(+977) 9818984104",
          email: "contact@softified.com.np",
          website: "www.softified.com.np",
          address: "Tokha 5, Basundhara, Kathmandu",
          signature:
            "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297337/signature_ihdroh.png",
          signatory_name: "Test Signatory",
        },
      };

      // Generate PDF
      const pdfBuffer = await generatePayrollPDF(testData);

      // Send test email
      const emailResult = await sendPayrollEmail(
        email,
        "Test Recipient",
        pdfBuffer,
        {
          start_date: new Date("2024-01-01"),
          end_date: new Date("2024-01-31"),
        },
        "Test Period"
      );

      return res.status(200).json({
        success: true,
        message: "Test email sent successfully",
        emailDetails: {
          messageId: emailResult.messageId,
          recipient: email,
          sentAt: new Date(),
        },
      });
    } catch (pdfError) {
      logger.error("Error generating PDF for test email:", pdfError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF for test email",
        error: pdfError instanceof Error ? pdfError.message : String(pdfError),
      });
    }
  } catch (error) {
    logger.error("Error sending test email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default {
  testGetUser,
  testGetCustomer,
  testGetOrganization,
  testCoreServiceConnection,
  testTokenCustomer,
  testSendEmail,
};
