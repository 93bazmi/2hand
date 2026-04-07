// pages/api/admin/auctions/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdminApi } from "@/lib/auth";
import {
  getAuctionById,
  closeAuction,
  adminUpdateAuction,
  adminDeleteAuction,
  adminCancelAuction,
} from "@/services/auctionService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;

  const { id } = req.query as { id: string };

  try {
    // ✅ GET
    if (req.method === "GET") {
      const auction = await getAuctionById(id);
      if (!auction) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(auction);
    }

    // ✅ PATCH
    if (req.method === "PATCH") {
      const b = req.body || {};
      console.log("PATCH BODY:", b);

      if (b.action === "cancel") {
        const a = await adminCancelAuction(id);
        return res.status(200).json(a);
      }

      if (b.action === "close") {
        const a = await closeAuction(id);
        return res.status(200).json(a);
      }

      const updated = await adminUpdateAuction(id, {
        title: b.title,
        description: b.description ?? undefined,
        bidIncrement:
          b.bidIncrement && !isNaN(Number(b.bidIncrement))
            ? Number(b.bidIncrement)
            : undefined,
        startAt:
          b.startAt && !isNaN(Date.parse(b.startAt))
            ? new Date(b.startAt)
            : undefined,
        endAt:
          b.endAt && !isNaN(Date.parse(b.endAt))
            ? new Date(b.endAt)
            : undefined,
        status:
          typeof b.status === "string"
            ? b.status.toUpperCase()
            : undefined,
      });

      return res.status(200).json(updated);
    }

    // ✅ DELETE
    if (req.method === "DELETE") {
      await adminDeleteAuction(id);
      return res.status(204).end();
    }

    // ❌ method ไม่รองรับ
    res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}