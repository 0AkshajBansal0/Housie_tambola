import { useEffect, useState } from "react";
import socket from "../services/socket";

const ParticipantDashboard = () => {

  const stored = JSON.parse(localStorage.getItem("ticketData"));

  const [ticket] = useState(stored?.numbers || []);
  const [teamName] = useState(stored?.teamName || "");
  const [drawnNumbers, setDrawnNumbers] = useState(stored?.drawnNumbers || []);
  const [activeNumber, setActiveNumber] = useState(null);

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
    });

    return () => {
      socket.off("numberDrawn");
      socket.off("gameReset");
    };

  }, []);

  const handleNumberClick = (num) => {
    if (!drawnNumbers.includes(num)) return;
    alert(`Open question panel for ${num}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3e2f1c] via-[#2a2116] to-black p-10">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#e6c79c] tracking-wide">
          TEAM: {teamName}
        </h1>
      </div>

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

          {/* Column Labels */}
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

          {/* Ticket Grid */}
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

    </div>
  );
};

export default ParticipantDashboard;