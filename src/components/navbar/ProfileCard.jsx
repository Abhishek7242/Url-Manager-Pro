// src/components/ProfileCard.jsx
import React, { useState, useEffect, useRef } from "react";
import { FiEdit2, FiMail, FiLock, FiX, FiCheck } from "react-icons/fi";
import EditProfileModal from "./EditProfileModal";
import { motion, AnimatePresence } from "framer-motion";
import "../CSS/ProfileCard.css";


/**
 * ProfileCard (modal) — fixed edit buttons to open EditProfileModal
 */
export default function ProfileCard({
  isOpen = true,
  onClose = () => {},
  user = { name: "User", email: "", avatarUrl: "", bio: "" },
  onSaveProfile,
  onChangePassword,
  onUploadAvatar,
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [modalField, setModalField] = useState(null);
  const [localUser, setLocalUser] = useState(user);
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const backdropRef = useRef(null);

  // keep local copy in sync when parent user changes
  useEffect(() => setLocalUser(user), [user]);

  // ESC closes modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // open/close helpers for edit modal
  const openModal = (field) => {
    console.debug("openModal ->", field);
    setModalField(field);
  };
  const closeModal = () => setModalField(null);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  // avatar upload handler
  const handleAvatarChange = async (file) => {
    if (!file) return;
    if (onUploadAvatar) {
      setStatus({ loading: true, success: "", error: "" });
      try {
        const res = await onUploadAvatar(file);
        if (res && res.ok && res.avatarUrl) {
          setLocalUser((s) => ({ ...s, avatarUrl: res.avatarUrl }));
          setStatus({ loading: false, success: "Avatar updated", error: "" });
        } else {
          setStatus({
            loading: false,
            success: "",
            error: res?.message || "Upload failed",
          });
        }
      } catch (err) {
        setStatus({
          loading: false,
          success: "",
          error: err?.message || "Upload failed",
        });
      }
    } else {
      const url = URL.createObjectURL(file);
      setLocalUser((s) => ({ ...s, avatarUrl: url }));
      setStatus({
        loading: false,
        success: "Avatar preview only (demo)",
        error: "",
      });
    }
  };

  // password change handler
  const submitChangePassword = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: "", error: "" });

    if (!pw.currentPassword || !pw.newPassword || pw.newPassword.length < 8) {
      setStatus({
        loading: false,
        success: "",
        error: "Fill current + new (min 8) password.",
      });
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setStatus({
        loading: false,
        success: "",
        error: "New and confirm do not match.",
      });
      return;
    }

    try {
      if (onChangePassword) {
        const res = await onChangePassword({
          currentPassword: pw.currentPassword,
          newPassword: pw.newPassword,
        });
        if (res && res.ok) {
          setStatus({
            loading: false,
            success: "Password changed.",
            error: "",
          });
          setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setShowPasswordForm(false);
        } else {
          setStatus({
            loading: false,
            success: "",
            error: res?.message || "Failed to change password.",
          });
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setStatus({
          loading: false,
          success: "Password changed (demo).",
          error: "",
        });
        setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      }
    } catch (err) {
      setStatus({
        loading: false,
        success: "",
        error: err?.message || "Unexpected error",
      });
    }
  };

  // motion variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const panelVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.98 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="profile-modal"
          ref={backdropRef}
          className="profile-card-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
          onClick={handleBackdropClick}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: 0.14 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="profile-card-overlay absolute inset-0 backdrop-blur-md bg-black/40"
            variants={backdropVariants}
          />

          <motion.div
            variants={panelVariants}
            transition={{ duration: 0.14 }}
            role="document"
            onClick={(e) => e.stopPropagation()}
            className="profile-card-panel relative z-10 w-full max-w-xl sm:max-w-3xl md:max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl"
          >
            <div className="profile-card-inner bg-gradient-to-br from-white/4 to-white/2 shadow-2xl ring-1 ring-black/30 rounded-2xl overflow-auto max-h-[92vh]">
              {/* HEADER */}
              <div className="profile-card-header flex items-start justify-between gap-4 p-4 sm:p-6">
                <div>
                  <h2 className="profile-card-title text-lg sm:text-xl font-semibold text-white">
                    Profile
                  </h2>
                  {/* <div className="profile-card-member-label text-xs text-gray-400">
                    Member since
                  </div>
                  <div className="profile-card-member-date text-sm text-gray-200">
                    Oct 2024
                  </div> */}
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close profile"
                  className="profile-card-close-btn ml-auto p-2 rounded-full hover:bg-white/6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <FiX />
                </button>
              </div>

              {/* BODY */}
              <div className="profile-card-body flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
                {/* AVATAR */}
                <div className="profile-card-avatar-wrapper flex-shrink-0 flex items-center sm:items-start justify-center sm:justify-start">
                  <div className="profile-card-avatar h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-2xl text-gray-700">
                    {localUser.avatarUrl ? (
                      <img
                        src={localUser.avatarUrl}
                        alt="avatar"
                        className="profile-card-avatar-img h-full w-full object-cover"
                      />
                    ) : (
                      <div className="profile-card-avatar-fallback h-full w-full flex items-center justify-center text-gray-700 font-medium">
                        {(localUser.name || "U")[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* INFO */}
                <div className="profile-card-info flex-1 min-w-0">
                  <div className="profile-card-info-header flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="profile-card-name-row flex items-center gap-3">
                        <h3 className="profile-card-name text-base sm:text-lg font-semibold text-white truncate">
                          {localUser.name}
                        </h3>

                        {/* FIXED: open edit modal using openModal helper (no stopPropagation) */}
                        <button
                          onClick={() => openModal("name")}
                          aria-label="Edit name"
                          className="profile-card-edit-btn text-gray-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <FiEdit2 />
                        </button>
                      </div>

                      <p className="profile-card-email text-sm text-gray-300 mt-1 flex items-center gap-2 truncate">
                        <FiMail />
                        <span className="truncate">
                          {localUser.email || "No email set"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {localUser.bio && (
                    <div className="profile-card-bio mt-3 sm:mt-4 flex items-start gap-2">
                      <div className="profile-card-bio-text text-sm text-gray-300 flex-1">
                        {localUser.bio}
                      </div>

                      {/* FIXED: open edit modal using openModal helper (no stopPropagation) */}
                      <button
                        onClick={() => openModal("bio")}
                        className="profile-card-edit-bio-btn text-gray-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Edit bio"
                      >
                        <FiEdit2 />
                      </button>
                    </div>
                  )}

                  {/* CONTROLS */}
                  <div className="profile-card-controls mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPasswordForm((s) => !s);
                      }}
                      className="profile-card-change-password-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <FiLock /> Change Password
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="profile-card-status-success text-sm text-green-400 truncate">
                        {status.success}
                      </div>
                      <div className="profile-card-status-error text-sm text-red-400 truncate">
                        {status.error}
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD FORM */}
                  <AnimatePresence>
                    {showPasswordForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        onSubmit={submitChangePassword}
                        className="profile-card-password-form mt-4 bg-white/3 p-3 sm:p-4 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="profile-card-password-grid grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="password"
                            placeholder="Current password"
                            value={pw.currentPassword}
                            onChange={(e) =>
                              setPw((p) => ({
                                ...p,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="profile-card-password-input w-full px-3 py-2 rounded-md bg-transparent border border-white/12 focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            value={pw.newPassword}
                            onChange={(e) =>
                              setPw((p) => ({
                                ...p,
                                newPassword: e.target.value,
                              }))
                            }
                            className="profile-card-password-input w-full px-3 py-2 rounded-md bg-transparent border border-white/12 focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new"
                            value={pw.confirmPassword}
                            onChange={(e) =>
                              setPw((p) => ({
                                ...p,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className="profile-card-password-input w-full px-3 py-2 rounded-md bg-transparent border border-white/12 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="profile-card-password-actions mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                          <button
                            type="submit"
                            className="profile-card-save-password-btn w-full sm:w-auto px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 justify-center"
                            disabled={status.loading}
                          >
                            <FiCheck />{" "}
                            {status.loading ? "Saving..." : "Save password"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPw({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            }}
                            className="profile-card-cancel-password-btn w-full sm:w-auto px-3 py-2 rounded-md bg-white/5 hover:bg-white/8 text-white"
                          >
                            Cancel
                          </button>

                          <div className="sm:ml-auto">
                            <div className="profile-card-status-success text-sm text-green-400">
                              {status.success}
                            </div>
                            <div className="profile-card-status-error text-sm text-red-400">
                              {status.error}
                            </div>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* footer spacing */}
              <div className="p-4 sm:p-6" />
            </div>
          </motion.div>
        </motion.div>
      )}
      <div className="edit-profile">
      {/* EditProfileModal */}
      <EditProfileModal
        open={!!modalField}
        field={modalField}
        value={modalField ? localUser[modalField] : ""}
        onClose={closeModal}
        onSave={async (updated) => {
          setStatus({ loading: true, success: "", error: "" });
          try {
            if (onSaveProfile) {
              const res = await onSaveProfile(updated);
              // Accept either { success: true } or truthy res.ok
              if (!(res && (res.success === true || res.ok))) {
                setStatus({
                  loading: false,
                  success: "",
                  error: res?.message || "Save failed",
                });
                return false;
              }
            }
            setLocalUser((lu) => ({ ...lu, ...updated }));
            setStatus({ loading: false, success: "Saved!", error: "" });
            closeModal();
            return true;
          } catch (err) {
            setStatus({
              loading: false,
              success: "",
              error: err?.message || "Save failed",
            });
            return false;
          }
        }}
        />
        </div>
    </AnimatePresence>
  );
}
