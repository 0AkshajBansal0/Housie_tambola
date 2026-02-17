import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  teamCode: String,

  number: Number,

  answer: String,

  isCorrect: Boolean,

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);