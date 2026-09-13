"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  reload as reloadUser,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { setCookie, destroyCookie } from "nookies";

// Name of the cookie where we store the Firebase token
const FIREBASE_TOKEN_COOKIE = "firebaseToken";

type User = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Store Firebase token in HTTP-only cookie for server-side auth using an API endpoint
  const storeUserToken = async (firebaseUser: FirebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      console.log('[storeUserToken] Got token:', token);
      console.log('[storeUserToken] Firebase user:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        providerData: firebaseUser.providerData
      });
      // Call our server-side API to set the HTTP-only cookie
      const response = await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      console.log('[storeUserToken] /api/auth/set-cookie response:', response.status, response.statusText);
      if (!response.ok) {
        const text = await response.text();
        console.error('[storeUserToken] Error response body:', text);
        throw new Error('Failed to set auth cookie via API');
      }
      setCookie(null, 'clientToken', token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
    } catch (error) {
      console.error("Failed to store user token:", error);
    }
  };

  // Check for existing user session on mount and subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[onAuthStateChanged] Firebase user:', firebaseUser);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified
        });
        await storeUserToken(firebaseUser);
        // Sync user with database
        try {
          // Call API to sync user with database
          const body = {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: firebaseUser.displayName?.split(' ')[0] || firebaseUser.email?.split('@')[0] || 'Unknown',
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User'
          };
          console.log('[onAuthStateChanged] Syncing user with body:', body);
          const syncRes = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
            },
            body: JSON.stringify(body)
          });
          console.log('[onAuthStateChanged] /api/auth/sync-user response:', syncRes.status, syncRes.statusText);
          if (!syncRes.ok) {
            const text = await syncRes.text();
            console.error('[onAuthStateChanged] Error syncing user:', text);
          }
        } catch (error) {
          console.error("Failed to sync user with database:", error);
        }
      } else {
        setUser(null);
        destroyCookie(null, FIREBASE_TOKEN_COOKIE, { path: "/" });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Function to refresh the user data (useful after email verification)
  const refreshUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await reloadUser(currentUser);
        
        // Update state with fresh user data
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified
        });
        
        // Update token cookie with fresh JWT that includes updated claims
        await storeUserToken(currentUser);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Send email verification to the current user
  const sendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    try {
      await sendEmailVerification(currentUser);
      return;
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw error;
    }
  };

  // Login with Firebase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Attempt to sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Only redirect if login was successful and we have a user
      if (userCredential && userCredential.user) {
        // Token is handled by onAuthStateChanged
        router.push("/dashboard");
      } else {
        throw new Error('Login failed: No user returned');
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Only redirect if login was successful and we have a user
      if (userCredential && userCredential.user) {
        // Token is handled by onAuthStateChanged
        router.push("/dashboard");
      } else {
        throw new Error('Google login failed: No user returned');
      }
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with GitHub
  const loginWithGithub = async () => {
    setIsLoading(true);
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Only redirect if login was successful and we have a user
      if (userCredential && userCredential.user) {
        // Token is handled by onAuthStateChanged
        router.push("/dashboard");
      } else {
        throw new Error('GitHub login failed: No user returned');
      }
    } catch (error) {
      console.error("GitHub login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Firebase
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email immediately after successful registration
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        // --- Sync user to Supabase ---
        try {
          const idToken = await userCredential.user.getIdToken();
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken, firstName, lastName }),
          });
          if (!response.ok) {
            console.error('Failed to sync user to Supabase:', await response.text());
          }
        } catch (syncError) {
          console.error('Error syncing user to Supabase:', syncError);
        }
      }
      // Only redirect after sync attempt
      router.push("/email-verification");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout with Firebase
  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // Token is handled by onAuthStateChanged
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    loginWithGithub,
    register,
    logout,
    sendVerificationEmail,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
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