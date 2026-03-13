import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Login.css";

function Login() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    try {
      // await window.db.login(username, password);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (password !== confirmPassword) {
        throw Error("Password needs to match");
      }
      const isOnline = await window.auth.register({ username, password });
      console.log(isOnline);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="loginContainer">
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
