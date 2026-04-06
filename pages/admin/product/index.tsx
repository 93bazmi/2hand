import AdminModern from "../../../components/AdminModern";
import CreateProductSection from "./component/CreateProductSection";
import ManageCategorySection from "./component/ManageCategorySection";
import ManageProductSection from "./component/ManageProductSection";
import { useState } from "react";

export default function ProductManagePage() {
  const [productRefreshKey, setProductRefreshKey] = useState(0);

  return (
    <AdminModern title="จัดการสินค้า">
      <h1 className="text-2xl font-bold mb-6">สินค้า & หมวดหมู่</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Create Product */}
        <div className="rounded shadow">
          <CreateProductSection
            onCreated={() => setProductRefreshKey((value) => value + 1)}
          />
        </div>

        {/* RIGHT: Category */}
        <div className="rounded shadow">
          <ManageCategorySection />
        </div>
      </div>

      {/* Product table */}
      <div className="mt-10">
        <ManageProductSection key={productRefreshKey} />
      </div>
    </AdminModern>
  );
}
