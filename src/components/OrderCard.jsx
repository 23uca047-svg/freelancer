import { memo } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderCard.css";

const statusColors = {
  pending: "#ff6b6b",
  "in-progress": "#ffd93d",
  delivered: "#66b2ff",
  completed: "#51cf66",
  cancelled: "#a5a5a5",
};

const statusSteps = ["pending", "in-progress", "delivered", "completed"];

function OrderCard({ order }) {
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    const icons = {
      pending: "â³",
      "in-progress": "ðŸ”„",
      delivered: "ðŸ“¤",
      completed: "âœ…",
      cancelled: "âŒ",
    };
    return icons[status] || "ðŸ“¦";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getDeliveryDate = () => {
    if (!order.createdAt) return "N/A";
    const createdDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const deliveryDays = parseInt(order.delivery) || 5;
    const deliveryDate = new Date(createdDate);
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    return deliveryDate.toLocaleDateString();
  };

  const getProgressPercentage = () => {
    const statusIndex = statusSteps.indexOf(order.status);
    if (statusIndex === -1) return 0;
    return ((statusIndex + 1) / statusSteps.length) * 100;
  };

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-title-section">
          <h3>{order.title}</h3>
          <p className="order-id">Order ID: {order.id?.slice(0, 8)}</p>
        </div>
        <div className={`status-badge ${order.status}`}>
          {getStatusIcon(order.status)} {order.status.toUpperCase()}
        </div>
      </div>

      <div className="order-details">
        <div className="detail-row">
          <span className="label">Package:</span>
          <span className="value">{order.package}</span>
        </div>
        <div className="detail-row">
          <span className="label">Amount:</span>
          <span className="value">â‚¹{order.total}</span>
        </div>
        <div className="detail-row">
          <span className="label">Seller:</span>
          <span className="value">{order.sellerName || "Top Rated Seller"}</span>
        </div>
        <div className="detail-row">
          <span className="label">Ordered:</span>
          <span className="value">{formatDate(order.createdAt)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Expected Delivery:</span>
          <span className="value">{getDeliveryDate()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${getProgressPercentage()}%`,
              backgroundColor: statusColors[order.status],
            }}
          ></div>
        </div>
        <div className="progress-steps">
          {statusSteps.map((step) => (
            <div
              key={step}
              className={`step ${order.status === step ? "active" : ""} ${
                statusSteps.indexOf(step) < statusSteps.indexOf(order.status)
                  ? "completed"
                  : ""
              }`}
            >
              <div className="step-circle">
                {statusSteps.indexOf(step) < statusSteps.indexOf(order.status)
                  ? "âœ“"
                  : ""}
              </div>
              <span className="step-label">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      {order.requirements && (
        <div className="requirements-section">
          <h4>Your Requirements:</h4>
          <p>{order.requirements}</p>
        </div>
      )}

      <div className="order-card-footer">
        <button
          className="btn-message"
          onClick={() => navigate(`/chat/${order.id}`)}
        >
          ðŸ’¬ Message Seller
        </button>
        <button
          className="btn-details"
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default memo(OrderCard);
