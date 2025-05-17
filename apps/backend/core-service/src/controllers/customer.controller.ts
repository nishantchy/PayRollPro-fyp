import { Request, Response } from "express";
import Customer, { ICustomer } from "../models/customer.model";
import Organization from "../models/organization.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  createDefaultSubscription,
  getCustomerSubscription,
  getSubscriptionPlan,
} from "../services/subscription.service";

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

const CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "205373363397-p6jd37eb2466d264621lhdjbvuakugq4.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// Console log for debugging - remove in production
console.log("Google Client ID:", CLIENT_ID);

/**
 * Register a new customer
 * @route POST /api/business/register
 * @access Public
 */
export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create customer
    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      phone,
      subscription_plan: "free",
      photo: "", // Default empty string
      address: {}, // Default empty object
      has_organization: false, // Initialize with no organizations
      org_count: 0, // Initialize with zero count
      hasOnboarded: false, // Initialize with not onboarded
    });

    // Create default subscription if needed
    if (createDefaultSubscription) {
      await createDefaultSubscription(
        (customer._id as mongoose.Types.ObjectId).toString()
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, role: "customer" },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    // Remove password from response
    const customerWithoutPassword = {
      _id: customer._id,
      customer_id: customer.customer_id,
      name: customer.name,
      email: customer.email,
      photo: customer.photo,
      address: customer.address,
      phone: customer.phone,
      subscription_plan: customer.subscription_plan,
      status: customer.status,
      has_organization: customer.has_organization,
      org_count: customer.org_count,
      hasOnboarded: customer.hasOnboarded,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    res.status(201).json({
      success: true,
      data: customerWithoutPassword,
      token,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during registration",
    });
  }
};

/**
 * Register Customer with Google
 * @route POST /api/business/google-register
 * @access Public
 */
export const googleRegister = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    console.log("Attempting to verify Google token");

    // Verify Google token with more flexible audience checking
    const ticket = await client.verifyIdToken({
      idToken: token,
      // Allow any of these audiences
      audience: [
        CLIENT_ID,
        "205373363397-p6jd37eb2466d264621lhdjbvuakugq4.apps.googleusercontent.com",
      ],
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log("Invalid token: no payload returned");
      return res.status(400).json({ message: "Invalid token" });
    }

    console.log("Google verification successful for:", payload.email);

    const { email, name, picture } = payload;

    // Check if customer exists
    let customer = await Customer.findOne({ email });

    if (customer) {
      // Check if this customer was created with Google
      if (!customer.googleId) {
        return res.status(400).json({
          success: false,
          message:
            "An account with this email already exists. Please login with password or use a different Google account.",
        });
      }

      // Organization exists and was created with Google, return login info
      const jwtToken = jwt.sign(
        {
          id: customer._id,
          role: "customer",
          authMethod: "google",
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        success: true,
        data: {
          _id: customer._id,
          customer_id: customer.customer_id,
          name: customer.name,
          email: customer.email,
          photo: customer.photo,
          authMethod: "google",
          has_organization: customer.has_organization,
          org_count: customer.org_count,
          hasOnboarded: customer.hasOnboarded,
          hasPassword: customer.password ? true : false,
        },
        token: jwtToken,
      });
    }

    // Create new customer for Google auth
    customer = await Customer.create({
      name,
      email,
      photo: picture || "https://res.cloudinary.com/default/placeholder.png",
      subscription_plan: "free", // Default plan
      googleId: payload.sub, // Store Google's unique identifier
      authMethod: "google",
      has_organization: false, // Initialize with no organizations
      org_count: 0, // Initialize with zero count
      hasOnboarded: false, // Initialize with not onboarded
    });

    // Generate JWT
    const jwtToken = jwt.sign(
      {
        id: customer._id,
        role: "customer",
        authMethod: "google",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      data: {
        _id: customer._id,
        customer_id: customer.customer_id,
        name: customer.name,
        email: customer.email,
        photo: customer.photo,
        authMethod: "google",
        has_organization: customer.has_organization,
        org_count: customer.org_count,
        hasOnboarded: customer.hasOnboarded,
        hasPassword: false,
      },
      token: jwtToken,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message || "Something went wrong during Google authentication",
    });
  }
};

/**
 * Login with Google
 * @route POST /api/business/google-login
 * @access Public
 */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // TESTING MODE - Skip actual Google verification
    if (token === "TEST_TOKEN") {
      // Mock Google user data
      const mockGoogleData = {
        email: "test@example.com",
        sub: "google-123456789", // Google's unique identifier
      };

      // Check if customer exists with this email and was created with Google
      const customer = await Customer.findOne({
        email: mockGoogleData.email,
        googleId: { $exists: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message:
            "No account found with this Google account. Please register first.",
        });
      }

      // Check if customer is active
      if (customer.status === "inactive") {
        return res.status(401).json({
          success: false,
          message: "Your account is inactive. Please contact support.",
        });
      }

      // Update organization count and has_organization flag
      const orgs = await Organization.find({
        customer_id: customer._id,
        status: "active",
      });

      const orgCount = orgs.length;
      const hasOrganization = orgCount > 0;

      // Update customer record if needed
      if (
        customer.org_count !== orgCount ||
        customer.has_organization !== hasOrganization
      ) {
        await Customer.findByIdAndUpdate(customer._id, {
          org_count: orgCount,
          has_organization: hasOrganization,
        });

        // Update customer object for response
        customer.org_count = orgCount;
        customer.has_organization = hasOrganization;
      }

      // Generate JWT
      const jwtToken = jwt.sign(
        { id: customer._id, role: "customer", authMethod: "google" },
        (process.env.JWT_SECRET as string) || "testsecret",
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        success: true,
        data: {
          _id: customer._id,
          customer_id: customer.customer_id,
          name: customer.name,
          email: customer.email,
          photo: customer.photo,
          address: customer.address,
          phone: customer.phone,
          subscription_plan: customer.subscription_plan,
          status: customer.status,
          has_organization: customer.has_organization,
          org_count: customer.org_count,
          authMethod: "google",
          hasOnboarded: customer.hasOnboarded,
          hasPassword: customer.password ? true : false,
        },
        token: jwtToken,
      });
    }

    console.log("Google Login: Attempting to verify token");

    // For production - actual Google verification
    const ticket = await client.verifyIdToken({
      idToken: token,
      // Allow any of these audiences
      audience: [
        CLIENT_ID,
        "925704032596-pfadbl07k67hh07kgko8b0i479bd41e3.apps.googleusercontent.com",
      ],
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log("Google Login: Invalid token - no payload");
      return res.status(400).json({ message: "Invalid token" });
    }

    console.log("Google Login: Successful verification for:", payload.email);

    const { email, sub } = payload;

    // Find customer by email and googleId
    const customer = await Customer.findOne({
      email,
      googleId: { $exists: true },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this Google account. Please register first.",
      });
    }

    // Check if organization is active
    if (customer.status === "inactive") {
      return res.status(401).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    // Update organization count and has_organization flag
    const orgs = await Organization.find({
      customer_id: customer._id,
      status: "active",
    });

    const orgCount = orgs.length;
    const hasOrganization = orgCount > 0;

    // Update customer record if needed
    if (
      customer.org_count !== orgCount ||
      customer.has_organization !== hasOrganization
    ) {
      await Customer.findByIdAndUpdate(customer._id, {
        org_count: orgCount,
        has_organization: hasOrganization,
      });

      // Update customer object for response
      customer.org_count = orgCount;
      customer.has_organization = hasOrganization;
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: customer._id, role: "customer", authMethod: "google" },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      data: {
        _id: customer._id,
        customer_id: customer.customer_id,
        name: customer.name,
        email: customer.email,
        photo: customer.photo,
        address: customer.address,
        phone: customer.phone,
        subscription_plan: customer.subscription_plan,
        status: customer.status,
        has_organization: customer.has_organization,
        org_count: customer.org_count,
        authMethod: "google",
        hasOnboarded: customer.hasOnboarded,
        hasPassword: customer.password ? true : false,
      },
      token: jwtToken,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during Google login",
    });
  }
};

/**
 * Login customer
 * @route POST /api/business/login
 * @access Public
 */
export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find customer
    const customer = await Customer.findOne({ email }).select("+password");
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if customer is active
    if (customer.status === "inactive") {
      return res
        .status(401)
        .json({ message: "Your account is inactive. Please contact support." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, customer.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update organization count and has_organization flag
    const orgs = await Organization.find({
      customer_id: customer._id,
      status: "active",
    });

    const orgCount = orgs.length;
    const hasOrganization = orgCount > 0;

    // Update customer record if needed
    if (
      customer.org_count !== orgCount ||
      customer.has_organization !== hasOrganization
    ) {
      await Customer.findByIdAndUpdate(customer._id, {
        org_count: orgCount,
        has_organization: hasOrganization,
      });

      // Update customer object for response
      customer.org_count = orgCount;
      customer.has_organization = hasOrganization;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: customer._id, role: "customer" },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    // Remove password from response
    const customerWithoutPassword = {
      _id: customer._id,
      customer_id: customer.customer_id,
      name: customer.name,
      email: customer.email,
      photo: customer.photo,
      address: customer.address,
      phone: customer.phone,
      subscription_plan: customer.subscription_plan,
      status: customer.status,
      has_organization: customer.has_organization,
      org_count: customer.org_count,
      hasOnboarded: customer.hasOnboarded,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: customerWithoutPassword,
      token,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during login",
    });
  }
};

/**
 * Get customer by ID
 * @route GET /api/customers/:id
 * @access Private
 */
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requesterId = (req as any).user?.id;
    const isSuperAdmin = (req as any).user?.isSuperAdmin;
    const isCustomer = (req as any).user?.role === "customer";

    // Try to find customer by _id first
    let customer = await Customer.findById(id);

    // If not found by _id, try to find by customer_id
    if (!customer) {
      customer = await Customer.findOne({ customer_id: id });
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Always refresh organization count and status
    const orgs = await Organization.find({
      customer_id: customer._id,
      status: "active",
    });

    const orgCount = orgs.length;
    const hasOrganization = orgCount > 0;

    // Update customer record if it doesn't match actual count
    if (
      customer.org_count !== orgCount ||
      customer.has_organization !== hasOrganization
    ) {
      await Customer.findByIdAndUpdate(
        customer._id,
        {
          org_count: orgCount,
          has_organization: hasOrganization,
        },
        { new: true }
      );

      // Update the customer object for the response
      customer.org_count = orgCount;
      customer.has_organization = hasOrganization;
    }

    // Allow access if:
    // 1. User is a superadmin
    // 2. User is a customer viewing their own account
    // 3. User has VIEW_CUSTOMERS permission (handled by middleware)
    const isOwnAccount =
      isCustomer &&
      (customer._id as mongoose.Types.ObjectId).toString() === requesterId;

    if (!isSuperAdmin && !isOwnAccount) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: customer._id,
        customer_id: customer.customer_id,
        name: customer.name,
        email: customer.email,
        password: customer.password,
        photo: customer.photo || "",
        address: customer.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        phone: customer.phone || "",
        subscription_plan: customer.subscription_plan,
        status: customer.status,
        has_organization: customer.has_organization,
        org_count: customer.org_count,
        authMethod: customer.authMethod,
        googleId: customer.googleId || "",
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        __v: customer.__v,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * Get all customers
 * @route GET /api/customers
 * @access Private/Admin
 */
export const getAllCustomers = async (req: Request, res: Response) => {
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
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const customers = await Customer.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(filter);

    // Format customers to include all fields with empty values for optional fields
    const formattedCustomers = customers.map((customer) => ({
      _id: customer._id,
      customer_id: customer.customer_id,
      name: customer.name,
      email: customer.email,
      photo: customer.photo || "",
      address: customer.address || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      phone: customer.phone || "",
      subscription_plan: customer.subscription_plan,
      status: customer.status,
      authMethod: customer.authMethod,
      googleId: customer.googleId || "",
      has_organization: customer.has_organization,
      org_count: customer.org_count,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      __v: customer.__v,
    }));

    res.status(200).json({
      success: true,
      data: formattedCustomers,
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

/**
 * Update customer
 * @route PUT /api/customers/:id
 * @access Private
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    let customer;

    // Check if the parameter is a customer_id or MongoDB id
    if (idParam.match(/^CUSTOMER\d+$/i)) {
      // It's a customer_id
      customer = await Customer.findOne({ customer_id: idParam });
    } else {
      // Assume it's a MongoDB id
      customer = await Customer.findById(idParam);
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if the requester has permission to update this customer
    const requesterId = (req as any).user?.id;
    const isSuperAdmin = (req as any).user?.isSuperAdmin;
    const isCustomer = (req as any).user?.role === "customer";

    // Allow if:
    // 1. User is a superadmin (from softified-auth)
    // 2. User has the EDIT_CUSTOMERS permission (handled by middleware in routes)
    // 3. A customer is updating their own account
    const isOwnAccountUpdate =
      isCustomer &&
      (customer._id as mongoose.Types.ObjectId).toString() === requesterId;

    if (!isSuperAdmin && !isOwnAccountUpdate) {
      // The middleware should have checked for EDIT_CUSTOMERS permission already
      // This is just a double-check
      return res
        .status(403)
        .json({ message: "Not authorized to update this resource" });
    }

    // Handle file upload if present
    if (req.file) {
      try {
        // Generate a unique filename
        const fileExtension = req.file.mimetype.split("/")[1];
        const fileName = `payrollpro/customers/${crypto.randomUUID()}.${fileExtension}`;

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
        if (customer.photo && customer.photo.includes(bucketName)) {
          try {
            // Extract key from URL
            const oldPhotoUrl = new URL(customer.photo);
            const key = oldPhotoUrl.pathname.substring(1); // Remove leading slash

            const deleteParams = {
              Bucket: bucketName,
              Key: key,
            };

            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3Client.send(deleteCommand);
          } catch (deleteError) {
            console.error("Error deleting old photo from S3:", deleteError);
          }
        }

        req.body.photo = photoUrl;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Error uploading image",
        });
      }
    }

    // Handle password update if present
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update customer using the found customer's _id
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customer._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during update",
    });
  }
};

/**
 * Delete customer
 * @route DELETE /api/customers/:id
 * @access Private/Admin
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    let customer;

    // Check if the parameter is a customer_id or MongoDB id
    if (idParam.match(/^CUSTOMER\d+$/i)) {
      // It's a customer_id
      customer = await Customer.findOne({ customer_id: idParam });
    } else {
      // Assume it's a MongoDB id
      customer = await Customer.findById(idParam);
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if the requester has permission to delete this customer
    const requesterId = (req as any).user?.id;
    const isSuperAdmin = (req as any).user?.isSuperAdmin;
    const isCustomer = (req as any).user?.role === "customer";

    // Allow if:
    // 1. User is a superadmin (from softified-auth)
    // 2. User has the DELETE_CUSTOMERS permission (handled by middleware)
    // 3. A customer is deleting their own account
    const isOwnAccountDelete =
      isCustomer &&
      (customer._id as mongoose.Types.ObjectId).toString() === requesterId;

    if (!isSuperAdmin && !isOwnAccountDelete) {
      // If not superadmin and not the customer themselves
      // The middleware already checked for the DELETE_CUSTOMERS permission
      return res
        .status(403)
        .json({ message: "Not authorized to delete this resource" });
    }

    // Delete photo from S3 if it exists
    if (customer.photo && customer.photo.includes(bucketName)) {
      try {
        // Extract key from URL
        const photoUrl = new URL(customer.photo);
        const key = photoUrl.pathname.substring(1); // Remove leading slash

        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
      } catch (deleteError) {
        console.error("Error deleting photo from S3:", deleteError);
      }
    }

    // Delete customer using the found customer's _id
    await Customer.findByIdAndDelete(customer._id);

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during deletion",
    });
  }
};

/**
 * Utility function to increment a customer's organization count
 * Call this when a new organization is created for a customer
 */
export const incrementCustomerOrgCount = async (customerId: string) => {
  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Set has_organization to true and increment org_count
    await Customer.findByIdAndUpdate(customerId, {
      has_organization: true,
      $inc: { org_count: 1 },
    });

    return true;
  } catch (error: any) {
    console.error("Failed to increment organization count:", error.message);
    return false;
  }
};

/**
 * Utility function to decrement a customer's organization count
 * Call this when an organization is deleted
 */
export const decrementCustomerOrgCount = async (customerId: string) => {
  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Count all active organizations
    const orgs = await Organization.find({
      customer_id: new mongoose.Types.ObjectId(customerId),
      status: "active",
    });

    const orgCount = orgs.length;
    const hasOrganization = orgCount > 0;

    // Update the customer record with the actual count
    await Customer.findByIdAndUpdate(customerId, {
      org_count: orgCount,
      has_organization: hasOrganization,
    });

    return { success: true, orgCount, hasOrganization };
  } catch (error: any) {
    console.error("Failed to decrement organization count:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Utility function to refresh a customer's organization count
 * Use this to ensure the has_organization and org_count fields are accurate
 */
export const refreshCustomerOrgCount = async (customerId: string) => {
  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Count active organizations for this customer
    const orgs = await Organization.find({
      customer_id: new mongoose.Types.ObjectId(customerId),
      status: "active",
    });

    const orgCount = orgs.length;
    const hasOrganization = orgCount > 0;

    // Update customer if the counts don't match
    if (
      customer.org_count !== orgCount ||
      customer.has_organization !== hasOrganization
    ) {
      await Customer.findByIdAndUpdate(customerId, {
        org_count: orgCount,
        has_organization: hasOrganization,
      });
    }

    return { orgCount, hasOrganization };
  } catch (error: any) {
    console.error("Failed to refresh organization count:", error.message);
    return { orgCount: 0, hasOrganization: false };
  }
};

/**
 * Update customer onboarding status
 * @route PATCH /api/customers/:id/onboarding
 * @access Private
 */
export const updateOnboardingStatus = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const { hasOnboarded } = req.body;

    if (typeof hasOnboarded !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "hasOnboarded field must be a boolean value",
      });
    }

    let customer;

    // Check if the parameter is a customer_id or MongoDB id
    if (idParam.match(/^CUSTOMER\d+$/i)) {
      // It's a customer_id
      customer = await Customer.findOne({ customer_id: idParam });
    } else {
      // Assume it's a MongoDB id
      customer = await Customer.findById(idParam);
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if the requester has permission to update this customer
    const requesterId = (req as any).user?.id;
    const isSuperAdmin = (req as any).user?.isSuperAdmin;
    const isCustomer = (req as any).user?.role === "customer";

    // Allow if:
    // 1. User is a superadmin
    // 2. A customer is updating their own account
    const isOwnAccountUpdate =
      isCustomer &&
      (customer._id as mongoose.Types.ObjectId).toString() === requesterId;

    if (!isSuperAdmin && !isOwnAccountUpdate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this resource",
      });
    }

    // Update the customer's onboarding status
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customer._id,
      { hasOnboarded },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        _id: updatedCustomer?._id,
        customer_id: updatedCustomer?.customer_id,
        hasOnboarded: updatedCustomer?.hasOnboarded,
      },
      message: "Onboarding status updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message || "Something went wrong updating onboarding status",
    });
  }
};
