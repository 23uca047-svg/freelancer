import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export async function ensureConversation(orderId, buyerId, sellerId) {
  const conversationRef = doc(db, "conversations", orderId);
  const snapshot = await getDoc(conversationRef);

  if (!snapshot.exists()) {
    await setDoc(conversationRef, {
      orderId,
      participants: [buyerId, sellerId],
      createdAt: serverTimestamp(),
    });
  }
}

export async function sendMessage(orderId, payload) {
  await addDoc(collection(db, "conversations", orderId, "messages"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export function subscribeMessages(orderId, onData) {
  const msgsQuery = query(
    collection(db, "conversations", orderId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(msgsQuery, (snapshot) => {
    onData(snapshot.docs.map((messageDoc) => ({ id: messageDoc.id, ...messageDoc.data() })));
  });
}

export function subscribeConversations(userId, onData) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(q, (snapshot) => {
    onData(snapshot.docs.map((conversationDoc) => ({ id: conversationDoc.id, ...conversationDoc.data() })));
  });
}
