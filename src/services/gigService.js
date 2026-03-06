import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { gigsWithPrice } from "../data/gigsData";
import { db, storage } from "../firebase";

function toGig(record) {
  return {
    id: record.id,
    title: record.title || "Untitled Gig",
    description: record.description || "",
    category: record.category || "General",
    deliveryTime: record.deliveryTime || "3 days",
    price: Number(record.price || record.packages?.basic?.price || 0),
    rating: Number(record.rating || 4.8),
    reviews: Number(record.reviews || 0),
    sellerId: record.sellerId || "",
    sellerName: record.sellerName || "Top Rated Seller",
    seller: record.sellerName || "Top Rated Seller",
    image: record.image || record.imageUrls?.[0] || "/website.jpg",
    imageUrls: record.imageUrls || [],
    createdAt: record.createdAt || null,
    packages: record.packages || {
      basic: { name: "Basic", price: Number(record.price || 0), delivery: record.deliveryTime || "3 days", revisions: "1" },
    },
  };
}

function fallbackGigs() {
  return gigsWithPrice.map((gig) =>
    toGig({
      ...gig,
      id: String(gig.id),
      sellerId: gig.sellerId || `seller-${gig.id}`,
      sellerName: gig.seller || "Top Rated Seller",
    })
  );
}

export async function getMarketplaceGigs() {
  const snapshot = await getDocs(query(collection(db, "gigs"), orderBy("createdAt", "desc")));
  const firestoreGigs = snapshot.docs.map((docItem) => toGig({ id: docItem.id, ...docItem.data() }));
  const defaults = fallbackGigs();

  // Show both Firestore gigs and default demo gigs together.
  // Firestore gigs appear first; duplicates are removed by id.
  const merged = [...firestoreGigs, ...defaults];
  const uniqueById = new Map();
  merged.forEach((gig) => {
    if (!uniqueById.has(String(gig.id))) {
      uniqueById.set(String(gig.id), gig);
    }
  });

  return [...uniqueById.values()];
}

export async function getGigById(id) {
  const gigDoc = await getDoc(doc(db, "gigs", id));

  if (gigDoc.exists()) {
    return toGig({ id: gigDoc.id, ...gigDoc.data() });
  }

  return fallbackGigs().find((gig) => gig.id === String(id)) || null;
}

export async function createGig({ user, title, description, category, price, deliveryTime, imageFile }) {
  if (!user || user.role !== "seller") {
    throw new Error("Only sellers can create gigs.");
  }

  let imageUrls = [];
  if (imageFile) {
    const storageRef = ref(storage, `gigs/${user.uid}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    imageUrls = [downloadURL];
  }

  const payload = {
    sellerId: user.uid,
    sellerName: user.name || user.email || "Seller",
    title,
    description,
    category,
    price: Number(price),
    deliveryTime,
    rating: 0,
    reviews: 0,
    imageUrls,
    image: imageUrls[0] || "/website.jpg",
    createdAt: serverTimestamp(),
  };

  return addDoc(collection(db, "gigs"), payload);
}

export function subscribeSellerGigs(sellerId, onData, onError) {
  const q = query(
    collection(db, "gigs"),
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((docItem) => toGig({ id: docItem.id, ...docItem.data() })));
    },
    onError
  );
}

export async function removeGig(gigId, user) {
  const gigRef = doc(db, "gigs", gigId);
  const gigSnapshot = await getDoc(gigRef);

  if (!gigSnapshot.exists()) {
    throw new Error("Gig not found");
  }

  const gigData = gigSnapshot.data();
  if (gigData.sellerId !== user?.uid) {
    throw new Error("You can only delete your own gigs.");
  }

  await deleteDoc(gigRef);
}

export function filterGigs(gigs, { search = "", category = "", minPrice = 0, maxPrice = Infinity }) {
  const searchValue = search.trim().toLowerCase();
  const max = Number.isFinite(maxPrice) ? maxPrice : Infinity;

  return gigs.filter((gig) => {
    const matchesSearch = searchValue
      ? gig.title.toLowerCase().includes(searchValue) || gig.description.toLowerCase().includes(searchValue)
      : true;
    const matchesCategory = category ? gig.category === category : true;
    const matchesPrice = gig.price >= minPrice && gig.price <= max;

    return matchesSearch && matchesCategory && matchesPrice;
  });
}

export function getGigCategories(gigs = []) {
  return [...new Set(gigs.map((gig) => gig.category))];
}
