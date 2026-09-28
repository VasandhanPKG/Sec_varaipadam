import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const ADMIN_MASTER_PASSWORD = 'admin@0718';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'admin' | 'faculty';
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  loginAdmin: (password: string, emailOrName?: string) => boolean;
  loginStudent: (displayName?: string, email?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'secmap_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Firebase user login defaults to student unless explicitly stored as admin
        const saved = localStorage.getItem(STORAGE_USER_KEY);
        let currentRole: 'student' | 'admin' = 'student';
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.role === 'admin') currentRole = 'admin';
          } catch {}
        }

        const mappedUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
          photoURL: fbUser.photoURL,
          role: currentRole,
        };
        setUser(mappedUser);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(mappedUser));
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const studentUser: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || 'Student',
        photoURL: res.user.photoURL,
        role: 'student',
      };
      setUser(studentUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(studentUser));
    } catch (err) {
      console.error('Firebase Google Sign-In error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const studentUser: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0] || 'Student',
        photoURL: res.user.photoURL,
        role: 'student',
      };
      setUser(studentUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(studentUser));
    } catch (err) {
      console.error('Firebase Email Sign-In error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const studentUser: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0] || 'Student',
        photoURL: res.user.photoURL,
        role: 'student',
      };
      setUser(studentUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(studentUser));
    } catch (err) {
      console.error('Firebase Email Sign-Up error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Admin Login with mandatory password check: admin@0718
  const loginAdmin = (password: string, emailOrName?: string): boolean => {
    if (password !== ADMIN_MASTER_PASSWORD) {
      return false;
    }

    const adminUser: AppUser = {
      uid: `admin_${Date.now()}`,
      email: emailOrName?.includes('@') ? emailOrName : 'admin@secmap.edu',
      displayName: emailOrName && !emailOrName.includes('@') ? emailOrName : 'Administrator',
      photoURL: null,
      role: 'admin',
    };

    setUser(adminUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(adminUser));
    return true;
  };

  // Student Fast / Standard Login
  const loginStudent = (displayName?: string, email?: string) => {
    const studentUser: AppUser = {
      uid: `student_${Date.now()}`,
      email: email || 'student@secmap.edu',
      displayName: displayName || 'Student User',
      photoURL: null,
      role: 'student',
    };
    setUser(studentUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(studentUser));
  };

  const logout = async () => {
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Sign out notice:', e);
    } finally {
      localStorage.removeItem(STORAGE_USER_KEY);
      setUser(null);
      setFirebaseUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAdmin,
        loginStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
