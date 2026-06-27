import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center px-8 py-4 bg-gray-900 border-b border-gray-800">
      <h1 className="text-xl font-bold text-indigo-400">
        ResumeAI Pro
      </h1>

      <div className="flex items-center gap-4">
        <span>{user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}