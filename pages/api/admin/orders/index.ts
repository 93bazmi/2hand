// pages/api/admin/orders/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromReq } from "@/lib/auth";
import formidable, { type File } from "formidable";
import path from "path";
import fs from "fs/promises";
import { supabaseAdmin } from "@/lib/supabase";

type OrderItemInput = {
  cartItemId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

export const config = { api: { bodyParser: false } };

// 🔥 แปลง formidable เป็น promise (สำคัญมาก)
function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false });

  return new Promise<{
    fields: formidable.Fields;
    files: formidable.Files;
  }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // ✅ parse form แบบ await
    const { fields, files } = await parseForm(req);

    // ✅ auth
    const user = await getSessionUserFromReq(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const first = (v: any): string | null =>
      Array.isArray(v) ? v[0] ?? null : v ?? null;

    // -------- Address --------
    const recipient = first(fields.recipient);
    const line1 = first(fields.line1);
    const line2 = first(fields.line2);
    const line3 = first(fields.line3);
    const city = first(fields.city);
    const postalCode = first(fields.postalCode);
    const country = first(fields.country);
    const paymentMethod = first(fields.paymentMethod);
    const couponCode = first(fields.couponCode);

    if (!recipient || !line1 || !city || !country || !paymentMethod) {
      return res.status(400).json({ error: "Missing address/payment" });
    }

    // -------- Items --------
    const rawItems = fields.items;
    const itemsStr =
      typeof rawItems === "string"
        ? rawItems
        : Array.isArray(rawItems)
        ? rawItems[0]
        : null;

    if (!itemsStr) {
      return res.status(400).json({ error: "Missing items" });
    }

    const items: OrderItemInput[] = JSON.parse(itemsStr);

    const cartItemIds = items.map((it: any) => it.cartItemId);

    const cartItems = await prisma.cartItem.findMany({
      where: {
        id: { in: cartItemIds },
        cart: { userId: user.id },
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length !== items.length) {
      return res.status(400).json({ error: "Cart mismatch" });
    }

    const cartMap = new Map(cartItems.map((c) => [c.id, c]));

    const normalizedItems = items.map((it: any) => {
      const cartItem = cartMap.get(it.cartItemId);
      if (!cartItem) throw new Error("CART_ITEM_NOT_FOUND");

      const price =
        cartItem.unitPrice ??
        cartItem.product.salePrice ??
        cartItem.product.price;

      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtPurchase: price,
        stock: cartItem.product.stock,
      };
    });

    // -------- Stock check --------
    for (const it of normalizedItems) {
      if (it.stock < it.quantity) {
        return res.status(400).json({ error: "Stock not enough" });
      }
    }

    // -------- Total --------
    const totalAmount = normalizedItems.reduce(
      (sum, it) => sum + it.priceAtPurchase * it.quantity,
      0
    );

    let discount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon) {
        couponId = coupon.id;
        discount =
          coupon.discountType === "percent"
            ? (totalAmount * (coupon.discountValue ?? 0)) / 100
            : coupon.discountValue ?? 0;
      }
    }

    const totalFinal = Math.max(totalAmount - discount, 0);

    // -------- Upload slip --------
    let slipUrl: string | null = null;

    const rawFileField = files.slipFile as File | File[] | undefined;

const rawFile = Array.isArray(rawFileField)
  ? rawFileField[0]
  : rawFileField;
    if (rawFile?.filepath) {
      const buffer = await fs.readFile(rawFile.filepath);

      const ext = path.extname(rawFile.originalFilename || ".jpg");
      const fileName = `slips/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}${ext}`;

      const { error } = await supabaseAdmin.storage
        .from("slips")
        .upload(fileName, buffer, {
          contentType: rawFile.mimetype || "image/jpeg",
        });

      if (error) throw error;

      const { data } = supabaseAdmin.storage
        .from("slips")
        .getPublicUrl(fileName);

      slipUrl = data.publicUrl;
    }

    // 🔥 Transaction (ปลอดภัยแล้ว)
    const order = await prisma.$transaction(
      async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: user.id,
            recipient,
            line1,
            line2,
            line3,
            city,
            postalCode,
            country,
            paymentMethod,
            slipUrl,
            totalAmount: totalFinal,
            couponId: couponId ?? undefined,
            items: {
              create: normalizedItems.map((it) => ({
                productId: it.productId,
                quantity: it.quantity,
                priceAtPurchase: it.priceAtPurchase,
              })),
            },
          },
          include: { items: true },
        });

        // ✅ update stock
        for (const it of normalizedItems) {
          await tx.product.update({
            where: { id: it.productId },
            data: {
              stock: {
                decrement: it.quantity,
              },
            },
          });
        }

        // ✅ clear cart
        await tx.cartItem.deleteMany({
          where: { cart: { userId: user.id } },
        });

        await tx.cart.deleteMany({
          where: { userId: user.id },
        });

        return created;
      },
      {
        timeout: 10000, // 🔥 กัน Vercel timeout
      }
    );

    return res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({
      error: "Create order failed",
    });
  }
}