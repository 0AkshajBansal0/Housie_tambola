import { runJudgeBatch } from "./judge0.js";

export const validateAnswer = async (question, answer, language) => {

  if (question.type === "MCQ") {
    return { isCorrect: question.correctAnswer === answer };
  }

  if (question.type === "CASE") {
    return {
      isCorrect:
        question.correctAnswer.trim().toLowerCase() ===
        answer.trim().toLowerCase()
    };
  }

  if (question.type === "CODING") {

    const allCases = [
      ...(question.testCases || []),
      ...(question.hiddenTestCases || [])
    ];

    const results = await runJudgeBatch(answer, language, allCases);

    let visibleCount = question.testCases.length;
    let hiddenCount = question.hiddenTestCases.length;

    let visibleResults = [];
    let hiddenPassed = 0;
    let hiddenFailed = 0;

    let compileError = null;

    results.forEach((res, i) => {

      const isPassed = res.status?.id === 3;

      const stdout = res.stdout
        ? Buffer.from(res.stdout, "base64").toString()
        : "";

      const stderr = res.stderr
        ? Buffer.from(res.stderr, "base64").toString()
        : "";

      if (res.status?.id === 6) {
        compileError = stderr || res.status.description;
      }

      if (i < visibleCount) {
        visibleResults.push({
          input: question.testCases[i].input,
          expected: question.testCases[i].expectedOutput,
          output: stdout,
          passed: isPassed,
          error: stderr
        });
      } else {
        if (isPassed) hiddenPassed++;
        else hiddenFailed++;
      }
    });

    const isCorrect =
      hiddenFailed === 0 &&
      visibleResults.every(r => r.passed);

    return {
      isCorrect,
      visibleResults,
      hiddenSummary: {
        total: hiddenCount,
        passed: hiddenPassed,
        failed: hiddenFailed
      },
      compileError
    };
  }

  return { isCorrect: false };
};