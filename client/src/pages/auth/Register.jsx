import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "@/components/common/Logo";
import api from "@/api/axios";

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", form);

      nav("/otp", {
        state: {
          email: form.email,
          phone: form.phone,
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
    <div className="container-x py-16 grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
      <div className="hidden lg:block">
        <Logo />
        <h1 className="text-5xl font-bold mt-8 leading-tight">
          Create your <span className="text-brand-dark">Rovauto</span> account.
        </h1>
        <p className="text-muted mt-4 max-w-md">
          Book trusted services and manage your vehicle care.
        </p>
      </div>

      <div className="card-soft p-7 max-w-md w-full mx-auto">
        <h2 className="text-2xl font-bold">Create account</h2>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <input
            required
            name="name"
            value={form.name}
            onChange={change}
            placeholder="Full name"
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />

          <input
            required
            name="email"
            value={form.email}
            onChange={change}
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />

          <input
            required
            name="phone"
            value={form.phone}
            onChange={change}
            maxLength={15}
            placeholder="Mobile number"
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />

          <input
            required
            name="password"
            value={form.password}
            onChange={change}
            type="password"
            placeholder="Password"
            minLength={8}
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />

          <button disabled={loading} className="btn-primary mt-2">
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="text-center text-sm text-muted">
            Already a member?{" "}
            <Link to="/login" className="text-ink font-medium">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}