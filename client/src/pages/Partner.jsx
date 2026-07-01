import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const SUPPORT_PHONE_DISPLAY = "+91 98993 19913";

export default function Partner() {
  return (
    <div className="container-x py-16 grid lg:grid-cols-2 gap-12">
      <div>
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
            <li key={x} className="flex items-center gap-3">{x}</li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/garage/login" className="btn-dark inline-flex items-center gap-2">
            Login to Garage Portal
            <FiArrowRight className="w-4 h-4" />
          </Link>

          <Link to="/garage/onboarding" className="btn-ghost inline-flex items-center gap-2">
            Full onboarding form
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="card-soft p-7">
        <div className="text-center py-10">
          <h3 className="text-2xl font-bold">Partner onboarding</h3>
          <p className="text-muted mt-3">We have moved the partner application into our full onboarding flow. To apply, please start the onboarding process or contact support for help.</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/garage/onboarding" className="btn-primary inline-flex items-center gap-2">
              Start Onboarding
              <FiArrowRight className="w-4 h-4" />
            </Link>

            <a href={`tel:${SUPPORT_PHONE_DISPLAY}`} className="btn-ghost inline-flex items-center gap-2">
              Contact Support
            </a>
          </div>

          <p className="text-muted text-sm mt-4">Or call us at <strong>{SUPPORT_PHONE_DISPLAY}</strong> for assistance.</p>
        </div>
      </div>
    </div>
  );
}
