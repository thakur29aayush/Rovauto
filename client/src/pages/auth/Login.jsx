import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "@/components/common/Logo";
import api from "@/api/axios";
import { FiArrowRight, FiUser, FiTool } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import completeGoogleAuth from "@/utils/googleAuth";
import {
  hasSavedUserLocation,
  requestSignupLocation,
  saveSignupLocationToProfile,
} from "@/utils/signupLocation";

export default function Login() {
  const { state } = useLocation();
  const from = state?.from?.pathname || null;
  const notice = state?.message || "";

  const nav = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [role, setRole] = useState("CUSTOMER"); // Default to CUSTOMER
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
      const res = await api.post("/auth/login", {
        identifier: form.identifier.trim(),
        password: form.password,
      });

      const data = res.data?.data;

      if (!data?.token || !data?.user) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", data.token);
      const freshUser = data.user;
      localStorage.setItem("user", JSON.stringify(freshUser));

      let redirectPath;
      if (freshUser.role === "GARAGE_OWNER") {
        redirectPath = "/garage";
      } else {
        if (!hasSavedUserLocation(freshUser)) {
          redirectPath = "/booking/address";
        } else {
          redirectPath = from || "/dashboard";
        }
      }

      window.location.href = redirectPath;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await completeGoogleAuth(role);
      let freshUser = data.user;

      if (freshUser.role === "CUSTOMER" && data.isNewUser) {
        const signupLocation = await requestSignupLocation();
        if (await saveSignupLocationToProfile(signupLocation)) {
          freshUser = {
            ...freshUser,
            customerProfile: {
              ...(freshUser.customerProfile || {}),
              address: signupLocation.address,
            },
            locations: signupLocation.latitude && signupLocation.longitude
              ? [
                  {
                    latitude: signupLocation.latitude,
                    longitude: signupLocation.longitude,
                    address: signupLocation.address,
                    isDefault: true,
                  },
                  ...(freshUser.locations || []),
                ]
              : freshUser.locations || [],
          };
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      }

      let redirectPath;
      if (freshUser.role === "GARAGE_OWNER") {
        redirectPath = "/garage";
      } else {
        if (!hasSavedUserLocation(freshUser)) {
          redirectPath = "/booking/address";
        } else {
          redirectPath = from || "/dashboard";
        }
      }

      window.location.href = redirectPath;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-16 grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
      <div className="hidden lg:block">
        <Logo />

        <h1 className="text-5xl font-bold mt-8 leading-tight">
          Welcome back.
          <br />
          <span className="text-muted">Your garage on demand.</span>
        </h1>
      </div>

      <div className="card-soft p-7 max-w-md w-full mx-auto">
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
          Login to Rovauto {role === "GARAGE_OWNER" ? " (Garage)" : ""}
        </h2>

        <p className="text-sm text-muted mt-1">
          Use email/phone and password
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {notice && !error && (
          <p className="mt-3 text-sm text-red-600">
            {notice}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 font-medium transition hover:border-ink disabled:opacity-60"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <input
            required
            name="identifier"
            value={form.identifier}
            onChange={change}
            placeholder="Email or phone"
            autoComplete="username"
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />

          <input
            required
            name="password"
            value={form.password}
            onChange={change}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="px-4 py-3 rounded-xl border border-line focus:border-ink outline-none"
          />

          <button disabled={loading} className="btn-primary mt-2">
            {loading ? (
              "Logging in..."
            ) : (
              <>
                Login <FiArrowRight />
              </>
            )}
          </button>

          <Link
            to="/forgot"
            className="text-sm text-muted hover:text-ink text-center mt-1"
          >
            Forgot password?
          </Link>

          <div className="text-center text-sm text-muted">
            New to Rovauto?{" "}
            <Link to="/register" className="text-ink font-medium">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
