import { useEffect, useState } from "react";
import socket from "../services/socket";
import API from "../services/api";
import QuestionModal from "../components/QuestionModal";
import Confetti from "react-confetti";

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

  const [rewardStatus, setRewardStatus] = useState({});
  const [submittedNumbers, setSubmittedNumbers] = useState([]);

  const [rewardPopup, setRewardPopup] = useState(null);
  const [confetti, setConfetti] = useState(false);

  const [events, setEvents] = useState([]);

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


  /* ================= FETCH REWARD STATUS ================= */

  useEffect(() => {

    const fetchRewardStatus = async () => {

      try {

        if (!token) return;

        const res = await API.get(`/submissions/rewards/${token}`);

        setRewardStatus(res.data.rewardStatus || {});

      } catch {
        console.log("reward status fetch failed");
      }

    };

    fetchRewardStatus();

  }, [token]);


  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {

    socket.emit("clientReady"); 
    
    socket.on("initialDrawnNumbers", (numbers) => {
      setDrawnNumbers(numbers || []);
    });

    socket.on("numberDrawn", (num) => {

      setDrawnNumbers(prev =>
        prev.includes(num) ? prev : [...prev, num]
      );

      setEvents(prev => [
        { text: `Number ${num} drawn` },
        ...prev.slice(0, 10)
      ]);

      setActiveNumber(num);

      setTimeout(() => setActiveNumber(null), 2000);

    });

    socket.on("eventFeed", (event) => {

      setEvents(prev => [
        event,
        ...prev.slice(0,10)
      ]);

    });

    socket.on("gameReset", () => {

      setDrawnNumbers([]);
      setRewardStatus({});
      setSubmittedNumbers([]);
      setRewardPopup(null);
      setEvents([]);

    });

    return () => {
      socket.off("initialDrawnNumbers");
      socket.off("numberDrawn");
      socket.off("gameReset");
      socket.off("eventFeed");
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
    setConfetti(true);

    setTimeout(() => {
      setRewardPopup(null);
      setConfetti(false);
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

      {/* CONFETTI */}
      {confetti && (
        <Confetti
          numberOfPieces={400}
          recycle={false}
          gravity={0.3}
          colors={["#FFD700","#FFC107","#FFE082","#FFF176"]}
        />
      )}

      {/* ================= REWARD POPUP ================= */}

      {rewardPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" />
          <div className="relative text-center animate-celebrate">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-widest text-yellow-300 drop-shadow-[0_0_25px_rgba(255,215,0,0.9)]">
              {rewardPopup}
            </h1>
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


      {/* PAGE LAYOUT */}

      <div className="grid grid-cols-12 gap-8">

        {/* LEFT PANEL */}

        <div className="col-span-3">

          <div className="bg-[#1c140c] p-6 rounded-xl border border-[#6b4f2a] shadow-lg">

            <h2 className="text-xl font-bold text-yellow-200 mb-4">
              WIN PROGRESS
            </h2>

            <div className="space-y-4">

              {[
                {label:"Early Five", key:"earlyFive"},
                {label:"Corners", key:"corners"},
                {label:"First Line", key:"firstLine"},
                {label:"Second Line", key:"secondLine"},
                {label:"Third Line", key:"thirdLine"},
                {label:"Full House", key:"fullHouseRank"}
              ].map((item) => {

                const done =
                  item.key === "fullHouseRank"
                    ? rewardStatus?.fullHouseRank > 0
                    : rewardStatus?.[item.key];

                return (
                  <div key={item.key} className="flex justify-between items-center">

                    <span className="text-[#e6c79c]">
                      {item.label}
                    </span>

                    <span className={`
                    px-2 py-1 text-xs rounded
                    ${done ? "bg-green-500 text-black" : "bg-gray-700"}
                    `}>
                      {done ? "✓" : "—"}
                    </span>

                  </div>
                );

              })}

            </div>

          </div>

        </div>


        {/* CENTER PANEL */}

        <div className="col-span-6">

          <div className="flex justify-center overflow-x-auto">

            <div className="relative bg-[#f5e6c8] p-10 rounded-lg border-4 border-[#6b4f2a] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">

              <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-1.png')]" />

              <div className="grid grid-cols-9 gap-0">

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
                        relative h-16 w-16 flex items-center justify-center
                        text-xl font-black border border-[#6b4f2a]
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

        </div>


        {/* RIGHT PANEL */}

        <div className="col-span-3">

          <div className="bg-[#1c140c] p-6 rounded-xl border border-[#6b4f2a] shadow-lg">

            <h2 className="text-xl font-bold text-yellow-200 mb-4">
              LIVE EVENT FEED
            </h2>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">

              {events.map((e,i)=>(
                <div
                  key={i}
                  className="p-3 bg-[#2a1c0f] rounded border border-[#6b4f2a]"
                >
                  <p className="text-sm text-[#e6c79c]">
                    {e.text}
                  </p>
                </div>
              ))}

            </div>

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

      <style>{`
      @keyframes drawX {
        0% { transform: scaleX(0); opacity: 0; }
        100% { transform: scaleX(1); opacity: 1; }
      }

      .animate-drawX {
        animation: drawX 0.3s ease-out forwards;
      }

      @keyframes fadeIn {
        from { opacity:0 }
        to { opacity:1 }
      }

      .animate-fadeIn{
        animation: fadeIn 0.4s ease;
      }

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
      `}</style>

    </div>

  );

};

export default ParticipantDashboard;