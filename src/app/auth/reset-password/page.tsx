'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const passwordValidationRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    password: '',
    confirmPassword: '',
  });
  
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return '密码至少需要8个字符';
    }
    if (!passwordValidationRegex.test(password)) {
      return '密码必须包含大小写字母、数字和特殊字符';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    // 验证验证码
    if (!formData.code || formData.code.length < 6) {
      setError('请输入有效的验证码');
      setLoading(false);
      return;
    }

    // 验证密码
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: formData.code,
        password: formData.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setSuccess(true);
        toast.success('密码重置成功！');
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError('重置失败，请检查验证码和密码');
      }
    } catch (err: any) {
      console.error('重置密码错误:', err);
      if (err.errors) {
        const errorCode = err.errors[0].code;
        switch (errorCode) {
          case 'form_code_incorrect':
            setError('验证码错误，请检查邮件中的验证码');
            break;
          case 'form_password_pwned':
            setError('该密码过于简单，请选择更强的密码');
            break;
          case 'verification_expired':
            setError('验证码已过期，请重新申请密码重置');
            break;
          case 'session_exists':
            setError('您已登录，正在跳转...');
            router.push('/dashboard');
            break;
          default:
            setError(err.errors[0].message || '重置密码失败，请重试');
        }
      } else {
        setError('网络错误，请稍后再试');
      }
    } finally {
      setLoading(false);
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
                密码重置成功
              </CardTitle>
              <CardDescription>
                您的密码已成功重置，正在自动登录并跳转到仪表板...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
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
            <CardTitle className="text-2xl font-semibold tracking-tight">
              重置密码
            </CardTitle>
            <CardDescription>
              请输入您收到的验证码和新密码
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
                <Label htmlFor="code">验证码</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="请输入邮件中的验证码"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  请查看您的邮箱，输入收到的重置验证码
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">新密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入新密码"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
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
                <p className="text-xs text-muted-foreground">
                  密码必须至少8个字符，包含大小写字母、数字和特殊字符
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="请再次输入新密码"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? '重置中...' : '重置密码'}
              </Button>
            </form>

            <div className="text-center text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">没收到验证码？ </span>
                <Link
                  href="/auth/forgot-password"
                  className="text-primary hover:underline"
                >
                  重新发送
                </Link>
              </div>
              <div>
                <Link
                  href="/auth/signin"
                  className="text-primary hover:underline"
                >
                  返回登录
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
