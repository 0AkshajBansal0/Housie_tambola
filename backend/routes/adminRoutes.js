import express from "express";
import Draw from "../models/Draw.js";
import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

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