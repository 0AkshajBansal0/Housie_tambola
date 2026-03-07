import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { setAuthToken } from "./services/api";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminHome from "./pages/AdminHome";

import TeamsPage from "./pages/TeamsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import LogsPage from "./pages/LogsPage";

import JoinPage from "./pages/JoinPage";
import ParticipantDashboard from "./pages/ParticipantDashboard";

function App() {

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      setAuthToken(token);
      setIsAdminLoggedIn(true);
    }

    setCheckingAuth(false);
  }, []);

  if (checkingAuth) return null;

  return (
    <BrowserRouter>

      <Routes>

        {/* ADMIN LOGIN */}
        <Route
          path="/admin/login"
          element={
            isAdminLoggedIn
              ? <Navigate to="/admin" replace />
              : <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
          }
        />

        {/* ADMIN PANEL */}
        <Route
          path="/admin"
          element={
            isAdminLoggedIn
              ? <AdminLayout setIsLoggedIn={setIsAdminLoggedIn}/>
              : <Navigate to="/admin/login" replace />
          }
        >

          <Route index element={<AdminHome/>}/>
          <Route path="teams" element={<TeamsPage/>}/>
          <Route path="submissions" element={<SubmissionsPage/>}/>
          <Route path="logs" element={<LogsPage/>}/>

        </Route>

        {/* PARTICIPANT */}
        <Route path="/join/:token" element={<JoinPage/>}/>
        <Route path="/dashboard" element={<ParticipantDashboard/>}/>

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;