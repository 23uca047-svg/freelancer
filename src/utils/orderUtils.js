/**
 * Order Tracking System Utilities
 * Helper functions for order management
 */

// Get status display text and color
export const getStatusInfo = (status) => {
  const statusMap = {
    pending: { label: "Pending", color: "#ff6b6b", icon: "⏳" },
    "in-progress": { label: "In Progress", color: "#ffd93d", icon: "🔄" },
    completed: { label: "Completed", color: "#51cf66", icon: "✅" },
    cancelled: { label: "Cancelled", color: "#a5a5a5", icon: "❌" },
  };
  return statusMap[status] || statusMap.pending;
};

// Calculate expected delivery date
export const calculateDeliveryDate = (createdDate, deliveryDays) => {
  const date = createdDate.toDate ? createdDate.toDate() : new Date(createdDate);
  const days = parseInt(deliveryDays) || 5;
  const deliveryDate = new Date(date);
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return deliveryDate;
};

// Check if order is overdue
export const isOrderOverdue = (createdDate, deliveryDays) => {
  const deliveryDate = calculateDeliveryDate(createdDate, deliveryDays);
  return new Date() > deliveryDate;
};

// Get order progress percentage
export const getOrderProgress = (status) => {
  const statusWeights = {
    pending: 25,
    "in-progress": 75,
    completed: 100,
    cancelled: 0,
  };
  return statusWeights[status] || 0;
};

// Format timestamp to readable date
export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format timestamp to time (HH:MM)
export const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get order status timeline
export const getStatusTimeline = (status) => {
  const timeline = [
    { stage: "pending", label: "Order Placed" },
    { stage: "in-progress", label: "In Progress" },
    { stage: "completed", label: "Completed" },
  ];

  return timeline.map((item) => ({
    ...item,
    completed: timeline.indexOf(item) < timeline.indexOf(timeline.find((t) => t.stage === status)),
    active: item.stage === status,
  }));
};

// Validate order data
export const validateOrderData = (order) => {
  const required = ["title", "package", "price", "total", "status", "buyerId"];
  return required.every((field) => order.hasOwnProperty(field));
};

// Calculate service fee (percentage-based)
export const calculateServiceFee = (price, feePercentage = 5) => {
  return Math.round((price * feePercentage) / 100);
};
