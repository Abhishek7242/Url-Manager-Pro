import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLink, FiKey, FiLoader, FiCheckCircle } from "react-icons/fi";
import UrlContext from "../../context/url_manager/UrlContext";
import "../CSS/VerifyOtp.css";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const context = React.useContext(UrlContext);
  const { API_BASE, makeAuthenticatedRequest, getCsrfToken } = context;

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  const email = state?.email;
  const otpToken = state?.otpToken;

  useEffect(() => {
    if (!email || !otpToken) {
      navigate("/signup", { replace: true });
    }
  }, [email, otpToken, navigate]);

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

      // Read XSRF token from cookie and send as header for Laravel CSRF middleware
      // const xsrf = (document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1];

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid OTP");
      setVerified(true);
      console.log(data);
      navigate("/");
    } catch (err) {
      console.error("OTP verify failed", err);
      setOtpError(err.message);
    } finally {
      setIsVerifying(false);
    }
  }
  // Helper function to get CSRF token from cookie

  // Updated OTP verification function

  return (
    <div className="signup-page">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <FiLink />
        </div>
        <div className="brand-text">
          <h2>URL Manager Pro</h2>
        </div>
      </Link>
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
            <div className="otp-col">
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
            </div>
          </div>

          <div className="alt-line">
            Entered wrong email? <a href="/signup">Go back</a>
          </div>
        </div>
      </div>
    </div>
  );
}
