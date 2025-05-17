import nodemailer from "nodemailer";
import { formatMonthYear } from "../utils/dateUtils";
import config from "../config/config";

// Create reusable transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send payroll email with PDF attachment
 */
export const sendPayrollEmail = async (
  recipientEmail: string,
  recipientName: string,
  pdfBuffer: Buffer,
  payPeriod: { start_date: Date; end_date: Date },
  monthYear?: string,
  organizationName?: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    // Format the month and year for the subject line
    const periodDisplay =
      monthYear || formatMonthYear(new Date(payPeriod.start_date));
    const orgName = organizationName || "Your Company";

    // Prepare email
    const mailOptions = {
      from: `"${orgName} Payroll" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your Payslip for ${periodDisplay}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Payslip for ${periodDisplay}</h2>
          
          <p>Hello ${recipientName},</p>
          
          <p>Please find attached your payslip for the period ${periodDisplay}.</p>
          
          <p>The document contains a detailed breakdown of your earnings and deductions for this pay period.</p>
          
          <p>If you have any questions regarding your payslip, please contact your HR department.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Payslip_${recipientName.replace(/\s+/g, "_")}_${periodDisplay.replace(/\s+/g, "_")}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Payroll email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending payroll email:", error);
    throw new Error(
      `Failed to send payroll email: ${(error as Error).message}`
    );
  }
};
