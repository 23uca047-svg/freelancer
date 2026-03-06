import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export async function createReview({ gigId, gigTitle, buyerId, buyerName, sellerId, rating, comment }) {
  if (!gigId || !buyerId) {
    throw new Error("Missing review details");
  }

  return addDoc(collection(db, "reviews"), {
    gigId,
    gigTitle: gigTitle || "",
    buyerId,
    buyerName: buyerName || "Buyer",
    sellerId,
    rating: Number(rating),
    comment: comment || "",
    createdAt: serverTimestamp(),
  });
}

export async function getOrderReview(orderId) {
  const snapshot = await getDoc(doc(db, "reviews", orderId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function submitOrderReview({ orderId, gigId, gigTitle, buyerId, buyerName, sellerId, rating, comment }) {
  if (!orderId || !buyerId) {
    throw new Error("Missing review metadata");
  }

  const safeRating = Number(rating);
  if (!Number.isFinite(safeRating) || safeRating < 1 || safeRating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  await runTransaction(db, async (transaction) => {
    const reviewRef = doc(db, "reviews", orderId);
    const existingReview = await transaction.get(reviewRef);

    if (existingReview.exists()) {
      throw new Error("Review already submitted for this order.");
    }

    transaction.set(reviewRef, {
      orderId,
      gigId,
      gigTitle: gigTitle || "",
      buyerId,
      buyerName: buyerName || "Buyer",
      sellerId,
      rating: safeRating,
      comment: comment || "",
      createdAt: serverTimestamp(),
    });

    if (gigId) {
      const gigRef = doc(db, "gigs", gigId);
      const gigSnapshot = await transaction.get(gigRef);

      if (gigSnapshot.exists()) {
        const gigData = gigSnapshot.data();
        const oldCount = Number(gigData.reviewCount || 0);
        const oldAverage = Number(gigData.averageRating || 0);
        const nextCount = oldCount + 1;
        const nextAverage = ((oldAverage * oldCount) + safeRating) / nextCount;

        transaction.update(gigRef, {
          reviewCount: increment(1),
          ratingTotal: increment(safeRating),
          averageRating: Number(nextAverage.toFixed(2)),
          rating: Number(nextAverage.toFixed(2)),
          reviews: nextCount,
        });
      }
    }
  });
}

export function subscribeBuyerReviews(buyerId, onData, onError) {
  const q = query(
    collection(db, "reviews"),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    },
    onError
  );
}

export function subscribeGigReviews(gigId, onData, onError) {
  const q = query(
    collection(db, "reviews"),
    where("gigId", "==", gigId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    },
    onError
  );
}
