import express from "express";
import Draw from "../models/Draw.js";
import protectAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

/* DRAW NUMBER */
router.post("/draw", protectAdmin, async (req, res) => {
  try {
    const { number } = req.body;

    if (!number || number < 1 || number > 90) {
      return res.status(400).json({ message: "Invalid number" });
    }

    const alreadyDrawn = await Draw.findOne({ number });
    if (alreadyDrawn) {
      return res.status(400).json({ message: "Number already drawn" });
    }

    const newDraw = await Draw.create({ number });

    const io = req.app.get("io");
    io.emit("numberDrawn", number);

    res.json({
      message: "Number broadcasted",
      number: newDraw.number
    });

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

export default router;