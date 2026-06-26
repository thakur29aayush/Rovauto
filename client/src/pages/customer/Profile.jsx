import { useEffect, useState } from "react";
import { useApp } from "@/hooks/useApp";
import api from "@/api/axios";

export default function Profile() {
  const { user, setUser, fetchMe } = useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/customer/profile");
      const data = res.data.data;

      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.customerProfile?.address || data.address || "",
      });

      setUser(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const change = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.patch("/customer/profile", {
        name: form.name,
        address: form.address,
      });

      await fetchMe?.();
      await loadProfile();

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="card-soft p-6 text-muted">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

      <form onSubmit={saveProfile} className="card-soft p-6 grid gap-4">
        <div className="flex items-center gap-4">
          <span className="grid place-items-center h-16 w-16 rounded-2xl bg-ink text-white font-bold text-xl">
            {form.name?.[0]?.toUpperCase() || "U"}
          </span>

          <div>
            <div className="font-semibold text-lg">
              {form.name || user?.name || "User"}
            </div>

            <div className="text-sm text-muted">
              {form.phone || "Phone not available"}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Full Name</span>

          <input
            name="name"
            value={form.name}
            onChange={change}
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Email</span>

          <input
            type="email"
            value={form.email}
            disabled
            className="px-4 py-3 rounded-xl border border-line bg-bg-soft text-muted outline-none cursor-not-allowed"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Phone</span>

          <input
            value={form.phone}
            disabled
            className="px-4 py-3 rounded-xl border border-line bg-bg-soft text-muted outline-none cursor-not-allowed"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Address</span>

          <textarea
            name="address"
            rows={3}
            value={form.address}
            onChange={change}
            placeholder="Enter your address"
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />
        </label>

        <button disabled={saving} className="btn-primary justify-self-start">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}