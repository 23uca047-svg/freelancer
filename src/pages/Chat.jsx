import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { ensureConversation, sendMessage, subscribeMessages } from "../services/conversationService";
import "./Chat.css";

function Chat() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        setPageError("Order not found for this chat.");
        return;
      }
      const data = orderSnap.data();
      setOrder({ id: orderSnap.id, ...data });
      await ensureConversation(orderId, data.buyerId, data.sellerId);
    };

    fetchOrder().catch((fetchError) => {
      console.error("Failed loading chat order", fetchError);
      setPageError("Unable to load the conversation right now.");
    });
  }, [user, orderId, navigate]);

  useEffect(() => {
    if (!order) return;

    const unsubscribe = subscribeMessages(orderId, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [order, orderId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setActionError("");
      await sendMessage(orderId, {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        text: text.trim(),
        attachmentURL: null,
      });
      setText("");
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message", err);
      setActionError("Unable to send your message. Please try again.");
    }
  };

  if (!user) return null; // already handled but just in case

  if (!order) {
    return <LoadingState title="Loading conversation" text="Preparing real-time chat for this order." />;
  }

  if (pageError) {
    return <ErrorState title="Chat issue" text={pageError} actionText="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h2>Chat about: {order.title}</h2>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.senderId === user.uid ? "sent" : "received"}`}
          >
            <span className="sender">{msg.senderName}</span>
            {msg.attachmentURL ? (
              <div className="attachment">
                {(msg.attachment?.type || "").startsWith("image/") || msg.attachmentURL.includes(".jpg") || msg.attachmentURL.includes(".png") || msg.attachmentURL.includes(".gif") ? (
                  <img src={msg.attachmentURL} alt="attachment" className="attachment-img" />
                ) : (
                  <a href={msg.attachmentURL} target="_blank" rel="noopener noreferrer" className="attachment-link">
                    Attachment: {msg.attachment?.name || msg.text}
                  </a>
                )}
              </div>
            ) : (
              <p className="text">{msg.text}</p>
            )}
            <small className="time">
              {msg.createdAt?.toDate
                ? msg.createdAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      {actionError ? <p className="chat-action-error">{actionError}</p> : null}
      <p className="chat-help">File attachments are temporarily disabled.</p>
    </div>
  );
}

export default Chat;
