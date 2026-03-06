import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import OrderCard from "../components/OrderCard";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { subscribeBuyerOrders } from "../services/orderService";
import "./OrderTracking.css";

function OrderTracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, in-progress, completed, cancelled

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer") {
      navigate("/seller-dashboard");
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
        console.error("Failed to fetch buyer orders", snapshotError);
        setError("Unable to load your orders right now. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  if (loading) {
    return <LoadingState title="Loading your orders" text="Fetching latest progress and delivery updates." />;
  }

  if (error) {
    return <ErrorState title="Orders unavailable" text={error} actionText="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="order-tracking">
      <div className="tracking-header">
        <h1>My Orders</h1>
        <p>Track your orders and deliveries</p>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {["all", "pending", "in-progress", "delivered", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </button>
          )
        )}
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <EmptyState
            title="No matching orders"
            text={`No ${filterStatus !== "all" ? filterStatus : "recent"} orders found.`}
          />
        )}
      </div>
    </div>
  );
}

export default OrderTracking;
