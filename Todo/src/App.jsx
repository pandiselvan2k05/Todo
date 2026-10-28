
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

import Admin from './pages/Admin';
import Login from './pages/Login';
import User from './pages/User';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useEffect } from "react";

const scheduleSessionExpiry = () => {
  const token = localStorage.getItem("token");
  if (!token) return () => {};

  let timeoutId;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return () => {};

    const expire = () => {
      const remaining = payload.exp * 1000 - Date.now();
      if (remaining <= 0) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.replace("/login?expired=1");
        return;
      }
      timeoutId = window.setTimeout(expire, Math.min(remaining, 2_147_000_000));
    };
    expire();
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.replace("/login");
  }

  return () => window.clearTimeout(timeoutId);
};

function App() {
  useEffect(() => {
    let cancelExpiry = scheduleSessionExpiry();
    const refreshExpiry = () => {
      cancelExpiry();
      cancelExpiry = scheduleSessionExpiry();
    };
    window.addEventListener("auth:login", refreshExpiry);
    window.addEventListener("storage", refreshExpiry);
    return () => {
      cancelExpiry();
      window.removeEventListener("auth:login", refreshExpiry);
      window.removeEventListener("storage", refreshExpiry);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<Admin />} />
             <Route
            path="/admin/users"
            element={<Admin />}
          />
          <Route
            path="/admin/settings"
            element={<h2>Admin Settings</h2>}
          />
         </Route>
        <Route path="/user" element={<User />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
