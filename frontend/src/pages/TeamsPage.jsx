import { useEffect, useState } from "react";
import API from "../services/api";

const TeamsPage = () => {

  const [tickets,setTickets] = useState([]);
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState("assigned");

  const fetchTickets = async () => {

    try{

      const res = await API.get("/admin/teams");

      console.log("Teams API:",res.data); // DEBUG

      setTickets(res.data || []);

    }catch(err){
      console.error("Tickets fetch failed",err);
    }finally{
      setLoading(false);
    }

  };

  useEffect(()=>{

    fetchTickets();

    const interval = setInterval(fetchTickets,3000);

    return ()=>clearInterval(interval);

  },[]);


  const filtered = tickets.filter(ticket =>
    tab === "assigned"
      ? ticket.teamName
      : !ticket.teamName
  );


  return (

    <div className="p-10 text-white">

      <h1 className="text-3xl font-bold text-yellow-400 mb-6 tracking-widest">
        TICKETS MONITOR
      </h1>


      {/* Tabs */}

      <div className="flex gap-6 mb-8">

        <button
          onClick={()=>setTab("assigned")}
          className={`px-6 py-2 rounded font-semibold ${
            tab==="assigned"
              ? "bg-yellow-500 text-black"
              : "bg-gray-800"
          }`}
        >
          Assigned
        </button>

        <button
          onClick={()=>setTab("unassigned")}
          className={`px-6 py-2 rounded font-semibold ${
            tab==="unassigned"
              ? "bg-yellow-500 text-black"
              : "bg-gray-800"
          }`}
        >
          Unassigned
        </button>

      </div>


      {loading && (
        <div className="animate-pulse text-gray-400">
          Loading tickets...
        </div>
      )}


      {/* Ticket Grid */}

      <div className="grid grid-cols-3 gap-10">

        {filtered.map(ticket => {

          const solvedNumbers = ticket.solvedNumbers || [];

          return(

            <div
              key={ticket.ticketId}
              className="bg-[#f5e6c8] text-black p-6 rounded-xl border-4 border-[#6b4f2a] shadow-lg"
            >

              {/* Team Info */}

              <div className="mb-4">

                <div className="text-lg font-bold text-[#3a250f]">
                  {ticket.teamName || "UNASSIGNED"}
                </div>

                <div className="text-xs text-gray-700">
                  Ticket ID: {ticket.ticketId}
                </div>

                {ticket.token && (
                  <div className="text-xs text-gray-500">
                    Token: {ticket.token}
                  </div>
                )}

              </div>


              {/* Ticket Numbers */}

              <div className="grid grid-cols-9 gap-1">

                {ticket.numbers.flat().map((num,i)=>{

                  const solved = solvedNumbers.includes(num);

                  return(

                    <div
                      key={i}
                      className={`relative h-10 w-10 flex items-center justify-center
                      text-sm font-bold border border-[#6b4f2a]
                      ${num ? "bg-[#fdf6e3]" : "bg-transparent"}
                      `}
                    >

                      {num}

                      {solved && (

                        <>
                          <div className="absolute w-full h-[2px] bg-red-700 rotate-45"/>
                          <div className="absolute w-full h-[2px] bg-red-700 -rotate-45"/>
                        </>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

};

export default TeamsPage;