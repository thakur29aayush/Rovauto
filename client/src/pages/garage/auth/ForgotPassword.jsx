import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import api from "@/api/axios";

export default function GarageForgotPassword() {
  const [step, setStep] = useState("email"); // "email" | "reset" | "success"
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpFromServer, setOtpFromServer] = useState(""); // show OTP returned by backend
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      const data = res.data.data || {};
      // If backend returns otp, show it
      if (data.otp) {
        setOtpFromServer(data.otp);
      }
      // Move to reset step where user can paste OTP and set password
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setStep("success");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      <div className="container-x py-8">
        <Link to="/garage/login" className="inline-flex items-center gap-2 text-muted hover:text-ink">
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md card-soft p-8 text-center">
          {step === "success" ? (
            <>
              <FiCheckCircle className="w-16 h-16 mx-auto text-brand mb-4" />
              <h1 className="text-3xl font-bold mb-2">Password updated</h1>
              <p className="text-muted mb-6">Your password has been set. Use your email and new password to login.</p>
              <Link to="/garage/login" className="btn-primary w-full">Back to Login</Link>
            </>
          ) : step === "email" ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-muted mb-8">Enter your email to receive a password reset OTP.</p>

              {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-left">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors text-left"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                  {loading ? "Sending..." : "Send Reset OTP"}
                </button>
              </form>
            </>
          ) : (
            // step === "reset"
            <>
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-muted mb-4">We sent a reset OTP to <strong>{email}</strong>.</p>

              {/* Show OTP from backend if present */}
              {otpFromServer && (
                <div className="mb-4 rounded-xl border border-line bg-yellow-50 p-3 text-sm text-ink">
                  <strong>OTP (from backend):</strong> {otpFromServer}
                </div>
              )}

              {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0,6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
                  {loading ? "Setting..." : "Set New Password"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}