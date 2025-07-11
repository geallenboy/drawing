'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { syncUserAction } from '@/actions/user/user-actions';
import { toast } from 'sonner';

// 定义同步结果类型
interface SyncResult {
  success: boolean;
  user?: any;
  message?: string;
  isNew?: boolean;
  error?: string;
}

/**
 * 用户同步组件
 * 在用户登录后自动同步用户信息到数据库
 * 
 * 功能：
 * - 检测用户登录状态
 * - 自动同步用户信息到数据库
 * - 显示同步状态和错误信息
 * - 防止重复同步
 */
export function UserSync() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);

  useEffect(() => {
    // 如果auth还没加载完成，或者已经尝试过同步，则不执行
    if (!isLoaded || hasAttemptedSync) return;
    
    // 如果用户已登录且有userId
    if (isSignedIn && userId) {
      setSyncStatus('syncing');
      setHasAttemptedSync(true);
      
      console.log('开始自动同步用户信息到数据库...');
      
      // 异步同步用户信息
      syncUserAction()
        .then((result: SyncResult) => {
        if (result.success) {
            setSyncStatus('success');
            console.log('✅ 用户信息同步成功:', result.message);
            
            // 如果是新用户，显示欢迎消息
            if (result.isNew) {
              toast.success('欢迎！您的账户已成功创建并同步', {
                description: '您现在可以开始使用所有功能了',
                duration: 4000,
              });
            } else {
              // 现有用户，简单记录日志即可
              console.log('用户信息已更新');
            }
        } else {
            setSyncStatus('error');
            console.error('❌ 用户信息同步失败:', result.error);
            
            // 显示错误提示，但不阻塞用户使用
            toast.error('用户信息同步失败', {
              description: '这不会影响您的使用，系统会稍后重试',
              duration: 3000,
            });
        }
        })
        .catch((error: Error) => {
          setSyncStatus('error');
          console.error('❌ 用户同步过程中发生错误:', error);
          
          toast.error('同步过程中出现问题', {
            description: '请检查网络连接，系统会稍后重试',
            duration: 3000,
          });
      });
    }
  }, [isLoaded, isSignedIn, userId, hasAttemptedSync]);

  // 当用户登出时重置状态
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setSyncStatus('idle');
      setHasAttemptedSync(false);
    }
  }, [isLoaded, isSignedIn]);

  // 这是一个隐形组件，不渲染任何内容
  // 但在开发环境中可以通过console查看同步状态
  if (process.env.NODE_ENV === 'development') {
    console.log('UserSync状态:', { 
      isSignedIn, 
      userId, 
      isLoaded, 
      syncStatus, 
      hasAttemptedSync 
    });
  }

  return null;
}
