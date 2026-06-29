import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "@/components/common/Logo";
import api from "@/api/axios";
import { FiUser, FiTool } from "react-icons/fi";

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
      };

      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      }

      await api.post("/auth/signup", payload);

      nav("/otp", {
        state: {
          email: form.email,
          phone: form.phone || null,
          fromSignup: true,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x grid min-h-[80vh] items-center gap-12 py-16 lg:grid-cols-2">
      <div className="hidden lg:block">
        <Logo />

        <h1 className="mt-8 text-5xl font-bold leading-tight">
          Create your <span className="text-brand-dark">Rovauto</span> account.
        </h1>

        <p className="mt-4 max-w-md text-muted">
          Book trusted services and manage your vehicle care.
        </p>
      </div>

      <div className="card-soft mx-auto w-full max-w-md p-7">
        <div className="flex bg-bg-soft rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition ${
              role === "CUSTOMER"
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            <FiUser />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole("GARAGE_OWNER")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition ${
              role === "GARAGE_OWNER"
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            <FiTool />
            Garage Partner
          </button>
        </div>

        <h2 className="text-2xl font-bold">
          Create account {role === "GARAGE_OWNER" ? " (Garage)" : ""}
        </h2>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input
            required
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Full name"
            className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
          />

          <input
            required
            name="email"
            value={form.email}
            onChange={change}
            type="email"
            placeholder="Email"
            className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={change}
            maxLength={15}
            placeholder="Mobile number (optional)"
            className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
          />

          <input
            required
            name="password"
            value={form.password}
            onChange={change}
            type="password"
            placeholder="Password"
            minLength={8}
            className="rounded-xl border border-line px-4 py-3 outline-none focus:border-ink"
          />

          <button disabled={loading} className="btn-primary mt-2">
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="text-center text-sm text-muted">
            Already a member?{" "}
            <Link to="/login" className="font-medium text-ink">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}