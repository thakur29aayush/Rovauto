import { Link } from "react-router-dom";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";

const SUPPORT_PHONE_DISPLAY = "+91 98993 19913";

export default function Partner() {
  return (
    <div className="container-x py-8">
      <div className="max-w-3xl">
        <span className="chip-brand">Partner With Us</span>
        <h1 className="text-4xl sm:text-5xl font-bold mt-4">Grow your garage with verified leads.</h1>
        <p className="text-muted mt-4 text-lg">Join 8,000+ garages already growing with Rovauto. Get bookings via WhatsApp, manage jobs from a simple portal, and get paid faster.</p>

        <ul className="mt-8 grid gap-3 text-sm">
          {[
            "Verified, paid leads via WhatsApp magic links",
            "Zero app required to start",
            "Transparent wallet & instant payouts",
            "Reputation-based ranking, quality bonuses",
            "Insurance & spare-parts assistance",
          ].map((x) => (
            <li key={x} className="flex items-center gap-3"><FiCheckCircle className="text-brand-dark text-lg" /> {x}</li>
          ))}
        </ul>

        <div className="mt-8">
          <Link to="/garage/login" className="btn-dark inline-flex items-center gap-2">
            Login to Garage Portal
            <FiArrowRight className="w-4 h-4" />
          </Link>

          <Link to="/garage/onboarding" className="btn-ghost inline-flex items-center gap-2 ml-4">
            Full onboarding form
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
