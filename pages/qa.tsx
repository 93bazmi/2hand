"use client";

import { useState, FormEvent } from "react";
import Layout from "@/components/Layout";
import useTranslation from "next-translate/useTranslation";

interface Faq {
  id: string;
  question: string;
  answer?: string | null;
}

export default function QaPage() {
  const { t } = useTranslation("common");

  const [newQ, setNewQ] = useState("");
  const [loading, setLoading] = useState(false);

  const staticFaqs: Faq[] = [
    {
      id: "1",
      question: t("faq1.question"),
      answer: t("faq1.answer"),
    },
  ];

  const submitQuestion = async (e: FormEvent) => {
    e.preventDefault();
    if (!newQ.trim()) return;

    setLoading(true);

    const res = await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQ }),
    });

    if (!res.ok) {
      alert(t("qaSentError"));
    } else {
      setNewQ("");
      alert(t("qaSentSuccess"));
    }

    setLoading(false);
  };

  return (
    <Layout title={t("qaTitle")}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-black">{t("qaTitle")}</h1>

        {/* Ask Question Card */}
        <div className="bg-white border border-black/10 rounded-xl shadow-sm p-5 mb-10">
          <form onSubmit={submitQuestion}>
            <textarea
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              placeholder={t("qaPlaceholder")}
              rows={4}
              required
              className="w-full border border-gray-300 rounded-lg p-3 mb-3
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
              transition"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-red-600 text-white rounded-lg
                hover:bg-red-700 active:scale-95 transition
                disabled:opacity-50 font-medium"
              >
                {loading ? t("qaSubmitting") : t("qaSubmit")}
              </button>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <h2 className="text-2xl font-semibold mb-4 text-black">
          {t("qaFaqHeading")}
        </h2>

        <div className="space-y-4">
          {staticFaqs.map((f) => (
            <div
              key={f.id}
              className="bg-white border border-black/10 rounded-xl p-4
              hover:border-red-500 transition group"
            >
              <p className="font-semibold text-black">Q: {f.question}</p>
              <p className="mt-2 text-gray-700 group-hover:text-black">
                A: {f.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
