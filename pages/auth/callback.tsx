"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/auth/profile", {
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json().catch(() => null);

        const user = data?.user;

        if (user?.role?.toUpperCase() === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Callback error:", err);
        router.push("/login");
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white px-4">
      {/* red glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl bg-red-200/40" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl bg-rose-200/40" />

      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl text-center">
        {/* loading icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>

        {/* title */}
        <h1 className="text-2xl font-bold text-black mb-2">กำลังเข้าสู่ระบบ</h1>

        {/* subtitle */}
        <p className="text-gray-600 mb-4">
          กรุณารอสักครู่ กำลังตรวจสอบข้อมูลของคุณ...
        </p>

        {/* small hint */}
        <p className="text-xs text-gray-400">
          หากใช้เวลานานเกินไป ระบบจะพาคุณกลับไปหน้าเข้าสู่ระบบ
        </p>
      </div>
    </div>
  );
}
