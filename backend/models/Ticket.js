import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  token: { type: String, required: true, unique: true },
  numbers: { type: [[Number]], required: true },
  teamName: { type: String, default: null },
  isAssigned: { type: Boolean, default: false },
  activeSocketId: { type: String, default: null },
  loginTime: Date
}, { timestamps: true });

export default mongoose.model("Ticket", ticketSchema);