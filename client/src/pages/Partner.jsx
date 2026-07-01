import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { garageApi } from "@/api/garage";

const SUPPORT_PHONE_DISPLAY = "+91 98993 19913";

export default function Partner() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    garageName: "",
    ownerName: "",
    email: "",
    phone: "",
    city: "",
    area: "",
    address: "",
    services: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await garageApi.submitApplication({
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        garageName: form.garageName,
        description: form.services,
        address: form.address || `${form.area}, ${form.city}`,
        city: form.city,
        area: form.area,
      });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit garage application");
    } finally {
      setLoading(false);
    }
  };

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
            <li key={x} className="flex items-center gap-3"><FiCheckCircle className="text-brand-dark text-lg" /> {x}</li>
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
        {sent ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 grid place-items-center bg-brand rounded-full mx-auto"><FiCheckCircle className="text-3xl" /></div>
            <h3 className="text-2xl font-bold mt-4">Application received!</h3>
            <p className="text-muted mt-2">Your application is pending admin approval. You will receive an email update after review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <h3 className="text-2xl font-bold">Apply to become a partner</h3>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Garage Name</span>
              <input required type="text" value={form.garageName} onChange={(e) => updateField("garageName", e.target.value)} placeholder="Speed Motors Workshop" className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Owner Name</span>
              <input required type="text" value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} placeholder="Mr. Sharma" className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" />
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Email</span>
                <input required type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="owner@example.com" className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Phone</span>
                <input required type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder={SUPPORT_PHONE_DISPLAY} className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">City</span>
                <input required type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Ghaziabad" className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Area</span>
                <input required type="text" value={form.area} onChange={(e) => updateField("area", e.target.value)} placeholder="Indirapuram" className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" />
              </label>
            </div>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Full Address</span>
              <textarea required rows={2} value={form.address} onChange={(e) => updateField("address", e.target.value)} className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" placeholder="Shop number, street, landmark" />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Services offered</span>
              <textarea rows={3} value={form.services} onChange={(e) => updateField("services", e.target.value)} className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none" placeholder="General service, denting, AC..." />
            </label>
            <button disabled={loading} className="btn-primary disabled:opacity-70">
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}