import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Hooks at top
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);

  const order = location.state;

  if (!order || !order.selectedPackage) {
    return <h2 style={{ padding: "40px" }}>No order data found</h2>;
  }

  const serviceFee = 100;
  const price = Number(order.selectedPackage.price);
  const total = price + serviceFee;

  const invoiceNumber = "INV-" + Math.floor(Math.random() * 1000000);
  const orderDate = new Date().toLocaleDateString();

  // 🔥 SAVE ORDER TO FIREBASE
  const handleConfirmOrder = async () => {
    try {
      setLoading(true);

      await addDoc(collection(db, "orders"), {
        title: order.title,
        package: order.selectedPackage.name,
        price: price,
        serviceFee: serviceFee,
        total: total,
        delivery: order.selectedPackage.delivery,
        requirements: requirements,
        status: "pending",
        buyerId: user.uid,
        buyerName: user.displayName || "Guest",
        buyerEmail: user.email,
        sellerId: order.sellerId || "seller123", // Add seller ID from gig
        createdAt: serverTimestamp(),
      });

      alert("Order placed successfully!");
      navigate("/order-tracking"); // go to order tracking
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h1>Order Summary</h1>

      <p><strong>Invoice:</strong> {invoiceNumber}</p>
      <p><strong>Order Date:</strong> {orderDate}</p>

      <hr />

      <h2>{order.title}</h2>
      <p><strong>Package:</strong> {order.selectedPackage.name}</p>
      <p><strong>Delivery:</strong> {order.selectedPackage.delivery}</p>

      <p>Service Price: ₹{price}</p>
      <p>Service Fee: ₹{serviceFee}</p>

      {/* 📝 REQUIREMENTS BOX */}
      <div style={{ marginTop: "15px" }}>
        <label><strong>Customization / Requirements</strong></label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Describe your requirements (style, colors, references...)"
          rows={4}
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            resize: "none",
          }}
        />
      </div>

      <hr />

      <h3>Total Amount: ₹{total}</h3>

      <button
        onClick={handleConfirmOrder}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "12px",
          width: "100%",
          background: "#1dbf73",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "6px",
        }}
      >
        {loading ? "Placing Order..." : "Confirm Order"}
      </button>
    </div>
  );
}

export default Order;