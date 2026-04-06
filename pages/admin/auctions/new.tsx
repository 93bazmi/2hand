import { useEffect, useMemo, useState } from "react";
export { getServerSideProps } from "@/lib/adminGuardPage";
import AdminModern from "@/components/AdminModern";

type Product = {
  id: string;
  price: number;
  imageUrl?: string | null;
  translations: { locale: string; name: string; description?: string | null }[];
};

export default function NewAuctionPage() {
  /* --------------------- เลือกสินค้าที่มีอยู่ --------------------- */
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    let cancel = false;

    const run = async () => {
      const q = query.trim();

      const url = q
        ? `/api/admin/products/search?q=${encodeURIComponent(q)}`
        : `/api/admin/products/search`; // 👈 ไม่มี q = เอาทั้งหมด

      const r = await fetch(url);
      const js = await r.json();

      if (!cancel) setResults(js);
    };

    const t = setTimeout(run, 300);

    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [query]);

  /* --------------------- ฟอร์ม Auction --------------------- */
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startPrice, setStartPrice] = useState<number | "">(0);
  const [bidIncrement, setBidIncrement] = useState<number | "">(50);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(false);

  const toLocalInputValue = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const nowIsoLocal = () =>
    toLocalInputValue(new Date(Date.now() + 0 * 60 * 1000));

  const endIsoLocal = () =>
    toLocalInputValue(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

  useEffect(() => {
    setStartAt(nowIsoLocal());
    setEndAt(endIsoLocal());
  }, []);

  const numericOk = useMemo(
    () =>
      typeof startPrice === "number" &&
      startPrice > 0 &&
      typeof bidIncrement === "number" &&
      bidIncrement > 0,
    [startPrice, bidIncrement],
  );
  const formValid =
    selectedId !== "" &&
    title.trim().length > 0 &&
    desc.trim().length > 0 &&
    startAt !== "" &&
    endAt !== "" &&
    numericOk &&
    new Date(endAt) > new Date(startAt);

  const submit = async () => {
    if (!selectedId) return alert("กรุณาเลือกสินค้า");
    if (!title.trim()) return alert("กรุณาระบุชื่อประมูล");
    if (!numericOk) return alert("ราคาเริ่มต้นและเพิ่มขั้นต่ำต้องมากกว่า 0");
    if (!startAt || !endAt)
      return alert("กรุณากำหนดเวลาเริ่ม/สิ้นสุดการประมูล");
    if (new Date(endAt) <= new Date(startAt))
      return alert("เวลาปิดต้องหลังเวลาเริ่ม");

    setLoading(true);
    const body = {
      productId: selectedId,
      title: title.trim(),
      description: desc.trim() || undefined,
      startPrice: Number(startPrice),
      bidIncrement: Number(bidIncrement),

      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
    };

    const res = await fetch("/api/admin/auctions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const js = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return alert(js.error || "Create failed");
    location.href = `/admin/auctions/${js.id}`;
  };

  return (
    <AdminModern title="สร้างประมูล">
      <div className="admin-grid">
        <div className="span-12 card">
          <div
            className="card-body"
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* HEADER ROW */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                สร้างรายการประมูล
              </div>

              <button
                className="btn btn-secondary "
                onClick={() => (location.href = "/admin/auctions")}
              >
                ← กลับหน้าประมูล
              </button>
            </div>

            {/* SEARCH PRODUCT */}
            <div style={{ marginBottom: 16 }}>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  ค้นหาสินค้าที่ต้องการนำมาประมูล
                </div>

                <input
                  className="input"
                  placeholder="ค้นหาชื่อสินค้า..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div
                style={{
                  marginTop: 8,
                  maxHeight: 220,
                  overflow: "auto",
                  border: "1px solid #1e1e1e",
                  borderRadius: 8,
                }}
              >
                {results.map((p) => {
                  const name =
                    p.translations.find((t) => t.locale === "en")?.name ||
                    p.translations[0]?.name ||
                    "Unnamed";

                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 px-2 py-2 border-b border-[#1e1e1e] cursor-pointer transition
    ${selectedId === p.id ? "bg-red-500/20" : "hover:bg-gray-500/10"}
  `}
                    >
                      <input
                        type="radio"
                        checked={selectedId === p.id}
                        onChange={() => {
                          setSelectedId(p.id);

                          const name =
                            p.translations.find((t) => t.locale === "en")
                              ?.name ||
                            p.translations[0]?.name ||
                            "Unnamed";

                          setSelectedName(name);
                          if (p.price) {
                            setStartPrice(p.price);
                          }
                        }}
                      />

                      <img
                        src={p.imageUrl || "/images/placeholder.png"}
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />

                      <span>{name}</span>
                    </label>
                  );
                })}

                {results.length === 0 && (
                  <div className="muted" style={{ padding: 10 }}>
                    ไม่พบสินค้า
                  </div>
                )}
              </div>

              {selectedId && (
                <div style={{ marginTop: 8 }}>
                  <span className="badge success">
                    สินค้าที่เลือก: {selectedName}
                  </span>
                </div>
              )}
            </div>

            {/* TITLE */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  ชื่อรายการประมูล
                </div>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  รายละเอียด
                </div>
                <textarea
                  className="input"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{ width: "100%", minHeight: 90, resize: "vertical" }}
                />
              </div>
            </div>

            {/* PRICE */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  ราคาเริ่มต้น
                </div>
                <input
                  type="number"
                  className="input"
                  value={startPrice}
                  onChange={(e) =>
                    setStartPrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  เพิ่มขั้นต่ำ
                </div>
                <input
                  type="number"
                  className="input"
                  value={bidIncrement}
                  onChange={(e) =>
                    setBidIncrement(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* DATE */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  เวลาเริ่ม
                </div>
                <input
                  type="datetime-local"
                  className="input"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  เวลาสิ้นสุด
                </div>
                <input
                  type="datetime-local"
                  className="input"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* BUTTON */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 10,
              }}
            >
              <button
                onClick={submit}
                disabled={loading || !formValid}
                className={`btn btn-primary ${!formValid ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ minWidth: 140 }}
              >
                {loading ? "กำลังสร้าง..." : "สร้างประมูล"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminModern>
  );
}
