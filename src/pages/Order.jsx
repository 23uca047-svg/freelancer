import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orderService";
import ErrorState from "../components/common/ErrorState";
import { formatRupees } from "../utils/currency";
import "./Order.css";

function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Local form state
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const order = location.state;

  if (!order || !order.selectedPackage) {
    return <ErrorState title="Order not found" text="No order data was provided. Please select a gig package again." />;
  }

  if (!user || user.role !== "buyer") {
    return <ErrorState title="Access denied" text="Only buyers can place orders." actionText="Go to gigs" onAction={() => navigate("/gigs")} />;
  }

  const serviceFee = 100;
  const price = Number(order.selectedPackage.price);
  const total = price + serviceFee;

  const invoiceNumber = "INV-" + Math.floor(Math.random() * 1000000);
  const orderDate = new Date().toLocaleDateString();

  // Save order to Firestore
  const handleConfirmOrder = async () => {
    try {
      setLoading(true);

      await createOrder({
        gigId: order.gigId || "",
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
        sellerName: order.sellerName || "Top Rated Seller",
      }, user.role);

      alert("Order placed successfully!");
      navigate("/my-orders");
    } catch (error) {
      console.error("Error saving order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <h1>Order Summary</h1>

      {error ? <p className="order-error">{error}</p> : null}

      <p><strong>Invoice:</strong> {invoiceNumber}</p>
      <p><strong>Order Date:</strong> {orderDate}</p>

      <hr />

      <h2>{order.title}</h2>
      <p><strong>Package:</strong> {order.selectedPackage.name}</p>
      <p><strong>Delivery:</strong> {order.selectedPackage.delivery}</p>
      <p><strong>Seller:</strong> {order.sellerName || "Top Rated Seller"}</p>

      <p>Service Price: {formatRupees(price)}</p>
      <p>Service Fee: {formatRupees(serviceFee)}</p>

      {/* Requirements box */}
      <div className="requirements-field">
        <label><strong>Customization / Requirements</strong></label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Describe your requirements (style, colors, references...)"
          rows={4}
        />
      </div>

      <hr />

      <h3>Total Amount: {formatRupees(total)}</h3>

      <button
        onClick={handleConfirmOrder}
        disabled={loading}
        className="confirm-order-btn"
      >
        {loading ? "Placing Order..." : "Confirm Order"}
      </button>
    </div>
  );
}

export default Order;
