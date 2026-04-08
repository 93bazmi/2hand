// pages/contact.tsx
import Layout from "@/components/Layout";
import useTranslation from "next-translate/useTranslation";

export default function ContactPage() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("ติดต่อเรา")}>
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* หัวข้อ */}
        <h1 className="text-3xl font-semibold mb-2">{t("ติดต่อเรา")}</h1>
        <hr className="border-t-2 border-gray-400 mb-6" />

        {/* ข้อความ */}
        <p className="mb-6 leading-relaxed">
          {t(
            "หากท่านมีข้อสงสัยใดๆ เกี่ยวกับคำสั่งซื้อ ท่านสามารถติดต่อแผนกลูกค้าสัมพันธ์ของ 2hand ได้ทุกวัน",
          )}
        </p>

        {/* ช่องทางอีเมล */}
        <p className="mb-2">
          <span className="font-medium">{t("อีเมล")}:</span>{" "}
          <span>{t("bambamboom234@gmail.com")}</span>
        </p>

        {/* ช่องทาง Line */}
        <p className="mb-2">
          <span className="font-medium">{t("ผ่าน Line ID")}:</span>{" "}
          <span>{t("bambee_tyvary")}</span>{" "}
          <span className="text-gray-600">{t("(เวลา 10:00 – 24:00 น.)")}</span>
        </p>

        {/* ช่องทางโทรศัพท์ */}
        <p>
          <span className="font-medium">{t("โทรศัพท์")}:</span>{" "}
          <span>{t("092-391-6120")}</span>{" "}
          <span className="text-gray-600">{t("(เวลา 10:00 – 24:00 น.)")}</span>
        </p>
      </div>
    </Layout>
  );
}
