'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccess(true);
      toast.success('重置链接已发送到您的邮箱');
    } catch (err: any) {
      console.error('重置密码错误:', err);
      if (err.errors) {
        const errorCode = err.errors[0].code;
        switch (errorCode) {
          case 'form_identifier_not_found':
            setError('该邮箱地址未注册，请检查输入或先注册账户');
            break;
          case 'form_param_format_invalid':
            setError('邮箱格式不正确，请检查输入');
            break;
          case 'too_many_requests':
            setError('请求过于频繁，请稍后再试');
            break;
          default:
            setError(err.errors[0].message || '发送重置邮件失败，请重试');
        }
      } else {
        setError('网络错误，请稍后再试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleResend = async () => {
    if (!email || loading || !isLoaded || !signIn) return;
    
    setError('');
    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      toast.success('重置链接已重新发送');
    } catch (err: any) {
      console.error('重发邮件错误:', err);
      toast.error('重发失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                邮件已发送
              </CardTitle>
              <CardDescription>
                我们已向 <strong>{email}</strong> 发送了密码重置链接，请查收邮件并按照指示重置密码
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  没收到邮件？请检查垃圾邮件文件夹
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  重新发送
                </Button>
              </div>
              
              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-primary hover:underline"
                >
                  返回登录
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Link
              href="/auth/signin"
              className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4 w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回登录
            </Link>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              重置密码
            </CardTitle>
            <CardDescription>
              输入您的邮箱地址，我们将向您发送密码重置链接
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
                <Label htmlFor="email">邮箱地址</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? '发送中...' : '发送重置链接'}
              </Button>
            </form>

            <div className="text-center text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">记起密码了？ </span>
                <Link
                  href="/auth/signin"
                  className="text-primary hover:underline font-medium"
                >
                  返回登录
                </Link>
              </div>
              <div>
                <span className="text-muted-foreground">还没有账户？ </span>
                <Link
                  href="/auth/signup"
                  className="text-primary hover:underline font-medium"
                >
                  立即注册
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
