
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginApi } from "../api/auth";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setMessage("Your session expired. Please log in again.");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await loginApi(formData);
      const { token } = response;
      const role = response.user?.role;

      if (!token || !role) {
        throw new Error("The server returned an invalid login response. Please try again.");
      }

      if (role !== "admin" && role !== "user") {
        throw new Error("Your account has an unsupported role. Please contact support.");
      }

      // Store JWT token and role
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      window.dispatchEvent(new Event("auth:login"));

      // Role-based navigation
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }

    } catch (error) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (!error.response) {
        setMessage("Unable to reach the server. Check your connection and try again.");
      } else if (status === 401) {
        setMessage(serverMessage || "Email or password is incorrect.");
      } else if (status >= 500) {
        setMessage("The server encountered an error. Please try again later.");
      } else {
        setMessage(serverMessage || error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Login to your account</p>

        <label>Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="message" role="alert">{message}</p>}
      </form>
    </div>
  );
}

export default Login;
