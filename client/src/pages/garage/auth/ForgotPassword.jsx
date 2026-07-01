
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import Logo from "@/components/common/Logo";

export default function GarageForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setStep("success");
    setLoading(false);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-soft p-8 text-center"
        >
          {step === "success" ? (
            <>
              <FiCheckCircle className="w-16 h-16 mx-auto text-brand mb-4" />
              <h1 className="text-3xl font-bold mb-2">Reset Link Sent!</h1>
              <p className="text-muted mb-6">
                Check your email {email} for password reset instructions
              </p>
              <Link to="/garage/login" className="btn-primary">
                Back to Login
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-muted mb-8">
                Enter your email to reset your password
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-left">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors text-left"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
