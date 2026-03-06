import express from "express";
import Draw from "../models/Draw.js";
import protectAdmin from "../middleware/authMiddleware.js";
import Ticket from "../models/Ticket.js";
import Submission from "../models/Submission.js";
import Reward from "../models/Reward.js";

const router = express.Router();


/* =========================
   GET ACTIVE TEAMS
========================= */
router.get("/teams", protectAdmin, async (req, res) => {
  try {

    const tickets = await Ticket.find()
      .select("teamName ticketId token numbers isAssigned");

    const submissions = await Submission.find({
      isCorrect: true
    }).select("ticketId number");

    // group solved numbers by ticket
    const solvedMap = {};

    submissions.forEach(s => {

      if (!solvedMap[s.ticketId]) {
        solvedMap[s.ticketId] = [];
      }

      solvedMap[s.ticketId].push(s.number);

    });

    const result = tickets.map(ticket => ({
      ...ticket.toObject(),
      solvedNumbers: solvedMap[ticket.ticketId] || []
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teams" });
  }
});


/* =========================
   GET SUBMISSIONS
========================= */
router.get("/submissions", protectAdmin, async (req, res) => {
  try {

    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(submissions);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});


/* =========================
   GET DRAW LOGS
========================= */
router.get("/logs", protectAdmin, async (req, res) => {
  try {

    const draws = await Draw.find().sort({ drawnAt: -1 });

    res.json(draws);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

/* DRAW NUMBER */
router.post("/draw", protectAdmin, async (req, res) => {
  try {

    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

    const drawn = await Draw.find().select("number");
    const drawnSet = new Set(drawn.map(d => d.number));

    const available = allNumbers.filter(n => !drawnSet.has(n));

    if (available.length === 0) {
      return res.status(400).json({ message: "All numbers drawn" });
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const number = available[randomIndex];

    await Draw.create({ number });

    const io = req.app.get("io");
    io.emit("numberDrawn", number);

    res.json({ number });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* GET DRAW HISTORY */
router.get("/drawn", protectAdmin, async (req, res) => {
  try {
    const draws = await Draw.find().sort({ drawnAt: 1 });
    res.json(draws);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/reset", protectAdmin, async (req, res) => {
  try {

    console.log("RESET ROUTE HIT");

    await Draw.deleteMany({});

    const io = req.app.get("io");
    io.emit("gameReset");

    res.status(200).json({
      success: true,
      message: "Game reset successfully"
    });

  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({
      success: false,
      message: "Reset failed"
    });
  }
});

export default router;