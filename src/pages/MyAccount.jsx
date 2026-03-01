import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MyAccount.css";

function MyAccount() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where(user.role === "seller" ? "sellerId" : "buyerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (!user) return null;

  return (
    <div className="my-account">
      <header className="my-account-header">
        <h1>My Account</h1>
        <p>Role: {user.role}</p>
      </header>

      <div className="tabs">
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Orders</button>
        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}>Messages</button>
      </div>

      <div className="tab-content">
        {tab === "orders" && (
          <div className="orders-list">
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length ? (
              orders.map((o) => (
                <div key={o.id} className="account-order">
                  <h3>{o.title}</h3>
                  <p>Package: {o.package} — ₹{o.total}</p>
                  <div className="order-actions">
                    <button onClick={() => navigate(`/order/${o.id}`)}>View</button>
                    <button onClick={() => navigate(`/chat/${o.id}`)}>Chat</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No orders yet</p>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div className="messages-list">
            <p>Messages are per-order. Open an order and click Chat to start.</p>
            <ul>
              {orders.map((o) => (
                <li key={o.id}>
                  <button onClick={() => navigate(`/chat/${o.id}`)}>
                    Chat about: {o.title} ({o.id.slice(0,8)})
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAccount;
