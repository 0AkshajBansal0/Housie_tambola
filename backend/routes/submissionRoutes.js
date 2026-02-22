import express from "express";
import Draw from "../models/Draw.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import Ticket from "../models/Ticket.js";
import { validateAnswer } from "../utils/questionValidator.js";
import { calculateRewards } from "../utils/rewardEngine.js";
import { getExpectedType } from "../utils/columnType.js";

const router = express.Router();


// =====================
// SUBMIT ANSWER
// =====================
router.post("/", async (req, res) => {
  try {

    let { token, number, answer, language } = req.body;

    if (!token || number === undefined || !answer || !language) {
      return res.status(400).json({ message: "Missing fields" });
    }

    number = Number(number);

    if (isNaN(number) || number < 1 || number > 90) {
      return res.status(400).json({ message: "Invalid number" });
    }

    // 1️⃣ Validate Ticket
    const ticket = await Ticket.findOne({ token });

    if (!ticket || !ticket.isAssigned) {
      return res.status(403).json({ message: "Invalid or unassigned ticket" });
    }

    // 2️⃣ Check number drawn
    const drawn = await Draw.findOne({ number });
    if (!drawn) {
      return res.status(400).json({ message: "Number not drawn yet" });
    }

    // 3️⃣ Fetch Question
    const question = await Question.findOne({ number });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 4️⃣ Column validation
    const expectedType = getExpectedType(number);
    if (question.type !== expectedType) {
      return res.status(400).json({
        message: `This column allows only ${expectedType} questions`
      });
    }

    // 5️⃣ Check previous correct submission
    const existingCorrect = await Submission.findOne({
      ticketId: ticket.ticketId,
      number,
      isCorrect: true
    });

    if (existingCorrect) {
      return res.status(400).json({
        message: "Already correctly solved",
        number
      });
    }

    // 6️⃣ Validate answer
    const verdict = await validateAnswer(question, answer, language);

    // 7️⃣ Save submission (retry allowed if wrong)
    await Submission.create({
      token,
      ticketId: ticket.ticketId,
      number,
      answer,
      isCorrect: verdict.isCorrect
    });

    // 8️⃣ Calculate rewards
    const rewardStatus = await calculateRewards(ticket.ticketId);

    res.json({
      number,
      isCorrect: verdict.isCorrect,
      visibleResults: verdict.visibleResults,
      hiddenSummary: verdict.hiddenSummary,
      compileError: verdict.compileError,
      rewardStatus
    });

  } catch (err) {
    console.error("Submission Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =====================
// GET SOLVED NUMBERS (FOR SLASH UI SYNC)
// =====================
router.get("/solved/:token", async (req, res) => {
  try {

    const { token } = req.params;

    const ticket = await Ticket.findOne({ token });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const solved = await Submission.find({
      ticketId: ticket.ticketId,
      isCorrect: true
    }).select("number -_id");

    const solvedNumbers = solved.map(s => s.number);

    res.json({ solvedNumbers });

  } catch (err) {
    console.error("Solved fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;