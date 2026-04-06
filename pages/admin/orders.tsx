// pages/admin/orders.tsx
import { GetServerSideProps, NextPage } from "next";
import AdminModern from "../../components/AdminModern";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { useState } from "react";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  recipient: string;
  line1: string;
  line2?: string | null;
  line3?: string | null;
  city: string;
  postalCode?: string | null;
  country?: string | null;
  paymentMethod?: string | null;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  items: OrderItem[];
  slipUrl?: string | null;
  createdAt: string;
}

interface Props {
  orders: Order[];
}

const currency = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
    n,
  );

const AdminOrdersPage: NextPage<Props> = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Order["status"]>(
    "ALL",
  );

  const updateStatus = async (orderId: string, newStatus: Order["status"]) => {
    if (busyId) return;
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        credentials: "include", // สำคัญ: ใช้คุกกี้ HttpOnly
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (e: any) {
      alert(e.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (busyId) return;
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อนี้?")) return;
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status !== 204) throw new Error("ลบคำสั่งซื้อไม่สำเร็จ");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (e: any) {
      alert(e.message || "ลบคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = q.toLowerCase();

    const matchText =
      order.id.toLowerCase().includes(keyword) ||
      order.recipient.toLowerCase().includes(keyword);

    const matchStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchText && matchStatus;
  });

  return (
    <AdminModern title="จัดการคำสั่งซื้อ">
      <div className="admin-grid">
        {/* FILTER */}
        <div className="span-12">
          <div
            className="card-body"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <input
              className="input"
              placeholder="ค้นหาเลขออเดอร์ / ชื่อผู้รับ..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 200, height: 45 }}
            />

            <select
              className="select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              style={{ width: 200, height: 45 }}
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="PROCESSING">กำลังดำเนินการ</option>
              <option value="SHIPPED">จัดส่งแล้ว</option>
              <option value="COMPLETED">สำเร็จ</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </div>
        </div>
        {filteredOrders.map((order) => (
          <div key={order.id} className="span-12 card">
            <div className="card-body">
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    เลขคำสั่งซื้อ: #{order.id}
                  </div>
                  <div className="muted">
                    วันที่สั่งซื้อ:{" "}
                    {new Date(order.createdAt).toLocaleString("th-TH")}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    value={order.status}
                    disabled={busyId === order.id}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value as Order["status"])
                    }
                    className={`select ${
                      order.status === "PENDING"
                        ? "status-pending"
                        : order.status === "PROCESSING"
                          ? "status-processing"
                          : order.status === "SHIPPED"
                            ? "status-shipped"
                            : order.status === "COMPLETED"
                              ? "status-completed"
                              : "status-cancelled"
                    }`}
                  >
                    <option value="PENDING">รอดำเนินการ</option>
                    <option value="PROCESSING">กำลังดำเนินการ</option>
                    <option value="SHIPPED">จัดส่งแล้ว</option>
                    <option value="COMPLETED">สำเร็จ</option>
                    <option value="CANCELLED">ยกเลิก</option>
                  </select>

                  <button
                    onClick={() => deleteOrder(order.id)}
                    disabled={busyId === order.id}
                    className="btn btn-danger"
                  >
                    X
                  </button>
                </div>
              </div>

              {/* Customer */}
              <div style={{ marginBottom: 12 }}>
                <div>
                  <strong>ผู้รับ:</strong> {order.recipient}
                </div>
                <div className="muted mt-1">
                  ที่อยู่:{" "}
                  {[order.line1, order.line2, order.line3, order.city]
                    .filter(Boolean)
                    .join(" ")}
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 12 }}>
                <div className="muted" style={{ marginBottom: 6 }}>
                  รายการสินค้า
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: "1px solid #1e1e1e",
                      }}
                    >
                      <img
                        src={item.product.imageUrl || "/images/placeholder.png"}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #222",
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <div>{item.product.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {item.quantity} × {currency(item.priceAtPurchase)}
                        </div>
                      </div>

                      <div style={{ fontWeight: 600 }}>
                        {currency(item.priceAtPurchase * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <div>
                  {order.status === "COMPLETED" && (
                    <span className="badge completed">สำเร็จ</span>
                  )}
                  {order.status === "PENDING" && (
                    <span className="badge pending">รอดำเนินการ</span>
                  )}
                  {order.status === "PROCESSING" && (
                    <span className="badge processing">กำลังดำเนินการ</span>
                  )}
                  {order.status === "SHIPPED" && (
                    <span className="badge shipped">จัดส่งแล้ว</span>
                  )}
                  {order.status === "CANCELLED" && (
                    <span className="badge cancelled ">ยกเลิก</span>
                  )}
                </div>

                <div style={{ fontWeight: 700 }}>
                  {currency(order.totalAmount)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminModern>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) =>
  adminGuard(ctx, async () => {
    // สามารถเลือก locale ตาม ctx.locale ได้
    const locale = (ctx.locale as "th" | "en") || "th";

    const rawOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: {
                  where: { locale },
                  take: 1,
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const orders: Order[] = rawOrders.map((o) => ({
      id: o.id,
      recipient: o.recipient,
      line1: o.line1,
      line2: o.line2,
      line3: o.line3,
      city: o.city,
      postalCode: o.postalCode,
      country: o.country,
      paymentMethod: o.paymentMethod,
      status: o.status as Order["status"],
      totalAmount: o.totalAmount,
      slipUrl: o.slipUrl,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((it) => ({
        id: it.id,
        quantity: it.quantity,
        priceAtPurchase: it.priceAtPurchase,
        product: {
          id: it.product.id,
          name: it.product.translations[0]?.name ?? null,
          imageUrl: it.product.imageUrl ?? null,
        },
      })),
    }));

    return { props: { orders } };
  });

export default AdminOrdersPage;
