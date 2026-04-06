"use client";

import { useState, useEffect } from "react";

export default function ManageSubBannerSection() {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch("/api/subbanner")
      .then((r) => r.json())
      .then(setForm);
  }, []);

  const save = async () => {
    await fetch("/api/subbanner", {
      method: "PUT",
      body: JSON.stringify(form),
    });
    alert("Saved");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sub Banner</h2>

      <input
        value={form.titleTh || ""}
        onChange={(e) => setForm({ ...form, titleTh: e.target.value })}
        className="input"
      />

      <button onClick={save} className="btn-primary mt-2">
        Save
      </button>
    </div>
  );
}
