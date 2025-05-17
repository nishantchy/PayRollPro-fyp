import puppeteer from "puppeteer";
import { format } from "date-fns";

import {
  EmployeeData,
  PayrollData,
  payrollTemplate,
} from "../templates/payrollTemplate";

export const generatePayrollPDF = async (
  payrollData: PayrollData,
  employeeData: EmployeeData
): Promise<Buffer> => {
  try {
    const payPeriodStart = new Date(payrollData.pay_period.start_date);
    const payPeriodEnd = new Date(payrollData.pay_period.end_date);
    const payDate = new Date(payrollData.pay_date);

    const templateData = {
      month: format(payPeriodStart, "MMMM yyyy"),
      employeeName: `${employeeData.first_name} ${employeeData.last_name}`,
      employeeId: employeeData.employee_id,
      payPeriod: {
        start: format(payPeriodStart, "MM/dd/yyyy"),
        end: format(payPeriodEnd, "MM/dd/yyyy"),
      },
      paidDays: payrollData.paid_days,
      lossOfPayDays: payrollData.loss_of_pay_days,
      payDate: format(payDate, "MM/dd/yyyy"),
      earnings: payrollData.earnings,
      deductions: payrollData.deductions,
      grossEarnings: payrollData.gross_earnings,
      totalDeductions: payrollData.total_deductions,
      netPayable: payrollData.net_payable,
      amountInWords: payrollData.amount_in_words,
      notes:
        payrollData.notes ||
        "This is a computer generated payslip and does not require a physical signature.",
    };

    const html = payrollTemplate(templateData);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "5px",
        right: "5px",
        bottom: "5px",
        left: "5px",
      },
    });

    await browser.close();
    // cmd
    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
