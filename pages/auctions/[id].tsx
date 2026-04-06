// pages/auctions/[id].tsx
import Layout from "@/components/Layout";
import BidModal from "@/components/BidModal"; // ✅ ใช้ BidModal
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Truck } from "lucide-react";

/* ---------- Types ---------- */
type Bid = {
  id?: string;
  user?: string;
  amount: number;
  at?: string;
  createdAt?: string;
  bidder?: { name?: string; email?: string };
};

type Auction = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  product?: { imageUrl?: string | null };
  startPrice?: number | null;
  minIncrement?: number | null;
  bidIncrement?: number | null;
  highestBid?: number;
  currentPrice?: number | null;
  bidderCount?: number;
  buyNowPrice?: number | null;
  endAt: string;
  bids?: Bid[];
  // ✅ เพิ่ม fee เพื่อให้ BidModal ใช้คำนวณยอดรวม
  shipping?: { policy?: string; note?: string; fee?: number };
};

/* ---------- Helpers ---------- */
const toNum = (x: unknown, fallback = 0) => {
  const v = Number(x);
  return Number.isFinite(v) ? v : fallback;
};
const formatTHB = (n?: number | null) =>
  toNum(n).toLocaleString("th-TH", { maximumFractionDigits: 0 });

function useCountdown(endISO: string) {
  const target = new Date(endISO).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const ss = Math.floor(diff / 1000);
  const d = Math.floor(ss / 86400);
  const h = Math.floor((ss % 86400) / 3600);
  const m = Math.floor((ss % 3600) / 60);
  const s = ss % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { text: `เหลือ ${d} วัน ${pad(h)}:${pad(m)}:${pad(s)}` };
}

/* ---------- Services ---------- */
async function getAuction(id: string): Promise<Auction> {
  const r = await fetch(`/api/auctions/${id}`);
  if (!r.ok)
    throw new Error((await r.json().catch(() => ({}))).error || "load-failed");
  return r.json();
}
async function placeBidAPI(id: string, amount: number) {
  const r = await fetch(`/api/auctions/${id}/bids`, {
    method: "POST",
    credentials: "include", // ✅ สำคัญมาก (ส่ง cookie)
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (r.status === 401) {
    window.location.href = "/login";
    return;
  }

  if (!r.ok)
    throw new Error((await r.json().catch(() => ({}))).error || "bid-failed");

  return r.json();
}

/* ---------- Page ---------- */
export default function AuctionDetailPage() {
  const router = useRouter();
  const { isReady, query, push, back } = router;

  const id = useMemo(() => {
    const raw = query?.id;
    return Array.isArray(raw) ? raw?.[0] : raw || "";
  }, [query]);

  const [item, setItem] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getAuction(id);
        if (alive) setItem(data);
      } catch (e: any) {
        if (alive) setErr(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isReady, id]);

  const title = item?.title || "ประมูล";

  if (loading) {
    return (
      <Layout title={title}>
        <main className="mx-auto max-w-5xl px-6 md:px-8 py-10 text-center">
          กำลังโหลด…
        </main>
      </Layout>
    );
  }
  if (err || !item) {
    return (
      <Layout title={title}>
        <main className="mx-auto max-w-5xl px-6 md:px-8 py-10 text-center">
          {err || "ไม่พบสินค้า"}
          <div className="mt-4">
            <button
              onClick={() => back()}
              className="border rounded px-3 py-1.5"
            >
              กลับ
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title={item.title}>
      <DetailContent
        item={item}
        onRefresh={async () => setItem(await getAuction(id))}
        onGoHome={() => push("/")}
      />
    </Layout>
  );
}

/* ---------- View ---------- */
function DetailContent({
  item,
  onRefresh,
  onGoHome,
}: {
  item: Auction;
  onRefresh: () => Promise<void>;
  onGoHome: () => void;
}) {
  const { text } = useCountdown(item.endAt);

  // ✅ เตรียมข้อมูลสำหรับแสดงผล/โมดัล
  const highest = toNum(item.highestBid ?? item.currentPrice, 0);
  const startPrice = toNum(item.startPrice, 0);
  const minInc = toNum(item.minIncrement ?? item.bidIncrement, 0);
  const shipFee = toNum(item.shipping?.fee, 0);

  const [showBid, setShowBid] = useState(false); // ✅ คุมโมดัล

  const mainImage = item.imageUrl ?? item.product?.imageUrl ?? null;

  const bids = (item.bids ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.at ?? b.createdAt ?? 0).getTime() -
        new Date(a.at ?? a.createdAt ?? 0).getTime(),
    );

  return (
    <>
      {/* Breadcrumbs — โทนดำ/แดง */}
      <nav className="mt-10 text-[13px] text-black/60">
        <Link href="/" className="hover:text-red-600">
          หน้าหลัก
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/auctions" className="hover:text-red-600">
          สินค้าประมูล
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-black">
          {item.title.length > 18 ? item.title.slice(0, 18) + "…" : item.title}
        </span>
      </nav>

      <div className="mx-auto w/full max-w-5xl px-6 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* ซ้าย: รูป */}
          <div className="relative w-full aspect-square rounded-xl bg-gray-100 overflow-hidden">
            {mainImage ? (
              <img
                src={mainImage}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-black/30">
                ไม่มีรูป
              </div>
            )}
          </div>

          {/* ขวา: รายละเอียด + ข้อมูลประมูล */}
          <div className="pt-1 mt-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-black">
              {item.title}
            </h1>

            {item.description && (
              <p className="mt-3 text-[15px] leading-relaxed text-black/70">
                {item.description}
              </p>
            )}

            {/* บล็อกข้อมูล 4 ช่อง */}
            <div className="mt-6 grid grid-cols-2 gap-y-2 text-[15px]">
              <div className="text-black/70">เวลาประมูล</div>
              <div className="font-semibold text-orange-400">{text}</div>

              <div className="text-black/70">จำนวนผู้ประมูล</div>
              <div className="font-semibold text-black">
                {toNum(item.bidderCount, 0)} ครั้ง
              </div>

              <div className="text-black/70">ราคาเปิดประมูล</div>
              <div className="font-semibold text-black">
                {startPrice ? `${formatTHB(startPrice)} THB` : "-"}
              </div>

              <div className="text-black/70">เพิ่มขั้นต่ำ/ครั้ง</div>
              <div className="font-semibold text-black">
                {minInc ? `${formatTHB(minInc)} THB` : "-"}
              </div>
            </div>

            {/* ราคาสูงสุดตอนนี้ */}
            <div className="mt-5 text-center">
              <div className="text-sm text-black/70">ราคาสูงสุดตอนนี้</div>
              <div className="text-2xl md:text-[28px] font-bold text-red-600">
                {formatTHB(highest)} บาท
              </div>
            </div>

            {/* ปุ่มประมูล — เปิด BidModal */}
            <div className="mt-4">
              <button
                onClick={() => setShowBid(true)}
                className={[
                  "w-full rounded-xl px-5 py-3 text-base font-semibold",
                  "bg-red-600 text-white hover:bg-red-700",
                  "focus:outline-none focus:ring-2 focus:ring-red-200",
                ].join(" ")}
              >
                ประมูลเลย
              </button>
            </div>

            {/* ประวัติการประมูล */}
            <section className="mt-8">
              <h2 className="text-base font-semibold text-black">
                ประวัติการประมูล (ล่าสุด)
              </h2>
              <div className="mt-2 rounded-lg border border-black/10 overflow-hidden">
                <div className="max-h-64 overflow-y-auto divide-y divide-black/10">
                  {bids.length ? (
                    bids.slice(0, 20).map((b, i) => {
                      const when = b.at ?? b.createdAt ?? "";
                      const name =
                        b.user ??
                        b.bidder?.name ??
                        b.bidder?.email ??
                        "ผู้ใช้ไม่ระบุ";
                      return (
                        <div
                          key={b.id ?? i}
                          className="grid grid-cols-3 gap-2 px-3 py-2 text-sm"
                        >
                          <div className="truncate text-black">{name}</div>
                          <div className="text-right font-medium text-black">
                            {formatTHB(b.amount)} THB
                          </div>
                          <div className="text-right text-black/60">
                            {when
                              ? new Date(when).toLocaleString("th-TH", {
                                  dateStyle: "short",
                                  timeStyle: "medium",
                                })
                              : "-"}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-3 text-sm text-black/60">
                      ยังไม่มีประวัติการประมูล
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* การจัดส่ง */}
            <section className="mt-8 border-t border-black/10 pt-4">
              <h2 className="text-sm font-semibold text-black mb-3">
                การจัดส่ง
              </h2>
              <div className="flex items-start gap-3 text-sm text-black/80">
                <Truck className="h-6 w-6 text-black" strokeWidth={1.75} />
                <div>
                  <div>
                    {item.shipping?.policy ??
                      "ผู้ขายยังไม่ได้ระบุรายละเอียดการจัดส่ง"}
                  </div>
                  {item.shipping?.note ? (
                    <div className="text-black/60 mt-1">
                      {item.shipping.note}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ✅ Bid Modal */}
      <BidModal
        open={showBid}
        onClose={() => setShowBid(false)}
        item={{
          id: item.id,
          title: item.title,
          highestBid: item.highestBid ?? item.currentPrice ?? 0,
          startPrice: item.startPrice ?? 0,
          minIncrement: item.minIncrement ?? item.bidIncrement ?? 0,
          shipping: { fee: item.shipping?.fee ?? 0 },
        }}
        onConfirm={async (amount: number) => {
          // 👈 ใส่ : number ให้ amount
          await placeBidAPI(item.id, amount);
          setShowBid(false);
          await onRefresh();
        }}
      />
    </>
  );
}
