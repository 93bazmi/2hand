import AdminModern from "../../../components/AdminModern";
import ManageBannerSection from "./component/ManageBannerSection";
import ManageSubBannerSection from "./component/ManageSubBannerSection";

export default function BannerManagePage() {
  return (
    <AdminModern title="จัดการแบนเนอร์">
      <h1 className="text-2xl font-bold mb-6">Banner & Sub-banner</h1>

      <div className="space-y-10">
        {/* Banner */}
        <div className="bg-white p-6 rounded shadow">
          <ManageBannerSection />
        </div>

        {/* Sub Banner */}
        <div className="bg-white p-6 rounded shadow">
          <ManageSubBannerSection />
        </div>
      </div>
    </AdminModern>
  );
}
