import React, { useEffect, useState } from "react";
import { FiX, FiSave } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "../CSS/EditProfileModal.css";


/**
 * Props:
 *  - open: boolean
 *  - field: 'name' | 'email' | 'bio' | 'avatar'
 *  - value: current value for the field (string)
 *  - onClose: () => void
 *  - onSave: async (updatedObject) => boolean|{ok:true}
 *
 * Modal is intentionally generic: when saving it calls onSave({ [field]: newValue })
 */
export default function EditProfileModal({
  open,
  field,
  value = "",
  onClose,
  onSave,
}) {
  const [input, setInput] = useState(value);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setInput(value || "");
    setMessage("");
  }, [value, field, open]);

  if (!open) return null;

  const titleMap = {
    name: "Edit Name",
    email: "Edit Email",
    bio: "Edit Bio",
    avatar: "Change Avatar",
  };

  const save = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (field === "avatar") {
        // For avatar we expect input to be a File; we won't handle file input here.
        // Parent should handle avatar file uploads via onSave calling onUploadAvatar.
        setMessage(
          "Use avatar uploader on profile (or implement file upload here)."
        );
        setLoading(false);
        return;
      }
      const payload = { [field]: input };
      const res = await onSave(payload);
      if (res === false) {
        setMessage("Save failed");
      } else {
        setMessage("Saved");
      }
    } catch (err) {
      setMessage(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="edit-profile-modal fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-gradient-to-br from-white/4 to-white/2 rounded-xl p-5 shadow-lg ring-1 ring-black/20">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">
                  {titleMap[field] || "Edit"}
                </h4>
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-white p-2 rounded-md"
                >
                  <FiX />
                </button>
              </div>

              <div className="mt-4">
                {field === "avatar" ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-300">
                      Avatar upload is handled from the profile card. Use that
                      control or implement file upload here.
                    </p>
                  </div>
                ) : field === "bio" ? (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={5}
                    className="w-full bg-transparent border border-white/12 rounded-md p-3 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Write a short bio..."
                  />
                ) : (
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-transparent border border-white/12 rounded-md p-3 focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Enter ${field}`}
                    type={field === "email" ? "email" : "text"}
                  />
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md text-white"
                >
                  <FiSave />
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/8 text-white"
                >
                  Cancel
                </button>

                {message && (
                  <div className="text-sm text-gray-200 ml-3">{message}</div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
