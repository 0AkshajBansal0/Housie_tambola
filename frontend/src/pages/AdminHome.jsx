import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

const AdminHome = () => {

  const {
    drawnNumbers,
    latestNumber,
    setLatestNumber,
    setDrawnNumbers
  } = useOutletContext();

  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  const [rolling, setRolling] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const playSound = () => {
    const audio = new Audio("/draw.mp3");
    audio.play();
  };

  const handleDraw = async () => {
    if (disabled) return;

    setDisabled(true);
    setRolling(true);

    let temp;
    const interval = setInterval(() => {
      temp = Math.floor(Math.random() * 90) + 1;
      setLatestNumber(temp);
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      setRolling(false);

      try {
        await API.post("/admin/draw");
        playSound();
      } catch {
        alert("Draw failed");
      }

      setTimeout(() => setDisabled(false), 5000);

    }, 3000);
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to reset the game?")) return;

    try {
      await API.delete("/admin/reset");
      setDrawnNumbers([]);
      setLatestNumber(null);
    } catch {
      alert("Reset failed");
    }
  };

  return (
    <div className="space-y-10">

      <div className="flex justify-center gap-6">
        <button
          onClick={handleDraw}
          disabled={disabled}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600
                     text-black px-12 py-5 rounded-2xl
                     text-2xl font-bold
                     hover:scale-105 transition-all duration-300
                     disabled:opacity-50"
        >
          🎲 GENERATE RANDOM NUMBER
        </button>

        <button
          onClick={handleClear}
          className="bg-red-600 px-8 py-5 rounded-2xl
                     text-xl font-bold hover:bg-red-700"
        >
          🧹 CLEAR BOARD
        </button>
      </div>

      <div className="flex justify-center">
        {latestNumber && (
          <div className={`text-7xl font-extrabold transition-all duration-500
            ${rolling ? "text-white animate-pulse" : "text-yellow-400 drop-shadow-[0_0_25px_#FFD700]"}
          `}>
            {latestNumber}
          </div>
        )}
      </div>

      <div className="grid grid-cols-10 gap-3 max-w-6xl mx-auto">
        {numbers.map((num) => {
          const isDrawn = drawnNumbers.includes(num);

          return (
            <div
              key={num}
              className={`p-4 text-center rounded-xl font-bold text-lg
                transition-all duration-500
                ${
                  isDrawn
                    ? "bg-yellow-400 text-black shadow-[0_0_20px_#FFD700] scale-110"
                    : "bg-gray-800 text-gray-500"
                }
              `}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHome;