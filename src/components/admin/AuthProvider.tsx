"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthChanged, signOut as firebaseSignOut } from "@/lib/firebase/auth";
import { getUserById } from "@/lib/firebase/services/users";
import { UserSerialized } from "@/types/user";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserSerialized | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserSerialized | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProfile = await getUserById(currentUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
