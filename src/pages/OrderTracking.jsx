import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import OrderCard from "../components/OrderCard";
import "./OrderTracking.css";

function OrderTracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, in-progress, completed, cancelled

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Subscribe to user's orders
    const q = query(
      collection(db, "orders"),
      where("buyerId", "==", user.uid),
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

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading orders...</div>;
  }

  return (
    <div className="order-tracking">
      <div className="tracking-header">
        <h1>My Orders</h1>
        <p>Track your orders and deliveries</p>
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

      {/* Orders List */}
      <div className="orders-container">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="no-orders">
            <p>No {filterStatus !== "all" ? filterStatus : ""} orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;
