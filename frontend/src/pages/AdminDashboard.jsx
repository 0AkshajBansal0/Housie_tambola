import { useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const AdminDashboard = () => {

  const [number, setNumber] = useState("");
  const [drawnNumbers, setDrawnNumbers] = useState([]);

  useEffect(() => {
    socket.on("initialDrawnNumbers", (numbers) => {
      setDrawnNumbers(numbers);
    });

    socket.on("numberDrawn", (num) => {
      setDrawnNumbers(prev => [...prev, num]);
    });

    return () => {
      socket.off("initialDrawnNumbers");
      socket.off("numberDrawn");
    };
  }, []);

  const handleDraw = async () => {
    if (!number) return;

    try {
      await API.post("/admin/draw", { number: Number(number) });
      setNumber("");
    } catch (err) {
      alert("Draw failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white overflow-hidden relative font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/10 blur-[150px] -z-10 pointer-events-none rounded-full"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-5xl font-black mb-10 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] uppercase tracking-wider text-center">
          Manual Dashboard
        </h1>

        <div className="flex justify-center gap-4 mb-12">
          <div className="relative group">
            <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none rounded-lg overflow-visible z-20">
              <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="6" ry="6"
                fill="none" stroke="#ff003c" strokeWidth="2"
                pathLength="100"
                strokeDasharray="100" strokeDashoffset="100"
                className="transition-all duration-1000 ease-out group-focus-within:stroke-dashoffset-0 drop-shadow-[0_0_8px_#ff003c]" />
            </svg>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter number (1-90)"
              className="relative z-10 p-4 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-red-500 text-xl w-64 shadow-inner"
            />
          </div>

          <button
            onClick={handleDraw}
            className="group relative bg-red-600 px-8 py-4 rounded-lg text-xl font-bold uppercase tracking-wider overflow-hidden hover:bg-red-700 transition duration-300 hover:shadow-[0_0_20px_#ff003c]"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
            Draw Number
          </button>
        </div>

        <div className="grid grid-cols-10 gap-3 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-md shadow-2xl">
          {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
            const isDrawn = drawnNumbers.includes(num);
            return (
              <div
                key={num}
                className={`flex items-center justify-center p-3 text-2xl font-black rounded-lg transition-all duration-300 
                  ${isDrawn
                    ? 'bg-yellow-500 text-gray-900 shadow-[0_0_15px_#eab308] border border-yellow-400 scale-105 z-10'
                    : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:bg-gray-700'}`}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;