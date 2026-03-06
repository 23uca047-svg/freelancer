import { useMemo, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";

function GigDelivery({ order, currentUser, onOrderAction }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isSeller = useMemo(
    () => currentUser?.uid && order?.sellerId && currentUser.uid === order.sellerId,
    [currentUser, order]
  );

  const isBuyer = useMemo(
    () => currentUser?.uid && order?.buyerId && currentUser.uid === order.buyerId,
    [currentUser, order]
  );

  const sellerCanDeliver = isSeller && ["pending", "in-progress"].includes(order.status);
  const buyerCanApprove = isBuyer && order.status === "delivered";

  const uploadDelivery = async () => {
    if (!file) {
      alert("Choose a ZIP or PDF file first.");
      return;
    }

    const validTypes = ["application/zip", "application/pdf", "application/x-zip-compressed"];
    if (!validTypes.includes(file.type) && !/\.(zip|pdf)$/i.test(file.name)) {
      alert("Only ZIP or PDF files are allowed.");
      return;
    }

    try {
      setUploading(true);
      const storageRef = ref(storage, `deliveries/${order.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const deliveryURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "orders", order.id), {
        status: "delivered",
        deliveryURL,
        deliveryFileName: file.name,
        deliveredAt: serverTimestamp(),
      });

      setFile(null);
      if (onOrderAction) onOrderAction("delivered");
      alert("Delivery uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload delivery", error);
      alert("Failed to upload delivery file.");
    } finally {
      setUploading(false);
    }
  };

  const approveDelivery = async () => {
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      if (onOrderAction) onOrderAction("completed");
    } catch (error) {
      console.error("Failed to approve delivery", error);
      alert("Unable to approve delivery.");
    }
  };

  const requestRevision = async () => {
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "in-progress",
        revisionRequestedAt: serverTimestamp(),
      });
      if (onOrderAction) onOrderAction("revision-requested");
    } catch (error) {
      console.error("Failed to request revision", error);
      alert("Unable to request revision.");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Delivery</h3>

      {order.deliveryURL ? (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p>
            Delivered file: <strong>{order.deliveryFileName || "File"}</strong>
          </p>
          <a
            href={order.deliveryURL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Download Delivery
          </a>
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-600">No delivery file uploaded yet.</p>
      )}

      {sellerCanDeliver ? (
        <div className="mt-4 space-y-2">
          <input
            type="file"
            accept=".zip,.pdf,application/zip,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-slate-300 p-2 text-sm"
          />
          <button
            type="button"
            onClick={uploadDelivery}
            disabled={uploading}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Delivery"}
          </button>
        </div>
      ) : null}

      {buyerCanApprove ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={approveDelivery}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Approve Delivery
          </button>
          <button
            type="button"
            onClick={requestRevision}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Request Revision
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default GigDelivery;
