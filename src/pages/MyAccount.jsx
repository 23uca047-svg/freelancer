import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { formatRupees } from "../utils/currency";
import "./MyAccount.css";

function MyAccount() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError("");

    const q = query(
      collection(db, "orders"),
      where(user.role === "seller" ? "sellerId" : "buyerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load account orders:", err);
        setError("Unable to load orders. Check Firestore rules/index and try again.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  if (!user) return null;

  const completedOrders = orders.filter((order) => order.status === "completed").length;
  const profileRating = completedOrders ? (4.6 + Math.min(0.4, completedOrders / 100)).toFixed(1) : "New";

  return (
    <div className="my-account">
      <header className="my-account-header">
        <div>
          <h1>My Profile</h1>
          <p>Role: {user.role}</p>
        </div>
        <div className="profile-rating">
          <strong>{profileRating === "New" ? "New" : `${profileRating} / 5`}</strong>
          <span>{completedOrders} completed orders</span>
        </div>
      </header>

      <section className="profile-meta">
        <article>
          <h3>{user.displayName || "Freelancer User"}</h3>
          <p>{user.email}</p>
        </article>
        <article>
          <h4>Recent Reviews</h4>
          <ul>
            <li>"Excellent communication and fast updates."</li>
            <li>"Delivered exactly what was promised."</li>
            <li>"Very professional collaboration experience."</li>
          </ul>
        </article>
      </section>

      <div className="tabs">
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Orders</button>
        <button className={tab === "messages" ? "active" : ""} onClick={() => setTab("messages")}>Messages</button>
      </div>

      <div className="tab-content">
        {tab === "orders" && (
          <div className="orders-list">
            {loading ? (
              <LoadingState title="Loading orders" text="Fetching your latest order activity." />
            ) : error ? (
              <ErrorState title="Unable to load orders" text={error} />
            ) : orders.length ? (
              orders.map((o) => (
                <div key={o.id} className="account-order">
                  <h3>{o.title}</h3>
                  <p>Package: {o.package} - {formatRupees(o.total)}</p>
                  <div className="order-actions">
                    <button onClick={() => navigate(`/order/${o.id}`)}>View</button>
                    <button onClick={() => navigate(`/chat/${o.id}`)}>Chat</button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No orders yet" text="Your active and completed orders will appear here." />
            )}
          </div>
        )}

        {tab === "messages" && (
          <div className="messages-list">
            <p>Messages are per-order. Open an order and click Chat to start.</p>
            {orders.length ? (
              <ul>
                {orders.map((o) => (
                  <li key={o.id}>
                    <button onClick={() => navigate(`/chat/${o.id}`)}>
                      Chat about: {o.title} ({o.id.slice(0, 8)})
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No message threads" text="Place or accept orders to start chatting." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAccount;
