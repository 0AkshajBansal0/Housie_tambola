import { runCodeWithOneCompiler } from "./oneCompiler.js";

export const validateAnswer = async (question, answer, language) => {

  if (question.type === "MCQ") {
    return question.correctAnswer === answer;
  }

  if (question.type === "CASE") {
    return question.correctAnswer.trim().toLowerCase() ===
      answer.trim().toLowerCase();
  }

  if (question.type === "CODING") {

    const allCases = [
      ...question.testCases,
      ...question.hiddenTestCases
    ];

    const inputs = allCases.map(tc => tc.input);

    const result = await runCodeWithOneCompiler(
      answer,
      language,
      inputs
    );

    for (let i = 0; i < allCases.length; i++) {
      if (result[i].stdout?.trim() !== allCases[i].expectedOutput.trim()) {
        return false;
      }
    }

    return true;
  }

  return false;
};