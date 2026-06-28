"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { auth, db, googleProvider } from "@/utils/firebase";

export interface RecipientProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin?: boolean;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  recipient: RecipientProfile | null;
  loading: boolean;
  maintenanceActive: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveRecipientProfile: (firstName: string, lastName: string, email: string) => Promise<void>;
  updateSenderName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [recipient, setRecipient] = useState<RecipientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // Listen to system config for maintenance mode
  useEffect(() => {
    const configDocRef = doc(db, "system_config", "maintenance");
    const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setMaintenanceActive(!!docSnap.data().enabled);
      } else {
        setMaintenanceActive(false);
      }
    }, (err) => {
      console.warn("Failed to listen to system config maintenance:", err);
    });
    return () => unsubscribe();
  }, []);

  // Redirect if maintenance mode is active and user is not an admin
  useEffect(() => {
    if (maintenanceActive && (!user || !user.isAdmin)) {
      const isInteractiveRoute = 
        pathname.startsWith("/login") || 
        pathname.startsWith("/create") || 
        pathname.startsWith("/dashboard") || 
        pathname.startsWith("/profile") || 
        pathname.startsWith("/recipient-setup");
      
      if (isInteractiveRoute) {
        router.push("/coming-soon");
      }
    }
  }, [maintenanceActive, user, pathname, router]);

  // Sync recipient profile from database
  const fetchRecipientProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data()?.recipient) {
        setRecipient(docSnap.data().recipient as RecipientProfile);
      } else {
        setRecipient(null);
      }
    } catch (err) {
      console.error("Failed to fetch Firestore recipient profile:", err);
    }
  };

  // Sync user profile in Firestore and detect admin roles
  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let isAdmin = false;
      let role = "user";
      let displayName = firebaseUser.displayName || "";
      
      const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
      const adminEmails = adminEmailsEnv.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
      const userEmail = (firebaseUser.email || "").toLowerCase();
      
      // Bootstrap admin checking via environment variables or special default admin email
      if (adminEmails.includes(userEmail) || userEmail === "admin@everafterletters.xyz" || userEmail === "elgen@example.com") {
        isAdmin = true;
        role = "admin";
      }
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.role === "admin" || data.isAdmin === true) {
          isAdmin = true;
          role = "admin";
        }
        
        if (data.displayName && !displayName) {
          displayName = data.displayName;
        }
        
        await setDoc(userDocRef, {
          email: firebaseUser.email || "",
          displayName: displayName || firebaseUser.email?.split("@")[0] || "",
          lastActive: Date.now(),
          role: role,
          isAdmin: isAdmin
        }, { merge: true });
      } else {
        displayName = displayName || firebaseUser.email?.split("@")[0] || "";
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: displayName,
          createdAt: Date.now(),
          lastActive: Date.now(),
          role: role,
          isAdmin: isAdmin,
          hasRecipientProfile: false
        });
      }
      
      return { isAdmin, role, displayName };
    } catch (err) {
      console.error("Failed to sync Firestore user profile:", err);
      return { isAdmin: false, role: "user", displayName: firebaseUser.displayName || "" };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const { isAdmin, role, displayName } = await syncUserProfile(firebaseUser);
        const mappedUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: displayName || undefined,
          isAdmin,
          role
        };
        setUser(mappedUser);
        await fetchRecipientProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setRecipient(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const saveRecipientProfile = async (firstName: string, lastName: string, email: string) => {
    const currentUid = user?.uid;
    if (!currentUid) throw new Error("No user authenticated.");

    const profile: RecipientProfile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim()
    };

    const userDocRef = doc(db, "users", currentUid);
    await setDoc(userDocRef, {
      uid: currentUid,
      email: user?.email,
      recipient: profile,
      hasRecipientProfile: true,
      updatedAt: Date.now()
    }, { merge: true });
    setRecipient(profile);
  };

  const updateSenderName = async (name: string) => {
    const currentUid = user?.uid;
    if (!currentUid) throw new Error("No user authenticated.");

    const trimmedName = name.trim();
    if (auth.currentUser) {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(auth.currentUser, { displayName: trimmedName });
    }

    const userDocRef = doc(db, "users", currentUid);
    await setDoc(userDocRef, {
      displayName: trimmedName,
      updatedAt: Date.now()
    }, { merge: true });

    setUser(prev => prev ? { ...prev, displayName: trimmedName } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      recipient,
      loading,
      maintenanceActive,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logout,
      saveRecipientProfile,
      updateSenderName
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
