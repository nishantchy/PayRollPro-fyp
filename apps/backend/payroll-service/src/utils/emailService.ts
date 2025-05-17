import nodemailer from "nodemailer";
import logger from "./logger";

// Log email configuration on startup
logger.info(
  `Email config check - USER: ${process.env.EMAIL_USER ? "Present" : "Missing"}, PASS: ${process.env.EMAIL_PASS ? "Present" : "Missing"}`
);

// Create a transporter with proper timeout settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verify the connection configuration at startup
transporter.verify((error, success) => {
  if (error) {
    logger.error(`SMTP Connection Error: ${error.message}`);
  } else {
    logger.info("Email server connection verified successfully");
  }
});

/**
 * Send payroll email with PDF attachment
 */
export const sendPayrollEmail = async (
  employeeEmail: string,
  employeeName: string,
  pdfBuffer: Buffer,
  payPeriod: { start_date: Date; end_date: Date },
  month_year?: string
): Promise<any> => {
  // Verify transporter configuration before sending
  try {
    // Validate email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.error("Email credentials not configured");
      throw new Error("Email credentials not configured");
    }

    logger.info(`Preparing to send payroll email to ${employeeEmail}`);
    logger.info(
      `Email recipient validation - Email: "${employeeEmail}", Name: "${employeeName}"`
    );

    // Additional validation
    if (!employeeEmail || employeeEmail.trim() === "") {
      throw new Error("Employee email is empty or invalid");
    }

    // Ensure pdfBuffer is a proper Buffer object and log its status
    const isBuffer = Buffer.isBuffer(pdfBuffer);
    logger.info(
      `PDF buffer check - Is Buffer: ${isBuffer}, Size: ${pdfBuffer ? pdfBuffer.length : "N/A"} bytes`
    );

    const buffer = isBuffer ? pdfBuffer : Buffer.from(pdfBuffer);

    if (buffer.length === 0 || !buffer) {
      throw new Error("PDF buffer is empty or invalid");
    }

    const mailOptions = {
      from: `"PayrollPro" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: month_year
        ? `Payroll Statement - ${month_year}`
        : `Payroll Statement - ${new Date(payPeriod.start_date).toLocaleDateString()} to ${new Date(payPeriod.end_date).toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dpnhdq9eg/image/upload/v1745848583/logo-transparent_pylj5q.png" alt="PayrollPro Logo" style="max-width: 180px; height: auto;">
          </div>
          <h2>Dear ${employeeName},</h2>
          <p style="margin: 15px 0;">Please find attached your payroll statement for ${month_year || `the period ${new Date(payPeriod.start_date).toLocaleDateString()} to ${new Date(payPeriod.end_date).toLocaleDateString()}`}.</p>
          <p style="margin: 15px 0;">If you have any questions regarding your payslip, please contact the HR department.</p>
          <br>
          <p style="margin: 5px 0;">Best regards,</p>
          <p style="margin: 5px 0;"><strong>HR Team</strong></p>
          <p style="margin: 5px 0;">Softified Pvt. Ltd</p>
          <hr style="border: 1px solid #eee; margin-top: 20px;">
          <p style="color: #777; font-size: 12px; text-align: center;">This is an automated email. Please do not reply to this message.</p>
        </div>
      `,
      attachments: [
        {
          filename: `payroll_${month_year || new Date().getTime()}.pdf`,
          content: buffer,
        },
      ],
    };

    logger.info(`Sending email to ${employeeEmail} with attachment`);

    try {
      // Verify SMTP connection
      await transporter.verify();
      logger.info("SMTP connection verified before sending");
    } catch (verifyError: any) {
      logger.error("SMTP verification failed:", verifyError);
      throw new Error(`SMTP verification failed: ${verifyError.message}`);
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully: ${info.messageId}`);
    logger.info(`Email delivery details: ${JSON.stringify(info)}`);

    return info;
  } catch (error) {
    logger.error("Failed to send email:", error);
    logger.error(
      "Error details:",
      error instanceof Error ? error.stack : String(error)
    );
    throw error;
  }
};
