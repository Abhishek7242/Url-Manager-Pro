import React, { useEffect, useState } from "react";
import { FiX, FiMail, FiKey, FiCheckCircle, FiLock } from "react-icons/fi";
import "../CSS/Login.css";
import UrlContext from "../../context/url_manager/UrlContext";
import { useNavigate } from "react-router-dom";


export default function ForgotPasswordModal({
  isOpen = false,
  onClose = () => {},
  onDone = () => {},
}) {
    const context = React.useContext(UrlContext);
  const { API_BASE, showNotify, makeAuthenticatedRequest } = context;
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: ask email, 2: enter otp + new pass
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generated, setGenerated] = useState("");
  const [newPass, setNewPass] = useState("");
  const [resend, setResend] = useState(0);
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    let t;
    if (resend > 0) {
      t = setTimeout(() => setResend((s) => s - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resend]);

  useEffect(() => {
    if (!isOpen) {
      // reset on close
      setStep(1);
      setEmail("");
      setOtp("");
      setGenerated("");
      setNewPass("");
      setResend(0);
      setVerified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function sendOtp(e) {
    if (!/\S+@\S+\.\S+/.test(email)) return alert("Enter valid email.");
     e.preventDefault();
   
    // Send OTP then navigate to verify page
    try {
    

      if (isSubmitting) return;
      setIsSubmitting(true);
      
         const response = await makeAuthenticatedRequest(
           `${API_BASE}/user/forgotpassword/sendotp`,
           {
             method: "POST",
             body: JSON.stringify({email }),
           }
         );
      const data = await response.json();
      if (!response.ok) {
        showNotify("error", "Failed to send OTP");

        throw new Error(data.message || "Failed to send OTP");
      }
               setResend(45);
               setStep(2);
      console.log(data);
      setGenerated(data.otp_token);
      showNotify("success", "OTP sent to your email");
    
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp() {
    if (!generated) return alert("No OTP sent.");


    if (!otp.trim()) return;
    if (isVerifying) return;
    try {
      setIsVerifying(true);
      console.log("Starting OTP verification...");
      console.log("OTP Token:", generated);
      console.log("OTP:", otp);

      // Ensure CSRF cookie for Sanctum
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/forgotpassword/verifyotp`,
        {
          method: "POST",
          body: JSON.stringify({ otp, otp_token: generated }),
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
      setResetToken(data.reset_token);
      console.log(data);
      showNotify("success", "OTP verified. You can now set a new password.");
      // navigate("/change-password");
    } catch (err) {
      console.error("OTP verify failed", err);
      // setOtpError(err.message);
    } finally {
      setIsVerifying(false);
    }
  }

async function saveNewPassword() {
    if (!verified) return alert("Verify OTP first.");
    if (newPass.length < 6)
      return alert("Password must be at least 6 characters.");
    // simulate saving password
     const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/newpassword`,
        {
          method: "POST",
          body: JSON.stringify({ new_password: newPass, reset_token: resetToken }),
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
      showNotify("success", "OTP verified. You can now set a new password.");
    onDone(email);
    onClose();
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card small">
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          <FiX />
        </button>
        <h3 className="modal-heading">Reset password</h3>

        {step === 1 && (
          <>
            <p className="muted">
              Enter your account email and we'll send a verification code.
            </p>

            <label className="field">
              <FiMail className="icon" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </label>

            <div className="modal-actions-row">
              <button className="btn primary" onClick={sendOtp}>
                Send OTP
              </button>
              <button className="btn cancel" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted">
              We sent an OTP to <strong>{email}</strong>.
            </p>

            {/* ✅ Only show OTP input & resend until verified */}
            {!verified && (
              <>
                <label className="field">
                  <FiKey className="icon" />
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter OTP"
                  />
                </label>

                <div className="modal-actions-row">
                  <button
                    className="btn primary"
                    onClick={verifyOtp}
                    disabled={verified}
                  >
                    {verified ? (
                      <>
                        <FiCheckCircle /> Verified
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setResend(45);
                    }}
                  >
                    {resend > 0 ? `Resend (${resend}s)` : "Resend"}
                  </button>
                </div>
              </>
            )}

            {/* ✅ After verification */}
            {verified && (
              <>
                <p
                  className="success-text"
                  style={{ textAlign: "center", color: "#16a34a" }}
                >
                  ✅ OTP Verified Successfully!
                </p>

                <label className="field">
                  <FiLock className="icon" />
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="New password"
                  />
                </label>

                <div className="modal-actions-row">
                  <button className="btn primary" onClick={saveNewPassword}>
                    Save password
                  </button>
                  <button className="btn cancel" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
