
import { useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import Logo from "@/components/common/Logo";
import ImageUpload from "@/components/garage/ImageUpload";

export default function OnboardingStep3({ data, onChange, onNext, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl card-soft p-8"
        >
          <h1 className="text-3xl font-bold mb-2">Garage Images</h1>
          <p className="text-muted mb-8">Upload photos after approval to activate</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              min={0}
              max={15}
              value={data.images}
              onChange={(images) => onChange({ ...data, images })}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? "Continuing..." : "Continue"}
              <FiArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
