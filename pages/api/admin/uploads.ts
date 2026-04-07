// pages/api/admin/uploads.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File as FormidableFile } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });

  form.parse(req, (err, _fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Upload error" });
    }

    const fileField = files.file as
      | FormidableFile
      | FormidableFile[]
      | undefined;

    if (!fileField) {
      return res.status(400).json({ error: "No file" });
    }

    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    const fileName = path.basename(file.filepath);
    const url = `/uploads/${fileName}`;

    return res.status(201).json({ url });
  });
}