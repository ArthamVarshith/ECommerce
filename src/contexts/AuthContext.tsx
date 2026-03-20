import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { auth } from "../integrations/firebase/client";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from "firebase/auth";
import type { UserRole } from "@/types/product";
import {
  createUserProfile,
  getUserProfile,
  updateLastLogin,
} from "@/services/firebase/userService";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  /**
   * Extracts the role from the user's ID token custom claims.
   */
  const extractRole = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setRole(null);
      return;
    }

    try {
      const tokenResult = await firebaseUser.getIdTokenResult();
      const claimedRole = tokenResult.claims.role as UserRole | undefined;
      setRole(claimedRole ?? "customer");
    } catch {
      setRole("customer");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await extractRole(firebaseUser);

      // Auto-create Firestore profile if it doesn't exist
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            await createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
            });
          }
        } catch (err) {
          // Silently ignore — profile sync is a best-effort operation
        }
      }

      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [extractRole]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: fullName,
      });

      // Create Firestore user profile
      try {
        await createUserProfile(auth.currentUser.uid, {
          email,
          displayName: fullName,
        });
      } catch (err) {
        console.warn("[Auth] Failed to create user profile:", err);
      }
    }

    return userCredential;
  };

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Ensure a Firestore user profile exists (auto-create if missing)
    try {
      const existingProfile = await getUserProfile(result.user.uid);
      if (!existingProfile) {
        await createUserProfile(result.user.uid, {
          email: result.user.email ?? email,
          displayName: result.user.displayName ?? email.split("@")[0],
        });
      } else {
        await updateLastLogin(result.user.uid);
      }
    } catch (err) {
      console.warn("[Auth] Failed to sync user profile:", err);
    }

    return result;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  /**
   * Force-refreshes the user's ID token to pick up updated custom claims.
   * Call this after an admin changes a user's role.
   */
  const refreshClaims = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      await extractRole(auth.currentUser);
    }
  }, [extractRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin: role === "admin",
        loading,
        initialized,
        signUp,
        signIn,
        signOut,
        refreshClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);