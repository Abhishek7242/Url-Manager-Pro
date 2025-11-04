import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLink } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import ForgotPasswordModal from "./ForgotPasswordModal";
import "../CSS/Login.css";
import { Link, useNavigate } from "react-router-dom";
import UrlContext from "../../context/url_manager/UrlContext";
import Buttons from "./Buttons";

export default function Login({isOpen,isSignUp, onClose, setOpenSignupModel }) {
  const context = React.useContext(UrlContext);
  const {
    API_BASE,
    makeAuthenticatedRequest,
    screenLoading,
    setScreenLoading,
    getAllUrls,
    setUrls,
  } = context;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const emailValid = /\S+@\S+\.\S+/.test(email);
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!emailValid) return setError("Please enter a valid email.");
    if (!password || password.length < 6)
      return setError("Please enter your password (min 6 chars).");

    try {
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
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message);
      }
      setScreenLoading(true);

      onClose();

      setTimeout(() => {
        setScreenLoading(false);
      }, 3000);
      const refreshedUrls = await getAllUrls();
      if (refreshedUrls && refreshedUrls.data) {
        setUrls(refreshedUrls.data);
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          onClick={onClose}
        />

        {/* Login panel */}
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="login-page flex items-center justify-center flex-col"
        >
          {" "}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cut-btn"
          >
            ✕
          </button>
          <Buttons
            setOpenSignupModel={setOpenSignupModel}
            onClose={onClose}
            isSignUp={isSignUp}
            isLogin={isOpen}
          />
          <div className="login-card">
            {/* Cut / Close button (top-right) */}

            <div className="login-top">
              <div className="login-head">
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
                    <span className="text-white">Remember me</span>
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

              <button
                type="submit"
                className="login-btn-submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  pointerEvents: isSubmitting ? "none" : "auto",
                }}
              >
                {isSubmitting ? (
                  <>
                    {/* Small inline SVG spinner */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 50 50"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        d="M25 5a20 20 0 1 0 20 20"
                        strokeLinecap="round"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 25 25"
                          to="360 25 25"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
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
        </motion.div>
      </>
    </AnimatePresence>
  );
}
