import puppeteer from "puppeteer";
import { payrollTemplate } from "../templates/payrollTemplate";
import { formatDate } from "../utils/dateUtils";

/**
 * Generate a PDF from payroll data
 */
export const generatePayrollPDF = async (
  payrollData: any,
  userData: any,
  organizationData: any
): Promise<Buffer> => {
  try {
    // Format dates for display
    const startDate = formatDate(new Date(payrollData.pay_period.start_date));
    const endDate = formatDate(new Date(payrollData.pay_period.end_date));
    const payDate = formatDate(new Date(payrollData.pay_date));

    // Prepare earnings and deductions data
    const earnings = payrollData.earnings.map((item: any) => ({
      earning_type: item.earning_type,
      amount: item.amount,
    }));

    const deductions = payrollData.deductions.map((item: any) => ({
      deduction_type: item.deduction_type,
      amount: item.amount,
    }));

    // Get month and year from pay period
    const monthYear =
      payrollData.month_year ||
      formatMonthYear(new Date(payrollData.pay_period.start_date));

    // Combine user's first and last name
    const employeeName = `${userData.name}`;

    // Generate the HTML content using the template
    const htmlContent = payrollTemplate({
      month: monthYear,
      employeeName: employeeName,
      employeeId: userData.user_id || "N/A",
      payPeriod: {
        start: startDate,
        end: endDate,
      },
      paidDays: payrollData.paid_days,
      lossOfPayDays: payrollData.loss_of_pay_days,
      payDate: payDate,
      earnings: earnings,
      deductions: deductions,
      grossEarnings: payrollData.gross_earnings,
      totalDeductions: payrollData.total_deductions,
      netPayable: payrollData.net_payable,
      amountInWords: payrollData.amount_in_words,
      notes: payrollData.notes || "",
      // Add organization data
      organization: {
        name: organizationData.name,
        logo: organizationData.logo || "",
        phone: organizationData.phone || "(+977) 9868211546",
        email: organizationData.email || "info@payrollpro.com.np",
        website: organizationData.website || "www.payrollpro.xyz",
        address: organizationData.address
          ? `${organizationData.address.street || ""}, ${organizationData.address.city || ""}, ${organizationData.address.state || ""}`
          : "",
        signature: organizationData.signature || "",
        signatureName: organizationData.signatureName || "Payroll Pro",
      },
    });

    // Launch browser to generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate payroll PDF");
  }
};

/**
 * Format date to Month YYYY
 */
function formatMonthYear(date: Date): string {
  const options = {
    month: "long",
    year: "numeric",
  } as Intl.DateTimeFormatOptions;
  return date.toLocaleDateString("en-US", options);
}
