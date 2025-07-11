'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SSOCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // 设置一个超时器，如果10秒内没有完成登录就认为失败
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && userId) {
        // 登录成功，延迟跳转确保状态稳定
        console.log('OAuth登录成功，用户ID:', userId);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else if (timeoutReached) {
        // 超时未完成登录，认为失败
        console.log('OAuth登录超时');
        router.push('/auth/signin?error=sso_timeout');
      }
    }
  }, [isLoaded, isSignedIn, userId, timeoutReached, router]);

  // 检查URL参数中是否有错误信息
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      console.log('OAuth回调错误:', error);
      setTimeout(() => {
        router.push(`/auth/signin?error=sso_failed&details=${error}`);
      }, 2000);
    }
  }, [searchParams, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              正在处理登录...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              请稍候，我们正在验证您的身份
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-semibold">
              登录成功！
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              欢迎回来，正在跳转到仪表板...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold">
            登录失败
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            登录过程中出现问题，正在返回登录页面...
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
