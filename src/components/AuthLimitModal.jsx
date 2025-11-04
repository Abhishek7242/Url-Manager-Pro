import React from "react";
import "./CSS/AuthLimitModal.css";

function AuthLimitModal({
  onClose,
  setOpenSignupModel = () => {},

  setOpenLoginModel = () => {},
}) {
  return (
    <div
      className="auth-limit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-limit-title"
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

        <h3 id="auth-limit-title" className="auth-limit-title">
          Create an account to add more
        </h3>
        <p className="auth-limit-text">
          You can add up to 5 URLs without an account. To keep adding and
          syncing your links across devices, please log in or sign up.
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
              onClose();
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

export default AuthLimitModal;
