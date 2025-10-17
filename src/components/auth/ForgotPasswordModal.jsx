import React, { useEffect, useState } from "react";
import { FiX, FiMail, FiKey, FiCheckCircle } from "react-icons/fi";
import "../CSS/Login.css";


export default function ForgotPasswordModal({
  isOpen = false,
  onClose = () => {},
  onDone = () => {},
}) {
  const [step, setStep] = useState(1); // 1: ask email, 2: enter otp + new pass
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generated, setGenerated] = useState("");
  const [newPass, setNewPass] = useState("");
  const [resend, setResend] = useState(0);
  const [verified, setVerified] = useState(false);

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

  function sendOtp() {
    if (!/\S+@\S+\.\S+/.test(email)) return alert("Enter valid email.");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGenerated(code);
    setResend(45);
    setStep(2);
    // dev: show code
    alert(`(DEV) OTP for ${email}: ${code}`);
  }

  function verifyOtp() {
    if (!generated) return alert("No OTP sent.");
    if (otp.trim() === generated) {
      setVerified(true);
      alert("OTP verified.");
    } else {
      alert("Invalid OTP.");
    }
  }

  function saveNewPassword() {
    if (!verified) return alert("Verify OTP first.");
    if (newPass.length < 6)
      return alert("Password must be at least 6 characters.");
    // simulate saving password
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
                  if (resend > 0) return;
                  const code = String(
                    Math.floor(100000 + Math.random() * 900000)
                  );
                  setGenerated(code);
                  setResend(45);
                  alert(`(DEV) Resent OTP: ${code}`);
                }}
              >
                {" "}
                {resend > 0 ? `Resend (${resend}s)` : "Resend"}{" "}
              </button>
            </div>

            {verified && (
              <>
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
