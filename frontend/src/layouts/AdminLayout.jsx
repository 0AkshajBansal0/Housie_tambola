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
    <div
      className="min-h-screen text-white bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/main_bg.jpg')"
      }}
    >
      <Navbar setIsLoggedIn={setIsLoggedIn} />

      <div className="p-6 backdrop-blur-[2px] bg-black/40 min-h-screen">
        <Outlet
          context={{
            drawnNumbers,
            latestNumber,
            setDrawnNumbers,
            setLatestNumber
          }}
        />
      </div>
    </div>
  );
};

export default AdminLayout;