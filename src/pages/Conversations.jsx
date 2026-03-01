import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Conversations.css";

function Conversations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Get all conversations where user is a participant
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convos = [];
      for (const convoDoc of snapshot.docs) {
        const data = convoDoc.data();
        
        // Get order details
        const orderRef = doc(db, "orders", data.orderId);
        const orderSnap = await getDoc(orderRef);
        const order = orderSnap.exists() ? orderSnap.data() : {};

        convos.push({
          id: convoDoc.id,
          orderId: data.orderId,
          title: order.title || "Order",
          createdAt: data.createdAt,
          participants: data.participants,
        });
      }
      // Sort by creation date descending
      convos.sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)));
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="conversations-page">
      <header className="conversations-header">
        <h1>💬 Your Conversations</h1>
      </header>

      {loading ? (
        <p className="loading">Loading conversations...</p>
      ) : conversations.length > 0 ? (
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div key={conv.id} className="conversation-item" onClick={() => navigate(`/chat/${conv.orderId}`)}>
              <div className="conv-content">
                <h3>{conv.title}</h3>
                <p className="order-id">Order ID: {conv.orderId.slice(0, 8)}</p>
              </div>
              <button className="open-btn">Open Chat →</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-conversations">
          <p>No conversations yet.</p>
          <p>Place an order or accept a gig to start chatting!</p>
        </div>
      )}
    </div>
  );
}

export default Conversations;
