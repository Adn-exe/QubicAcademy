// ============================================================
// QuantumLearn AI — Authentication Context & Provider
// Supabase Auth with Google OAuth, Email/Password, and Session Management
// ============================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { autoMigrateLocalStorageToSupabase } from '../lib/db';
import { useProfileStore } from './profileStore';
import { useProgressStore } from './store';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadProgress = useProgressStore((s) => s.loadProgress);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Initial session restoration
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        // Run migration and reload stores with current user data
        autoMigrateLocalStorageToSupabase(currentSession.user.id).then(() => {
          loadProfile();
          loadProgress();
        });
      }
      setLoading(false);
    });

    // Listen for auth state transitions (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && newSession?.user) {
        await autoMigrateLocalStorageToSupabase(newSession.user.id);
        loadProfile();
        loadProgress();
      } else if (event === 'SIGNED_OUT') {
        loadProfile();
        loadProgress();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, loadProfile, loadProgress]);

  const signIn = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { error };
      }

      if (data?.session?.user) {
        setSession(data.session);
        setUser(data.session.user);
        await autoMigrateLocalStorageToSupabase(data.session.user.id);
        loadProfile();
        loadProgress();
      }

      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name || cleanEmail.split('@')[0],
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data?.session?.user) {
        setSession(data.session);
        setUser(data.session.user);
        await autoMigrateLocalStorageToSupabase(data.session.user.id);
        loadProfile();
        loadProgress();
      }

      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const purgeLocalSessionCache = () => {
    try {
      localStorage.removeItem('quantumlearn:profile');
      localStorage.removeItem('quantumlearn:problems_progress');
      localStorage.removeItem('quantumlearn:active_problem');
      localStorage.removeItem('quantumlearn:announcements_read');
    } catch {
      // ignore storage access errors
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      purgeLocalSessionCache();
      loadProfile();
      loadProgress();
      return { error };
    } catch (err) {
      setUser(null);
      setSession(null);
      purgeLocalSessionCache();
      loadProfile();
      loadProgress();
      return { error: err as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
