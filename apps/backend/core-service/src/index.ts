import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect";
import { notFound, errorHandler } from "./middlewares/error.middleware";

// routes
import adminRoutes from "./routes/admin.routes";
import customerRoutes from "./routes/customer.routes";
import organizationRoutes from "./routes/organization.routes";
import orgUserRoutes from "./routes/org-user.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import serviceApiRoutes from "./routes/service-api.routes";

// Load environment variables
dotenv.config();
dbConnect();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Special handling for Stripe webhooks
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// Health check endpoint for frontend connectivity testing
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Server is healthy and responding to requests",
  });
});

// API Routes
// Authentication and account management
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);

// Organization and user management
app.use("/api/organization", organizationRoutes);
app.use("/api/users", orgUserRoutes);

// Subscription management
app.use("/api/subscription", subscriptionRoutes);

// Service-to-Service API
app.use("/api/service", serviceApiRoutes);

// Error handling middleware
app.use(notFound as express.RequestHandler);
app.use(errorHandler as express.ErrorRequestHandler);

// Home route - API documentation
app.get("/", (_req, res) => {
  res.send(`
    <h1>PayrollPro API</h1>
    <h2>Available Endpoints:</h2>
    <ul>
      <li><strong>Auth:</strong> /api/admin, /api/customer</li>
      <li><strong>Organizations:</strong> /api/organization</li>
      <li><strong>Organization Users:</strong> /api/users</li>
      <li><strong>Subscriptions:</strong> /api/subscription</li>
      <li><strong>Service API:</strong> /api/service (for service-to-service communication)</li>
      <li><strong>Health Check:</strong> /api/health (for connectivity testing)</li>
    </ul>
    <p>For detailed API documentation, please refer to the documentation.</p>
  `);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
