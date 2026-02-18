import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import socket from "../services/socket";

const AdminLayout = ({ setIsLoggedIn }) => {

  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [latestNumber, setLatestNumber] = useState(null);

  useEffect(() => {

    socket.on("initialDrawnNumbers", (nums) => {
      setDrawnNumbers(nums);
    });

    socket.on("numberDrawn", (num) => {
      setDrawnNumbers(prev => [...prev, num]);
      setLatestNumber(num);
    });

    // ✅ ADD THIS HERE
    socket.on("gameReset", () => {
      setDrawnNumbers([]);
      setLatestNumber(null);
    });

    return () => {
      socket.off("initialDrawnNumbers");
      socket.off("numberDrawn");
      socket.off("gameReset"); // cleanup bhi zaroori
    };

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <Navbar setIsLoggedIn={setIsLoggedIn} />
      <div className="p-6">
        <Outlet context={{
          drawnNumbers,
          latestNumber,
          setDrawnNumbers,
          setLatestNumber
        }} />
      </div>
    </div>
  );
};

export default AdminLayout;