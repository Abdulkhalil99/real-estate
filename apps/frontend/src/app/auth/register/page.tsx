"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home, Mail, Lock, User, Phone } from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { authHelper } from "@/lib/auth";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Min 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = "Must include upper, lower and number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authApi.register(form);
      authHelper.saveSession(data);
      toast.success("Account created! Welcome, " + data.user.firstName + "!");

      // بعد از register، اگر pending favorite داشت اضافه کن
      const pendingId = sessionStorage.getItem("pending_favorite");
      if (pendingId) {
        sessionStorage.removeItem("pending_favorite");
        const key = "estatehub_favorites_" + data.user.id;
        try {
          const stored = localStorage.getItem(key);
          const current: string[] = stored ? JSON.parse(stored) : [];
          if (!current.includes(pendingId)) {
            current.push(pendingId);
            localStorage.setItem(key, JSON.stringify(current));
          }
        } catch {}
        toast.success("Property added to favorites ❤️");
        router.push("/favorites");
        return;
      }

      router.push("/");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f6f9" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl text-white"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#3498db" }}
          >
            <Home className="w-5 h-5 text-white" />
          </div>
          EstateHub
        </Link>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join thousands of
            <br />
            agents & owners
          </h2>
          <p style={{ color: "#85929e" }} className="text-lg leading-relaxed">
            Create your free account and start listing properties in minutes. No
            credit card required.
          </p>
          <div className="space-y-3 mt-8">
            {[
              "Free to list properties",
              "Reach thousands of buyers",
              "Manage inquiries easily",
              "Professional agent profile",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#3498db" }}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span style={{ color: "#aab7b8" }} className="text-sm">
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: "#566573" }}>
          © {new Date().getFullYear()} EstateHub. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg mb-8 lg:hidden"
            style={{ color: "#2c3e50" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#3498db" }}
            >
              <Home className="w-4 h-4 text-white" />
            </div>
            EstateHub
          </Link>

          <div className="card p-8">
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "#2c3e50" }}
            >
              Create account
            </h1>
            <p className="text-sm mb-6" style={{ color: "#7f8c8d" }}>
              Fill in your details to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First name</label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "#95a5a6" }}
                    />
                    <input
                      type="text"
                      className={
                        "input pl-10 " + (errors.firstName ? "input-error" : "")
                      }
                      placeholder="John"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                    />
                  </div>
                  {errors.firstName && (
                    <p className="error-msg">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="label">Last name</label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "#95a5a6" }}
                    />
                    <input
                      type="text"
                      className={
                        "input pl-10 " + (errors.lastName ? "input-error" : "")
                      }
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                    />
                  </div>
                  {errors.lastName && (
                    <p className="error-msg">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#95a5a6" }}
                  />
                  <input
                    type="email"
                    className={
                      "input pl-10 " + (errors.email ? "input-error" : "")
                    }
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                {errors.email && <p className="error-msg">{errors.email}</p>}
              </div>

              <div>
                <label className="label">
                  Phone{" "}
                  <span className="font-normal" style={{ color: "#95a5a6" }}>
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#95a5a6" }}
                  />
                  <input
                    type="tel"
                    className="input pl-10"
                    placeholder="+216 XX XXX XXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#95a5a6" }}
                  />
                  <input
                    type={showPw ? "text" : "password"}
                    className={
                      "input pl-10 pr-10 " +
                      (errors.password ? "input-error" : "")
                    }
                    placeholder="Min 8 chars, upper + lower + number"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? (
                      <EyeOff
                        className="w-4 h-4"
                        style={{ color: "#95a5a6" }}
                      />
                    ) : (
                      <Eye className="w-4 h-4" style={{ color: "#95a5a6" }} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-msg">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: "0.5rem" }}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div
              className="mt-4 pt-4 text-center text-sm"
              style={{ borderTop: "1px solid #f0f3f6", color: "#7f8c8d" }}
            >
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold hover:underline"
                style={{ color: "#3498db" }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
