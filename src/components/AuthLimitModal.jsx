import React from "react";
import "./CSS/AuthLimitModal.css";

function AuthLimitModal({
    onClose,
    loginHref = "/login",
    signupHref = "/signup",
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
                    You can add up to 5 URLs without an account. To keep adding
                    and syncing your links across devices, please log in or sign
                    up.
                </p>
                <div className="auth-limit-actions">
                    <a
                        href={loginHref}
                        className="btn btn-outline"
                        onClick={onClose}
                    >
                        Log in
                    </a>
                    <a
                        href={signupHref}
                        className="btn btn-filled"
                        onClick={onClose}
                    >
                        Sign up
                    </a>
                </div>
            </div>
        </div>
    );
}

export default AuthLimitModal;
