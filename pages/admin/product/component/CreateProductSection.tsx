"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  onCreated?: () => void;
  refreshKey?: number;
}

export default function CreateProductSection({ onCreated, refreshKey }: Props) {
  const [form, setForm] = useState({
    nameTh: "",
    nameEn: "",
    descTh: "",
    descEn: "",
    price: "",
    salePrice: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories?locale=th")
      .then((r) => r.json())
      .then(setCategories);
  }, [refreshKey]);

  const onChange = (e: any) => {
    const { name, value, files } = e.target;

    if (name === "image" && files) {
      const f = files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const upload = async () => {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/uploads", {
      method: "POST",
      body: fd,
    });

    const js = await res.json();
    return js.url;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await upload();

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          salePrice: form.salePrice.trim() === "" ? "" : Number(form.salePrice),
          stock: Number(form.stock),
          imageUrl,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ไม่สามารถสร้างสินค้าได้");
      }

      setForm({
        nameTh: "",
        nameEn: "",
        descTh: "",
        descEn: "",
        price: "",
        salePrice: "",
        stock: "",
        categoryId: "",
        imageUrl: "",
      });
      setFile(null);
      setPreview("");
      onCreated?.();
      alert("Created!");
    } catch (error: any) {
      alert(error?.message || "สร้างสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const BOX_HEIGHT = 180;

  return (
    <div className="card">
      <div className="card-body">
        {/* HEADER */}
        <div style={{ marginBottom: 16 }}>
          <div className="card-title">สร้างสินค้าใหม่</div>
          <div className="muted">เพิ่มสินค้าใหม่เข้าสู่ระบบ</div>
        </div>

        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            <div>
              <div className="muted">รูปสินค้า</div>

              <div
                className="border border-dashed rounded-xl bg-[#111] flex items-center justify-center"
                style={{ height: BOX_HEIGHT }}
              >
                <input
                  type="file"
                  name="image"
                  onChange={onChange}
                  className="hidden"
                  id="edit-upload"
                />

                <label
                  htmlFor="edit-upload"
                  className="cursor-pointer w-full h-full flex items-center justify-center"
                >
                  {preview ? (
                    <img
                      src={preview}
                      className="max-h-full max-w-full rounded-xl object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      คลิกเพื่ออัปโหลด
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* NAME */}
            <div>
              <div className="muted">ชื่อสินค้า</div>
              <input
                name="nameTh"
                value={form.nameTh}
                onChange={onChange}
                className="input w-full"
              />
            </div>

            {/* PRICE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="muted">ราคา</div>
                <input
                  name="price"
                  value={form.price}
                  onChange={onChange}
                  type="number"
                  className="input w-full"
                />
              </div>

              <div>
                <div className="muted">ราคาลด(ไม่บังคับ)</div>
                <input
                  name="salePrice"
                  value={form.salePrice}
                  onChange={onChange}
                  type="number"
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {/* DESC */}
            <div>
              <div className="muted">รายละเอียด</div>
              <textarea
                name="descTh"
                value={form.descTh}
                onChange={onChange}
                className="input w-full"
                style={{ height: 180 }}
              />
            </div>

            {/* CATEGORY + STOCK */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="muted">หมวดหมู่</div>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={onChange}
                  className="select w-full"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="muted">Stock</div>
                <input
                  name="stock"
                  value={form.stock}
                  onChange={onChange}
                  type="number"
                  className="input w-full"
                />
              </div>
            </div>

            {/* ACTION */}
            <div className="flex justify-end gap-3 pt-6">
              <button className="btn btn-primary px-6">บันทึก</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
