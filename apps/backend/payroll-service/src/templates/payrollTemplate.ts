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

export interface StaffData {
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
}

export interface OrganizationData {
  name: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  signature?: string;
  signatureName: string;
}

export interface TemplateData {
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
  organization?: {
    name: string;
    logo?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    signature?: string;
    signatureName?: string;
  };
}

export const payrollTemplate = (data: TemplateData): string => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const {
    month,
    employeeName,
    employeeId,
    payPeriod,
    paidDays,
    lossOfPayDays,
    payDate,
    earnings,
    deductions,
    grossEarnings,
    totalDeductions,
    netPayable,
    amountInWords,
    notes,
    organization,
  } = data;

  // Default organization info if not provided
  const org = organization || {
    name: "Payroll Pro",
    logo: "https://res.cloudinary.com/dpnhdq9eg/image/upload/v1745848583/logo-transparent_pylj5q.png",
    phone: "(+977) 9868211546",
    email: "contact@payrollpro.com.np",
    website: "",
    address: "",
    signature: "",
    signatureName: "Payroll Pro",
  };

  // Generate earnings rows
  const earningsRows = earnings
    .map(
      (item) => `
    <tr>
      <td>${item.earning_type}</td>
      <td class="amount">${formatCurrency(item.amount)}</td>
    </tr>
  `
    )
    .join("");

  // Generate deductions rows
  const deductionsRows = deductions
    .map(
      (item) => `
    <tr>
      <td>${item.deduction_type}</td>
      <td class="amount">${formatCurrency(item.amount)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payslip - ${month}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          font-size: 12px;
        }
        .payslip {
          max-width: 100%;
          width: 850px;
          margin: 0 auto;
          border: 1px solid #ccc;
          padding: 20px 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 10px;
        }
        .logo {
          max-width: 160px;
          max-height: 100px;
        }
        .company-info {
          text-align: right;
        }
        .title {
          text-align: center;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
        }
        .staff-info {
          margin-bottom: 20px;
          border: 1px solid #eee;
          padding: 15px;
          background-color: #f9f9f9;
        }
        .info-row {
          display: flex;
          margin-bottom: 5px;
          text-align: left;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
          text-align: left;
        }
        .payroll-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .earnings, .deductions {
          width: 48%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
        }
        .amount {
          text-align: right;
        }
        .summary {
          margin-top: 20px;
          border-top: 1px solid #eee;
          padding-top: 15px;
          text-align: left;
        }
        .net-pay {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .notes {
          margin-top: 20px;
          font-style: italic;
          color: #666;
          border-top: 1px dashed #ccc;
          padding-top: 10px;
          text-align: left;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          flex-direction: column;
        }
        .signature-image {
          max-width: 150px;
          margin-bottom: 5px;
        }
        .signatory-name {
          font-weight: bold;
        }
        .footer {
          margin-top: 20px;
          border-top: 1px solid #eee;
          padding-top: 10px;
          text-align: center;
          font-size: 10px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="payslip">
        <div class="header">
          <img src="${org.logo}" alt="Company Logo" class="logo">
          <div class="company-info">
            <h2>${org.name}</h2>
            ${formatAddress(org.address)}
            <p>Phone: ${org.phone}</p>
            <p>Email: ${org.email}</p>
            ${org.website ? `<p>Website: ${org.website}</p>` : ""}
          </div>
        </div>
        
        <div class="title">PAYROLL STATEMENT - ${month}</div>
        
        <div class="staff-info">
          <div class="info-row">
            <div class="info-label">Staff Name:</div>
            <div>${employeeName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Staff ID:</div>
            <div>${employeeId}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Pay Period:</div>
            <div>${payPeriod.start} to ${payPeriod.end}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Paid Days:</div>
            <div>${paidDays}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Loss of Pay Days:</div>
            <div>${lossOfPayDays}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Pay Date:</div>
            <div>${payDate}</div>
          </div>
        </div>
        
        <div class="payroll-details">
          <div class="earnings">
            <h3>Earnings</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${earningsRows}
                <tr>
                  <td><strong>Total Earnings</strong></td>
                  <td class="amount"><strong>${formatCurrency(grossEarnings)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="deductions">
            <h3>Deductions</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${deductionsRows}
                <tr>
                  <td><strong>Total Deductions</strong></td>
                  <td class="amount"><strong>${formatCurrency(totalDeductions)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="summary">
          <div class="info-row">
            <div class="info-label">Gross Earnings:</div>
            <div class="amount">${formatCurrency(grossEarnings)}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Total Deductions:</div>
            <div class="amount">${formatCurrency(totalDeductions)}</div>
          </div>
          <div class="net-pay">
            <div class="info-row">
              <div class="info-label">Net Pay:</div>
              <div class="amount">${formatCurrency(netPayable)}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Amount in Words:</div>
            <div>${amountInWords}</div>
          </div>
        </div>
        
        <div class="notes">
          <p><strong>Notes:</strong> ${notes}</p>
        </div>
        
        <div class="signature-section">
          <img src="${org.signature}" alt="Signature" class="signature-image">
          <div class="signatory-name">${org.signatureName}</div>
          <div>Authorized Signatory</div>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated document and does not require a signature.</p>
          <p>© ${new Date().getFullYear()} ${org.name} - All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to format address that could be string or object
function formatAddress(address: any): string {
  if (!address) {
    return "";
  }

  // If address is an object with street, city, etc.
  if (typeof address === "object") {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip) parts.push(address.zip);

    return parts.length > 0 ? `<p>${parts.join(", ")}</p>` : "";
  }

  // If address is a string
  return typeof address === "string" && address.trim() !== ""
    ? `<p>${address}</p>`
    : "";
}

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
