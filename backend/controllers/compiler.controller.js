import Question from "../models/Question.js";
import { runJudgeBatch } from "../utils/judge0.js";

export const runCode = async (req, res) => {

  const { language, code, number } = req.body;

  try {

    const question = await Question.findOne({ number: Number(number) });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }


console.log("Question Number:", number);
console.log("Visible length:", question.testCases?.length);
console.log("Hidden length:", question.hiddenTestCases?.length);

    const visible = question.testCases || [];
    const hidden = question.hiddenTestCases || [];

    const allCases = [...visible, ...hidden];

    const judgeResults = await runJudgeBatch(code, language, allCases);

    let compileError = null;

    const formatted = judgeResults.map((r, i) => {

      const isPassed = r.status?.id === 3;

      const stdout = r.stdout
        ? Buffer.from(r.stdout, "base64").toString().trim()
        : "";

      const stderr = r.stderr
        ? Buffer.from(r.stderr, "base64").toString()
        : "";

      if (r.status?.id === 6) {
        compileError = stderr || r.status.description;
      }

      if (i < visible.length) {
        return {
          type: "visible",
          passed: isPassed,
          input: visible[i].input,
          expected: visible[i].expectedOutput,
          output: stdout,
          error: stderr
        };
      } else {
        return {
          type: "hidden",
          passed: isPassed
        };
      }
    });

    res.json({
      results: formatted,
      compileError
    });

  } catch (err) {
    console.error("Run Error:", err);
    res.status(500).json({ message: "Execution failed" });
  }
};