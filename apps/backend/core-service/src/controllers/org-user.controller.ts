import { Request, Response } from "express";
import OrgUser from "../models/org.user.model";
import Organization from "../models/organization.model";
import { Counter } from "../models/counter.model";
import { Types } from "mongoose";
import { canAddMoreUsers } from "../services/subscription.service";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import dotenv from "dotenv";

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

export const createOrgUser = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;
    const { name, email, designation, org_id } = req.body;

    // Verify organization exists and belongs to the customer
    const organization = await Organization.findOne({
      _id: org_id,
      customer_id: customerId,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found or you don't have access to it",
      });
    }

    // Check if customer can add more users to this organization based on subscription
    const canAdd = await canAddMoreUsers(org_id, customerId);
    if (!canAdd) {
      return res.status(403).json({
        success: false,
        message:
          "You have reached the maximum number of users allowed for this organization in your subscription plan",
      });
    }

    let photoUrl = "";

    // Handle photo upload if present
    if (req.file) {
      try {
        // Generate a unique filename
        const fileExtension = req.file.mimetype.split("/")[1];
        const fileName = `payrollpro/org-users/${crypto.randomUUID()}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct the URL for the uploaded object
        photoUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
        console.log("Photo upload successful:", photoUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading photo",
          error: (uploadError as Error).message,
        });
      }
    }

    // Generate user_id
    const counter = await Counter.findByIdAndUpdate(
      { _id: "user_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Format: USER001, USER002, etc.
    const user_id = `USER${counter.seq.toString().padStart(3, "0")}`;

    // Create organization user
    const orgUser = await OrgUser.create({
      org_id,
      customer_id: customerId,
      name,
      email,
      photo: photoUrl,
      designation: designation || "",
      user_id,
    });

    res.status(201).json({
      success: true,
      message: "Organization user created successfully",
      data: orgUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create organization user",
    });
  }
};

export const getOrgUsers = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;
    const { org_id } = req.params;

    // Verify organization exists and belongs to the customer
    const organization = await Organization.findOne({
      _id: org_id,
      customer_id: customerId,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found or you don't have access to it",
      });
    }

    const orgUsers = await OrgUser.find({
      org_id,
      customer_id: customerId,
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orgUsers.length,
      data: orgUsers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organization users",
    });
  }
};

export const getOrgUserById = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    // Find by _id or user_id
    let orgUser;
    if (Types.ObjectId.isValid(id)) {
      orgUser = await OrgUser.findOne({
        _id: id,
        customer_id: customerId,
      });
    } else {
      orgUser = await OrgUser.findOne({
        user_id: id,
        customer_id: customerId,
      });
    }

    if (!orgUser) {
      return res.status(404).json({
        success: false,
        message: "Organization user not found",
      });
    }

    res.status(200).json({
      success: true,
      data: orgUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organization user",
    });
  }
};

export const updateOrgUser = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;
    const { name, email, designation } = req.body;

    // Find organization user
    let orgUser;
    if (Types.ObjectId.isValid(id)) {
      orgUser = await OrgUser.findOne({
        _id: id,
        customer_id: customerId,
      });
    } else {
      orgUser = await OrgUser.findOne({
        user_id: id,
        customer_id: customerId,
      });
    }

    if (!orgUser) {
      return res.status(404).json({
        success: false,
        message: "Organization user not found",
      });
    }

    // Handle photo upload if present
    if (req.file) {
      try {
        // Generate a unique filename
        const fileExtension = req.file.mimetype.split("/")[1];
        const fileName = `payrollpro/org-users/${crypto.randomUUID()}.${fileExtension}`;

        // Upload to S3
        const uploadParams = {
          Bucket: bucketName,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct the URL for the uploaded object
        const photoUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;

        // Delete old photo from S3 if it exists
        if (orgUser.photo && orgUser.photo.includes(bucketName)) {
          try {
            // Extract key from URL (everything after the bucket name in the path)
            const oldPhotoUrl = new URL(orgUser.photo);
            const key = oldPhotoUrl.pathname.substring(1); // Remove leading slash

            const deleteParams = {
              Bucket: bucketName,
              Key: key,
            };

            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3Client.send(deleteCommand);
            console.log("Old photo deleted from S3");
          } catch (deleteError) {
            console.error("Error deleting old photo from S3:", deleteError);
          }
        }

        req.body.photo = photoUrl;
        console.log("Photo upload successful:", photoUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading photo",
          error: (uploadError as Error).message,
        });
      }
    }

    // Update organization user
    const updatedOrgUser = await OrgUser.findByIdAndUpdate(
      orgUser._id,
      {
        $set: {
          name: name || orgUser.name,
          email: email || orgUser.email,
          designation: designation || orgUser.designation,
          photo: req.body.photo || orgUser.photo,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Organization user updated successfully",
      data: updatedOrgUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update organization user",
    });
  }
};

export const deleteOrgUser = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    // Find organization user
    let orgUser;
    if (Types.ObjectId.isValid(id)) {
      orgUser = await OrgUser.findOne({
        _id: id,
        customer_id: customerId,
      });
    } else {
      orgUser = await OrgUser.findOne({
        user_id: id,
        customer_id: customerId,
      });
    }

    if (!orgUser) {
      return res.status(404).json({
        success: false,
        message: "Organization user not found",
      });
    }

    // Delete photo from S3 if it exists
    if (orgUser.photo && orgUser.photo.includes(bucketName)) {
      try {
        // Extract key from URL (everything after the bucket name in the path)
        const photoUrl = new URL(orgUser.photo);
        const key = photoUrl.pathname.substring(1); // Remove leading slash

        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
        console.log("Organization user photo deleted from S3");
      } catch (deleteError) {
        console.error("Error deleting photo from S3:", deleteError);
      }
    }

    // Delete organization user
    await OrgUser.findByIdAndDelete(orgUser._id);

    res.status(200).json({
      success: true,
      message: "Organization user deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete organization user",
    });
  }
};

export const getAllOrgUsers = async (req: Request, res: Response) => {
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

    if (req.query.org_id) {
      filter.org_id = req.query.org_id;
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { designation: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const orgUsers = await OrgUser.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("org_id", "name organization_id")
      .sort({ createdAt: -1 });

    const total = await OrgUser.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orgUsers,
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
