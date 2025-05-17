import { Request, Response } from "express";
import Admin from "../models/admin.model";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { DataStoredInToken } from "../types/auth.types";
import { Types } from "mongoose";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Reload environment variables at controller level
dotenv.config();

// Log directly in the controller
console.log("CONTROLLER ENV CHECK:", {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "exists" : "missing",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
    ? "exists"
    : "missing",
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,
});

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

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let photoUrl = "";
    // Upload photo to S3 if exists
    if (req.file) {
      try {
        // Generate a unique filename
        const fileExtension = req.file.mimetype.split("/")[1];
        const fileName = `payrollpro/admin/${crypto.randomUUID()}.${fileExtension}`;

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
        console.log("Upload successful:", photoUrl);
      } catch (uploadError) {
        console.error("S3 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading image",
          error: (uploadError as Error).message,
        });
      }
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      photo: photoUrl,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        id: (admin._id as unknown as Types.ObjectId).toString(),
        name: admin.name,
        email: admin.email,
        photo: admin.photo,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found with this email",
      });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const payload: DataStoredInToken = {
      id: (admin._id as unknown as Types.ObjectId).toString(),
      email: admin.email,
      isAdmin: admin.isAdmin,
    };

    const secret = process.env.JWT_SECRET || "default_secret";
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    } as SignOptions);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        name: admin.name,
        email: admin.email,
        photo: admin.photo,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
