import { useEffect, useState } from "react";
import socket from "../services/socket";
import API from "../services/api";
import QuestionModal from "../components/QuestionModal";

const ParticipantDashboard = () => {

  const storedData = localStorage.getItem("ticketData");
  const stored = storedData ? JSON.parse(storedData) : null;

  const [ticket] = useState(stored?.numbers || []);
  const [teamName] = useState(stored?.teamName || "");
  const [drawnNumbers, setDrawnNumbers] = useState(stored?.drawnNumbers || []);
  const [activeNumber, setActiveNumber] = useState(null);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [rewardStatus, setRewardStatus] = useState(null);

  // ---------------- SOCKET EVENTS ----------------
  useEffect(() => {

    socket.on("numberDrawn", (num) => {
      setDrawnNumbers(prev => [...prev, num]);
      setActiveNumber(num);

      setTimeout(() => {
        setActiveNumber(null);
      }, 2000);
    });

    socket.on("gameReset", () => {
      setDrawnNumbers([]);
      setRewardStatus(null);
    });

    return () => {
      socket.off("numberDrawn");
      socket.off("gameReset");
    };

  }, []);

  // ---------------- FETCH QUESTION ----------------
  const handleNumberClick = async (num) => {

    if (!drawnNumbers.includes(num)) return;

    try {
      setLoadingQuestion(true);

      const res = await API.get(`/questions/${num}`);
      setSelectedQuestion(res.data);

    } catch (err) {
      alert("Failed to load question");
    } finally {
      setLoadingQuestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3e2f1c] via-[#2a2116] to-black p-10">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#e6c79c] tracking-wide">
          TEAM: {teamName}
        </h1>
      </div>

      {/* REWARD STATUS PANEL */}
      {rewardStatus && (
        <div className="mb-8 text-center text-[#f5e6c8]">
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

        <div
          className="
            bg-[#f5e6c8]
            p-10
            rounded-lg
            shadow-[0_10px_40px_rgba(0,0,0,0.6)]
            border-4 border-[#6b4f2a]
          "
        >

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

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => !isBlank && handleNumberClick(num)}
                    className={`
                      h-20 w-20 flex items-center justify-center
                      text-2xl font-extrabold
                      border border-[#6b4f2a]
                      transition-all duration-300
                      
                      ${isBlank && "bg-transparent"}
                      
                      ${!isBlank && !isDrawn && "bg-[#fdf6e3] text-[#4b3214]"}
                      
                      ${isDrawn && "bg-[#d2a86a] text-[#2a1c0f]"}
                      
                      ${isActive && "scale-110 bg-[#c68b3c]"}
                      
                      ${!isBlank ? "cursor-pointer hover:bg-[#e6c79c]" : ""}
                    `}
                  >
                    {!isBlank && num}
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
          teamName={teamName}
          onClose={() => setSelectedQuestion(null)}
          onSubmissionResult={(data) => {
            setRewardStatus(data.rewardStatus);
          }}
        />
      )}

    </div>
  );
};

export default ParticipantDashboard;