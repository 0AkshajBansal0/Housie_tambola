import Reward from "../models/Reward.js";
import Submission from "../models/Submission.js";
import Ticket from "../models/Ticket.js";

export const calculateRewards = async (teamCode) => {

  const reward = await Reward.findOneAndUpdate(
    { teamCode },
    {},
    { upsert: true, returnDocument: "after" }
  );

  const submissions = await Submission.find({
    teamCode,
    isCorrect: true
  });

  const correctNumbers = submissions.map(s => s.number);

  const ticket = await Ticket.findOne({ teamName: teamCode });

  if (!ticket) return reward;

  const flatTicket = ticket.numbers.flat().filter(n => n !== null);

  // Early Five
  if (correctNumbers.length >= 5 && !reward.earlyFive) {
    reward.earlyFive = true;
  }

  // Corners
  const firstRow = ticket.numbers[0].filter(n => n !== null);
  const lastRow = ticket.numbers[2].filter(n => n !== null);

  const corners = [
    firstRow[0],
    firstRow[firstRow.length - 1],
    lastRow[0],
    lastRow[lastRow.length - 1]
  ];

  if (corners.every(n => correctNumbers.includes(n))) {
    reward.corners = true;
  }

  // Lines
  const checkLine = (rowIndex) => {
    const rowNums = ticket.numbers[rowIndex].filter(n => n !== null);
    return rowNums.every(n => correctNumbers.includes(n));
  };

  if (checkLine(0)) reward.firstLine = true;
  if (checkLine(1)) reward.secondLine = true;
  if (checkLine(2)) reward.thirdLine = true;

  // Full House (Top 3 only)
  const fullSolved = flatTicket.every(n => correctNumbers.includes(n));

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