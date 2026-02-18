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
      }, 4000);
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
    alert(`Open question for number ${num}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-8">

      <h1 className="text-3xl font-bold mb-6 text-center">
        Team: {teamName}
      </h1>

      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl">

        <div className="grid grid-cols-9 gap-3">

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
                    h-16 flex items-center justify-center
                    rounded-lg font-bold text-lg
                    transition-all duration-500
                    ${isBlank ? "bg-gray-700" : ""}
                    ${!isBlank && !isDrawn ? "bg-gray-600 text-gray-300" : ""}
                    ${isDrawn ? "bg-yellow-400 text-black" : ""}
                    ${isActive ? "animate-pulse scale-125 shadow-[0_0_30px_#FFD700]" : ""}
                    ${!isBlank ? "cursor-pointer" : ""}
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
  );
};

export default ParticipantDashboard;