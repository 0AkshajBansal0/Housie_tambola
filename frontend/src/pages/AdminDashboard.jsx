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
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter number (1-90)"
          className="p-2 rounded bg-gray-800"
        />

        <button
          onClick={handleDraw}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Draw Number
        </button>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {drawnNumbers.map((num, index) => (
          <div
            key={index}
            className="bg-blue-600 p-3 text-center rounded"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;