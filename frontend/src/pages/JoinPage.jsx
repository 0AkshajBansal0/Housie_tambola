import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

const JoinPage = () => {

  const { token } = useParams();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) return alert("Enter team name");

    try {
      setLoading(true);

      const res = await API.post(`/join/${token}`, {
        teamName: teamName.trim()
      });

      localStorage.setItem("ticketData", JSON.stringify(res.data));

      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Join failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white">

      <div className="bg-gradient-to-br from-gray-900 to-black p-12 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.2)] w-[420px] border border-yellow-500/30">

        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6 tracking-widest">
          HOUSIE ENTRY
        </h2>

        <form onSubmit={handleJoin} className="space-y-6">

          <input
            type="text"
            placeholder="Enter Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-800 text-white text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Joining..." : "ENTER GAME"}
          </button>

        </form>
      </div>

    </div>
  );
};

export default JoinPage;