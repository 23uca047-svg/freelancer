import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function SellerDashboard() {
  const { user } = useAuth();

  const [gigs, setGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 🔥 Fetch Seller Gigs
      const gigsQuery = query(
        collection(db, "gigs"),
        where("sellerId", "==", user.uid)
      );
      const gigsSnapshot = await getDocs(gigsQuery);
      const gigsData = gigsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGigs(gigsData);

      // 🔥 Fetch Seller Orders
      const ordersQuery = query(
        collection(db, "orders"),
        where("sellerId", "==", user.uid)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);

      // 🔥 Calculate Earnings
      const total = ordersData.reduce(
        (sum, order) => sum + order.amount,
        0
      );
      setEarnings(total);
    };

    fetchData();
  }, [user]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Seller Dashboard</h1>

      <h2>Total Earnings: ₹{earnings}</h2>
      <h2>Total Orders: {orders.length}</h2>

      <hr />

      <h2>My Gigs</h2>
      {gigs.map((gig) => (
        <div key={gig.id} style={{ marginBottom: "10px" }}>
          {gig.title} - ₹{gig.price}
        </div>
      ))}

      <hr />

      <h2>Orders</h2>
      {orders.map((order) => (
        <div key={order.id}>
          Buyer: {order.buyerName} | ₹{order.amount} | {order.status}
        </div>
      ))}
    </div>
  );
}

export default SellerDashboard;