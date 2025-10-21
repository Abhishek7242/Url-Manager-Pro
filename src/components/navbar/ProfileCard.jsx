import React, { useState, useEffect, useRef } from "react";
import {
  FiEdit2,
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiCheck,
  FiX,
} from "react-icons/fi";
import EditProfileModal from "./EditProfileModal";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ProfileCard (modal)
 *
 * Props:
 *  - isOpen: boolean           // controls open/close (animated)
 *  - onClose: () => void       // called on backdrop click, ESC, or close button
 *  - user, onSaveProfile, onChangePassword, onUploadAvatar (same as before)
 *
 * Keep the component name as `ProfileCard`.
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

  // sync when parent user changes
  useEffect(() => setLocalUser(user), [user]);

  // ESC closes modal
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openModal = (field) => setModalField(field);
  const closeModal = () => setModalField(null);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  // avatar upload handler (unchanged)
  const handleAvatarChange = async (file) => {
    if (!file) return;
    if (onUploadAvatar) {
      setStatus({ loading: true, success: "", error: "" });
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

  // change password handler (unchanged)
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

  // animation variants
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleBackdropClick}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: 0.14 }}
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop blur + layer */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md bg-black/40"
            variants={backdropVariants}
          />

          {/* Card / Panel */}
          <motion.div
            variants={panelVariants}
            transition={{ duration: 0.14 }}
            className="relative z-10 w-[min(96%,900px)] max-h-[94vh] overflow-auto rounded-2xl p-6 shadow-2xl ring-1 ring-black/30 bg-gradient-to-br from-white/4 to-white/2"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: title + close button (separate, non-overlapping) */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Profile</h2>
                {/* "Member since" placed under title so it won't collide with close button */}
                <div className="text-xs text-gray-400">Member since</div>
                <div className="text-sm text-gray-200">Oct 2024</div>
              </div>

              {/* Close button placed in header area, visually separated */}
              <button
                onClick={onClose}
                aria-label="Close profile"
                className="ml-auto p-2 rounded-full hover:bg-white/6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <FiX />
              </button>
            </div>

            {/* Content */}
            <div className="flex gap-6 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-2xl text-gray-700">
                  {localUser.avatarUrl ? (
                    <img
                      src={localUser.avatarUrl}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser />
                  )}
                </div>

                <label
                  htmlFor="avatar-input"
                  className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-500 p-2 rounded-full text-white shadow-md cursor-pointer"
                  title="Change avatar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiCamera />
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    e.stopPropagation();
                    handleAvatarChange(e.target.files?.[0]);
                  }}
                />
              </div>

              {/* Info block */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {localUser.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("name");
                        }}
                        aria-label="Edit name"
                        className="text-gray-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <FiEdit2 />
                      </button>
                    </div>

                    <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
                      <FiMail />{" "}
                      <span className="truncate">
                        {localUser.email || "No email set"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("email");
                        }}
                        aria-label="Edit email"
                        className="text-gray-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ml-2"
                      >
                        <FiEdit2 />
                      </button>
                    </p>
                  </div>
                </div>

                {localUser.bio && (
                  <div className="mt-4 flex items-start gap-2">
                    <div className="text-sm text-gray-300 flex-1">
                      {localUser.bio}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("bio");
                      }}
                      className="text-gray-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Edit bio"
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                )}

                {/* controls */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPasswordForm((s) => !s);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <FiLock /> Change Password
                  </button>

                  <div className="text-sm text-green-400">{status.success}</div>
                  <div className="text-sm text-red-400">{status.error}</div>
                </div>

                {/* password form */}
                <AnimatePresence>
                  {showPasswordForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      onSubmit={submitChangePassword}
                      className="mt-4 bg-white/3 p-4 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                          className="px-3 py-2 rounded-md bg-transparent border border-white/12 focus:ring-2 focus:ring-indigo-500"
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
                          className="px-3 py-2 rounded-md bg-transparent border border-white/12 focus:ring-2 focus:ring-indigo-500"
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
                          className="px-3 py-2 rounded-md bg-transparent border border-white/12 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2"
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
                          className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/8 text-white"
                        >
                          Cancel
                        </button>

                        <div className="text-sm text-green-400">
                          {status.success}
                        </div>
                        <div className="text-sm text-red-400">
                          {status.error}
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* EditProfileModal */}
            <EditProfileModal
              open={!!modalField}
              field={modalField}
              value={modalField ? localUser[modalField] : ""}
              onClose={closeModal}
              onSave={async (updated) => {
                setStatus({ loading: true, success: "", error: "" });
                if (onSaveProfile) {
                  const res = await onSaveProfile(updated);
                  if (!res || !res.ok) {
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
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
