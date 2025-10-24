import React from 'react'
import '../CSS/Buttons.css'

const Buttons = ({
  isLogin,
  setOpenSignupModel,
  onClose,
  isSignUp,
  setOpenLoginModel,
}) => {
  return (
    <div className="toggle-btn-container">
      <button
        onClick={() => {
          setOpenLoginModel(true);
          onClose();
        }}
        className={`toggle-btn ${isLogin ? "active" : ""}`}
      >
        Sign In
      </button>
      <button
        onClick={() => {
          setOpenSignupModel(true);
          onClose();
        }}
        className={`toggle-btn signup_btn ${isSignUp ? "active" : ""}`}
      >
        Sign Up
      </button>
    </div>
  );
};   

export default Buttons
