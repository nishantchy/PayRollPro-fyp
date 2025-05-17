import mongoose, { Schema, Document } from "mongoose";

interface ICounter extends Document {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>("Counter", CounterSchema);
