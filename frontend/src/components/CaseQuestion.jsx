import { useState } from "react";
import API from "../services/api";

const CaseQuestion = ({ question, teamName }) => {

  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const submit = async () => {

    const res = await API.post("/submit", {
      teamCode: teamName,
      number: question.number,
      answer
    });

    setResult(res.data);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{question.questionText}</h2>

      <textarea
        className="w-full border p-2"
        rows="5"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <button
        onClick={submit}
        className="mt-4 bg-yellow-500 px-4 py-2"
      >
        Submit
      </button>

      {result && (
        <p className="mt-3">
          {result.isCorrect ? "Correct ✅" : "Wrong ❌"}
        </p>
      )}
    </div>
  );
};

export default CaseQuestion;