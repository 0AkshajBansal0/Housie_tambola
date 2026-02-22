import { useState } from "react";
import Editor from "@monaco-editor/react";
import API from "../services/api";

const CodingQuestion = ({ question, token, onSubmissionResult }) => {

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("// Write your code here");

  const [runResults, setRunResults] = useState([]);
  const [compileError, setCompileError] = useState(null);

  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [finalResult, setFinalResult] = useState(null);

  // =========================
  // RUN CODE (VISIBLE + HIDDEN)
  // =========================
  const handleRun = async () => {
    try {
      setLoadingRun(true);
      setRunResults([]);
      setCompileError(null);
      setFinalResult(null);

      const res = await API.post("/compiler/run", {
        language,
        code,
        number: question.number
      });

      if (res.data.compileError) {
        setCompileError(res.data.compileError);
        return;
      }

      setRunResults(res.data.results || []);

    } catch {
      alert("Execution failed");
    } finally {
      setLoadingRun(false);
    }
  };

  // =========================
  // SUBMIT CODE
  // =========================
  const handleSubmit = async () => {

    if (!token) {
      alert("Session expired. Please re-login.");
      return;
    }

    if (!code.trim()) {
      alert("Code cannot be empty.");
      return;
    }

    try {
      setLoadingSubmit(true);
      setCompileError(null);
      setFinalResult(null);

      const res = await API.post("/submit", {
        token,
        number: question.number,
        answer: code,
        language
      });

      if (res.data.compileError) {
        setCompileError(res.data.compileError);
        setFinalResult(false);
        return;
      }

      setFinalResult(res.data.isCorrect);
      onSubmissionResult(res.data);

    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#0f172a] text-white">

      {/* LEFT PANEL */}
      <div className="w-[25%] p-6 overflow-y-auto border-r border-gray-700 bg-[#111827]">
        <h2 className="text-2xl font-bold mb-6">
          {question.questionText}
        </h2>

        <h3 className="font-semibold mb-3 text-gray-300">
          Sample Test Cases
        </h3>

        {question.testCases?.map((tc, i) => (
          <div key={i} className="mb-4 p-3 bg-[#1f2937] rounded">
            <div className="text-gray-400 text-sm">Input</div>
            <pre className="whitespace-pre-wrap">{tc.input}</pre>

            <div className="text-gray-400 text-sm mt-2">Expected</div>
            <pre className="whitespace-pre-wrap">{tc.expectedOutput}</pre>
          </div>
        ))}
      </div>

      {/* CENTER PANEL */}
      <div className="w-[50%] flex flex-col">

        <div className="flex justify-between px-6 py-3 border-b border-gray-700">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 p-2 rounded"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
          </select>

          <div className="flex gap-4">
            <button
              onClick={handleRun}
              disabled={loadingRun}
              className="bg-blue-600 px-5 py-2 rounded"
            >
              {loadingRun ? "Running..." : "Run"}
            </button>

            <button
              onClick={handleSubmit}
              disabled={loadingSubmit}
              className="bg-yellow-500 text-black px-5 py-2 rounded"
            >
              {loadingSubmit ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(value) => setCode(value || "")}
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[25%] p-6 overflow-y-auto border-l border-gray-700 bg-black">

        <h3 className="text-xl font-bold mb-4">Output</h3>

        {(loadingRun || loadingSubmit) && (
          <div className="text-yellow-400 animate-pulse mb-4">
            Running test cases...
          </div>
        )}

        {compileError && (
          <div className="bg-red-900 p-4 rounded mb-4">
            <div className="font-bold text-red-400 mb-2">
              Compilation Error
            </div>
            <pre className="text-sm whitespace-pre-wrap">
              {compileError}
            </pre>
          </div>
        )}

        {runResults.map((r, i) => {
          const visibleCount = question.testCases?.length || 0;
          const isHidden = r.type === "hidden";

          return (
            <div key={i} className="mb-6 p-4 border border-gray-700 rounded">
              <div className={r.passed ? "text-green-400" : "text-red-400"}>
                {isHidden
                  ? `Hidden Test Case ${i + 1 - visibleCount}`
                  : `Test Case ${i + 1}`}
                {r.passed ? " ✔ Passed" : " ✖ Failed"}
              </div>

              {!isHidden && (
                <div className="mt-2 text-sm space-y-2">
                  <div>
                    <div className="text-gray-400">Input:</div>
                    <pre>{r.input}</pre>
                  </div>

                  <div>
                    <div className="text-gray-400">Your Output:</div>
                    <pre>{r.output}</pre>
                  </div>

                  <div>
                    <div className="text-gray-400">Expected:</div>
                    <pre>{r.expected}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {finalResult !== null && (
          <div className="mt-6 text-lg font-bold">
            {finalResult
              ? "All Test Cases Passed ✅"
              : "Some Test Cases Failed ❌"}
          </div>
        )}

      </div>

    </div>
  );
};

export default CodingQuestion;