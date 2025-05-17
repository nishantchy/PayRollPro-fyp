import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayroll extends Document {
  user_id: Types.ObjectId;
  organization_id: Types.ObjectId;
  customer_id: Types.ObjectId;
  month_year?: string;
  pay_period: {
    start_date: Date;
    end_date: Date;
  };
  paid_days: number;
  loss_of_pay_days: number;
  pay_date: Date;
  earnings: [
    {
      earning_type: string;
      amount: number;
    },
  ];
  deductions: [
    {
      deduction_type: string;
      amount: number;
    },
  ];
  gross_earnings: number;
  total_deductions: number;
  net_payable: number;
  amount_in_words: string;
  email_sent: boolean;
  email_sent_at?: Date;
  payment_status: "pending" | "processed" | "failed";
  payment_method?: "bank_transfer" | "check" | "cash";
  transaction_id?: string;
  notes?: string;
  status: "pending" | "paid" | "cancelled";
  generated_by: Types.ObjectId;
  approved_by?: Types.ObjectId;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    month_year: {
      type: String,
      required: false,
    },
    pay_period: {
      start_date: {
        type: Date,
        required: true,
      },
      end_date: {
        type: Date,
        required: true,
      },
    },
    paid_days: {
      type: Number,
      required: true,
      min: 0,
      max: 31,
    },
    loss_of_pay_days: {
      type: Number,
      required: true,
      default: 0,
    },
    pay_date: {
      type: Date,
      required: true,
    },
    earnings: [
      {
        earning_type: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    deductions: [
      {
        deduction_type: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    gross_earnings: {
      type: Number,
      default: 0,
    },
    total_deductions: {
      type: Number,
      default: 0,
    },
    net_payable: {
      type: Number,
      default: 0,
    },
    amount_in_words: {
      type: String,
      required: true,
    },
    email_sent: {
      type: Boolean,
      default: false,
    },
    email_sent_at: {
      type: Date,
    },
    notes: {
      type: String,
      required: false,
    },
    generated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PayrollSchema.pre("validate", function (next) {
  try {
    if (this.net_payable !== this.gross_earnings - this.total_deductions) {
      next(new Error("Net payable calculation mismatch"));
      return;
    }
    if (this.gross_earnings < 0 || this.total_deductions < 0) {
      next(new Error("Earnings and deductions cannot be negative"));
      return;
    }
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

PayrollSchema.pre("save", function (next) {
  if (
    this.gross_earnings !==
    this.earnings.reduce((sum, earning) => sum + earning.amount, 0)
  ) {
    next(new Error("Gross earnings calculation mismatch"));
    return;
  }
  if (
    this.total_deductions !==
    this.deductions.reduce((sum, deduction) => sum + deduction.amount, 0)
  ) {
    next(new Error("Total deductions calculation mismatch"));
    return;
  }
  if (this.net_payable !== this.gross_earnings - this.total_deductions) {
    next(new Error("Net payable calculation mismatch"));
    return;
  }
  next();
});

PayrollSchema.index(
  {
    user_id: 1,
    organization_id: 1,
    "pay_period.start_date": 1,
    "pay_period.end_date": 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      "pay_period.start_date": { $exists: true },
      "pay_period.end_date": { $exists: true },
    },
  }
);

export const PayrollModel = mongoose.model<IPayroll>("Payroll", PayrollSchema);
export default PayrollModel;
