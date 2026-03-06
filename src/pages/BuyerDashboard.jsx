import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { subscribeBuyerOrders } from "../services/orderService";
import "./BuyerDashboard.css";

function BuyerDashboard() {
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

    const unsubscribe = subscribeBuyerOrders(
      user.uid,
      (ordersList) => {
        setOrders(ordersList);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to load buyer dashboard", snapshotError);
        setError("Unable to load your dashboard right now.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const metrics = useMemo(() => {
    const completed = orders.filter((order) => order.status === "completed").length;
    const active = orders.filter((order) => order.status === "pending" || order.status === "in-progress").length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      completed,
      active,
      total: orders.length,
      totalSpent,
    };
  }, [orders]);

  if (loading) {
    return <LoadingState title="Loading dashboard" text="Collecting your latest orders and progress." />;
  }

  if (error) {
    return <ErrorState title="Dashboard unavailable" text={error} actionText="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="buyer-dashboard">
      <header className="buyer-header">
        <h1>Buyer Dashboard</h1>
        <p>Monitor spending, active deliveries, and completed work at a glance.</p>
      </header>

      <section className="buyer-stats-grid">
        <article className="buyer-stat-card">
          <p>Total Orders</p>
          <h3>{metrics.total}</h3>
        </article>
        <article className="buyer-stat-card">
          <p>Active Orders</p>
          <h3>{metrics.active}</h3>
        </article>
        <article className="buyer-stat-card">
          <p>Completed Orders</p>
          <h3>{metrics.completed}</h3>
        </article>
        <article className="buyer-stat-card">
          <p>Total Spent</p>
          <h3>Rs {metrics.totalSpent}</h3>
        </article>
      </section>

      <section className="buyer-panel">
        <div className="buyer-panel-head">
          <h2>Recent Orders</h2>
          <button type="button" onClick={() => navigate("/my-orders")}>Open My Orders</button>
        </div>

        {orders.length ? (
          <div className="buyer-list">
            {orders.slice(0, 8).map((order) => (
              <article className="buyer-order-row" key={order.id}>
                <div>
                  <h4>{order.title}</h4>
                  <p>{order.package} package</p>
                </div>
                <strong>Rs {order.total}</strong>
                <button type="button" onClick={() => navigate(`/chat/${order.id}`)}>Message Seller</button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No orders yet" text="Explore gigs and place your first order to start tracking progress." />
        )}
      </section>
    </div>
  );
}

export default BuyerDashboard;
