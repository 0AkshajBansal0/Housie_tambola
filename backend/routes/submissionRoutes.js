import express from "express";
import Draw from "../models/Draw.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import { validateAnswer } from "../utils/questionValidator.js";
import { calculateRewards } from "../utils/rewardEngine.js";
import { getExpectedType } from "../utils/columnType.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {

    let { teamCode, number, answer, language } = req.body;

    // ---------------- Basic Validation ----------------
    if (!teamCode || number === undefined || !answer || !language) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔥 VERY IMPORTANT FIX
    number = Number(number);

    // ---------------- Check number drawn ----------------
    const drawn = await Draw.findOne({ number });
    if (!drawn) {
      return res.status(400).json({ message: "Number not drawn yet" });
    }

    // ---------------- Prevent duplicate submission ----------------
    const already = await Submission.findOne({ teamCode, number });
    if (already) {
      return res.status(400).json({ message: "Already submitted" });
    }

    // ---------------- Fetch question ----------------
    const question = await Question.findOne({ number });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // ---------------- Column Type Enforcement ----------------
    const expectedType = getExpectedType(number);

    if (question.type !== expectedType) {
      return res.status(400).json({
        message: `This column allows only ${expectedType} questions`
      });
    }

    // ---------------- Validate answer ----------------
    const isCorrect = await validateAnswer(question, answer, language);

    // ---------------- Save submission ----------------
    await Submission.create({
      teamCode,
      number,
      answer,
      isCorrect
    });

    // ---------------- Calculate rewards ----------------
    const rewardStatus = await calculateRewards(teamCode);

    res.json({
      isCorrect,
      rewardStatus
    });

  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;