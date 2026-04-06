"use client";

import { useEffect, useState } from "react";
import EditProductModal from "../component/EditProductModal";

interface Product {
  id: string;
  nameTh: string;
  nameEn?: string;
  descTh?: string;
  descEn?: string;
  price: number;
  salePrice?: number;
  stock: number;
  categoryId?: string;
  imageUrl?: string;
}

export default function ManageProductSection() {
  const [items, setItems] = useState<Product[]>([]);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [editForm, setEditForm] = useState<any>({
    nameTh: "",
    nameEn: "",
    descTh: "",
    descEn: "",
    price: "",
    salePrice: "",
    stock: "",
    categoryId: "",
  });

  const [editPreview, setEditPreview] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);

  const loadProducts = async () => {
    const r = await fetch("/api/products");
    const d = await r.json();
    const products = (d.items || d).map((p: any) => ({
      ...p,
      nameTh:
        p.nameTh || p.translations?.find((t: any) => t.locale === "th")?.name || "",
      nameEn:
        p.nameEn || p.translations?.find((t: any) => t.locale === "en")?.name || "",
      descTh:
        p.descTh ||
        p.translations?.find((t: any) => t.locale === "th")?.description ||
        "",
      descEn:
        p.descEn ||
        p.translations?.find((t: any) => t.locale === "en")?.description ||
        "",
    }));
    setItems(products);
  };

  useEffect(() => {
    // Fetch products
    loadProducts().catch((err) =>
      console.error("Error fetching products:", err)
    );

    // Fetch categories
    fetch("/api/categories?locale=th")
      .then((r) => r.json())
      .then((d) => setCategories(d))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // 🗑 ลบ
  const remove = async (id: string) => {
    if (!confirm("ลบสินค้านี้?")) return;

    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((x) => x.id !== id));
  };

  // ✏️ เปิด modal
  const openEdit = (p: Product) => {
    setEditItem(p);

    setEditForm({
      nameTh: p.nameTh || "",
      nameEn: p.nameEn || "",
      descTh: p.descTh || "",
      descEn: p.descEn || "",
      price: p.price?.toString() || "",
      salePrice: p.salePrice?.toString() || "",
      stock: p.stock?.toString() || "",
      categoryId: p.categoryId || "",
    });

    setEditPreview(p.imageUrl || "");
    setEditFile(null);
  };

  // 🔄 change form
  const handleEditChange = (e: any) => {
    const { name, value, files } = e.target;

    if (name === "image" && files) {
      const f = files[0];
      setEditFile(f);
      setEditPreview(URL.createObjectURL(f));
    } else {
      setEditForm((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 💾 save
  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    if (!editItem) return;

    const fd = new FormData();

    fd.append("nameTh", editForm.nameTh);
    fd.append("nameEn", editForm.nameEn || "");
    fd.append("descTh", editForm.descTh || "");
    fd.append("descEn", editForm.descEn || "");
    fd.append("price", editForm.price);
    fd.append("salePrice", editForm.salePrice || "");
    fd.append("stock", editForm.stock);
    fd.append("categoryId", editForm.categoryId || "");

    if (editFile) fd.append("image", editFile);

    const res = await fetch(`/api/products/${editItem.id}`, {
      method: "PUT",
      body: fd,
    });

    if (res.ok) {
      const updated = await res.json();
      const product = {
        ...updated,
        nameTh:
          updated.nameTh ||
          updated.translations?.find((t: any) => t.locale === "th")?.name ||
          "",
        nameEn:
          updated.nameEn ||
          updated.translations?.find((t: any) => t.locale === "en")?.name ||
          "",
        descTh:
          updated.descTh ||
          updated.translations?.find((t: any) => t.locale === "th")
            ?.description ||
          "",
        descEn:
          updated.descEn ||
          updated.translations?.find((t: any) => t.locale === "en")
            ?.description ||
          "",
      };

      setItems((prev) => prev.map((p) => (p.id === product.id ? product : p)));

      setEditItem(null);
    } else {
      alert("แก้ไขไม่สำเร็จ");
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        {/* HEADER */}
        <div className="mb-4">
          <div className="card-title">ตารางรายการสินค้า</div>
          <div className="muted">รายการสินค้าทั้งหมด</div>
        </div>

        {/* TABLE */}
        {items.length === 0 ? (
          <div className="empty">ยังไม่มีสินค้า</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>สินค้า</th>
                <th>รายละเอียด</th>
                <th style={{ width: 120, textAlign: "right" }}>ราคา</th>
                <th style={{ width: 100, textAlign: "center" }}>สต็อก</th>
                <th style={{ width: 160, textAlign: "center" }}>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  {/* PRODUCT */}
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl || "/images/placeholder.png"}
                        className="w-10 h-10 rounded object-cover border"
                      />
                      <div className="truncate">{p.nameTh}</div>
                    </div>
                  </td>

                  {/* DESC */}
                  <td className="muted" style={{ maxWidth: 300 }}>
                    <div className="truncate">
                      {p.descTh || p.descEn || "-"}
                    </div>
                  </td>

                  {/* PRICE */}
                  <td style={{ textAlign: "right", fontWeight: 500 }}>
                    ฿{p.price.toLocaleString()}
                  </td>

                  {/* STOCK */}
                  <td style={{ textAlign: "center" }}>{p.stock}</td>

                  {/* ACTION */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => openEdit(p)}
                        className="btn btn-secondary"
                      >
                        แก้ไข
                      </button>

                      <button
                        onClick={() => remove(p.id)}
                        className="btn btn-danger"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditProductModal
        open={!!editItem}
        form={editForm}
        categories={categories}
        preview={editPreview}
        onClose={() => setEditItem(null)}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
