import { Request, Response } from "express";
import Organization from "../models/organization.model";
import { Counter } from "../models/counter.model";
import { Types } from "mongoose";
import { canCreateMoreOrganizations } from "../services/subscription.service";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import dotenv from "dotenv";
import {
  incrementCustomerOrgCount,
  decrementCustomerOrgCount,
  refreshCustomerOrgCount,
} from "./customer.controller";
import Customer from "../models/customer.model";
import mongoose from "mongoose";

// Reload environment variables
dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Get bucket name from environment variable
const bucketName = process.env.AWS_BUCKET_NAME || "";

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;
    const {
      name,
      industry,
      description,
      phone,
      email,
      website,
      signatory_name,
      address,
    } = req.body;

    // Check if customer can create more organizations based on subscription
    const canCreate = await canCreateMoreOrganizations(customerId);
    if (!canCreate) {
      return res.status(403).json({
        success: false,
        message:
          "You have reached the maximum number of organizations allowed in your subscription plan",
      });
    }

    let logoUrl = "";
    let signatureUrl = "";

    // Handle logo upload if present
    if (
      req.files &&
      (req.files as any).logo &&
      (req.files as any).logo.length > 0
    ) {
      try {
        const logoFile = (req.files as any).logo[0];
        // Generate a unique filename
        const fileExtension = logoFile.mimetype.split("/")[1];
        const fileName = `payrollpro/organizations/${crypto.randomUUID()}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: logoFile.buffer,
          ContentType: logoFile.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct the URL for the uploaded object
        logoUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
        console.log("Logo upload successful:", logoUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading logo",
          error: (uploadError as Error).message,
        });
      }
    }

    // Handle signature upload if present
    if (
      req.files &&
      (req.files as any).signature &&
      (req.files as any).signature.length > 0
    ) {
      try {
        const signatureFile = (req.files as any).signature[0];
        // Generate a unique filename
        const fileExtension = signatureFile.mimetype.split("/")[1];
        const fileName = `payrollpro/signatures/${crypto.randomUUID()}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: signatureFile.buffer,
          ContentType: signatureFile.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct the URL for the uploaded object
        signatureUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
        console.log("Signature upload successful:", signatureUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading signature",
          error: (uploadError as Error).message,
        });
      }
    } else if (req.body.signature) {
      // Use the signature URL from the request body if provided
      signatureUrl = req.body.signature;
    }

    // Generate organization_id
    const counter = await Counter.findByIdAndUpdate(
      { _id: "organization_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Format: ORG001, ORG002, etc.
    const organization_id = `ORG${counter.seq.toString().padStart(3, "0")}`;

    // Create organization
    const organization = await Organization.create({
      name,
      customer_id: new mongoose.Types.ObjectId(customerId),
      logo: logoUrl,
      industry: industry || "",
      description,
      organization_id,
      phone,
      email,
      website,
      signature: signatureUrl,
      signatory_name,
      address,
    });

    // Update customer's organization count
    await incrementCustomerOrgCount(customerId);

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create organization",
    });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;
    console.log(`Getting organizations for customer ID: ${customerId}`);
    console.log(`User context:`, req.user);

    // Log the request headers for debugging
    console.log("Request headers:", {
      authorization: req.headers.authorization
        ? "Bearer Token Present"
        : "No Bearer Token",
      cookie: req.headers.cookie || "No Cookie",
    });

    const organizations = await Organization.find({
      customer_id: new mongoose.Types.ObjectId(customerId),
      status: "active",
    }).sort({ createdAt: -1 });

    console.log(
      `Found ${organizations.length} organizations for customer ${customerId}`
    );

    if (organizations.length === 0) {
      // Log a sample organization to check filtering conditions
      const anyOrg = await Organization.findOne({}).sort({ createdAt: -1 });
      console.log(
        "Sample organization in database:",
        anyOrg
          ? {
              _id: anyOrg._id,
              name: anyOrg.name,
              customer_id: anyOrg.customer_id,
            }
          : "No organizations in database"
      );
    }

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations,
    });
  } catch (error: any) {
    console.error("Error in getOrganizations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organizations",
    });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    // Find by _id or organization_id
    let organization;
    if (Types.ObjectId.isValid(id)) {
      organization = await Organization.findOne({
        _id: id,
        customer_id: new mongoose.Types.ObjectId(customerId),
      });
    } else {
      organization = await Organization.findOne({
        organization_id: id,
        customer_id: new mongoose.Types.ObjectId(customerId),
      });
    }

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organization",
    });
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;
    const {
      name,
      industry,
      description,
      phone,
      email,
      website,
      signatory_name,
      address,
      signature,
    } = req.body;

    // Find organization
    let organization;
    if (Types.ObjectId.isValid(id)) {
      organization = await Organization.findOne({
        _id: id,
        customer_id: new mongoose.Types.ObjectId(customerId),
      });
    } else {
      organization = await Organization.findOne({
        organization_id: id,
        customer_id: new mongoose.Types.ObjectId(customerId),
      });
    }

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const updates = {
      name: name || organization.name,
      industry: industry || organization.industry,
      logo: organization.logo,
      description:
        description !== undefined ? description : organization.description,
      phone: phone !== undefined ? phone : organization.phone,
      email: email !== undefined ? email : organization.email,
      website: website !== undefined ? website : organization.website,
      signatory_name:
        signatory_name !== undefined
          ? signatory_name
          : organization.signatory_name,
      address: address !== undefined ? address : organization.address,
      signature: signature || organization.signature,
    };

    // Handle logo upload if present
    if (
      req.files &&
      (req.files as any).logo &&
      (req.files as any).logo.length > 0
    ) {
      try {
        const logoFile = (req.files as any).logo[0];
        // Generate a unique filename
        const fileExtension = logoFile.mimetype.split("/")[1];
        const fileName = `payrollpro/organizations/${crypto.randomUUID()}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: logoFile.buffer,
          ContentType: logoFile.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct the URL for the uploaded object
        const logoUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;

        // Delete old logo from S3 if it exists
        if (organization.logo && organization.logo.includes(bucketName)) {
          try {
            // Extract key from URL (everything after the bucket name in the path)
            const oldLogoUrl = new URL(organization.logo);
            const key = oldLogoUrl.pathname.substring(1); // Remove leading slash

            const deleteParams = {
              Bucket: bucketName,
              Key: key,
            };

            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3Client.send(deleteCommand);
            console.log("Old logo deleted from S3");
          } catch (deleteError) {
            console.error("Error deleting old logo from S3:", deleteError);
          }
        }

        updates.logo = logoUrl;
        console.log("Logo upload successful:", logoUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading logo",
          error: (uploadError as Error).message,
        });
      }
    }

    // Handle signature upload if present
    if (
      req.files &&
      (req.files as any).signature &&
      (req.files as any).signature.length > 0
    ) {
      try {
        const signatureFile = (req.files as any).signature[0];
        // Generate a unique filename
        const fileExtension = signatureFile.mimetype.split("/")[1];
        const fileName = `payrollpro/signatures/${crypto.randomUUID()}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: signatureFile.buffer,
          ContentType: signatureFile.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct the URL for the uploaded object
        const signatureUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;

        // Delete old signature from S3 if it exists
        if (
          organization.signature &&
          organization.signature.includes(bucketName)
        ) {
          try {
            // Extract key from URL (everything after the bucket name in the path)
            const oldSignatureUrl = new URL(organization.signature);
            const key = oldSignatureUrl.pathname.substring(1); // Remove leading slash

            const deleteParams = {
              Bucket: bucketName,
              Key: key,
            };

            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3Client.send(deleteCommand);
            console.log("Old signature deleted from S3");
          } catch (deleteError) {
            console.error("Error deleting old signature from S3:", deleteError);
          }
        }

        updates.signature = signatureUrl;
        console.log("Signature upload successful:", signatureUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading signature",
          error: (uploadError as Error).message,
        });
      }
    } else if (req.body.signature) {
      // Use the signature URL from the request body if provided
      updates.signature = req.body.signature;
    }

    // Update organization
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organization._id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: updatedOrganization,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update organization",
    });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    // Find organization
    let organization;
    if (Types.ObjectId.isValid(id)) {
      organization = await Organization.findOne({
        _id: id,
        customer_id: new mongoose.Types.ObjectId(customerId),
      });
    } else {
      organization = await Organization.findOne({
        organization_id: id,
        customer_id: new mongoose.Types.ObjectId(customerId),
      });
    }

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // Delete logo from S3 if it exists
    if (organization.logo && organization.logo.includes(bucketName)) {
      try {
        // Extract key from URL (everything after the bucket name in the path)
        const logoUrl = new URL(organization.logo);
        const key = logoUrl.pathname.substring(1); // Remove leading slash

        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
        console.log("Organization logo deleted from S3");
      } catch (deleteError) {
        console.error("Error deleting logo from S3:", deleteError);
      }
    }

    // Delete organization
    await Organization.findByIdAndDelete(organization._id);

    await refreshCustomerOrgCount(customerId);

    // Update customer's organization count
    console.log("Updating customer org count for customerId:", customerId);
    const result = await decrementCustomerOrgCount(customerId);
    console.log("Org count update result:", result);

    // Force refresh customer data
    const customer = await Customer.findById(customerId);
    if (customer) {
      const orgs = await Organization.find({
        customer_id: new mongoose.Types.ObjectId(customerId),
        status: "active",
      });

      const orgCount = orgs.length;
      const hasOrganization = orgCount > 0;

      console.log("Current org count:", orgCount, "Has org:", hasOrganization);

      // Update customer record if it doesn't match actual count
      if (
        customer.org_count !== orgCount ||
        customer.has_organization !== hasOrganization
      ) {
        console.log("Updating customer record with correct count");
        await Customer.findByIdAndUpdate(customerId, {
          org_count: orgCount,
          has_organization: hasOrganization,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete organization",
    });
  }
};

export const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    // Implement pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Implement filters
    const filter: any = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { industry: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const organizations = await Organization.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Organization.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: organizations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
