import puppeteer from "puppeteer";
import { format } from "date-fns";
import { payrollTemplate } from "../templates/payrollTemplate";

export interface PayrollData {
  month_year?: string;
  pay_period: {
    start_date: Date | string;
    end_date: Date | string;
  };
  paid_days: number;
  loss_of_pay_days: number;
  pay_date: Date | string;
  earnings: Array<{ earning_type: string; amount: number }>;
  deductions: Array<{ deduction_type: string; amount: number }>;
  gross_earnings: number;
  total_deductions: number;
  net_payable: number;
  amount_in_words: string;
  notes?: string;
}

export interface EmployeeData {
  first_name: string;
  last_name: string;
  employee_id?: string;
  email?: string;
}

export interface OrganizationData {
  name: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  signature?: string;
  signatory_name?: string;
  signatureName?: string;
}

export const generatePayrollPDF = async (data: {
  month: string;
  staffName: string;
  staffId: string;
  payPeriod: {
    start: string;
    end: string;
  };
  paidDays: number;
  lossOfPayDays: number;
  payDate: string;
  earnings: Array<{ earning_type: string; amount: number }>;
  deductions: Array<{ deduction_type: string; amount: number }>;
  grossEarnings: number;
  totalDeductions: number;
  netPayable: number;
  amountInWords: string;
  notes: string;
  organization: OrganizationData;
}): Promise<Buffer> => {
  try {
    const templateData = {
      ...data,
      employeeName: data.staffName,
      employeeId: data.staffId,
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

    // Return proper Buffer object
    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
