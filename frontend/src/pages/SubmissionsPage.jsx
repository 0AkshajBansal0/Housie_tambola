import { useEffect, useState } from "react";
import API from "../services/api";

const SubmissionsPage = () => {

  const [grouped,setGrouped] = useState({});

  const fetchSubmissions = async () => {

    try{

      const res = await API.get("/admin/submissions");

      const submissions = res.data;

      const map = {};

      submissions.forEach(s => {

        if(!map[s.ticketId]){
          map[s.ticketId] = [];
        }

        map[s.ticketId].push(s);

      });

      setGrouped(map);

    }catch(err){
      console.error("Submission fetch failed");
    }

  };

  useEffect(()=>{

    fetchSubmissions();
    const interval = setInterval(fetchSubmissions,4000);

    return ()=>clearInterval(interval);

  },[]);

  return (

    <div className="p-10 text-white">

      <h1 className="text-3xl font-bold text-yellow-400 mb-10 tracking-widest">
        SUBMISSIONS TRACKER
      </h1>

      <div className="grid grid-cols-3 gap-8">

        {Object.keys(grouped).map(ticketId => (

          <div
            key={ticketId}
            className="bg-black border border-yellow-500/40 rounded-xl p-6"
          >

            <div className="text-yellow-400 font-bold mb-4 text-lg">
              Ticket {ticketId}
            </div>

            <div className="space-y-2">

              {grouped[ticketId].map((s,i)=>(
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-900 px-3 py-2 rounded"
                >

                  <div className="flex gap-3">

                    <span className="font-bold">
                      {s.number}
                    </span>

                    {s.isCorrect
                      ? <span className="text-green-400">✔</span>
                      : <span className="text-red-400">✖</span>
                    }

                  </div>

                  <span className="text-gray-400 text-sm">
                    {new Date(s.createdAt).toLocaleTimeString()}
                  </span>

                </div>
              ))}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default SubmissionsPage;