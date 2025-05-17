import mongoose, { Schema, Document } from "mongoose";
import { Counter } from "./counter.model";

export interface IOrgUser extends Document {
  org_id: mongoose.Types.ObjectId;
  customer_id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  photo?: string;
  designation?: string;
  user_id: string;
  status: "active" | "inactive";
}

const OrgUserSchema = new Schema(
  {
    org_id: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "",
    },
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

OrgUserSchema.pre("save", async function (next) {
  try {
    // Only generate ID if it's a new document
    if (!this.isNew) {
      return next();
    }

    const counter = await Counter.findByIdAndUpdate(
      { _id: "user_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Format: USER001, USER002, etc.
    this.user_id = `USER${counter.seq.toString().padStart(3, "0")}`;
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IOrgUser>("OrgUser", OrgUserSchema);
