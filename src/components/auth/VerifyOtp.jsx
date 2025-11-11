import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLink, FiKey, FiLoader, FiCheckCircle } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";
import "../CSS/VerifyOtp.css";
import { motion } from "framer-motion";

export default function VerifyOtp({ onClose }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const context = React.useContext(UrlContext);
  const {
    API_BASE,
    makeAuthenticatedRequest,
    getCsrfToken,
    screenLoading,
    setScreenLoading,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    otp_token,
    setOtpToken,
    getAllUrls,
    setUrls,
  } = context;

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Resend timer state
  const RESEND_SECONDS = 45;
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const otpToken = otp_token;

  useEffect(() => {}, [email, otpToken, navigate]);
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Countdown effect for resend button
  useEffect(() => {
    setResendTimer(RESEND_SECONDS); // start countdown on mount
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  async function handleVerify() {
    const raw = localStorage.getItem("lynkr_session");
    console.log("raw session string:", raw);

    const session = raw ? JSON.parse(raw) : null;
    console.log("parsed session:", session);

    const session_id = session?.id ?? null;
    console.log("session_id:", session_id);
    if (!otp.trim()) return;
    if (isVerifying) return;
    try {
      setIsVerifying(true);
      console.log("Starting OTP verification...");
      console.log("OTP Token:", otpToken);
      console.log("OTP:", otp);

      // Ensure CSRF cookie for Sanctum
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/signup/verifyotp`,
        {
          method: "POST",
          body: JSON.stringify({ otp, otp_token: otpToken, session_id }),
        }
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Invalid OTP");
      setVerified(true);
      setScreenLoading(true);
      console.log(data);
      onClose();
        setTimeout(() => {
          setScreenLoading(false);
        }, 3000);
        const refreshedUrls = await getAllUrls();
        if (refreshedUrls && refreshedUrls.data) {
          setUrls(refreshedUrls.data);
        }
    } catch (err) {
      console.error("OTP verify failed", err);
      setOtpError(err.message);
    } finally {
      setIsVerifying(false);
    }
  }

  // Resend OTP handler
  async function handleResend() {
    console.log( name, email, password);
    if (resendTimer > 0 || isResending) return;
    try {
      setIsResending(true);
      setResendMessage("");
      // call same endpoint that sends OTP on signup
      const resp = await fetch(`${API_BASE}/user/signup/sendotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include", // This is important!

        body: JSON.stringify({ name, email, password }),
      });
      const respData = await resp.json();
      if (!resp.ok) {
        throw new Error(respData.message || "Failed to resend OTP");
      }
      setOtpToken(respData.otp_token);

      // success: reset timer
      setResendMessage("OTP resent — check your email.");
      setResendTimer(RESEND_SECONDS);
      // start countdown again
      const interval = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Resend failed", err);
      setResendMessage(err.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="signup-page">
      <motion.div
        className="flex w-full justify-center items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22 }}
      >
        <div className="signup-card">
          <div className="signup-top">
            <div className="headline">
              <h1>Verify your email</h1>
              <p className="sub">Enter the 6-digit code sent to {email}</p>
            </div>
          </div>

          <div className="signup-form">
            <div className="field-row flex flex-col items-start w-full">
              <label className="field otp-field w-full">
                <FiKey className="icon" />
                <input
                  aria-label="OTP"
                  type="text"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setOtpError(""); // Clear error when user types
                  }}
                  className={otpError ? "error" : ""}
                />
              </label>
              {otpError && <div className="helper error">{otpError}</div>}
              <div
                className="otp-col"
                style={{ display: "flex", gap: 8, marginTop: 8 }}
              >
                <button
                  type="button"
                  className={`otp-btn verify ${verified ? "done" : ""}`}
                  onClick={handleVerify}
                  disabled={verified || isVerifying || otp.length < 4}
                >
                  {isVerifying ? (
                    <>
                      <FiLoader className="animate-spin" />
                    </>
                  ) : verified ? (
                    <>
                      <FiCheckCircle /> Verified
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>

                <button
                  type="button"
                  className="otp-btn resend"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || isResending}
                >
                  {isResending ? (
                    <FiLoader className="animate-spin" />
                  ) : resendTimer > 0 ? (
                    `Resend in ${resendTimer}s`
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>

              {resendMessage && (
                <div className="helper" style={{ marginTop: 8 }}>
                  {resendMessage}
                </div>
              )}
            </div>

            <div className="alt-line">
              Entered wrong email? <a href="/signup">Go back</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
