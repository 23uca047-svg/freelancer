import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SellerOrders.css";

function SellerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Subscribe to seller's orders
    const q = query(
      collection(db, "orders"),
      where("sellerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
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
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading orders...</div>;
  }

  return (
    <div className="seller-orders">
      <div className="orders-header">
        <h1>📦 Manage Orders</h1>
        <p>View and manage all orders on your gigs</p>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {["all", "pending", "in-progress", "completed", "cancelled"].map(
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
                  <td className="amount-cell">₹{order.total}</td>
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
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                    <button
                      className="chat-btn"
                      onClick={() => navigate(`/chat/${order.id}`)}
                      style={{ marginTop: "6px", display: "block" }}
                    >
                      💬 Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-orders-message">
            <p>📭 No {filterStatus !== "all" ? filterStatus : ""} orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerOrders;
