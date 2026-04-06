// pages/auctions/index.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import AuctionCard from "@/components/AuctionCard";
import { Search, X } from "lucide-react";

type Item = {
  id: string;
  title: string;
  currentPrice: number;
  endAt: string; // ISO
  status: string;
  product?: { imageUrl?: string | null };
  bids: { id: string; amount: number }[];
};

export default function AuctionsIndex() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const url = q
      ? `/api/auctions?q=${encodeURIComponent(q)}`
      : "/api/auctions";
    fetch(url)
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, [q]);

  return (
    <Layout title="ประมูล">
      {/* ❌ เอา container ออกให้เท่ากับ all-products */}
      <h1 className="mt-10 mb-4 text-2xl font-bold">รายการประมูล</h1>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            {/* icon */}
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300
          focus:outline-none focus:ring-1 focus:ring-red-200 focus:border-red-500
          transition"
              placeholder="ค้นหาสินค้า / รายการประมูล"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* clear */}
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2
            text-gray-400 hover:text-black transition"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ ใช้คอลัมน์เท่ากับ all-products: 2 / 3 / 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {items.filter((a) => a.status === "LIVE").length > 0 ? (
          items
            .filter((a) => a.status === "LIVE")
            .map((a) => (
              <AuctionCard
                key={a.id}
                id={a.id}
                title={a.title}
                imageUrl={a.product?.imageUrl ?? null}
                currentPrice={a.currentPrice}
                bidsCount={a.bids?.length ?? 0}
                endAt={a.endAt}
              />
            ))
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-10">
            ไม่มีรายการที่กำลังประมูลอยู่ในขณะนี้
          </p>
        )}
      </div>
    </Layout>
  );
}
