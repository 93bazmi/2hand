// pages/api/cart.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

const COOKIE_NAME = "token"; // ให้ตรงกับตอน login ตั้งคุกกี้

// วิธี B: ไม่ใช้ Prisma namespace — อิงจาก typeof prisma แล้วตัดเมธอดที่ไม่อยู่ในทรานแซกชันออก
type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ ดึง token จากคุกกี้ก่อน
  const cookieToken = req.cookies?.[COOKIE_NAME];

  // ✅ เผื่อยังมีคนส่งแบบ Bearer
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  const token = cookieToken ?? bearerToken;

  // ตรวจ token และดึง user
  const user = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // GET /api/cart → ดึงรายการในตะกร้า (พร้อมชื่อสินค้าตาม locale)
  if (req.method === "GET") {
    try {
      const locale = (req.query.locale as string) || "th";

      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  translations: {
                    where: { locale },
                    select: { name: true, description: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      // ให้พารามิเตอร์ it มีชนิด ไม่เป็น any
      type CartItemWithProduct = NonNullable<typeof cart>["items"][number];

      const items =
        (cart?.items ?? []).map((it: CartItemWithProduct) => {
          const trans = it.product.translations[0];
          const effectivePrice = it.unitPrice ?? it.product.salePrice ?? it.product.price;
          return {
            id: it.id,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            auctionId: it.auctionId,
            product: {
              id: it.product.id,
              name: trans?.name ?? "",
              price: effectivePrice,
              basePrice: it.product.price,
              salePrice: it.product.salePrice,
              imageUrl: it.product.imageUrl,
              stock: it.product.stock,
              // description: trans?.description ?? null,
            },
          };
        }) ?? [];

      return res.status(200).json({ items });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Failed to load cart" });
    }
  }

  // POST /api/cart → เพิ่มหรืออัปเดตจำนวน (เพิ่มจำนวนเข้าไป) พร้อมกันจำนวนไม่ให้เกิน stock
  if (req.method === "POST") {
    const { productId, quantity, auctionId, unitPrice } = req.body as {
      productId: string;
      quantity: number;
      auctionId?: string;
      unitPrice?: number;
    };

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid productId or quantity" });
    }

    try {
      const result = await prisma.$transaction(async (tx: TxClient) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { stock: true },
        });
        if (!product) throw new Error("PRODUCT_NOT_FOUND");

        // สร้างตะกร้าถ้ายังไม่มี
        const cart = await tx.cart.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
          select: { id: true },
        });

        // หา item เดิม
        const existing = await tx.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId,
            auctionId: auctionId ?? null,
          },
          select: { id: true, quantity: true },
        });

        const isAuctionItem = Boolean(auctionId);
        const current = existing?.quantity ?? 0;
        const next = isAuctionItem ? 1 : current + quantity;

        if (next > product.stock) {
          // ห้ามเกินสต็อก
          return { blocked: true as const, current, stock: product.stock };
        }

        // อัปเดต/สร้างตามปกติ
        const item = existing
          ? await tx.cartItem.update({
              where: { id: existing.id },
              data: {
                quantity: next,
                unitPrice: isAuctionItem ? unitPrice ?? null : null,
                auctionId: auctionId ?? null,
              },
            })
          : await tx.cartItem.create({
              data: {
                cartId: cart.id,
                productId,
                quantity: next,
                unitPrice: isAuctionItem ? unitPrice ?? null : null,
                auctionId: auctionId ?? null,
              },
            });

        return { blocked: false as const, item };
      });

      if (result.blocked) {
        return res.status(409).json({
          error: "EXCEEDS_STOCK",
          message: "Quantity exceeds available stock",
          current: result.current,
          stock: result.stock,
        });
      }

      return res.status(200).json(result.item);
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || "Failed to add to cart" });
    }
  }

  // PATCH /api/cart → อัปเดตจำนวนสินค้าแบบ set จำนวนใหม่ (กันเกิน stock)
  if (req.method === "PATCH") {
    const { itemId, quantity } = req.body as {
      itemId: string;
      quantity: number;
    };

    if (!itemId || quantity === undefined || quantity < 1) {
      return res.status(400).json({ error: "Invalid itemId or quantity" });
    }

    try {
      const updated = await prisma.$transaction(async (tx: TxClient) => {
        const item = await tx.cartItem.findUnique({
          where: { id: itemId },
          select: { id: true, productId: true, auctionId: true },
        });
        if (!item) throw new Error("ITEM_NOT_FOUND");

        if (item.auctionId && quantity !== 1) {
          throw new Error("AUCTION_ITEM_QUANTITY_LOCKED");
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        if (!product) throw new Error("PRODUCT_NOT_FOUND");

        if (quantity > product.stock) {
          return { blocked: true as const, stock: product.stock };
        }

        const newItem = await tx.cartItem.update({
          where: { id: itemId },
          data: { quantity },
        });

        return { blocked: false as const, newItem };
      });

      if (updated.blocked) {
        return res
          .status(409)
          .json({ error: "EXCEEDS_STOCK", stock: updated.stock });
      }

      return res.status(200).json(updated.newItem);
    } catch (err: any) {
      return res.status(400).json({ error: err?.message || "Failed to update cart item" });
    }
  }

  // DELETE /api/cart → ลบสินค้าออกจากตะกร้า
  if (req.method === "DELETE") {
    const { itemId } = req.body as { itemId?: string };
    if (!itemId) {
      return res.status(400).json({ error: "Missing itemId" });
    }
    try {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err?.message || "Cannot delete cart item" });
    }
  }

  res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
