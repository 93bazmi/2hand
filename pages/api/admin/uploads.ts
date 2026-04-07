// pages/api/admin/uploads.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File as FormidableFile } from "formidable";
import fs from "fs/promises";
import { supabaseAdmin } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({
    multiples: false,
    maxFileSize: 5 * 1024 * 1024,
  });

  try {
    const { files } = await new Promise<any>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const fileField = files.file as
      | FormidableFile
      | FormidableFile[]
      | undefined;

    if (!fileField) {
      return res.status(400).json({ error: "No file" });
    }

    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    // 🔥 อ่านไฟล์จาก /tmp
    const buffer = await fs.readFile(file.filepath);

    // 🔥 ตั้งชื่อไฟล์
    const fileName = `products/${Date.now()}-${file.originalFilename}`;

    // 🔥 upload ไป Supabase
    const { error } = await supabaseAdmin.storage
      .from("products") // 👈 ต้องมี bucket นี้
      .upload(fileName, buffer, {
        contentType: file.mimetype || "image/jpeg",
      });

    if (error) throw error;

    // 🔥 เอา public URL
    const { data } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(fileName);

    return res.status(201).json({
      url: data.publicUrl,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
}