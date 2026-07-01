
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiPhone, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Logo from "@/components/common/Logo";
import { mockGarage } from "@/data/garageData";
import { setGarage } from "@/store/garageSlice";

export default function GarageOtpLogin() {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setStep("otp");
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.some(digit => !digit)) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    dispatch(setGarage(mockGarage));
    navigate("/garage");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      <div className="container-x py-8">
        <Link to="/partner" className="inline-flex items-center gap-2 text-muted hover:text-ink">
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-soft p-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            {step === "phone" ? "Login with OTP" : "Verify OTP"}
          </h1>
          <p className="text-muted mb-8">
            {step === "phone" 
              ? "Enter your phone number to receive OTP" 
              : `OTP sent to ${phone}`}
          </p>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:border-ink focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg"
              >
                {loading ? "Sending..." : "Send OTP"}
                <FiArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-line rounded-xl focus:border-ink focus:outline-none transition-colors"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.some(d => !d)}
                className="btn-primary w-full py-4 text-lg"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <p className="text-center text-muted text-sm">
                Didn't receive OTP?{" "}
                <button onClick={() => setStep("phone")} className="text-ink font-semibold hover:underline">
                  Resend
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
