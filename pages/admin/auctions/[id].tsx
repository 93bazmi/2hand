// pages/admin/auctions/[id].tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import AdminModern from "@/components/AdminModern";
export { getServerSideProps } from "@/lib/adminGuardPage";

type Bid = {
  id: string;
  amount: number;
  createdAt: string;
  bidder?: { name?: string; email?: string };
};
type Product = { id: string; imageUrl?: string | null; translations?: any[] };
type Auction = {
  id: string;
  title: string;
  description?: string | null;
  bidIncrement: number;
  startAt: string;
  endAt: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELED";
  currentPrice: number;
  product?: Product | null;
  bids: Bid[];
};

export default function AdminAuctionManage() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [data, setData] = useState<Auction | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    bidIncrement: 10,
    startAt: "",
    endAt: "",
    status: "SCHEDULED" as Auction["status"],
  });

  useEffect(() => {
    if (!id) return;
    setErr(null);
    fetch(`/api/admin/auctions/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const js = await r.json().catch(() => ({}));
          throw new Error(js.error || `Request failed (${r.status})`);
        }
        return r.json();
      })
      .then((a: Auction) => {
        setData(a);
        setForm({
          title: a.title ?? "",
          description: a.description ?? "",
          bidIncrement: a.bidIncrement ?? 10,
          startAt: toLocalInput(a.startAt),
          endAt: toLocalInput(a.endAt),
          status: a.status,
        });
      })
      .catch((e: any) => setErr(String(e?.message || "Load failed")));
  }, [id]);

  const topBid = useMemo(() => (data?.bids?.[0] ? data.bids[0] : null), [data]);
  const topName = useMemo(
    () => topBid?.bidder?.name || topBid?.bidder?.email || null,
    [topBid],
  );
  const totalBids = data?.bids?.length ?? 0;

  const canClose = data && !["ENDED", "CANCELED"].includes(data.status);
  const canCancel = data && !["ENDED", "CANCELED"].includes(data.status);

  const save = async () => {
    if (!data) return;
    const startIso = fromLocalInput(form.startAt);
    const endIso = fromLocalInput(form.endAt);
    if (!startIso || !endIso) return alert("Please set start/end time");
    if (new Date(endIso) <= new Date(startIso))
      return alert("End time must be after start time");

    setSaving(true);
    const res = await fetch(`/api/admin/auctions/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        bidIncrement: Number(form.bidIncrement),
        startAt: startIso,
        endAt: endIso,
        status: form.status,
      }),
    });
    const js = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return alert(js.error || "Save failed");
    setData(js);
  };

  const action = async (act: "close" | "cancel") => {
    if (!data) return;
    if (act === "close" && !confirm("Close this auction now?")) return;
    if (act === "cancel" && !confirm("Cancel this auction?")) return;

    setBusy(true);
    const res = await fetch(`/api/admin/auctions/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    const js = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return alert(js.error || "Action failed");
    setData(js);
    setForm((f) => ({ ...f, status: js.status }));
  };

  const del = async () => {
    if (!data) return;
    if (!confirm("Delete this auction? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/auctions/${data.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) return alert("Delete failed");
    router.replace("/admin/auctions");
  };

  const [uploading, setUploading] = useState(false);
  const changeImage = async (file: File) => {
    if (!data?.product?.id) return alert("This auction has no product.");
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    const up = await fetch("/api/admin/uploads", { method: "POST", body: fd });
    const upJs = await up.json().catch(() => ({}));
    if (!up.ok) {
      setUploading(false);
      return alert(upJs.error || "Upload failed");
    }
    const res = await fetch(`/api/admin/products/${data.product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: upJs.url }),
    });
    const js = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) return alert(js.error || "Update product failed");
    setData((d) =>
      d && d.product
        ? { ...d, product: { ...d.product, imageUrl: upJs.url } }
        : d,
    );
  };

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-6">Loading…</div>;

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
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{data.title}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => (location.href = "/admin/auctions")}
            >
              ← กลับหน้าประมูล
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => (location.href = `/auctions/${data.id}`)}
            >
              ดูหน้าเว็บจริง ↗
            </button>
          </div>
        </div>

        {/* STATS 4 ช่อง */}
        <div
          className="span-12"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          <div className="stat-card">
            <div className="stat-label">สถานะ</div>
            <div style={{ marginTop: 6 }}>
              {data.status === "LIVE" && (
                <span className="badge warn">กำลังประมูล</span>
              )}
              {data.status === "ENDED" && (
                <span className="badge info">จบแล้ว</span>
              )}
              {data.status === "SCHEDULED" && (
                <span className="badge">ยังไม่เริ่ม</span>
              )}
              {data.status === "CANCELED" && (
                <span className="badge danger">ยกเลิก</span>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">ราคาปัจจุบัน</div>
            <div className="stat-metric">
              ฿{data.currentPrice.toLocaleString()}
            </div>
            {topName && <div className="muted">{topName}</div>}
          </div>

          <div className="stat-card">
            <div className="stat-label">จำนวนบิด</div>
            <div className="stat-metric">{totalBids}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">สิ้นสุดใน</div>
            <div className="stat-metric">{formatRemaining(data.endAt)}</div>
          </div>
        </div>

        {/* MAIN 2 COLUMN */}
        <div
          className="span-12"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 16,
          }}
        >
          {/* LEFT = ALL IN ONE CARD */}
          <div className="card">
            <div
              className="card-body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* PRODUCT */}
              <div>
                <div className="card-title">สินค้า</div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={data.product?.imageUrl || "/images/placeholder.png"}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 10,
                      objectFit: "cover",
                      border: "1px solid #222",
                    }}
                  />

                  <div>
                    <div className="muted">เปลี่ยนรูปสินค้า</div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) changeImage(f);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="card-title mb-3">ข้อมูลการประมูล</div>

                <div className="grid grid-cols-2 gap-4">
                  {/* TITLE */}
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">
                      ชื่อรายการ
                    </label>
                    <input
                      className="input w-full h-[42px]"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">
                      รายละเอียด
                    </label>
                    <textarea
                      className="input w-full h-[100px]"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  {/* BID */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      ขั้นต่ำการบิด (บาท)
                    </label>
                    <input
                      className="input w-full h-[42px]"
                      value={form.bidIncrement}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          bidIncrement: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      สถานะ
                    </label>
                    <select
                      className="select w-full h-[42px]"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value as any })
                      }
                    >
                      <option value="SCHEDULED">ยังไม่เริ่ม</option>
                      <option value="LIVE">กำลังประมูล</option>
                      <option value="ENDED">จบแล้ว</option>
                      <option value="CANCELED">ยกเลิก</option>
                    </select>
                  </div>
                </div>

                {/* TIME */}
                <div className="mt-5">
                  <div className="card-title mb-2">วันเวลา</div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        เริ่มต้น
                      </label>
                      <input
                        type="datetime-local"
                        className="input w-full h-[42px]"
                        value={form.startAt}
                        onChange={(e) =>
                          setForm({ ...form, startAt: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">
                        สิ้นสุด
                      </label>
                      <input
                        type="datetime-local"
                        className="input w-full h-[42px]"
                        value={form.endAt}
                        onChange={(e) =>
                          setForm({ ...form, endAt: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div>
                <div className="card-title">การดำเนินการ</div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <button className="btn btn-primary" onClick={save}>
                    บันทึกการแก้ไข
                  </button>

                  <div className="flex gap-2">
                    <button
                      className="btn flex-1"
                      onClick={() => action("close")}
                    >
                      ปิดทันที
                    </button>

                    <button
                      className="btn flex-1"
                      onClick={() => action("cancel")}
                    >
                      ยกเลิกการประมูล
                    </button>
                  </div>

                  <button className="btn btn-danger" onClick={del}>
                    ลบรายการประมูลนี้
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT = BIDS */}
          <div className="card">
            <div className="card-body">
              <div className="card-title">ประวัติการบิด</div>

              <table className="table">
                <thead>
                  <tr>
                    <th>ราคา</th>
                    <th>ผู้ใช้</th>
                    <th>เวลา</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bids.map((b) => (
                    <tr key={b.id}>
                      <td>฿{b.amount.toLocaleString()}</td>
                      <td>{b.bidder?.name || b.bidder?.email || "ไม่ทราบ"}</td>
                      <td>{new Date(b.createdAt).toLocaleString("th-TH")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.bids.length === 0 && (
                <div className="empty">ยังไม่มีการประมูล</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminModern>
  );
}

function toLocalInput(dt: string) {
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function formatRemaining(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "จบแล้ว";

  const h = Math.floor(diff / 1000 / 60 / 60);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
