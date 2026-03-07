import express from "express";
import Draw from "../models/Draw.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";
import Ticket from "../models/Ticket.js";
import Reward from "../models/Reward.js";
import { validateAnswer } from "../utils/questionValidator.js";
import { calculateRewards } from "../utils/rewardEngine.js";
import { getExpectedType } from "../utils/columnType.js";
import { getIO } from "../sockets/socketHandler.js";

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

    const ticket = await Ticket.findOne({ token });

    if (!ticket || !ticket.isAssigned) {
      return res.status(403).json({ message: "Invalid or unassigned ticket" });
    }

    const drawn = await Draw.findOne({ number });

    if (!drawn) {
      return res.status(400).json({ message: "Number not drawn yet" });
    }

    const question = await Question.findOne({ number });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const expectedType = getExpectedType(number);

    if (question.type !== expectedType) {
      return res.status(400).json({
        message: `This column allows only ${expectedType} questions`
      });
    }

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

    const verdict = await validateAnswer(question, answer, language);

    await Submission.create({
      token,
      ticketId: ticket.ticketId,
      number,
      answer,
      isCorrect: verdict.isCorrect
    });

    /* ================= EVENT EMIT LOGIC ================= */

    const io = getIO();

    if (io && verdict.isCorrect) {

      // event: solved question
      io.emit("eventFeed", {
        text: `${ticket.teamName} solved question ${number}`
      });

      // reward BEFORE
      const beforeReward = await Reward.findOne({ teamCode: ticket.ticketId });

      // recalc reward
      const rewardStatus = await calculateRewards(ticket.ticketId);

      const afterReward = await Reward.findOne({ teamCode: ticket.ticketId });

      if (!beforeReward?.firstLine && afterReward?.firstLine) {
        io.emit("eventFeed", {
          text: `${ticket.teamName} completed FIRST LINE`
        });
      }

      if (!beforeReward?.secondLine && afterReward?.secondLine) {
        io.emit("eventFeed", {
          text: `${ticket.teamName} completed SECOND LINE`
        });
      }

      if (!beforeReward?.thirdLine && afterReward?.thirdLine) {
        io.emit("eventFeed", {
          text: `${ticket.teamName} completed THIRD LINE`
        });
      }

      if (!beforeReward?.corners && afterReward?.corners) {
        io.emit("eventFeed", {
          text: `${ticket.teamName} completed CORNERS`
        });
      }

      if (!beforeReward?.earlyFive && afterReward?.earlyFive) {
        io.emit("eventFeed", {
          text: `${ticket.teamName} completed EARLY FIVE`
        });
      }

      if (!beforeReward?.fullHouseRank && afterReward?.fullHouseRank > 0) {
        io.emit("eventFeed", {
          text: `${ticket.teamName} got FULL HOUSE Rank #${afterReward.fullHouseRank}`
        });
      }

      return res.json({
        number,
        isCorrect: verdict.isCorrect,
        visibleResults: verdict.visibleResults,
        hiddenSummary: verdict.hiddenSummary,
        compileError: verdict.compileError,
        rewardStatus
      });

    }

    // incorrect answer
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
// GET SOLVED NUMBERS
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


// =====================
// GET REWARD STATUS
// =====================
router.get("/rewards/:token", async (req, res) => {

  try {

    const { token } = req.params;

    const ticket = await Ticket.findOne({ token });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const rewardStatus = await calculateRewards(ticket.ticketId);

    res.json({ rewardStatus });

  } catch (err) {

    console.error("Reward fetch error:", err);

    res.status(500).json({ message: "Server error" });

  }

});

export default router;