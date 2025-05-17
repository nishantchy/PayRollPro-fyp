import mongoose, { Document, Schema } from "mongoose";

interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  photo: string;
  isAdmin: Boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    photo: {
      type: String,
      required: false,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAdmin>("Admin", AdminSchema);
