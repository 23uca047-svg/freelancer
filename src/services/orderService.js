import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";

const ALLOWED_STATUSES = ["pending", "in-progress", "delivered", "completed", "cancelled"];

export async function createOrder(orderPayload, userRole = "buyer") {
  if (userRole !== "buyer") {
    throw new Error("Only buyers can place orders.");
  }

  return addDoc(collection(db, "orders"), {
    ...orderPayload,
    status: orderPayload.status || "pending",
    createdAt: serverTimestamp(),
  });
}

export function subscribeBuyerOrders(userId, onData, onError) {
  const q = query(
    collection(db, "orders"),
    where("buyerId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      items.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      onData(items);
    },
    onError
  );
}

export function subscribeSellerOrders(userId, onData, onError) {
  const q = query(
    collection(db, "orders"),
    where("sellerId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      items.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      onData(items);
    },
    onError
  );
}

export async function updateOrderStatus(orderId, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid order status");
  }

  await updateDoc(doc(db, "orders", orderId), { status });
}
