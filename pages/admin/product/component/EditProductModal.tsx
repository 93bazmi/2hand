"use client";

import { FormEvent } from "react";

interface Props {
  open: boolean;
  form: any;
  categories: any[];
  preview: string;
  onClose: () => void;
  onChange: (e: any) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function EditProductModal({
  open,
  form,
  categories,
  preview,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="card-body space-y-5">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <div className="card-title">แก้ไขสินค้า</div>
              <div className="muted">อัปเดตข้อมูลสินค้า</div>
            </div>

            <button onClick={onClose} className="btn">
              ✕
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* IMAGE */}
            <div>
              <div className="muted mb-1">รูปสินค้า</div>

              <div
                style={{
                  border: "1px dashed var(--border)",
                  borderRadius: 10,
                  padding: 12,
                  textAlign: "center",
                  background: "#111",
                }}
              >
                <input
                  type="file"
                  name="image"
                  onChange={onChange}
                  style={{ display: "none" }}
                  id="edit-upload"
                />

                <label htmlFor="edit-upload" style={{ cursor: "pointer" }}>
                  {preview ? (
                    <img
                      src={preview}
                      style={{
                        margin: "0 auto",
                        height: 120,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="muted">คลิกเพื่ออัปโหลด</div>
                  )}
                </label>
              </div>
            </div>

            {/* NAME */}
            <div
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div>
                <div className="muted">ชื่อสินค้า</div>
                <input
                  name="nameTh"
                  value={form.nameTh}
                  onChange={onChange}
                  className="input w-full"
                />
              </div>
            </div>

            {/* DESC */}
            <div>
              <div className="muted">รายละเอียด</div>
              <textarea
                name="descTh"
                value={form.descTh}
                onChange={onChange}
                className="input w-full"
                style={{ height: 120 }}
              />
            </div>

            {/* PRICE */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr ",
                gap: 10,
              }}
            >
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
                <div className="muted">ราคาลด</div>
                <input
                  name="salePrice"
                  value={form.salePrice}
                  onChange={onChange}
                  type="number"
                  className="input w-full"
                />
              </div>
            </div>

            {/* CATEGORY + STOCK */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
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
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn">
                ยกเลิก
              </button>

              <button className="btn btn-primary">บันทึก</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
