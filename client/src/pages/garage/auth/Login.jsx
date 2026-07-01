
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/hooks/useApp";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import Logo from "@/components/common/Logo";
import { mockGarage } from "@/data/garageData";

export default function GarageLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginGarage } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    loginGarage(mockGarage, "mock-garage-token");
    navigate("/garage");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-soft p-8"
        >
          <h1 className="text-3xl font-bold mb-2">Garage Login</h1>
          <p className="text-muted mb-8">Sign in to manage your garage</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <Link to="/garage/forgot-password" className="text-muted hover:text-ink">
                Forgot Password?
              </Link>
              <Link to="/garage/otp-login" className="text-ink font-semibold hover:underline">
                Login with OTP
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
              <FiArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
