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
import { doc, getDoc, setDoc } from "firebase/firestore";
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
}

interface AuthContextType {
  user: AuthUser | null;
  recipient: RecipientProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveRecipientProfile: (firstName: string, lastName: string, email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [recipient, setRecipient] = useState<RecipientProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Connect real Firebase state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const mappedUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || undefined
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

  return (
    <AuthContext.Provider value={{
      user,
      recipient,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logout,
      saveRecipientProfile
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
