import React from "react";
import "./CSS/AuthLimitModal.css";

function AuthFeatureModal({
  onClose,
  setOpenSignupModel = () => {},

  setOpenLoginModel = () => {},
}) {
  return (
    <div
      className="auth-limit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-feature-title"
    >
      <div className="auth-limit-modal" role="document">
        {/* ❌ Close Button */}
        <button
          className="auth-limit-close"
          aria-label="Close modal"
          onClick={onClose}
        >
          &times;
        </button>

        <h3 id="auth-feature-title" className="auth-limit-title">
          Login Required to Access This Feature
        </h3>

        <p className="auth-limit-text">
          This feature is available only for logged-in users. Please log in or
          create an account to continue and unlock full access.
        </p>

        <div className="auth-limit-actions">
          <button
            onClick={() => {
              setOpenLoginModel(true);
              onClose();
            }}
            className="btn btn-outline"
          >
            Log in
          </button>
          <button
            onClick={() => {
              setOpenSignupModel(true);
              onClose()
              // console.log(openSignupModel);
            }}
            className="btn btn-filled"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthFeatureModal;
