import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

/**
 * GET QUESTION BY NUMBER
 * Participant clicks drawn number
 */
router.get("/:number", async (req, res) => {
  try {

    const number = Number(req.params.number);

    if (isNaN(number) || number < 1 || number > 90) {
      return res.status(400).json({ message: "Invalid number" });
    }

    const question = await Question.findOne({ number }).lean();

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 🔥 DO NOT SEND hiddenTestCases
    const sanitized = {
      number: question.number,
      type: question.type,
      questionText: question.questionText,
      options: question.options || [],
      testCases:
        question.type === "CODING"
          ? question.testCases || []
          : undefined
    };

    res.json(sanitized);

  } catch (err) {
    console.error("Question fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;