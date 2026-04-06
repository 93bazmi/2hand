import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/auth/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const { user } = await res.json();

      if (user?.role?.toUpperCase() === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    };

    run();
  }, []);

  return <div style={{ padding: 40 }}>กำลังเข้าสู่ระบบ...</div>;
}
