import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import { subscribeBuyerOrders } from "../services/orderService";
import { createReview, subscribeBuyerReviews } from "../services/reviewService";
import "./Reviews.css";

function Reviews() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer") {
      navigate("/seller-dashboard");
      return;
    }

    const unsubOrders = subscribeBuyerOrders(
      user.uid,
      (ordersList) => {
        setOrders(ordersList);
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to load buyer orders for reviews", snapshotError);
        setError("Unable to load completed orders.");
        setLoading(false);
      }
    );

    const unsubReviews = subscribeBuyerReviews(
      user.uid,
      (reviewList) => setReviews(reviewList),
      (snapshotError) => {
        console.error("Failed to load buyer reviews", snapshotError);
        setError("Unable to load existing reviews.");
      }
    );

    return () => {
      unsubOrders();
      unsubReviews();
    };
  }, [user, navigate]);

  const reviewedGigIds = useMemo(() => new Set(reviews.map((review) => review.gigId)), [reviews]);

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "completed" && !reviewedGigIds.has(order.gigId)),
    [orders, reviewedGigIds]
  );

  const updateDraft = (orderId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: {
        rating: prev[orderId]?.rating || 5,
        comment: prev[orderId]?.comment || "",
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const submitReview = async (order) => {
    const draft = drafts[order.id] || { rating: 5, comment: "" };

    if (!order.gigId) {
      alert("This completed order has no gigId, so review cannot be attached.");
      return;
    }

    if (order.sellerId === user.uid) {
      alert("Sellers cannot review their own gig.");
      return;
    }

    try {
      await createReview({
        gigId: order.gigId,
        gigTitle: order.title,
        buyerId: user.uid,
        buyerName: user.name || user.email || "Buyer",
        sellerId: order.sellerId,
        rating: Number(draft.rating || 5),
        comment: draft.comment || "",
      });

      alert("Review submitted");
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });
    } catch (submitError) {
      console.error("Failed to submit review", submitError);
      alert("Unable to submit review right now.");
    }
  };

  if (loading) {
    return <LoadingState title="Loading reviews" text="Fetching completed orders eligible for review." />;
  }

  if (error) {
    return <ErrorState title="Reviews unavailable" text={error} />;
  }

  return (
    <section className="reviews-page">
      <h1>My Reviews</h1>
      <p>Only buyers can leave reviews for completed orders.</p>

      <div className="review-section">
        <h2>Leave a Review</h2>
        {completedOrders.length ? (
          completedOrders.map((order) => (
            <article key={order.id} className="review-card">
              <div>
                <h3>{order.title}</h3>
                <p>Order: {order.id.slice(0, 8)} | Seller: {order.sellerId?.slice(0, 8)}</p>
              </div>
              <div className="review-form-row">
                <select
                  value={drafts[order.id]?.rating || 5}
                  onChange={(e) => updateDraft(order.id, "rating", e.target.value)}
                >
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
                <input
                  placeholder="Write your feedback"
                  value={drafts[order.id]?.comment || ""}
                  onChange={(e) => updateDraft(order.id, "comment", e.target.value)}
                />
                <button type="button" onClick={() => submitReview(order)}>Submit</button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No pending reviews" text="Complete an order to leave a review." />
        )}
      </div>

      <div className="review-section">
        <h2>Your Submitted Reviews</h2>
        {reviews.length ? (
          <div className="submitted-grid">
            {reviews.map((review) => (
              <article key={review.id} className="submitted-card">
                <strong>{review.gigTitle || "Gig"}</strong>
                <p>Rating: {review.rating}/5</p>
                <p>{review.comment || "No comment"}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No reviews submitted" text="Your submitted feedback will appear here." />
        )}
      </div>
    </section>
  );
}

export default Reviews;
