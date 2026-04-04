import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Login.css";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { setIsAuthenticated } = useAuth();

  const navigate = useNavigate();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter Username and/or Password");
      return;
    }

    const response: ResponseMessageType = await window.auth.login({
      username,
      password,
    });

    if (!response.success) {
      setError(response.message);
      return;
    }

    setIsAuthenticated(true);
    navigate("/");
  };

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (username.includes(" ")) {
      setError("Username cannot contain spaces");
      return;
    }
    if (!password.trim()) {
      setError("Password needs to be non empty");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password needs to match");
      return;
    }

    const response: ResponseMessageType = await window.auth.register({
      username,
      password,
    });

    if (!response.success) {
      setError(response.message);
      return;
    }

    setIsAuthenticated(true);
    navigate("/");
  };

  return (
    <div className="loginContainer">
      <button className="goBack" onClick={() => navigate("/")}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div className="loginSubContainer">
        <div className="tab-bar">
          <button
            className={`tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login to Account
          </button>
          <button
            className={`tab ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Create Account
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {tab === "login" ? (
          <form className="login" onSubmit={handleLogin}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            <button className="submit" type="submit">
              Login
            </button>
          </form>
        ) : (
          <form className="register" onSubmit={handleRegister}>
            <label htmlFor="username">Enter Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <label htmlFor="password">Enter Password:</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            <label htmlFor="confirm-password">Confirm Password:</label>
            <div className="password-wrapper">
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            <button className="submit" type="submit">
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
