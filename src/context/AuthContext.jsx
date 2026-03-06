import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Load profile (name, role, description, etc) from Firestore users collection.
      try {
        const userDoc = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userDoc);
        const profile = snap.exists() ? snap.data() : {};

        setUser({
          ...currentUser,
          name: profile.name || currentUser.displayName || "User",
          role: profile.role || "buyer",
          profileImage: profile.profileImage || "",
          description: profile.description || "",
          createdAt: profile.createdAt || null,
        });
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setUser({ ...currentUser, role: "buyer", name: currentUser.displayName || "User" });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
