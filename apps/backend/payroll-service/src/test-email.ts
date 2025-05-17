import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { sendPayrollEmail } from "./utils/emailService";
import logger from "./utils/logger";

// Load environment variables
dotenv.config();

async function sendTestEmail() {
  try {
    // Create a simple text buffer as a test
    const testBuffer = Buffer.from("This is a test PDF content");

    // Target email - replace with your own for testing
    const targetEmail = process.env.TEST_EMAIL || "test@example.com";

    logger.info("Sending test email...");
    await sendPayrollEmail(
      targetEmail,
      "Test User",
      testBuffer,
      {
        start_date: new Date("2024-04-01"),
        end_date: new Date("2024-04-30"),
      },
      "April 2024"
    );

    logger.info("Test email sent successfully!");
  } catch (error) {
    logger.error("Failed to send test email:", error);
  }
}

// Execute the test
sendTestEmail().then(() => {
  logger.info("Email test completed");
});
