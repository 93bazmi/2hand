// pages/admin/auctions/index.tsx
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AuctionListItem } from "../../../types/auction";
import { useRouter } from "next/router";
export { getServerSideProps } from "@/lib/adminGuardPage";
import AdminModern from "@/components/AdminModern";

function fmtDate(input: string | Date) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}
type StatusFilter = "ALL" | "SCHEDULED" | "LIVE" | "ENDED" | "CANCELED";

export default function AdminAuctionsList() {
  const router = useRouter();
  const [items, setItems] = useState<AuctionListItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const url = useMemo(() => {
    const s = new URLSearchParams();
    if (qDebounced) s.set("q", qDebounced);
    if (status !== "ALL") s.set("status", status);
    return `/api/admin/auctions${s.toString() ? `?${s}` : ""}`;
  }, [qDebounced, status]);

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    setLoading(true);
    setErr(null);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    fetch(url, { signal: ac.signal })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          router.replace("/admin/login");
          return [];
        }
        if (!r.ok) {
          const js = await r.json().catch(() => ({}));
          throw new Error(js.error || `Request failed (${r.status})`);
        }
        return r.json();
      })
      .then((data) => {
        if (!ac.signal.aborted) setItems(Array.isArray(data) ? data : []);
      })
      .catch((e: any) => {
        if (!ac.signal.aborted) setErr(String(e?.message || "Load failed"));
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [url, router]);

  return (
    <AdminModern title="จัดการประมูล">
      <div className="admin-grid">
        {/* HEADER */}
        <div
          className="span-12"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>รายการประมูล</div>

          <Link href="/admin/auctions/new" className="btn btn-primary">
            + สร้างประมูล
          </Link>
        </div>

        {/* FILTER */}
        <div className="span-12 ">
          <div
            className="card-body"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <input
              className="input"
              placeholder="ค้นหา..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 200, height: 45 }}
            />

            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              style={{ width: 180, height: 45 }}
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="SCHEDULED">ยังไม่เริ่ม</option>
              <option value="LIVE">กำลังประมูล</option>
              <option value="ENDED">จบแล้ว</option>
              <option value="CANCELED">ยกเลิก</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="span-12 card">
          <div className="card-body">
            {loading && <div className="muted">กำลังโหลด...</div>}
            {err && <div className="badge danger">Error: {err}</div>}

            {!loading && !err && items.length === 0 && (
              <div className="empty">ไม่มีรายการประมูล</div>
            )}

            {items.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>ชื่อ</th>
                    <th>ราคาปัจจุบัน</th>
                    <th>เวลาจบ</th>
                    <th>สถานะ</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((a) => (
                    <tr key={a.id}>
                      <td>{a.title}</td>

                      <td>฿{Number(a.currentPrice ?? 0).toLocaleString()}</td>

                      <td>{fmtDate(a.endAt as any)}</td>

                      <td>
                        {a.status === "LIVE" && (
                          <span className="badge pending">กำลังประมูล</span>
                        )}
                        {a.status === "ENDED" && (
                          <span className="badge completed">จบแล้ว</span>
                        )}
                        {a.status === "SCHEDULED" && (
                          <span className="badge">ยังไม่เริ่ม</span>
                        )}
                        {a.status === "CANCELED" && (
                          <span className="badge cancelled">ยกเลิก</span>
                        )}
                      </td>

                      <td>
                        <Link
                          href={`/auctions/${a.id}`}
                          className="btn btn-secondary"
                        >
                          ดูหน้าเว็บจริง ↗
                        </Link>
                        <Link
                          href={`/admin/auctions/${a.id}`}
                          className="btn btn-secondary"
                        >
                          จัดการ
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminModern>
  );
}
