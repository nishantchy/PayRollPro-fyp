export interface PayPeriod {
  start_date: Date;
  end_date: Date;
}

export interface EarningDeduction {
  earning_type?: string;
  deduction_type?: string;
  amount: number;
}

export interface PayrollData {
  pay_period: PayPeriod;
  paid_days: number;
  loss_of_pay_days: number;
  pay_date: Date;
  earnings: EarningDeduction[];
  deductions: EarningDeduction[];
  gross_earnings: number;
  total_deductions: number;
  net_payable: number;
  amount_in_words: string;
  notes?: string;
  month_year?: string;
}

export interface EmployeeData {
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
}

export const payrollTemplate = (data: {
  month: string;
  employeeName: string;
  employeeId: string;
  payPeriod: {
    start: string;
    end: string;
  };
  paidDays: number;
  lossOfPayDays: number;
  payDate: string;
  earnings: EarningDeduction[];
  deductions: EarningDeduction[];
  grossEarnings: number;
  totalDeductions: number;
  netPayable: number;
  amountInWords: string;
  notes: string;
}): string => {
  // Calculate padding rows to make tables equal height
  const maxRows = Math.max(data.earnings.length, data.deductions.length);
  const earningsPadding = Math.max(0, maxRows - data.earnings.length);
  const deductionsPadding = Math.max(0, maxRows - data.deductions.length);

  const earningsRows = data.earnings
    .map(
      (earning) => `
        <tr class="border-b">
          <td class="p-2 text-sm">${earning.earning_type}</td>
          <td class="p-2 text-sm text-right">Rs. ${earning.amount.toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  const earningsPaddingRows = Array(earningsPadding)
    .fill(null)
    .map(
      (_, index) => `
      <tr class="border-b" key="padding-${index}">
        <td class="p-2 text-sm">&nbsp;</td>
        <td class="p-2 text-sm">&nbsp;</td>
      </tr>
    `
    )
    .join("");

  const deductionsRows = data.deductions
    .map(
      (deduction) => `
        <tr class="border-b">
          <td class="p-2 text-sm">${deduction.deduction_type}</td>
          <td class="p-2 text-sm text-right">Rs. ${deduction.amount.toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  const deductionsPaddingRows = Array(deductionsPadding)
    .fill(null)
    .map(
      (_, index) => `
      <tr class="border-b" key="padding-${index}">
        <td class="p-2 text-sm">&nbsp;</td>
        <td class="p-2 text-sm">&nbsp;</td>
      </tr>
    `
    )
    .join("");

  return `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Payroll Slip</title>
          <style>
            ${payrollStyles}
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header Section -->
            <div class="header">
              <div class="company-info">
                <img src="https://res.cloudinary.com/dpnhdq9eg/image/upload/v1738649505/logo_lvrzl1.png" alt="Softified" class="logo" />
                <h1 class="company-name">
                  Softified Development & <br />
                  Consulting Group Pvt. Ltd.
                </h1>
              </div>
              <div class="payroll-month">
                <h2 class="month-label">Payslip for the month</h2>
                <p class="month-value">${data.month}</p>
              </div>
              <div class="contact-info">
                <div class="contact-item">
                  <div class="icon-container">
                    <img
                      src="https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297651/ic--baseline-phone_my7f1r.png"
                      alt="Phone"
                      class="icon"
                    />
                  </div>
                  <span>(+977) 9818984104</span>
                </div>
                <div class="contact-item">
                  <div class="icon-container">
                    <img
                      src="https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297650/ic--baseline-email_jahkcp.png"
                      alt="Email"
                      class="icon"
                    />
                  </div>
                  <span>contact@softified.com.np</span>
                </div>
                <div class="contact-item">
                  <div class="icon-container">
                    <img
                      src="https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297649/uil--globe_bpqh4h.png"
                      alt="Website"
                      class="icon"
                    />
                  </div>
                  <span>www.softified.com.np</span>
                </div>
                <div class="contact-item">
                  <div class="icon-container">
                    <img
                      src="https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297650/mdi--location_rh9oyv.png"
                      alt="Location"
                      class="icon"
                    />
                  </div>
                  <span>Tokha 5, Basundhara, Kathmandu</span>
                </div>
              </div>
            </div>
  
            <!-- Employee Details Section -->
            <div class="employee-details">
              <h1 class="section-title">Employee Pay Summary</h1>
              <div class="details-grid">
                <div class="details-row">
                  <span class="label">Employee Name:</span>
                  <span class="value">${data.employeeName}</span>
                </div>
                <div class="details-row">
                  <span class="label">Employee ID:</span>
                  <span class="value">${data.employeeId}</span>
                </div>
                <div class="details-row">
                  <span class="label">Pay Period:</span>
                  <span class="value">${data.payPeriod.start} - ${data.payPeriod.end}</span>
                </div>
                <div class="details-row">
                  <span class="label">Paid Days:</span>
                  <span class="value">${data.paidDays}</span>
                </div>
                <div class="details-row">
                  <span class="label">Loss of Pay Days:</span>
                  <span class="value">${data.lossOfPayDays}</span>
                </div>
                <div class="details-row">
                  <span class="label">Pay Date:</span>
                  <span class="value">${data.payDate}</span>
                </div>
              </div>
            </div>
  
            <!-- Earnings and Deductions Tables -->
            <div class="tables-container">
              <!-- Earnings Table -->
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th class="th-left">Earnings</th>
                      <th class="th-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${earningsRows}
                    ${earningsPaddingRows}
                    <tr class="total-row">
                      <td class="p-2 text-sm font-bold">Total Earnings</td>
                      <td class="p-2 text-sm text-right font-bold">Rs. ${data.grossEarnings.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
  
              <!-- Deductions Table -->
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th class="th-left">Deductions</th>
                      <th class="th-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${deductionsRows}
                    ${deductionsPaddingRows}
                    <tr class="total-row">
                      <td class="p-2 text-sm font-bold">Total Deductions</td>
                      <td class="p-2 text-sm text-right font-bold">Rs. ${data.totalDeductions.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  
            <!-- Net Payable Section -->
            <div class="net-payable-section">
              <div class="net-payable-row">
                <h2 class="net-label">Net Payable</h2>
                <p class="net-amount">Rs. ${data.netPayable.toLocaleString()}</p>
              </div>
              <div class="amount-words-row">
                <h3 class="words-label">Amount in words:</h3>
                <p class="words-value">${data.amountInWords}</p>
              </div>
            </div>
  
            <!-- Notes Section -->
            ${
              data.notes
                ? `
            <div class="notes-section">
              <h3 class="notes-title">Notes:</h3>
              <p class="notes-content">${data.notes}</p>
            </div>
            `
                : ""
            }
  
            <!-- Signature Section -->
            <div class="signature-section">
              <div class="signature-image-container">
                <img
                  src="https://res.cloudinary.com/dpnhdq9eg/image/upload/v1740297337/signature_ihdroh.png"
                  alt="Signature"
                  class="signature-image"
                />
              </div>
              <div class="signature-line"></div>
              <p class="signature-label">Signature</p>
              <p class="signature-name">Aayush Raj Joshi</p>
            </div>
          </div>
        </body>
      </html>
    `;
};

const payrollStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

body {
  background-color: #f8f9fa;
  color: #333;
  line-height: 1.5;
  padding: 20px;
}

.container {
  max-width: 210mm;
  margin: 0 auto;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header Section */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px dashed #ddd;
  border-radius: 12px;
  margin-bottom: 24px;
}

.company-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo {
  width: 176px;
  object-fit: contain;
}

.company-name {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-top: 6px;
  margin-left: 24px;
}

.payroll-month {
  text-align: center;
}

.month-label {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.month-value {
  font-size: 16px;
  font-weight: 500;
  color: #2563eb;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 20px;
  height: 20px;
  border: 1px solid #2563eb;
  border-radius: 50%;
  padding: 4px;
}

/* Employee Details Section */
.employee-details {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.details-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  font-size: 14px;
}

.label {
  font-weight: 600;
  color: #111827;
}

.value {
  color: #4b5563;
}

/* Tables Container */
.tables-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.table-wrapper {
  width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.th-left {
  text-align: left;
  padding: 8px;
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.th-right {
  text-align: right;
  padding: 8px;
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.p-2 {
  padding: 8px;
}

.text-sm {
  font-size: 14px;
}

.text-right {
  text-align: right;
}

.font-bold {
  font-weight: 600;
}

.total-row {
  background-color: #f9fafb;
}

/* Net Payable Section */
.net-payable-section {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.net-payable-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.net-label {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.net-amount {
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
}

.amount-words-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.words-label {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.words-value {
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  max-width: 60%;
  text-align: right;
}

/* Notes Section */
.notes-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.notes-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.notes-content {
  font-size: 14px;
  color: #4b5563;
}

/* Signature Section */
.signature-section {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 36px;
}

.signature-image-container {
  height: 80px;
  width: 128px;
  transform: rotate(6deg);
  margin-bottom: -20px;
}

.signature-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.signature-line {
  height: 1px;
  width: 176px;
  background-color: #111827;
  margin: 8px 0;
}

.signature-label {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-left: 36px;
}

.signature-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-left: 16px;
}

@media print {
  body {
    background-color: white;
    padding: 0;
  }
  
  .container {
    max-width: 100%;
    padding: 20px;
    box-shadow: none;
  }
}
`;

// utils/pdfGenerator.ts
