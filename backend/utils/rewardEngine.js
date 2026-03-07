import Reward from "../models/Reward.js";
import Submission from "../models/Submission.js";
import Ticket from "../models/Ticket.js";

export const calculateRewards = async (teamCode) => {

  // teamCode = ticketId
  const ticketId = teamCode;

  const reward = await Reward.findOneAndUpdate(
    { teamCode: ticketId },
    {},
    { upsert: true, returnDocument: "after" }
  );

  /* ================= FETCH TICKET ================= */

  const ticket = await Ticket.findOne({ ticketId });

  if (!ticket) return reward;

  /* ================= FETCH CORRECT SUBMISSIONS ================= */

  const submissions = await Submission.find({
    ticketId,
    isCorrect: true
  });

  // normalize numbers
  const correctNumbers = submissions.map(s => Number(s.number));

  const flatTicket = ticket.numbers
    .flat()
    .filter(n => n !== null)
    .map(n => Number(n));

  /* ================= EARLY FIVE ================= */

  if (correctNumbers.length >= 5 && !reward.earlyFive) {
    reward.earlyFive = true;
  }

  /* ================= CORNERS ================= */

  const firstRow = ticket.numbers[0];
  const lastRow = ticket.numbers[2];

  const topLeft = Number(firstRow.find(n => n !== null));
  const topRight = Number([...firstRow].reverse().find(n => n !== null));
  const bottomLeft = Number(lastRow.find(n => n !== null));
  const bottomRight = Number([...lastRow].reverse().find(n => n !== null));

  const corners = [topLeft, topRight, bottomLeft, bottomRight];

  if (
    corners.every(n => correctNumbers.includes(n)) &&
    !reward.corners
  ) {
    reward.corners = true;
  }

  /* ================= LINES ================= */

  const checkLine = (rowIndex) => {

    const rowNums = ticket.numbers[rowIndex]
      .filter(n => n !== null)
      .map(n => Number(n));

    const solved = rowNums.filter(n => correctNumbers.includes(n));
    return solved.length === rowNums.length;
  };

  if (checkLine(0) && !reward.firstLine) {
    reward.firstLine = true;
  }

  if (checkLine(1) && !reward.secondLine) {
    reward.secondLine = true;
  }

  if (checkLine(2) && !reward.thirdLine) {
    reward.thirdLine = true;
  }

  /* ================= FULL HOUSE ================= */

  const fullSolved = flatTicket.every(n =>
    correctNumbers.includes(n)
  );

  if (fullSolved && reward.fullHouseRank === 0) {
    const fullHouseCount = await Reward.countDocuments({
      fullHouseRank: { $gt: 0 }
    });

    if (fullHouseCount < 3) {
      reward.fullHouseRank = fullHouseCount + 1;
    }
  }
  await reward.save();
  return reward;
};