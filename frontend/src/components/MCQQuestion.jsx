import { useState } from "react";
import API from "../services/api";

const MCQQuestion = ({ question, teamName }) => {

  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);

  const submit = async () => {

    const res = await API.post("/submit", {
      teamCode: teamName,
      number: question.number,
      answer: selected
    });

    setResult(res.data);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{question.questionText}</h2>

      {question.options.map((opt, i) => (
        <div key={i}>
          <input
            type="radio"
            name="mcq"
            value={opt}
            onChange={(e) => setSelected(e.target.value)}
          /> {opt}
        </div>
      ))}

      <button
        onClick={submit}
        className="mt-4 bg-brown-600 px-4 py-2 bg-yellow-500"
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

export default MCQQuestion;