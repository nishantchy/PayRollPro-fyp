import express from "express";
import * as orgUserController from "../controllers/org-user.controller";
import verifyToken from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/file.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { asyncHandler } from "../utils/route-utils";

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Organization user routes - grouped by organization for frontend convenience

// Get all users for an organization
router.get(
  "/organization/:org_id",
  asyncHandler(orgUserController.getOrgUsers)
);

// Create a user for an organization - org_id will be in the URL
router.post(
  "/organization/:org_id",
  uploadImage.single("photo"),
  asyncHandler((req, res) => {
    // Set org_id from URL parameter
    req.body.org_id = req.params.org_id;
    return orgUserController.createOrgUser(req, res);
  })
);

// Individual user operations
router.get("/:id", asyncHandler(orgUserController.getOrgUserById));

router.put(
  "/:id",
  uploadImage.single("photo"),
  asyncHandler(orgUserController.updateOrgUser)
);

router.delete("/:id", asyncHandler(orgUserController.deleteOrgUser));

// Admin routes - require admin privileges
router.get(
  "/admin/all",
  isAdmin,
  asyncHandler(orgUserController.getAllOrgUsers)
);

export default router;
