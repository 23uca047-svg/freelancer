import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { subscribeSellerOrders } from "../services/orderService";
import { formatRupees } from "../utils/currency";
import "./Earnings.css";

function Earnings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "seller") {
      navigate("/");
      return;
    }

    const unsubscribe = subscribeSellerOrders(
      user.uid,
      (ordersList) => {
        setOrders(ordersList);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to load seller earnings", snapshotError);
        setError("Unable to load earnings data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const stats = useMemo(() => {
    const completed = orders.filter((order) => order.status === "completed");
    const delivered = orders.filter((order) => order.status === "delivered");
    const totalRevenue = completed.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const potential = delivered.reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      totalRevenue,
      potential,
      completed: completed.length,
      delivered: delivered.length,
    };
  }, [orders]);

  if (loading) {
    return <LoadingState title="Loading earnings" text="Calculating your completed and delivered payouts." />;
  }

  if (error) {
    return <ErrorState title="Earnings unavailable" text={error} />;
  }

  return (
    <section className="earnings-page">
      <h1>Earnings</h1>
      <p>Revenue and payout-ready totals for your seller account.</p>

      <div className="earnings-grid">
        <article>
          <span>Total Revenue</span>
          <strong>{formatRupees(stats.totalRevenue)}</strong>
        </article>
        <article>
          <span>Delivered (Awaiting Completion)</span>
          <strong>{formatRupees(stats.potential)}</strong>
        </article>
        <article>
          <span>Completed Orders</span>
          <strong>{stats.completed}</strong>
        </article>
        <article>
          <span>Delivered Orders</span>
          <strong>{stats.delivered}</strong>
        </article>
      </div>
    </section>
  );
}

export default Earnings;
