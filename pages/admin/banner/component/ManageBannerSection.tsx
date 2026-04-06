"use client";

import { useState, useEffect } from "react";

export default function ManageBannerSection() {
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  const upload = async () => {
    if (!file) return;

    const fd = new FormData();
    fd.append("image", file);

    await fetch("/api/banners", {
      method: "POST",
      body: fd,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Banner</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={upload} className="btn-primary mt-2">
        Upload
      </button>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {items.map((b) => (
          <img key={b.id} src={b.imageUrl} className="rounded" />
        ))}
      </div>
    </div>
  );
}
