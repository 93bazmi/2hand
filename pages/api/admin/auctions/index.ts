// pages/api/admin/auctions/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/lib/auth";
import { createAuction, listAuctions } from "@/services/auctionService";
import { prisma } from "@/lib/prisma";
import { AuctionStatus } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;

  try {
    // ✅ GET
    if (req.method === "GET") {
      const q =
        typeof req.query.q === "string" ? req.query.q : undefined;

      

const rawStatus =
  typeof req.query.status === "string"
    ? req.query.status.toUpperCase()
    : undefined;

const status = Object.values(AuctionStatus).includes(
  rawStatus as AuctionStatus
)
  ? (rawStatus as AuctionStatus)
  : undefined;

      const data = await listAuctions({ q, status });
      return res.status(200).json(data);
    }

    // ✅ POST
    if (req.method === "POST") {
      const b = req.body || {};
      let productId = String(b.productId || "");

      // 🔥 สร้าง product ถ้ายังไม่มี
      if (!productId && b.productInput) {
        const p = b.productInput;
        const name = String(p.name || "").trim();

        if (!name) {
          return res
            .status(400)
            .json({ error: "Product name is required" });
        }

        const newProduct = await prisma.product.create({
          data: {
            price: Number(p.price ?? 0),
            stock: Number(p.stock ?? 1),
            imageUrl: p.imageUrl ? String(p.imageUrl) : null,
            translations: {
              create: [
                {
                  locale: "en",
                  name,
                  description: p.description ?? null,
                },
                {
                  locale: "th",
                  name,
                  description: p.description ?? null,
                },
              ],
            },
          },
        });

        productId = newProduct.id;
      }

      if (!productId) {
        return res.status(400).json({ error: "Product is required" });
      }

      const dto = {
        productId,
        sellerId: String(b.sellerId ?? admin.id),
        title: String(b.title || "").trim() || "Untitled Auction",
        description: b.description ? String(b.description) : undefined,
        startPrice: Number(b.startPrice),
        bidIncrement: b.bidIncrement
          ? Number(b.bidIncrement)
          : undefined,
        startAt: new Date(b.startAt),
        endAt: new Date(b.endAt),
      };

      const created = await createAuction(dto);
      return res.status(201).json(created);
    }

    // ❌ method ไม่รองรับ
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}