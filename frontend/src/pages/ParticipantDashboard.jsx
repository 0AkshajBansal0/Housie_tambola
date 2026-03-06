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

  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [activeNumber, setActiveNumber] = useState(null);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [rewardStatus, setRewardStatus] = useState(null);
  const [submittedNumbers, setSubmittedNumbers] = useState([]);

  const [rewardPopup, setRewardPopup] = useState(null);

  /* ================= FETCH SOLVED NUMBERS ================= */

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


  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {

    socket.on("initialDrawnNumbers", (numbers) => {
      setDrawnNumbers(numbers || []);
    });

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
      setRewardPopup(null);

    });

    return () => {
      socket.off("initialDrawnNumbers");
      socket.off("numberDrawn");
      socket.off("gameReset");
    };

  }, []);


  /* ================= REWARD POPUP LOGIC ================= */

  const triggerRewardPopup = (newRewardStatus) => {

    if (!rewardStatus) {
      setRewardStatus(newRewardStatus);
      return;
    }

    if (!rewardStatus.earlyFive && newRewardStatus.earlyFive) {
      showReward("EARLY FIVE COMPLETED 🎉");
    }

    if (!rewardStatus.corners && newRewardStatus.corners) {
      showReward("CORNERS COMPLETED 🎉");
    }

    if (!rewardStatus.firstLine && newRewardStatus.firstLine) {
      showReward("FIRST LINE COMPLETED 🎉");
    }

    if (!rewardStatus.secondLine && newRewardStatus.secondLine) {
      showReward("SECOND LINE COMPLETED 🎉");
    }

    if (!rewardStatus.thirdLine && newRewardStatus.thirdLine) {
      showReward("THIRD LINE COMPLETED 🎉");
    }

    if (
      rewardStatus.fullHouseRank === 0 &&
      newRewardStatus.fullHouseRank > 0
    ) {
      showReward(`FULL HOUSE! Rank #${newRewardStatus.fullHouseRank} 🏆`);
    }

    setRewardStatus(newRewardStatus);

  };

  const showReward = (text) => {

    setRewardPopup(text);

    setTimeout(() => {
      setRewardPopup(null);
    }, 10000);

  };


  /* ================= NUMBER CLICK ================= */

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

      {/* ================= REWARD POPUP ================= */}

      {rewardPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* background glow */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" />
          {/* celebration text */}
          <div className="relative text-center animate-celebrate">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-widest text-yellow-300 drop-shadow-[0_0_25px_rgba(255,215,0,0.9)]">
              {rewardPopup}
            </h1>
            {/* sparkle particles */}
            <div className="sparkles"></div>
          </div>
        </div>
      )}


      {/* HEADER */}

      <div className="text-center mb-10">

        <h1 className="text-4xl font-extrabold text-[#e6c79c] tracking-widest drop-shadow-lg">
          TEAM: {teamName}
        </h1>

      </div>


      {/* TICKET */}

      <div className="flex justify-center">

        <div className="relative bg-[#f5e6c8] p-10 rounded-lg border-4 border-[#6b4f2a] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">

          <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-1.png')]" />

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
                        <span className="relative z-10">
                          {num}
                        </span>

                        {isSubmitted && (
                          <>
                            <div className="absolute w-full h-[3px] bg-[#7a0f0f] rotate-45 animate-drawX" />
                            <div className="absolute w-full h-[3px] bg-[#7a0f0f] -rotate-45 animate-drawX" />
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


      {/* QUESTION MODAL */}

      {selectedQuestion && (

        <QuestionModal
          question={selectedQuestion}
          token={token}
          onClose={() => setSelectedQuestion(null)}

          onSubmissionResult={(data) => {

            triggerRewardPopup(data.rewardStatus);

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


      <style>
        {`

@keyframes drawX {
  0% { transform: scaleX(0); opacity: 0; }
  100% { transform: scaleX(1); opacity: 1; }
}

.animate-drawX {
  animation: drawX 0.3s ease-out forwards;
}

/* background fade */

@keyframes fadeIn {
  from { opacity:0 }
  to { opacity:1 }
}

.animate-fadeIn{
  animation: fadeIn 0.4s ease;
}

/* main celebration animation */

@keyframes celebrate {

  0%{
    transform: scale(0.6) translateY(40px);
    opacity:0;
  }

  50%{
    transform: scale(1.15) translateY(-10px);
  }

  100%{
    transform: scale(1);
    opacity:1;
  }

}

.animate-celebrate{
  animation: celebrate 0.8s cubic-bezier(.22,1.2,.36,1);
}

/* sparkles */

.sparkles::before,
.sparkles::after{

  content:"✨ ✨ ✨ ✨ ✨ ✨ ✨";
  position:absolute;
  left:50%;
  transform:translateX(-50%);
  font-size:40px;
  letter-spacing:25px;
  animation:sparkleBurst 1.5s ease-out infinite;

}

.sparkles::before{
  top:-80px;
}

.sparkles::after{
  bottom:-80px;
}

@keyframes sparkleBurst{

  0%{
    opacity:0;
    transform:translateX(-50%) scale(0.5);
  }

  50%{
    opacity:1;
    transform:translateX(-50%) scale(1.2);
  }

  100%{
    opacity:0;
    transform:translateX(-50%) scale(1);
  }

}

`}
      </style>

    </div>

  );

};

export default ParticipantDashboard;