import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },

  ticketId: {
    type: String,
    required: true
  },

  number: {
    type: Number,
    required: true
  },

  answer: {
    type: String,
    required: true
  },

  isCorrect: {
    type: Boolean,
    required: true
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// Prevent duplicate submission per ticket per number
submissionSchema.index({ ticketId: 1, number: 1 });

export default mongoose.model("Submission", submissionSchema);