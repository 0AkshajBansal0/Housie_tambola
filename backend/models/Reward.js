import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  teamCode: { type: String, unique: true },

  earlyFive: { type: Boolean, default: false },
  corners: { type: Boolean, default: false },
  firstLine: { type: Boolean, default: false },
  secondLine: { type: Boolean, default: false },
  thirdLine: { type: Boolean, default: false },

  fullHouseRank: { type: Number, default: 0 }

}, { timestamps: true });

export default mongoose.model("Reward", rewardSchema);