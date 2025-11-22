import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, User, Paperclip, Send } from "lucide-react";
import "./CSS/FuturisticContact.css";
import { FiArrowLeft, FiCommand } from "react-icons/fi";
import UrlContext from "../context/url_manager/UrlContext";
import { Link } from "react-router-dom";

// Futuristic Contact Component
// TailwindCSS required. Uses framer-motion and lucide-react for icons.
// Usage: import FuturisticContact from './FuturisticContact'; <FuturisticContact />

export default function FuturisticContact() {
      const context = React.useContext(UrlContext);
      const { API_BASE, getXsrfHeader } = context;
  const [form, setForm] = useState({ 
    subject: "",
    message: "",
  });
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    success: null,
    error: null,
  });
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus({ loading: true, success: null, error: null });

  try {
    const payload = new FormData();
    payload.append("subject", form.subject || "");
    payload.append("message", form.message || "");
    if (fileRef.current?.files?.[0]) {
      payload.append("file", fileRef.current.files[0]);
    }

    // Grab CSRF token from meta tag (Laravel default)
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");

    const res = await fetch(`${API_BASE}/contact/store`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getXsrfHeader(),
        },
        credentials: "include", // include cookies for session auth
        body: JSON.stringify({ subject: form.subject, message: form.message }),
    });

    // 422 -> validation errors from Laravel
    if (res.status === 422) {
      const data = await res.json().catch(() => ({}));
      const errors = data.errors || data; // structure may vary
      // Combine messages for display
      const msgs = [];
      if (errors && typeof errors === "object") {
        Object.values(errors).forEach((v) => {
          if (Array.isArray(v)) msgs.push(...v);
          else if (typeof v === "string") msgs.push(v);
        });
      } else if (data.message) {
        msgs.push(data.message);
      }
      throw new Error(msgs.length ? msgs.join(" • ") : "Validation failed");
    }

    if (!res.ok) {
      // try parse JSON message if available
      const text = await res.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {}
      const errMsg =
        (parsed && (parsed.message || JSON.stringify(parsed))) ||
        res.statusText ||
        "Request failed";
      throw new Error(errMsg);
    }

    const json = await res.json().catch(() => ({}));
    setStatus({
      loading: false,
      success: json.message || "Message sent. Thank you!",
      error: null,
    });

    // Reset form fields
    setForm({ subject: "", message: "" });
    setFileName("");
    if (fileRef.current) fileRef.current.value = null;
  } catch (err) {
    setStatus({
      loading: false,
      success: null,
      error: err.message || "Failed to send",
    });
  }
};


    return (
      <>
        <div className="futuristic-contact w-full min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-black relative overflow-hidden">
          <Link
            to="/dashboard"
            className="terms-back-btn mr-4 absolute top-8 right-4 flex items-center gap-2 text-white hover:text-indigo-400"
          >
            <FiArrowLeft size={22} />
          </Link>
          {/* Subtle animated background blobs */}
          <div className="flex items-center gap-4 uml-brand absolute top-6 left-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white uml-brand-mark">
              <div className="brand-icon" aria-hidden>
                <FiCommand />
              </div>
            </div>
            <div className="uml-brand-text">
              <div className="font-extrabold text-lg uml-brand-title">
                URL <span className="text-indigo-400"> Manager</span>
              </div>
              <div className="text-xs text-slate-500 uml-brand-sub">
                Save • Manage • Analyze
              </div>
            </div>
          </div>

          <svg
            className="absolute left-0 top-0 -translate-y-1/3 opacity-30 pointer-events-none"
            width="520"
            height="520"
            viewBox="0 0 520 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#7C3AED" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <circle cx="260" cy="260" r="220" fill="url(#g1)" />
          </svg>

          <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info panel */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl"
              aria-hidden
            >
              <div className="flex items-start gap-4">
                <div className="neon-ring p-3 rounded-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Get in touch
                  </h3>
                  <p className="mt-1 text-sm text-white leading-relaxed">
                    We're listening — drop a message and we'll get back fast.
                    For partnerships, projects or just to say hi.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="flex items-center gap-3">
                  <div className="avatar-spark w-12 h-12 rounded-full flex items-center justify-center">
                    <div className="brand-icon" aria-hidden>
                      <FiCommand />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white">URL Manager</p>
                    <p className="text-xs text-white">
                      Business & Support — response within 24h
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  {/* <div className="info-pill">Mon — Fri</div> */}
                  <div className="info-pill">24/7 Support</div>
                  {/* <div className="info-pill">Live chat</div> */}
                </div>

                {/* <div className="mt-4 text-xs text-white">
              Follow us for updates and design drops
            </div>
            <div className="flex gap-3 mt-3">
              <button className="icon-btn">Twitter</button>
              <button className="icon-btn">LinkedIn</button>
              <button className="icon-btn">Dribbble</button>
            </div> */}
              </div>
            </motion.div>

            {/* Form panel */}
            <motion.form
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              onSubmit={handleSubmit}
              className="glass-card p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl"
              aria-label="Contact form"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Send us a message</h3>
                <div className="text-sm text-white">Secure • Encrypted</div>
              </div>

              <div className="mt-4 grid gap-3">
                {/* <label className="input-wrap">
              <User className="input-icon" />
              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="input-field"
                aria-label="Name"
              />
            </label>

            <label className="input-wrap">
              <Mail className="input-icon" />
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="input-field"
                aria-label="Email"
              />
            </label> */}

                <label className="input-wrap">
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Subject (optional)"
                    className="input-field"
                    aria-label="Subject"
                  />
                </label>

                <label className="input-wrap h-32">
                  <textarea
                    required
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    className="input-field resize-none h-full"
                    aria-label="Message"
                  />
                </label>
                {/* 
            <div className="flex items-center gap-3">
              <label className="file-btn">
                <Paperclip className="w-4 h-4" />
                <input
                  ref={fileRef}
                  type="file"
                  onChange={handleFile}
                  className="hidden"
                />
                <span className="text-xs">Attach file</span>
              </label>
              <div className="text-xs text-white truncate">
                {fileName || "No file selected"}
              </div>
            </div> */}

                <div className="flex items-center gap-3 justify-between mt-2">
                  <div className="text-xs text-white">
                    By sending you agree to our privacy policy.
                  </div>

                  <button
                    type="submit"
                    className="send-btn flex items-center gap-2"
                    disabled={status.loading}
                  >
                    <Send className="w-4 h-4" />
                    <span>{status.loading ? "Sending..." : "Send"}</span>
                  </button>
                </div>

                {status.success && (
                  <div className="mt-2 text-sm text-green-500">
                    {status.success}
                  </div>
                )}
                {status.error && (
                  <div className="mt-2 text-sm text-red-500">
                    {status.error}
                  </div>
                )}
              </div>
            </motion.form>
          </div>

          {/* Component-specific styles (Tailwind friendly but small helpers) */}
        </div>
      </>
    );
}
