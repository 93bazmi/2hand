"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { type LucideIcon, User, Package, LogOut, Smile } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Item = {
  to: string;
  label: string;
  Icon: LucideIcon;
};

const items: Item[] = [
  { to: "/account", label: "บัญชีของฉัน", Icon: User },
  { to: "/orders", label: "คำสั่งซื้อของฉัน", Icon: Package },
];

export default function AccountSidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (to: string) => router.asPath === to;

  return (
    <aside className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-white shadow-sm">
          <Smile className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-[11px] text-gray-500">สวัสดี,</div>
          <div className="font-semibold text-gray-900">
            {user?.name || "Username"}
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="p-2">
        {/* menu ปกติ */}
        {items.map(({ to, label, Icon }) => {
          const active = isActive(to);

          return (
            <Link key={to} href={to} className="block">
              <div
                className={[
                  "mt-4 flex items-center gap-3 rounded-xl px-4 py-2.5 transition",
                  active
                    ? "text-black border border-red-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <Icon className="ml-2 h-4 w-4" />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}

        {/* logout */}
        <button onClick={logout} className="w-full text-left mt-4">
          <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-red-600 hover:bg-red-50 transition">
            <LogOut className="ml-2 h-4 w-4" />
            <span>ออกจากระบบ</span>
          </div>
        </button>
      </nav>
    </aside>
  );
}
