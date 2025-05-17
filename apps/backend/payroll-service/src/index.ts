import express from "express";
import cors from "cors";
import dbConnect from "./config/dbConnect";
import config from "./config/config";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import payrollRoutes from "./routes/payroll.routes";
import testRoutes from "./routes/test.routes";

// Connect to database
dbConnect();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/payroll", payrollRoutes);
app.use("/api/test", testRoutes);

// Error handling middleware
app.use(notFound as express.RequestHandler);
app.use(errorHandler as express.ErrorRequestHandler);

// Home route - API documentation
app.get("/", (_req, res) => {
  res.send(`
    <h1>PayrollPro - Payroll Service API</h1>
    <h2>Available Endpoints:</h2>
    <ul>
      <li><strong>Payroll:</strong> /api/payroll</li>
      <li><strong>Test Core Service:</strong> /api/test</li>
    </ul>
    <p>For detailed API documentation, please refer to the documentation.</p>
  `);
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Payroll service running on http://localhost:${PORT}`);
});
