import { runCodeWithOneCompiler } from "../utils/oneCompiler.js";

/**
 * Normalize output safely for comparison
 */
const normalizeOutput = (text) => {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n")
    .trim();
};

export const validateAnswer = async (question, answer, language) => {

  // ================= MCQ =================
  if (question.type === "MCQ") {
    return question.correctAnswer === answer;
  }

  // ================= CASE =================
  if (question.type === "CASE") {
    return question.correctAnswer.trim().toLowerCase() ===
      answer.trim().toLowerCase();
  }

  // ================= CODING =================
  if (question.type === "CODING") {

    if (!language) return false;

    const allCases = [
      ...(question.testCases || []),
      ...(question.hiddenTestCases || [])
    ];

    if (allCases.length === 0) return false;

    const inputs = allCases.map(tc => tc.input);

    const result = await runCodeWithOneCompiler(
      answer,
      language,
      inputs
    );

    const executions = Array.isArray(result) ? result : [result];

    for (let i = 0; i < allCases.length; i++) {

      const userOutput = normalizeOutput(executions[i]?.stdout || "");
      const expectedOutput = normalizeOutput(
        allCases[i].expectedOutput
      );

      if (userOutput !== expectedOutput) {
        return false;
      }
    }

    return true;
  }

  return false;
};