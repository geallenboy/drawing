/**
 * 简化的认证Hook
 * 提供统一的用户状态管理
 */
'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { AuthUser } from '@/lib/auth';

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isSignedIn: boolean;
  error: string | null;
};

export function useAuth(): AuthState {
  const { isSignedIn, userId, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isSignedIn: false,
    error: null,
  });

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !userId || !clerkUser) {
      setAuthState({
        user: null,
        isLoading: false,
        isSignedIn: false,
        error: null,
      });
      return;
    }

    // 同步用户数据到本地状态
    const syncUser = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        // 调用服务端API同步用户
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('同步用户失败');
        }

        const result = await response.json();

        if (result.success && result.user) {
          setAuthState({
            user: result.user,
            isLoading: false,
            isSignedIn: true,
            error: null,
          });
        } else {
          throw new Error(result.error || '同步用户失败');
        }
      } catch (error) {
        console.error('用户同步失败:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isSignedIn: true, // Clerk认证成功，但数据库同步失败
          error: error instanceof Error ? error.message : '同步失败',
        });
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, userId, clerkUser]);

  return authState;
}