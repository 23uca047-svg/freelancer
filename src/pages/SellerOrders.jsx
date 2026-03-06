import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { subscribeSellerOrders, updateOrderStatus } from "../services/orderService";
import "./SellerOrders.css";

function SellerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
        console.error("Failed to fetch seller orders", snapshotError);
        setError("Unable to load seller orders. Please try again in a moment.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    }
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  if (loading) {
    return <LoadingState title="Loading seller orders" text="Syncing latest orders from your gigs." />;
  }

  if (error) {
    return <ErrorState title="Seller orders unavailable" text={error} actionText="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="seller-orders">
      <div className="orders-header">
        <h1>Manage Orders</h1>
        <p>View and manage all orders on your gigs</p>
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

      {/* Orders Table */}
      <div className="orders-table-container">
        {filteredOrders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Gig Title</th>
                <th>Buyer</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Ordered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={`status-${order.status}`}>
                  <td className="order-id-cell">
                    <small>{order.id?.slice(0, 8)}</small>
                  </td>
                  <td className="title-cell">{order.title}</td>
                  <td className="buyer-cell">
                    <div>
                      <p className="buyer-name">{order.buyerName}</p>
                      <small>{order.buyerEmail}</small>
                    </div>
                  </td>
                  <td>{order.package}</td>
                  <td className="amount-cell">â‚¹{order.total}</td>
                  <td className="status-cell">
                    <span className={`status-badge ${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="date-cell">
                    {order.createdAt?.toDate?.().toLocaleDateString() || "N/A"}
                  </td>
                  <td className="action-cell">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order.id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                    <button
                      className="chat-btn"
                      onClick={() => navigate(`/chat/${order.id}`)}
                      style={{ marginTop: "6px", display: "block" }}
                    >
                      ðŸ’¬ Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No orders found"
            text={`No ${filterStatus !== "all" ? filterStatus : "active"} orders match your filters.`}
          />
        )}
      </div>
    </div>
  );
}

export default SellerOrders;
