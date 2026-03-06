import { Navigate, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useSellerOrders from "../hooks/useSellerOrders";
import SellerEarningsCard from "../components/SellerEarningsCard";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

function getDueDateLabel(order) {
  if (!order?.createdAt) return "N/A";

  const created = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
  const deliveryDays = Number.parseInt(order.delivery, 10);
  const safeDays = Number.isFinite(deliveryDays) ? deliveryDays : 3;
  const dueDate = new Date(created);
  dueDate.setDate(dueDate.getDate() + safeDays);
  return dueDate.toLocaleDateString();
}

function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const { orders, groupedOrders, loading, error } = useSellerOrders(user);
  const rows = useMemo(() => groupedOrders?.[activeTab] || [], [groupedOrders, activeTab]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <LoadingState title="Loading seller dashboard" text="Syncing orders and revenue." />;
  }

  if (error) {
    return <ErrorState title="Seller dashboard unavailable" text={error} />;
  }

  const tabs = [
    { key: "active", label: "Active Orders", count: groupedOrders.active.length },
    { key: "delivered", label: "Delivered", count: groupedOrders.delivered.length },
    { key: "completed", label: "Completed", count: groupedOrders.completed.length },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seller Workspace</h1>
          <p className="mt-1 text-sm text-slate-600">Manage orders, deliveries, and earnings in one place.</p>
        </div>
        <div className="min-w-[240px]">
          <SellerEarningsCard orders={orders} />
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-3 font-semibold">Buyer</th>
                <th className="px-3 py-3 font-semibold">Gig</th>
                <th className="px-3 py-3 font-semibold">Due Date</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="px-3 py-3 text-slate-700">{order.buyerName || "Buyer"}</td>
                  <td className="px-3 py-3 text-slate-900">{order.title || "Gig"}</td>
                  <td className="px-3 py-3 text-slate-700">{getDueDateLabel(order)}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-700">
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 ? (
            <p className="p-6 text-center text-slate-500">No orders in this tab yet.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default SellerDashboard;
