"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthCard from "@/components/AuthCard";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const user = await login(form.email, form.password, form.remember);

      // ✅ เช็ค role
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);
      const msg = String(err?.message || "");
      setError(
        /invalid credentials/i.test(msg)
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : msg || "ไม่สามารถเข้าสู่ระบบได้",
      );
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      setError(null);
      setLoadingGoogle(true);
      const r = await fetch(
        `/api/auth/google/url?remember=${
          form.remember ? 1 : 0
        }&redirect=${encodeURIComponent("/auth/callback")}`,
      );
      const js = await r.json();
      if (js?.url) {
        window.location.href = js.url;
      } else {
        setLoadingGoogle(false);
        setError("ไม่สามารถเริ่มการเข้าสู่ระบบด้วย Google ได้");
      }
    } catch (e: any) {
      setLoadingGoogle(false);
      setError(e?.message || "ไม่สามารถเริ่มการเข้าสู่ระบบด้วย Google ได้");
    }
  };

  const GoogleLogo = (props: any) => (
    <svg viewBox="0 0 256 262" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M255.9 133.5c0-10.7-.9-18.5-2.9-26.6H130v48.2h71.9c-1.5 12-9.6 30.2-27.6 42.4l-.3 2 40.1 31 2.8.3c25.6-23.6 39-58.3 39-97.3z"
      />
      <path
        fill="#34A853"
        d="M130 261.1c35.3 0 65-11.6 86.7-31.3l-41.3-32.1c-11.1 7.7-26 13-45.4 13-34.6 0-63.9-23-74.3-54.9l-2 .2-40.4 31.2-.5 1.9c21.4 42.5 65.5 71.9 117.2 71.9z"
      />
      <path
        fill="#FBBC05"
        d="M55.7 156.1c-2.8-8.1-4.5-16.9-4.5-26.1s1.7-18 4.5-26.1l-.1-1.8-40.8-31.5-1.3.6C4.9 88.5 0 109.4 0 130c0 20.6 4.9 41.5 13.5 59l42.2-32.9z"
      />
      <path
        fill="#EA4335"
        d="M130 50.2c24.6 0 41.2 10.6 50.6 19.4l36.9-36C195.7 12.4 166.2-.5 131-.5 78.3-.5 34.2 28.9 12.8 71.4L55 104c10.5-31.9 39.7-53.8 75-53.8z"
      />
    </svg>
  );

  return (
    <AuthCard imageSrc="/images/logo_2hand.png" imageAlt="I Love 2Hand">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-center text-black">
          เข้าสู่ระบบ
        </h1>

        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              อีเมล
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder="alex@email.com"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="username"
                className="w-full rounded-xl border border-gray-300 bg-white
px-3.5 py-2.5 pr-11
focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500
transition"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 mr-1.5 my-1.5 inline-flex items-center justify-center rounded-lg p-2 text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="โปรดกรอกรหัสผ่าน"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 bg-white
px-3.5 py-2.5 pr-11
focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500
transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 mr-1.5 my-1.5
inline-flex items-center justify-center rounded-lg p-2
text-gray-500 hover:bg-gray-100 transition"
                aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPw ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
                className="h-4 w-4 rounded border-gray-300 accent-black"
              />
              <span className="text-gray-700">จำฉันไว้</span>
            </label>
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="font-medium text-red-600 hover:underline"
            >
              ลืมรหัสผ่าน?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl px-4 py-2.5 font-medium text-white
  transition focus:outline-none focus:ring-2 focus:ring-red-200
  ${
    loading
      ? "bg-red-400 cursor-not-allowed"
      : "bg-red-600 hover:bg-red-700 active:scale-95"
  }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs font-medium text-gray-400">
                หรือ
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={googleLogin}
            disabled={loadingGoogle}
            className="flex w-full items-center justify-center gap-2
rounded-xl bg-white px-4 py-2.5 font-medium text-gray-800
border border-gray-300
hover:bg-gray-50 active:scale-95
focus:ring-2 focus:ring-red-100
transition disabled:opacity-60"
            aria-busy={loadingGoogle}
          >
            <GoogleLogo className="h-5 w-5" />
            <span>
              {loadingGoogle
                ? "กำลังเชื่อมต่อ Google…"
                : "เข้าสู่ระบบด้วย Google"}
            </span>
          </button>

          <p className="text-center text-sm text-slate-600">
            ยังไม่มีบัญชี?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-medium text-red-600 hover:underline"
            >
              ลงทะเบียน
            </button>
          </p>
        </form>
      </div>
    </AuthCard>
  );
}
