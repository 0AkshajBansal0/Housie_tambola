import { useEffect, useState } from "react";
import socket from "../services/socket";
import API from "../services/api";
import QuestionModal from "../components/QuestionModal";

const ParticipantDashboard = () => {

  const storedData = localStorage.getItem("ticketData");
  const stored = storedData ? JSON.parse(storedData) : null;

  const token = stored?.token;

  const [ticket] = useState(stored?.numbers || []);
  const [teamName] = useState(stored?.teamName || "");
  const [drawnNumbers, setDrawnNumbers] = useState(stored?.drawnNumbers || []);
  const [activeNumber, setActiveNumber] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [rewardStatus, setRewardStatus] = useState(null);
  const [submittedNumbers, setSubmittedNumbers] = useState([]);

  // ================= FETCH SOLVED NUMBERS =================
  useEffect(() => {
    const fetchSolvedNumbers = async () => {
      try {
        if (!token) return;
        const res = await API.get(`/submissions/solved/${token}`);
        setSubmittedNumbers(res.data.solvedNumbers || []);
      } catch {
        console.error("Failed to fetch solved numbers");
      }
    };
    fetchSolvedNumbers();
  }, [token]);

  // ================= SOCKET EVENTS =================
  useEffect(() => {

    socket.on("numberDrawn", (num) => {
      setDrawnNumbers(prev =>
        prev.includes(num) ? prev : [...prev, num]
      );

      setActiveNumber(num);
      setTimeout(() => setActiveNumber(null), 2000);
    });

    socket.on("gameReset", () => {
      setDrawnNumbers([]);
      setRewardStatus(null);
      setSubmittedNumbers([]);
    });

    return () => {
      socket.off("numberDrawn");
      socket.off("gameReset");
    };

  }, []);

  // ================= FETCH QUESTION =================
  const handleNumberClick = async (num) => {

    if (!drawnNumbers.includes(num)) return;
    if (submittedNumbers.includes(num)) return;

    try {
      setLoadingQuestion(true);
      const res = await API.get(`/questions/${num}`);
      setSelectedQuestion(res.data);
    } catch {
      alert("Failed to load question");
    } finally {
      setLoadingQuestion(false);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-[#2a2116] bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px]">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#e6c79c] tracking-widest drop-shadow-lg">
          TEAM: {teamName}
        </h1>
      </div>

      {/* REWARD STATUS */}
      {rewardStatus && (
        <div className="mb-8 text-center text-[#f5e6c8] space-y-1">
          <p>Early Five: {rewardStatus.earlyFive ? "Unlocked ✅" : "—"}</p>
          <p>Corners: {rewardStatus.corners ? "Unlocked ✅" : "—"}</p>
          <p>1st Line: {rewardStatus.firstLine ? "Unlocked ✅" : "—"}</p>
          <p>2nd Line: {rewardStatus.secondLine ? "Unlocked ✅" : "—"}</p>
          <p>3rd Line: {rewardStatus.thirdLine ? "Unlocked ✅" : "—"}</p>
          {rewardStatus.fullHouseRank > 0 && (
            <p>Full House Rank: {rewardStatus.fullHouseRank} 🏆</p>
          )}
        </div>
      )}

      {/* TICKET */}
      <div className="flex justify-center">
        <div className="bg-[#f5e6c8] p-10 rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-4 border-[#6b4f2a] relative">

          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-1.png')]" />

          {/* COLUMN LABELS */}
          <div className="grid grid-cols-9 mb-4 text-center font-semibold text-[#5c3d1e] text-sm tracking-wide">
            <div>1-9</div>
            <div>10s</div>
            <div>20s</div>
            <div>30s</div>
            <div>40s</div>
            <div>50s</div>
            <div>60s</div>
            <div>70s</div>
            <div>80-90</div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-9">

            {ticket.map((row, rowIndex) =>
              row.map((num, colIndex) => {

                const isBlank = num === null;
                const isDrawn = !isBlank && drawnNumbers.includes(num);
                const isActive = activeNumber === num;
                const isSubmitted = submittedNumbers.includes(num);

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => !isBlank && handleNumberClick(num)}
                    className={`
                      relative h-20 w-20 flex items-center justify-center
                      text-2xl font-black border border-[#6b4f2a]
                      transition-all duration-300
                      ${isBlank && "bg-transparent"}
                      ${!isBlank && !isDrawn && "bg-[#fdf6e3] text-[#4b3214]"}
                      ${isDrawn && "bg-[#d2a86a] text-[#2a1c0f]"}
                      ${isSubmitted && "bg-[#c39a5c] shadow-[inset_0_0_12px_rgba(0,0,0,0.35)]"}
                      ${isActive && "scale-110 bg-[#c68b3c]"}
                      ${!isBlank && !isSubmitted ? "cursor-pointer hover:bg-[#e6c79c]" : ""}
                    `}
                  >
                    {!isBlank && (
                      <>
                        <span className={`relative z-10 ${isSubmitted ? "opacity-80" : ""}`}>
                          {num}
                        </span>

                        {isSubmitted && (
                          <>
                            {/* LINE 1 */}
                            <div className="absolute w-full h-[3px] bg-[#7a0f0f] rotate-45 animate-drawX shadow-[0_0_4px_rgba(122,15,15,0.6)]" />

                            {/* LINE 2 */}
                            <div className="absolute w-full h-[3px] bg-[#7a0f0f] -rotate-45 animate-drawX shadow-[0_0_4px_rgba(122,15,15,0.6)]" />
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>

      {/* LOADING */}
      {loadingQuestion && (
        <div className="text-center mt-6 text-[#f5e6c8]">
          Loading question...
        </div>
      )}

      {/* QUESTION MODAL */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion}
          token={token}
          onClose={() => setSelectedQuestion(null)}
          onSubmissionResult={(data) => {

            setRewardStatus(data.rewardStatus);

            if (data.isCorrect && data.number) {
              setSubmittedNumbers(prev =>
                prev.includes(data.number)
                  ? prev
                  : [...prev, data.number]
              );
            }

            setSelectedQuestion(null);
          }}
        />
      )}

      {/* ANIMATION */}
      <style>
        {`
          @keyframes drawX {
            0% { transform: scaleX(0) rotate(var(--rotate)); opacity: 0; }
            100% { transform: scaleX(1) rotate(var(--rotate)); opacity: 1; }
          }
          .animate-drawX {
            animation: drawX 0.3s ease-out forwards;
          }
        `}
      </style>

    </div>
  );
};

export default ParticipantDashboard;