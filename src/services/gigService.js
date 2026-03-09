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
import { gigsWithPrice } from "../data/gigsData";
import { db } from "../firebase";

const FIRESTORE_IMAGE_LIMIT_BYTES = 850 * 1024;
const MAX_IMAGE_DIMENSION = 1200;

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Unable to process image."));
    reader.readAsDataURL(blob);
  });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read selected image."));
    };

    image.src = objectUrl;
  });
}

async function imageFileToGigDataUrl(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }

  const image = await loadImageFromFile(file);
  const longestEdge = Math.max(image.width, image.height);
  const scale = longestEdge > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestEdge : 1;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to process image.");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = 0.82;
  let blob = await canvasToBlob(canvas, quality);

  while (blob && blob.size > FIRESTORE_IMAGE_LIMIT_BYTES && quality > 0.48) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob) {
    throw new Error("Unable to process image.");
  }

  if (blob.size > FIRESTORE_IMAGE_LIMIT_BYTES) {
    throw new Error("Image is too large after optimization. Please use a smaller image.");
  }

  const dataUrl = await blobToDataUrl(blob);
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    throw new Error("Unable to process image.");
  }

  return dataUrl;
}

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

export async function createGig({ user, title, description, category, price, deliveryTime, imageFile, onUploadProgress }) {
  if (!user || user.role !== "seller") {
    throw new Error("Only sellers can create gigs.");
  }

  let imageUrls = [];
  if (imageFile) {
    if (typeof onUploadProgress === "function") onUploadProgress(15);
    const imageDataUrl = await imageFileToGigDataUrl(imageFile);
    if (typeof onUploadProgress === "function") onUploadProgress(90);
    imageUrls = [imageDataUrl];
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

  const created = await addDoc(collection(db, "gigs"), payload);
  if (typeof onUploadProgress === "function") onUploadProgress(100);
  return created;
}

export function subscribeSellerGigs(sellerId, onData, onError) {
  const q = query(collection(db, "gigs"), where("sellerId", "==", sellerId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docItem) => toGig({ id: docItem.id, ...docItem.data() }));
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
