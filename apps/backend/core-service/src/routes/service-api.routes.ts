import express from "express";
import { apiKeyMiddleware } from "../middlewares/api-key.middleware";

// Controllers (will be created later)
import {
  getUserById,
  getOrganizationById,
  getCustomerById,
  validateUserBelongsToOrg,
} from "../controllers/service-api.controller";

const router = express.Router();

// Apply API key middleware to all routes
router.use(apiKeyMiddleware);

// User endpoints
router.get("/users/:userId", getUserById);

// Organization endpoints
router.get("/organization/:organizationId", getOrganizationById);
router.get(
  "/organization/:organizationId/users/:userId",
  validateUserBelongsToOrg
);

// Customer endpoints
router.get("/customer/:customerId", getCustomerById);

export default router;
