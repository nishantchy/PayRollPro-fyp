/**
 * Manual test script for testing core service connections
 * Run with ts-node: npx ts-node src/tests/core-service-test.ts
 */

import coreService from "../services/core.service";
import logger from "../utils/logger";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Log core service configuration
logger.info("Core Service Configuration:");
logger.info(`URL: ${process.env.CORE_SERVICE_URL}`);
logger.info(
  `API Key Present: ${process.env.CORE_SERVICE_API_KEY ? "Yes" : "No"}`
);

async function testCoreServiceConnection() {
  try {
    logger.info("Starting core service connection test...");

    // Test customer endpoint with valid MongoDB ObjectId format
    try {
      // Valid MongoDB ObjectId format (24-character hex string)
      const testCustomerId = "507f1f77bcf86cd799439011";
      logger.info("Testing getCustomerById...");
      const customerData = await coreService.getCustomerById(testCustomerId);
      logger.info("Success! Customer data:", customerData);
    } catch (error: any) {
      logger.error(`Customer test failed: ${error.message}`);
    }

    // Test user endpoint with valid MongoDB ObjectId format
    try {
      const testUserId = "507f191e810c19729de860ea";
      logger.info("Testing getUserById...");
      const userData = await coreService.getUserById(testUserId);
      logger.info("Success! User data:", userData);
    } catch (error: any) {
      logger.error(`User test failed: ${error.message}`);
    }

    // Test organization endpoint with valid MongoDB ObjectId format
    try {
      const testOrgId = "507f191e810c19729de860eb";
      logger.info("Testing getOrganizationById...");
      const orgData = await coreService.getOrganizationById(testOrgId);
      logger.info("Success! Organization data:", orgData);
    } catch (error: any) {
      logger.error(`Organization test failed: ${error.message}`);
    }

    logger.info("Core service tests completed.");
  } catch (error: any) {
    logger.error(`Overall test failed: ${error.message}`);
  }
}

// Run the test
testCoreServiceConnection().then(() => {
  logger.info("Test script execution completed");
});
