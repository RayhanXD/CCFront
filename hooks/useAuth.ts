import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged as onFirebaseAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  User,
  AuthError as FirebaseAuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthError = FirebaseAuthError;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      setLoading(true);
      setError(null);
      await firebaseUpdateProfile(auth.currentUser, updates);
      // Update local user state
      setUser({ ...auth.currentUser, ...updates } as User);
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update email
  const updateUserEmail = async (newEmail: string) => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      setLoading(true);
      setError(null);
      await firebaseUpdateEmail(auth.currentUser, newEmail);
      // Update local user state
      setUser({ ...auth.currentUser, email: newEmail } as User);
    } catch (error: any) {
      console.error('Update email error:', error);
      setError(error.message || 'Failed to update email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    try {
      setLoading(true);
      setError(null);
      await firebaseUpdatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      console.error('Update password error:', error);
      setError(error.message || 'Failed to update password');
      throw error;
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
    signOut: handleSignOut,
    resetPassword,
    updateProfile: updateUserProfile,
    updateEmail: updateUserEmail,
    updatePassword: updateUserPassword,
  };
}

export default useAuth;
