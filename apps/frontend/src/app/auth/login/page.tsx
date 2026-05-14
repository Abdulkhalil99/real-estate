"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home, Mail, Lock, AlertCircle } from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { authHelper } from "@/lib/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(""); // ← shows the error inline
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const validate = () => {
    const e = { email: "", password: "" };
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password.trim()) e.password = "Password is required";
    setFieldErrors(e);
    return !e.email && !e.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); // clear previous error
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      authHelper.saveSession(data);
      toast.success("Welcome back, " + data.user.firstName + "!");

      // بعد از لاگین، اگر pending favorite داشت اضافه کن
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

      if (data.user.role === "ADMIN" || data.user.role === "AGENT") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      // Show the error INSIDE the form, not just a toast
      const message = getErrorMessage(err);
      setFormError(message); // ← this makes it visible in the form
      toast.error(message);
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
            Manage your properties
            <br />
            from one place
          </h2>
          <p style={{ color: "#85929e" }} className="text-lg leading-relaxed">
            List, update, and track your real estate portfolio. Respond to
            inquiries instantly.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: "500+", label: "Active listings" },
              { value: "2k+", label: "Happy clients" },
              { value: "98%", label: "Satisfaction" },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#3498db" }}
                >
                  {s.value}
                </div>
                <div className="text-xs mt-1" style={{ color: "#7f8c8d" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: "#566573" }}>
          © {new Date().getFullYear()} EstateHub. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
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
              Welcome back
            </h1>
            <p className="text-sm mb-6" style={{ color: "#7f8c8d" }}>
              Sign in to your account to continue
            </p>

            {/* ── Inline error banner ─────────────────────────────────── */}
            {formError && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{ background: "#fadbd8", border: "1px solid #f1948a" }}
              >
                <AlertCircle
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "#e74c3c" }}
                />
                <p className="text-sm font-medium" style={{ color: "#922b21" }}>
                  {formError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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
                      "input pl-10 " + (fieldErrors.email ? "input-error" : "")
                    }
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError("");
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="error-msg">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <Link
                    href="/auth/forgot"
                    className="text-xs hover:underline"
                    style={{ color: "#3498db" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#95a5a6" }}
                  />
                  <input
                    type={showPw ? "text" : "password"}
                    className={
                      "input pl-10 pr-10 " +
                      (fieldErrors.password ? "input-error" : "")
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError("");
                      setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
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
                {fieldErrors.password && (
                  <p className="error-msg">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: "0.5rem" }}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Register link */}
            <div
              className="mt-4 pt-4 text-center text-sm"
              style={{ borderTop: "1px solid #f0f3f6", color: "#7f8c8d" }}
            >
              Do not have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold hover:underline"
                style={{ color: "#3498db" }}
              >
                Create one
              </Link>
            </div>

            {/* Demo credentials */}
            <div
              className="mt-4 p-3 rounded-xl text-xs space-y-1"
              style={{ background: "#ebf5fb", color: "#1a6fa3" }}
            >
              <p className="font-semibold mb-1">Demo accounts:</p>
              <p>Admin: admin@realestate.com / Password1</p>
              <p>Agent: sarah@realestate.com / Password1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
