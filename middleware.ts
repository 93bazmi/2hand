import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // ❌ ไม่มี token → เด้ง login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // decode JWT
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("PAYLOAD:", payload);
    // ❌ ไม่ใช่ ADMIN → เด้งออก
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  console.log("TOKEN:", token);

  // ✅ ผ่าน
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // ใช้เฉพาะ admin
};