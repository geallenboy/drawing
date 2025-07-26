/**
 * Provider认证
 */
'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AuthUser } from '@/lib/auth';

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuth();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}