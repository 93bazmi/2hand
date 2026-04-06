import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  ShoppingCart,
  Gavel,
  Home,
  Tag,
  MessageCircleQuestion,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Logo from "../public/images/logo_2hand.png";
import { useAuth } from "@/context/AuthContext";
import logout from "@/pages/api/auth/logout";

type Props = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const navItems = [
  { href: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/orders", label: "จัดการคำสั่งซื้อ", icon: ShoppingCart },

  // { href: "/admin/home-manage", label: "จัดการหน้าแรก", icon: Home },
  { href: "/admin/product", label: "จัดการสินค้า", icon: Home },
  // { href: "/admin/banner", label: "จัดการแบนเนอร์", icon: Home },
  { href: "/admin/auctions", label: "การประมูล", icon: Gavel },
  // { href: "/admin/coupons", label: "คูปอง", icon: Tag },
  // { href: "/admin/qa", label: "ถาม-ตอบ", icon: MessageCircleQuestion },
];

const NavLink = ({
  href,
  label,
  Icon,
  collapsed,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  collapsed: boolean;
}) => {
  const router = useRouter();
  const active = router.pathname === href;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "10px 0" : "10px 14px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 8,
          cursor: "pointer",
          position: "relative",
          transition: "all 0.18s ease",
          background: active ? "#e8000d" : "transparent",
          color: active ? "#fff" : "#aaa",
          fontWeight: active ? 600 : 400,
          fontSize: 13.5,
          letterSpacing: 0.2,
        }}
        className="nav-item"
      >
        {active && !collapsed && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: "60%",
              background: "#fff",
              borderRadius: "0 2px 2px 0",
            }}
          />
        )}
        <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  );
};

export default function AdminModern({ title, actions, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-root {
          display: flex;
          min-height: 100vh;
          background: #0d0d0d;
          font-family: 'IBM Plex Sans Thai', sans-serif;
          color: #f0f0f0;
        }

        .admin-sidebar {
          width: ${collapsed ? "64px" : "220px"};
          transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
          background: #111;
          border-right: 1px solid #1e1e1e;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }

        .admin-brand {
  display: flex;
  align-items: center;
  justify-content: ${collapsed ? "center" : "space-between"};
  padding: 12px;
  border-bottom: 1px solid #1e1e1e;
}

        .brand-mark {
          width: 32px;
          height: 32px;
          background: transparent; /* เอาแดงออก */
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .brand-label {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.4px;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
          white-space: nowrap;
        }

        .brand-sub {
          font-size: 10px;
          color: #555;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-family: 'IBM Plex Mono', monospace;
        }

        .admin-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .nav-section-label {
          font-size: 9px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #444;
          padding: 8px 6px 4px;
          font-family: 'IBM Plex Mono', monospace;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
          white-space: nowrap;
        }

        .nav-item:hover {
          background: #1c1c1c !important;
          color: #fff !important;
        }

        .admin-collapse-btn {
          margin: 0;
          padding: 8px;
          border-radius: 7px;
          background: transparent;
          border: 1px solid #222;
          color: #555;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .admin-collapse-btn:hover {
          border-color: #e8000d;
          color: #e8000d;
          background: #1a0001;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #0d0d0d;
        }

        .admin-topbar {
          height: 56px;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: #111;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .topbar-title {
          font-size: 15px;
          font-weight: 600;
          color: #f0f0f0;
          letter-spacing: 0.2px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .topbar-divider {
          width: 1px;
          height: 14px;
          background: #2a2a2a;
        }

        .topbar-path {
          font-size: 12px;
          color: #444;
          font-family: 'IBM Plex Mono', monospace;
        }

        .topbar-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e8000d;
          flex-shrink: 0;
        }

        .admin-content {
          flex: 1;
          padding: 28px 24px;
        }

        .admin-footer {
          padding: 14px 24px;
          border-top: 1px solid #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-text {
          font-size: 10px;
          color: #333;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.5px;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #444;
          font-family: 'IBM Plex Mono', monospace;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e88;
        }

        .admin-user {
  padding: 12px;
  border-top: 1px solid #1e1e1e;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #1c1c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  font-size: 12px;
  font-weight: 500;
}

.user-role {
  font-size: 10px;
  color: #666;
}

.logout-btn {
  padding: 6px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #222;
  color: #777;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  color: #e8000d;
  border-color: #e8000d;
  background: #1a0001;
}
      `}</style>

      <div className="admin-root">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div
            className="admin-brand"
            style={{
              flexDirection: collapsed ? "column" : "row", // ✅ สำคัญ
              gap: collapsed ? 8 : 10,
            }}
          >
            {!collapsed && (
              <Link href="/" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <div className="brand-mark">
                    <Image src={Logo} alt="logo" width={24} height={24} />
                  </div>
                  <div>
                    <div className="brand-label">2Hand</div>
                    <div className="brand-sub">Admin</div>
                  </div>
                </div>
              </Link>
            )}
            <button
              className="admin-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "ขยาย" : "ย่อ"}
            >
              {collapsed ? <Menu size={15} /> : <X size={15} />}
            </button>
          </div>

          <nav className="admin-nav">
            <div className="nav-section-label">เมนูหลัก</div>
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                collapsed={collapsed}
              />
            ))}
          </nav>
          <div className="admin-user">
            {!collapsed ? (
              <>
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt="avatar"
                        width={28}
                        height={28}
                        style={{ borderRadius: 8 }}
                      />
                    ) : (
                      user?.name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>

                  <div>
                    <div className="user-name">{user?.name || user?.email}</div>
                    <div className="user-role">{user?.role}</div>
                  </div>
                </div>

                <button
                  className="logout-btn"
                  onClick={logout}
                  title="ออกจากระบบ"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button
                className="logout-btn"
                onClick={logout}
                title="ออกจากระบบ"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          <div className="admin-topbar">
            <div className="topbar-title">
              <div className="topbar-dot" />
              {title ?? "Admin"}
              <div className="topbar-divider" />
              <span className="topbar-path">2hand.admin</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {actions}
            </div>
          </div>

          <div className="admin-content">{children}</div>

          <div className="admin-footer">
            <span className="footer-text">© 2025 2Hand Platform</span>
          </div>
        </main>
      </div>
    </>
  );
}
