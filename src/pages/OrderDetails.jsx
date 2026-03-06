import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import GigDelivery from "../components/GigDelivery";
import ReviewModal from "../components/ReviewModal";
import { getOrderReview, submitOrderReview } from "../services/reviewService";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewExists, setReviewExists] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Order not found.");
          setLoading(false);
          return;
        }

        setOrder({ id: snapshot.id, ...snapshot.data() });
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to load order", snapshotError);
        setError("Unable to load order details.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !user || !order || user.uid !== order.buyerId) return;

    getOrderReview(orderId)
      .then((review) => {
        const exists = Boolean(review);
        setReviewExists(exists);

        if (order.status === "completed" && !exists) {
          setReviewOpen(true);
        }
      })
      .catch((reviewError) => {
        console.error("Failed to check order review", reviewError);
      });
  }, [orderId, user, order]);

  const canAccess = useMemo(() => {
    if (!user || !order) return false;
    return user.uid === order.buyerId || user.uid === order.sellerId;
  }, [user, order]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingState title="Loading order details" text="Preparing the workspace for this order." />;
  }

  if (error) {
    return <ErrorState title="Order unavailable" text={error} actionText="Go back" onAction={() => navigate(-1)} />;
  }

  if (!order || !canAccess) {
    return <Navigate to="/" replace />;
  }

  const submitReview = async ({ rating, comment }) => {
    await submitOrderReview({
      orderId: order.id,
      gigId: order.gigId,
      gigTitle: order.title,
      buyerId: order.buyerId,
      buyerName: order.buyerName || user.name || user.email,
      sellerId: order.sellerId,
      rating,
      comment,
    });

    setReviewExists(true);
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
        <p className="mt-1 text-sm text-slate-600">Order #{order.id.slice(0, 10)}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-slate-500">Buyer</p>
            <p className="text-sm font-semibold text-slate-800">{order.buyerName || "Buyer"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Seller</p>
            <p className="text-sm font-semibold text-slate-800">{order.sellerName || "Seller"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Gig</p>
            <p className="text-sm font-semibold text-slate-800">{order.title || "Gig"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Status</p>
            <p className="text-sm font-semibold capitalize text-emerald-600">{order.status || "pending"}</p>
          </div>
        </div>
      </header>

      <GigDelivery
        order={order}
        currentUser={user}
        onOrderAction={(action) => {
          if (action === "completed" && user.uid === order.buyerId && !reviewExists) {
            setReviewOpen(true);
          }
        }}
      />

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate(`/chat/${order.id}`)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Open Chat
        </button>
        <button
          type="button"
          onClick={() => navigate(user.role === "seller" ? "/seller-dashboard" : "/my-orders")}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back
        </button>
      </div>

      <ReviewModal
        open={reviewOpen && user.uid === order.buyerId}
        onClose={() => setReviewOpen(false)}
        onSubmit={submitReview}
        gigTitle={order.title}
      />
    </section>
  );
}

export default OrderDetails;
