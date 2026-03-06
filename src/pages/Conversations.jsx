import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { subscribeConversations } from "../services/conversationService";
import "./Conversations.css";

function Conversations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const unsubscribe = subscribeConversations(user.uid, async (rawConversations) => {
      try {
        const withOrderData = await Promise.all(
          rawConversations.map(async (conversation) => {
            const orderRef = doc(db, "orders", conversation.orderId);
            const orderSnap = await getDoc(orderRef);
            const order = orderSnap.exists() ? orderSnap.data() : {};

            return {
              id: conversation.id,
              orderId: conversation.orderId,
              title: order.title || "Order",
              createdAt: conversation.createdAt,
              participants: conversation.participants,
            };
          })
        );

        withOrderData.sort(
          (a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0))
        );
        setConversations(withOrderData);
        setError("");
      } catch (fetchError) {
        console.error("Failed to enrich conversation list", fetchError);
        setError("Unable to load conversation details.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  if (!user) return null;

  if (loading) {
    return <LoadingState title="Loading conversations" text="Syncing your latest buyer and seller chats." />;
  }

  if (error) {
    return <ErrorState title="Conversations unavailable" text={error} actionText="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="conversations-page">
      <header className="conversations-header">
        <h1>Your Conversations</h1>
      </header>

      {conversations.length > 0 ? (
        <div className="conversations-list">
          {conversations.map((conv) => (
            <div key={conv.id} className="conversation-item" onClick={() => navigate(`/chat/${conv.orderId}`)}>
              <div className="conv-content">
                <h3>{conv.title}</h3>
                <p className="order-id">Order ID: {conv.orderId.slice(0, 8)}</p>
              </div>
              <button className="open-btn">Open Chat</button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No conversations yet"
          text="Place an order or accept a gig to start chatting in real-time."
        />
      )}
    </div>
  );
}

export default Conversations;
