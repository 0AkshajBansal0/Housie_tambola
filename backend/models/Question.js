import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },

  type: {
    type: String,
    enum: ["MCQ", "CASE", "CODING"],
    required: true
  },

  questionText: {
    type: String,
    required: true
  },

  options: [String],

  correctAnswer: String,

  testCases: [
    {
      input: String,
      expectedOutput: String
    }
  ],

  hiddenTestCases: [
    {
      input: String,
      expectedOutput: String
    }
  ]

}, { timestamps: true });

export default mongoose.model("Question", questionSchema);