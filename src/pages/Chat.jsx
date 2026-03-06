import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        setError("Order not found for this chat.");
        return;
      }
      const data = orderSnap.data();
      setOrder({ id: orderSnap.id, ...data });
      await ensureConversation(orderId, data.buyerId, data.sellerId);
    };

    fetchOrder().catch((fetchError) => {
      console.error("Failed loading chat order", fetchError);
      setError("Unable to load the conversation right now.");
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
      setError("Unable to send your message. Please try again.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large (max 5MB)");
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `chats/${orderId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const attachmentURL = await getDownloadURL(storageRef);

      await sendMessage(orderId, {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        text: file.name,
        attachmentURL,
        isFile: true,
      });
      scrollToBottom();
    } catch (err) {
      console.error("Failed to upload file", err);
      setError("File upload failed. Please try a smaller file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null; // already handled but just in case

  if (!order) {
    return <LoadingState title="Loading conversation" text="Preparing real-time chat for this order." />;
  }

  if (error) {
    return <ErrorState title="Chat issue" text={error} actionText="Retry" onAction={() => window.location.reload()} />;
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
                {msg.attachmentURL.includes(".jpg") || msg.attachmentURL.includes(".png") || msg.attachmentURL.includes(".gif") ? (
                  <img src={msg.attachmentURL} alt="attachment" className="attachment-img" />
                ) : (
                  <a href={msg.attachmentURL} target="_blank" rel="noopener noreferrer" className="attachment-link">
                    Attachment: {msg.text}
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
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="file-btn"
          title="Attach file (max 5MB)"
        >
          Attach
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default Chat;
