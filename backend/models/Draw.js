import mongoose from "mongoose";

const drawSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },

  drawnAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model("Draw", drawSchema);