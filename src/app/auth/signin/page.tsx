'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Github, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // 检查URL参数中的错误
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const details = searchParams.get('details');
    
    if (errorParam === 'sso_failed') {
      const errorMessage = details 
        ? `第三方登录失败: ${details}` 
        : '第三方登录失败，请重试或使用邮箱密码登录';
      setError(errorMessage);
    } else if (errorParam === 'sso_timeout') {
      setError('第三方登录超时，请重试或使用邮箱密码登录');
    }
  }, [searchParams]);

  // 检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success('登录成功！');
        router.push('/dashboard');
      } else if (result.status === 'needs_first_factor') {
        // 需要第一个验证因子，通常是密码
        setError('需要完成身份验证');
      } else if (result.status === 'needs_second_factor') {
        // 需要二次验证（如 2FA）
        setError('需要二次验证');
      } else {
        setError('登录失败，请检查您的邮箱和密码');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      if (err.errors) {
        const errorCode = err.errors[0].code;
        switch (errorCode) {
          case 'form_identifier_not_found':
            setError('邮箱地址未找到，请检查输入或先注册账户');
            break;
          case 'form_password_incorrect':
            setError('密码错误，请重新输入');
            break;
          case 'too_many_requests':
            setError('登录尝试次数过多，请稍后再试');
            break;
          case 'session_exists':
            setError('您已登录，正在跳转...');
            router.push('/dashboard');
            break;
          default:
            setError(err.errors[0].message || '登录失败，请重试');
        }
      } else {
        setError('网络错误，请检查您的网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;
    
    setOauthLoading(provider);
    setError('');

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${window.location.origin}/auth/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/dashboard`,
      });
    } catch (err: any) {
      console.error('OAuth 错误:', err);
      const providerName = provider === 'oauth_google' ? 'Google' : 'GitHub';
      setError(`${providerName} 登录失败，请重试`);
      toast.error(`${providerName} 登录失败`);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError('');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              登录账户
            </CardTitle>
            <CardDescription className="text-center">
              输入您的邮箱和密码来登录您的账户
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入您的密码"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  忘记密码？
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或者使用第三方登录
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleOAuth('oauth_google')}
                disabled={oauthLoading === 'oauth_google' || loading}
              >
                {oauthLoading === 'oauth_google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('oauth_github')}
                disabled={oauthLoading === 'oauth_github' || loading}
              >
                {oauthLoading === 'oauth_github' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">还没有账户？ </span>
              <Link
                href="/auth/signup"
                className="text-primary hover:underline font-medium"
              >
                立即注册
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
