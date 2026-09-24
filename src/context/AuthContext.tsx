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

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'guest' | 'student' | 'faculty' | 'admin';
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  loginDemo: (role: 'student' | 'faculty' | 'admin') => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('secmap_demo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const role = fbUser.email?.includes('admin') ? 'admin' : 'student';
        const mappedUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          photoURL: fbUser.photoURL,
          role,
        };
        setUser(mappedUser);
        localStorage.removeItem('secmap_demo_user');
      } else {
        const saved = localStorage.getItem('secmap_demo_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
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
      await signInWithEmailAndPassword(auth, email, pass);
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
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error('Firebase Email Sign-Up error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = (role: 'student' | 'faculty' | 'admin') => {
    const demoUser: AppUser = {
      uid: `demo_${role}_${Date.now()}`,
      email: `${role}@secmap.edu`,
      displayName: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
      photoURL: null,
      role,
    };
    setUser(demoUser);
    localStorage.setItem('secmap_demo_user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
    } finally {
      localStorage.removeItem('secmap_demo_user');
      setUser(null);
      setFirebaseUser(null);
    }
  };

  const isAdmin = user?.role === 'admin' || !!user?.email?.includes('admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginDemo,
        logout,
        isAdmin,
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
