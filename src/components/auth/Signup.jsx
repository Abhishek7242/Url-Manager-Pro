import React, { useState } from "react";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiLink,
  FiLoader,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "../CSS/Signup.css";
import { Link, useNavigate } from "react-router-dom";
import UrlContext from "../../context/url_manager/UrlContext";

export default function Signup({ onClose, setOpenVerifyOTPModel }) {
  const context = React.useContext(UrlContext);
  const {
    API_BASE,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    otp_token,
    setOtpToken,
  } = context;

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  // inline validation
  const nameValid = name.trim().length >= 2;
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
    return { score, label: labels[score], pct: (score / 4) * 100 };
  })();
  const passwordValid = passwordStrength.score >= 2; // require at least "Good"
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // no resend countdown in this screen

  // OTP actions moved to VerifyOtp screen

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nameValid) return alert("Please enter your name (min 2 chars).");
    if (!emailValid) return alert("Please enter a valid email.");
    if (!passwordValid)
      return alert("Please choose a stronger password (see strength).");
    // Send OTP then navigate to verify page
    try {
      // Step 1: Get CSRF cookie first (this is crucial!)
      // await fetch(
      //   "http://127.0.0.1:8000/sanctum/csrf-cookie",
      //   {
      //     method: "GET",
      //     credentials: "include",
      //   }
      // );

      if (isSubmitting) return;
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/user/signup/sendotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include", // This is important!

        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (
          data.message.includes("already exists") ||
          data.message.includes("already registered")
        ) {
          setEmailError("This email is already registered");
          return;
        }
        throw new Error(data.message || "Failed to send OTP");
      }
      setOpenVerifyOTPModel(true)
      onClose();
      setOtpToken(data.otp_token)
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="signup-page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
      >
        <div className="signup-card">
          {/* Cut / Close button (top-right) */}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cut-btn"
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "inherit",
              padding: 6,
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          <div className="signup-top">
            <div className="headline">
              <h1>Create your Url Manager account</h1>
              <p className="sub">
                Securely save, organize and revisit your links
              </p>
            </div>
          </div>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <label className="field">
              <FiUser className="icon" />
              <input
                aria-label="Full name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <div className="helper-row">
              <div className={`helper ${nameValid ? "ok" : ""}`}>
                {nameValid ? "Looks good" : "Enter at least 2 characters"}
              </div>
            </div>

            {/* Email */}
            <div className="field-row flex flex-col items-start w-full">
              <label className="field email-field w-full">
                <FiMail className="icon" />
                <input
                  aria-label="Email address"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(""); // Clear error when user types
                  }}
                  className={emailError ? "error" : ""}
                  required
                />
              </label>
              {emailError && <div className="helper error">{emailError}</div>}
            </div>

            {/* Password */}
            <label className="field">
              <FiLock className="icon" />
              <input
                aria-label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </label>

            {/* password strength */}
            <div className="pw-strength-row">
              <div className="pw-bar">
                <div
                  className="pw-fill"
                  style={{ width: `${passwordStrength.pct}%` }}
                  aria-hidden="true"
                />
              </div>
              <div
                className={`pw-label ${
                  passwordStrength.score >= 2 ? "good" : ""
                }`}
              >
                {password ? passwordStrength.label : "Enter a password"}
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={
                !(nameValid && emailValid && passwordValid) || isSubmitting
              }
            >
              {isSubmitting ? (
                <div className="flex justify-center items-center">
                  <FiLoader className="animate-spin" />
                </div>
              ) : (
                "Create account"
              )}
            </button>

            <div className="alt-line">
              Already have an account? <a href="/login">Login</a>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
