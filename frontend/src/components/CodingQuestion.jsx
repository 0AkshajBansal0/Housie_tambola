import { useState } from "react";
import Editor from "@monaco-editor/react";
import API from "../services/api";

const CodingQuestion = ({ question, teamName, onSubmissionResult }) => {

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("// Write your code here");
  const [runResults, setRunResults] = useState([]);
  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const handleRun = async () => {
    try {
      setLoadingRun(true);
      setRunResults([]);
      setFinalResult(null);

      const res = await API.post("/compiler/run", {
        language,
        code,
        number: question.number
      });

      setRunResults(res.data.results);

    } catch {
      alert("Execution failed");
    } finally {
      setLoadingRun(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoadingSubmit(true);

      const res = await API.post("/submit", {
        teamCode: teamName,
        number: question.number,
        answer: code,
        language
      });

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
            <p className="text-sm text-gray-400">Input</p>
            <pre className="mb-2 whitespace-pre-wrap">{tc.input}</pre>

            <p className="text-sm text-gray-400">Expected</p>
            <pre className="whitespace-pre-wrap">{tc.expectedOutput}</pre>
          </div>
        ))}
      </div>

      {/* CENTER PANEL (EDITOR) */}
      <div className="w-[50%] flex flex-col">

        <div className="flex justify-between items-center px-6 py-3 border-b border-gray-700 bg-[#0f172a]">
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

      {/* RIGHT PANEL (OUTPUT) */}
      <div className="w-[25%] p-6 overflow-y-auto border-l border-gray-700 bg-black">

        <h3 className="text-xl font-bold mb-4">Output</h3>

        {runResults.length === 0 && (
          <p className="text-gray-400">Run to see results</p>
        )}

        {runResults.map((r, i) => (
          <div key={i} className="mb-4 p-3 border-b border-gray-700">
            <p className={r.passed ? "text-green-400" : "text-red-400"}>
              Test Case {i + 1}: {r.passed ? "Passed" : "Failed"}
            </p>
            <pre className="text-sm whitespace-pre-wrap">
Input:
{r.input}

Your Output:
{r.output}

Expected:
{r.expected}
            </pre>
          </div>
        ))}

        {finalResult !== null && (
          <div className="mt-6 text-lg font-bold">
            {finalResult
              ? "All Test Cases Passed (Including Hidden) ✅"
              : "Hidden Test Cases Failed ❌"}
          </div>
        )}
      </div>

    </div>
  );
};

export default CodingQuestion;