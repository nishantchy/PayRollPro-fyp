import express from "express";
import {
  createPayroll,
  getPayrolls,
  getPayrollById,
  downloadPayrollPDF,
  sendPayrollEmailById,
  updatePayroll,
  deletePayroll,
} from "../controllers/payroll.controller";
import validateApiKey from "../middlewares/api-key.middleware";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// @route   POST /api/payroll
// @desc    Create a new payroll
// @access  Private
router.post("/", createPayroll);

// @route   GET /api/payroll
// @desc    Get all payrolls (with filters)
// @access  Private
router.get("/", getPayrolls);

// @route   GET /api/payroll/:id
// @desc    Get a single payroll by ID
// @access  Private
router.get("/:id", getPayrollById);

// @route   GET /api/payroll/:id/download
// @desc    Download payroll PDF
// @access  Private
router.get("/:id/download", downloadPayrollPDF);

// @route   POST /api/payroll/:id/send-email
// @desc    Send payroll email
// @access  Private
router.post("/:id/send-email", sendPayrollEmailById);

// @route   PUT /api/payroll/:id
// @desc    Update a payroll
// @access  Private
router.put("/:id", updatePayroll);

// @route   DELETE /api/payroll/:id
// @desc    Delete a payroll
// @access  Private
router.delete("/:id", deletePayroll);

export default router;
