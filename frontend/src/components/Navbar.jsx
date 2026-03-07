import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ setIsLoggedIn }) => {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    navigate("/admin/login");
  };

  return (
    <nav className="bg-black border-b border-yellow-500 p-4 flex justify-between items-center">
      <h1 className="text-yellow-400 font-bold text-xl tracking-widest">
        HOUSIE CONTROL ROOM
      </h1>
      <div className="flex gap-6 text-gray-300">
        <NavLink
          to="/admin"
          className={({isActive}) =>
            `hover:text-yellow-400 ${isActive ? "text-yellow-400" : ""}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/admin/teams"
          className={({isActive}) =>
            `hover:text-yellow-400 ${isActive ? "text-yellow-400" : ""}`
          }
        >
          Teams
        </NavLink>
        <NavLink
          to="/admin/submissions"
          className={({isActive}) =>
            `hover:text-yellow-400 ${isActive ? "text-yellow-400" : ""}`
          }
        >
          Submissions
        </NavLink>
        <NavLink
          to="/admin/logs"
          className={({isActive}) =>
            `hover:text-yellow-400 ${isActive ? "text-yellow-400" : ""}`
          }
        >
          Logs
        </NavLink>
        <button
          onClick={logout}
          className="text-red-400 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
export default Navbar;