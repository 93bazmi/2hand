"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function CookieConsent({
  onAccept,
  onDecline,
}: CookieConsentProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookieConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    Cookies.set("cookieConsent", "true", { expires: 365 });
    setShow(false);
    if (onAccept) onAccept();
  };

  const decline = () => {
    Cookies.set("cookieConsent", "false", { expires: 365 });
    setShow(false);
    if (onDecline) onDecline();
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-3xl w-[95%]
      bg-white border border-black/10 shadow-xl rounded-xl p-4 md:p-5
      flex flex-col md:flex-row items-center gap-4 text-center md:text-left"
    >
      <p className="text-gray-800 flex-1 text-sm md:text-base leading-relaxed">
        เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพการใช้งานและวิเคราะห์ข้อมูลการใช้งาน
        โปรดยอมรับเพื่อให้เราสามารถให้บริการที่ดีที่สุดแก่คุณ
      </p>

      <div className="flex gap-3">
        {/* Accept */}
        <button
          onClick={accept}
          className="bg-red-600 text-white px-4 py-2 rounded-lg
          hover:bg-red-700 active:scale-95 transition font-medium"
        >
          ยอมรับ
        </button>

        {/* Decline */}
        <button
          onClick={decline}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg
          hover:bg-gray-800 active:scale-95 transition font-medium"
        >
          ไม่ยอมรับ
        </button>
      </div>
    </div>
  );
}
