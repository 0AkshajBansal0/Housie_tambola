import { useEffect,useState } from "react";
import API from "../services/api";

const LogsPage = () => {

  const [logs,setLogs] = useState([]);

  const fetchLogs = async () => {

    try{

      const res = await API.get("/admin/logs");
      setLogs(res.data);

    }catch(err){
      console.error("Logs fetch failed");
    }

  };

  useEffect(()=>{

    fetchLogs();

  },[]);

  return (

    <div className="p-10 text-white">

      <h1 className="text-3xl font-bold text-yellow-400 mb-8 tracking-widest">
        DRAW HISTORY
      </h1>

      <div className="grid grid-cols-10 gap-4">

        {logs.map((log,i)=>(
          <div
            key={i}
            className="bg-black border border-yellow-500/40 rounded-xl p-4 text-center hover:scale-105 transition-all"
          >
            <div className="text-2xl font-bold text-yellow-400">
              {log.number}
            </div>

            <div className="text-xs text-gray-400 mt-2">
              {new Date(log.drawnAt).toLocaleTimeString()}
            </div>

          </div>
        ))}

      </div>

    </div>

  );

};

export default LogsPage;