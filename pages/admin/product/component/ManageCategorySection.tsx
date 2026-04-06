"use client";

import { useState, useEffect } from "react";

export default function ManageCategorySection() {
  const [cats, setCats] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCats);
  }, []);

  const add = async () => {
    if (!name.trim()) return;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameTh: name, nameEn: name }),
    });

    const data = await res.json();
    setCats((c) => [...c, data]);
    setName("");
  };

  return (
    <div className="card">
      <div className="card-body">
        {/* HEADER */}
        <div style={{ marginBottom: 16 }}>
          <div className="card-title">หมวดหมู่</div>
          <div className="muted">เพิ่ม / จัดการหมวดสินค้า</div>
        </div>

        {/* ADD */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="ชื่อหมวด"
            style={{ flex: 1 }}
          />

          <button onClick={add} className="btn btn-primary">
            เพิ่ม
          </button>
        </div>

        {/* LIST */}
        {cats.length === 0 ? (
          <div className="empty">ยังไม่มีหมวดหมู่</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ชื่อหมวดหมู่</th>
                <th style={{ width: 120 }}>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {cats.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={async () => {
                        if (!confirm("ลบหมวดนี้?")) return;

                        await fetch(`/api/categories/${c.id}`, {
                          method: "DELETE",
                        });

                        setCats((prev) => prev.filter((x) => x.id !== c.id));
                      }}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
