import Question from "../models/Question.js";
import { runCodeWithOneCompiler } from "../utils/oneCompiler.js";

export const runCode = async (req, res) => {

  const { language, code, number } = req.body;

  try {

    const question = await Question.findOne({ number: Number(number) });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const inputs = question.testCases.map(tc => tc.input);

    const result = await runCodeWithOneCompiler(
      code,
      language,
      inputs
    );

    const results = result.map((r, i) => ({
      input: r.stdin,
      expected: question.testCases[i].expectedOutput,
      output: r.stdout?.trim(),
      passed: r.stdout?.trim() === question.testCases[i].expectedOutput.trim()
    }));

    res.json({ results });

  } catch (err) {
    console.error("Compiler Error:", err.response?.data || err.message);
    res.status(500).json({ message: "Execution failed" });
  }
};