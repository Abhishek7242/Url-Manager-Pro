import React, { useEffect, useState } from "react";
import {
  FiX,
  FiMail,
  FiKey,
  FiCheckCircle,
  FiLock,
  FiLoader,
  FiEye,
  FiEyeOff, // 👁️ added
} from "react-icons/fi";
import "../CSS/Login.css";
import "../CSS/ForgotPasswordModal.css";
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

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [generated, setGenerated] = useState("");
  const [newPass, setNewPass] = useState("");
  const [resend, setResend] = useState(0);
  const [verified, setVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [isResending, setIsResending] = useState(false);

  // 👁️ Add toggle state
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let t;
    if (resend > 0) {
      t = setTimeout(() => setResend((s) => s - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resend]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail("");
      setEmailError("");
      setOtp("");
      setGenerated("");
      setNewPass("");
      setResend(0);
      setVerified(false);
      setOtpError("");
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: "Weak", color: "#ef4444" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    const label = score === 3 ? "Strong" : score === 2 ? "Good" : "Weak";
    const color = score === 3 ? "#16a34a" : score === 2 ? "#f59e0b" : "#ef4444";
    return { score, label, color };
  }

  async function sendOtp(e) {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email.");
      return;
    }
    e.preventDefault();

    try {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setEmailError("");

      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/forgotpassword/sendotp`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.message || "Failed to send OTP");
        showNotify("error", data.message || "Failed to send OTP");
        throw new Error(data.message || "Failed to send OTP");
      }

      setResend(45);
      setStep(2);
      setGenerated(data.otp_token);
      setEmailError("");
      showNotify("success", "OTP sent to your email");
    } catch (err) {
      console.error("Error sending OTP:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendOtp() {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email to resend OTP.");
      return;
    }

    if (resend > 0) return;

    try {
      if (isResending) return;
      setIsResending(true);
      setEmailError("");

      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/forgotpassword/sendotp`,
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.message || "Failed to resend OTP.");
        showNotify("error", data.message || "Failed to resend OTP.");
        throw new Error(data.message || "Failed to resend OTP.");
      }

      setGenerated(data.otp_token);
      setResend(45);
      showNotify("success", "OTP resent to your email.");
    } catch (err) {
      console.error("Resend OTP failed:", err);
    } finally {
      setIsResending(false);
    }
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      return;
    }

    if (isVerifying) return;

    try {
      setIsVerifying(true);
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/forgotpassword/verifyotp`,
        {
          method: "POST",
          body: JSON.stringify({ otp, otp_token: generated }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid OTP");
      setVerified(true);
      setResetToken(data.reset_token);
      setOtpError("");
      showNotify("success", "OTP verified. You can now set a new password.");
    } catch (err) {
      console.error("OTP verify failed", err);
      setOtpError("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function saveNewPassword() {
    if (!verified) return;

    if (newPass.length < 6) {
      showNotify("error", "Password must be at least 6 characters.");
      return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);

      const response = await makeAuthenticatedRequest(
        `${API_BASE}/user/newpassword`,
        {
          method: "POST",
          body: JSON.stringify({
            new_password: newPass,
            reset_token: resetToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showNotify("error", data.message || "Failed to update password.");
        throw new Error(data.message || "Failed to update password.");
      }

      showNotify("success", "Password updated successfully!");
      onDone(email);
      onClose();
    } catch (err) {
      console.error("Error saving new password:", err);
      if (!err.message) {
        showNotify("error", "Failed to update password. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  const strength = getPasswordStrength(newPass);

  return (
    <div
      className="modal-overlay send-opt-modal-container"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card small send-opt-modal">
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          <FiX />
        </button>
        <h3 className="modal-heading">Reset password</h3>

        {step === 1 && (
          <>
            <p className="muted">
              Enter your account email and we'll send a verification code.
            </p>

            <label className={`field ${emailError ? "error" : ""}`}>
              <FiMail className="icon" />
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="Email address"
              />
            </label>

            {emailError && <p className="error-text">{emailError}</p>}

            <div className="modal-actions-row">
              <button
                className="btn primary"
                onClick={sendOtp}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="icon spin" /> Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
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

            {!verified && (
              <>
                <label className={`field ${otpError ? "error" : ""}`}>
                  <FiKey className="icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(value);
                      if (value.length > 0 && value.length < 6) {
                        setOtpError("OTP must be 6 digits.");
                      } else {
                        setOtpError("");
                      }
                    }}
                    placeholder="Enter 6-digit OTP"
                  />
                </label>

                {otpError && <p className="error-text">{otpError}</p>}

                <div className="modal-actions-row">
                  <button
                    className="btn primary"
                    onClick={verifyOtp}
                    disabled={isVerifying || verified || otp.length !== 6}
                  >
                    {isVerifying ? (
                      <>
                        <FiLoader className="icon spin" /> Verifying...
                      </>
                    ) : verified ? (
                      <>
                        <FiCheckCircle /> Verified
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>

                  <button
                    className="btn"
                    onClick={resendOtp}
                    disabled={resend > 0 || isResending}
                  >
                    {isResending ? (
                      <>
                        <FiLoader className="icon spin" /> Resending...
                      </>
                    ) : resend > 0 ? (
                      `Resend (${resend}s)`
                    ) : (
                      "Resend"
                    )}
                  </button>
                </div>
              </>
            )}

            {verified && (
              <>
                <p
                  className="success-text"
                  style={{ textAlign: "center", color: "#16a34a" }}
                >
                  ✅ OTP Verified Successfully!
                </p>

                <label className="field" style={{ position: "relative" }}>
                  <FiLock className="icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="New password"
                  />
                  {/* 👁️ Eye toggle icon */}
                  <span
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#666",
                    }}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </label>

                <div style={{ margin: "8px 0 12px 0" }}>
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    {[0, 1, 2].map((i) => {
                      const filled = i < strength.score;
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            background: filled ? strength.color : "#e6e6e6",
                            transition: "background 200ms ease",
                          }}
                        />
                      );
                    })}
                    <div
                      style={{ minWidth: 72, textAlign: "right", fontSize: 12 }}
                    >
                      <span style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    className="btn primary"
                    onClick={saveNewPassword}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <FiLoader className="icon spin" /> Saving...
                      </>
                    ) : (
                      "Save password"
                    )}
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
