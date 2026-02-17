import express from "express";
import Ticket from "../models/Ticket.js";
import Draw from "../models/Draw.js";

const router = express.Router();

/* ------------------ JOIN WITH TOKEN ------------------ */

router.post("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { teamName } = req.body;

    if (!teamName || teamName.trim() === "") {
      return res.status(400).json({ message: "Team name is required" });
    }

    const ticket = await Ticket.findOne({ token });

    if (!ticket) {
      return res.status(404).json({ message: "Invalid QR code or token" });
    }

    // If already assigned to another team, block access
    if (ticket.isAssigned && ticket.teamName !== teamName) {
      return res.status(403).json({
        message: "This ticket is already assigned to another team"
      });
    }

    // Assign if first login
    if (!ticket.isAssigned) {
      ticket.teamName = teamName.trim();
      ticket.isAssigned = true;
      ticket.loginTime = new Date();
    }

    await ticket.save();

    // Fetch full drawn history
    const draws = await Draw.find().sort({ drawnAt: 1 });
    const drawnNumbers = draws.map(d => d.number);

    res.json({
      success: true,
      ticketId: ticket.ticketId,
      numbers: ticket.numbers,
      teamName: ticket.teamName,
      drawnNumbers
    });

  } catch (err) {
    console.error("Join Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;