import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useSimpleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        console.log('✅ User signed in:', user.email);
      } else {
        console.log('❌ User signed out');
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Attempting to sign in with:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful:', userCredential.user.email);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      const errorMessage = error.message || 'Failed to sign in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Attempting to sign up with:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign up successful:', userCredential.user.email);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      const errorMessage = error.message || 'Failed to create account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      const errorMessage = error.message || 'Failed to sign out';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    clearError: () => setError(null)
  };
}
