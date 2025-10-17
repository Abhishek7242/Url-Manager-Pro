import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLink } from "react-icons/fi";
import ForgotPasswordModal from "./ForgotPasswordModal";
import "../CSS/Login.css";
import { Link, useNavigate } from "react-router-dom";
import UrlContext from "../../context/url_manager/UrlContext";

export default function Login() {
    const context = React.useContext(UrlContext);
    const { API_BASE, makeAuthenticatedRequest } = context;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const emailValid = /\S+@\S+\.\S+/.test(email);

 async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!emailValid) return setError("Please enter a valid email.");
    if (!password || password.length < 6)
      return setError("Please enter your password (min 6 chars).");
 
 
    // Send OTP then navigate to verify page
    try {
      // Step 1: Get CSRF cookie first (this is crucial!)
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      if (isSubmitting) return;
      setIsSubmitting(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/login`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

    
      const data = await response.json();
      console.log( data);
      if (!response.ok) {
        
        throw new Error(data.message );
      }
      navigate("/");
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
    // TODO: call backend auth endpoint
    // simulate success
  }

  return (
    <div className="login-page">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <FiLink />
        </div>
        <div className="brand-text">
          <h2>URL Manager Pro</h2>
        </div>
      </Link>
      <div className="login-card">
        <div className="login-top">
          <div className="login-head">
            <h2>Welcome back</h2>
            <p className="sub">Sign in to manage your links</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <FiMail className="icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <FiLock className="icon" />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="pwd-toggle"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </label>

          <div className="row-between">
            <div className="remember">
              <label className="remember-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="button"
              className="link-btn"
              onClick={() => setForgotOpen(true)}
            >
              Forgot password?
            </button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="login-btn-submit">
            Sign In
          </button>

          <div className="alt">
            Don't have an account? <a href="/signup">Sign up</a>
          </div>
        </form>
      </div>

      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        onDone={(email) => {
          setForgotOpen(false);
          alert(`Password reset successful for ${email} (simulated).`);
        }}
      />
    </div>
  );
}
