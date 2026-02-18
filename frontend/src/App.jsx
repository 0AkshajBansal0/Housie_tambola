import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { setAuthToken } from "./services/api";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/AdminHome";
import TeamsPage from "./pages/TeamsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import LogsPage from "./pages/LogsPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {!isLoggedIn ? (
          <Route path="*" element={<AdminLogin onLogin={() => setIsLoggedIn(true)} />} />
        ) : (
          <Route path="/" element={<AdminLayout setIsLoggedIn={setIsLoggedIn} />}>
            <Route index element={<AdminHome />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;