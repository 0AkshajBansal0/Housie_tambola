import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "./models/Question.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seed = async () => {

  await Question.deleteMany({ number: { $lte: 9 } });

  const questions = [];

  for (let i = 1; i <= 9; i++) {
    questions.push({
      number: i,
      type: "CODING",
      questionText: "Given two integers, print their sum.",
      testCases: [
        { input: "2 3", expectedOutput: "5" },
        { input: "10 20", expectedOutput: "30" }
      ],
      hiddenTestCases: [
        { input: "100 200", expectedOutput: "300" },
        { input: "1 1", expectedOutput: "2" },
        { input: "7 8", expectedOutput: "15" }
      ]
    });
  }

  await Question.insertMany(questions);

  console.log("Questions 1-9 inserted");
  process.exit();
};

seed();