import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const admin = await requireAdminApi(req, res);
  if (!admin) return;

  try {
    // ✅ POST
    if (req.method === "POST") {
      const b = req.body || {};
      const name = String(b.name || "").trim();

      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }

      const created = await prisma.product.create({
        data: {
          price: Number(b.price ?? 0),
          stock: Number(b.stock ?? 1),
          imageUrl: b.imageUrl ? String(b.imageUrl) : null,
          translations: {
            create: [
              { locale: "en", name, description: b.description ?? null },
              { locale: "th", name, description: b.description ?? null },
            ],
          },
        },
        include: { translations: true },
      });

      return res.status(201).json(created);
    }

    // ❌ method ไม่รองรับ
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}