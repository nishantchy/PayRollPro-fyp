import { Request, Response } from "express";
import OrgUser from "../models/org.user.model";
import Organization from "../models/organization.model";
import Customer from "../models/customer.model";

/**
 * Get user by ID
 * @route GET /api/service/users/:userId
 * @access Private (API Key)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await OrgUser.findById(req.params.userId)
      .select("-password -refreshToken")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: (error as Error).message,
    });
  }
};

/**
 * Get organization by ID
 * @route GET /api/service/organization/:organizationId
 * @access Private (API Key)
 */
export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const organization = await Organization.findById(
      req.params.organizationId
    ).lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organization",
      error: (error as Error).message,
    });
  }
};

/**
 * Get customer by ID
 * @route GET /api/service/customer/:customerId
 * @access Private (API Key)
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.customerId)
      .select("-password -refreshToken")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer",
      error: (error as Error).message,
    });
  }
};

/**
 * Validate that a user belongs to an organization
 * @route GET /api/service/organization/:organizationId/users/:userId
 * @access Private (API Key)
 */
export const validateUserBelongsToOrg = async (req: Request, res: Response) => {
  try {
    const { organizationId, userId } = req.params;

    // This will depend on your data structure, but here's an example:
    const user = await OrgUser.findOne({
      _id: userId,
      org_id: organizationId,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        organizationId,
        isValid: true,
      },
    });
  } catch (error) {
    console.error("Error validating user organization membership:", error);
    res.status(500).json({
      success: false,
      message: "Error validating user organization membership",
      error: (error as Error).message,
    });
  }
};
