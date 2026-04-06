import AdminModern from "../../components/AdminModern";
import AdminGuard from "@/components/AdminGuard";

export default function DashboardPage() {
  return (
    <AdminGuard>
      <AdminModern title="แดชบอร์ด (Mock)">
        <div className="admin-grid">
          <div className="span-3 stat-card">
            <div>
              <div className="stat-label">รายได้รวม (30 วัน)</div>
              <div className="stat-metric">฿ 1,284,900</div>
            </div>
            <div className="badge completed">+12.4%</div>
          </div>

          <div className="span-3 stat-card">
            <div>
              <div className="stat-label">จำนวนคำสั่งซื้อ</div>
              <div className="stat-metric">1,842</div>
            </div>
            <div className="badge processing">เฉลี่ย 698 บาท</div>
          </div>

          <div className="span-3 stat-card">
            <div>
              <div className="stat-label">จำนวนประมูลที่กำลังเปิด</div>
              <div className="stat-metric">328</div>
            </div>
            <div className="badge pending">กำลังเปิดประมูล</div>
          </div>

          <div className="span-3 stat-card">
            <div>
              <div className="stat-label">ความตรงเวลาในการจัดส่ง</div>
              <div className="stat-metric">96%</div>
            </div>
            <div className="badge completed">ปกติ</div>
          </div>

          <div className="span-12 card">
            <div className="card-body">
              <div className="card-title mb-2">รายการคำสั่งซื้อล่าสุด</div>

              <table className="table ">
                <thead>
                  <tr>
                    <th>เลขออเดอร์</th>
                    <th>ลูกค้า</th>
                    <th>ยอดรวม</th>
                    <th>สถานะ</th>
                    <th>วันที่</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>#INV-00192</td>
                    <td>สมชาย ท.</td>
                    <td>฿2,590</td>
                    <td>
                      <span className="badge completed">ชำระเงินแล้ว</span>
                    </td>
                    <td>15 ต.ค. 2025</td>
                  </tr>

                  <tr>
                    <td>#INV-00191</td>
                    <td>สุดา ช.</td>
                    <td>฿890</td>
                    <td>
                      <span className="badge pending">รอดำเนินการ</span>
                    </td>
                    <td>15 ต.ค. 2025</td>
                  </tr>

                  <tr>
                    <td>#INV-00190</td>
                    <td>อนันต์ พ.</td>
                    <td>฿4,120</td>
                    <td>
                      <span className="badge processing">กำลังแพ็กสินค้า</span>
                    </td>
                    <td>14 ต.ค. 2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminModern>
    </AdminGuard>
  );
}
