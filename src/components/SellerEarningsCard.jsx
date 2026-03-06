import { formatRupees } from "../utils/currency";

function SellerEarningsCard({ orders }) {
  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + Number(order.price || order.total || 0), 0);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Revenue</p>
      <h3 className="mt-2 text-2xl font-bold text-emerald-600">{formatRupees(totalRevenue)}</h3>
      <p className="mt-1 text-sm text-slate-500">Sum of all completed orders.</p>
    </article>
  );
}

export default SellerEarningsCard;
