import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function useSellerOrders(currentUser) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser?.uid) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "orders"), where("sellerId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
        items.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });

        setOrders(items);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to load seller orders", snapshotError);
        setError("Unable to load seller orders.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const groupedOrders = useMemo(() => {
    const activeStatuses = ["pending", "in-progress"];

    return {
      active: orders.filter((order) => activeStatuses.includes(order.status)),
      delivered: orders.filter((order) => order.status === "delivered"),
      completed: orders.filter((order) => order.status === "completed"),
    };
  }, [orders]);

  return {
    orders,
    groupedOrders,
    loading,
    error,
  };
}
