import express from "express";
import testController from "../controllers/test.controller";

const router = express.Router();

// Test endpoints for core service communication
router.get("/connection", testController.testCoreServiceConnection);
router.get("/user/:userId", testController.testGetUser);
router.get("/customer/:customerId", testController.testGetCustomer);
router.get("/organization/:orgId", testController.testGetOrganization);

// Token-based test endpoint
router.get("/token-customer", testController.testTokenCustomer);

// Email test endpoint
router.post("/email", testController.testSendEmail);

export default router;
