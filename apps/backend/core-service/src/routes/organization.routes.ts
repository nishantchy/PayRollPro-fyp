import express from "express";
import * as organizationController from "../controllers/organization.controller";
import verifyToken from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/file.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { asyncHandler } from "../utils/route-utils";

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Customer organization routes
router.post(
  "/",
  uploadImage.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  asyncHandler(organizationController.createOrganization)
);

router.get("/", asyncHandler(organizationController.getOrganizations));
router.get("/:id", asyncHandler(organizationController.getOrganizationById));

router.put(
  "/:id",
  uploadImage.fields([
    { name: "logo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  asyncHandler(organizationController.updateOrganization)
);

router.delete("/:id", asyncHandler(organizationController.deleteOrganization));

// Admin routes - require admin privileges
router.get(
  "/admin/all",
  isAdmin,
  asyncHandler(organizationController.getAllOrganizations)
);

export default router;
