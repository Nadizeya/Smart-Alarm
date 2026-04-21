import { auth } from "@/config/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  /** @deprecated Firebase manages session automatically. This is a no-op kept for API compatibility. */
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth session from AsyncStorage persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /** No-op — kept so existing screens that call checkAuth() don't break. */
  const checkAuth = async () => {};

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      return false;
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error("Firebase signUp error:", error);
      // Convert Firebase error codes to readable messages
      let message = "An unexpected error occurred. Please try again.";
      if (error?.code === "auth/email-already-in-use") {
        message = "This email is already registered. Please log in instead.";
      } else if (error?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error?.code === "auth/weak-password") {
        message = "Password is too weak. Use at least 6 characters.";
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        isLoading,
        user,
        login,
        signUp,
        logout,
        checkAuth,
      }}
    >
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
