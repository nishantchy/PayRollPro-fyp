import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  googleLogin,
  googleRegister,
  updateOnboardingStatus,
} from "../controllers/customer.controller";
import verifyToken from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/file.middleware";
import { isAdmin, isAdminOrSelf } from "../middlewares/admin.middleware";

const router = express.Router();

// Public routes
router.post("/register", registerCustomer);
router.post("/google-register", googleRegister);
router.post("/login", loginCustomer);
router.post("/google-login", googleLogin);

// Protected routes
router.use(verifyToken);

// Get all customers - only for admin users
router.get("/", isAdmin, getAllCustomers);

// Get single customer - only for admins or the customer themselves
router.get("/:id", isAdminOrSelf, getCustomer);

// Update customer - only for admins or the customer themselves
router.put("/:id", isAdminOrSelf, uploadImage.single("photo"), updateCustomer);

// Update onboarding status - only for the customer themselves
router.patch("/:id/onboarding", isAdminOrSelf, updateOnboardingStatus);

// Delete customer - only for admins or the customer themselves
router.delete("/:id", isAdminOrSelf, deleteCustomer);

export default router;
