"use client";
import Image from "next/image";

export default function AuthCard({
  children,
  imageSrc = "/images/logo_2hand.png",
  imageAlt = "Auth Illustration",
  height = 650,
}: {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  height?: number;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        {/* ใช้ style แทน class dynamic */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ minHeight: height }}
        >
          {/* ซ้าย: โลโก้ */}
          <div className="relative bg-white flex items-center justify-center">
            <div className="relative w-full h-48 md:h-full">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-contain p-6 md:p-10"
                priority
              />
            </div>
          </div>

          {/* ขวา: ฟอร์ม */}
          <div className="p-6 md:p-10 flex items-center">
            <div className="w-full max-w-md mx-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
