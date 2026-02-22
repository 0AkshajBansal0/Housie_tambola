import MCQQuestion from "./MCQQuestion";
import CaseQuestion from "./CaseQuestion";
import CodingQuestion from "./CodingQuestion";

const QuestionModal = ({
  question,
  teamName,
  onClose,
  onSubmissionResult
}) => {

  return (
    <div className="fixed inset-0 z-50 bg-black">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-white text-2xl z-50"
      >
        ✖
      </button>

      {/* Render Question Fullscreen */}
      {question.type === "MCQ" && (
        <MCQQuestion
          question={question}
          teamName={teamName}
          onSubmissionResult={onSubmissionResult}
        />
      )}

      {question.type === "CASE" && (
        <CaseQuestion
          question={question}
          teamName={teamName}
          onSubmissionResult={onSubmissionResult}
        />
      )}

      {question.type === "CODING" && (
        <CodingQuestion
          question={question}
          teamName={teamName}
          onSubmissionResult={onSubmissionResult}
        />
      )}

    </div>
  );
};

export default QuestionModal;