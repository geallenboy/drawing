'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSignUp, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Github, Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const passwordValidationRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [verificationMode, setVerificationMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  // 检查用户是否已登录，如果已登录则重定向
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

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

    // 验证表单
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('请输入完整的姓名');
      setLoading(false);
      return;
    }

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

    if (!formData.agreeToTerms) {
      setError('请同意服务条款和隐私政策');
      setLoading(false);
      return;
    }

    try {
      await signUp.create({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        emailAddress: formData.email,
        password: formData.password,
      });

      // 发送邮箱验证码
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerificationMode(true);
      toast.success('验证码已发送到您的邮箱');
    } catch (err: any) {
      console.error('注册错误:', err);
      if (err.errors) {
        const errorCode = err.errors[0].code;
        switch (errorCode) {
          case 'form_identifier_exists':
            setError('该邮箱已被注册，请使用其他邮箱或直接登录');
            break;
          case 'form_password_pwned':
            setError('该密码过于简单，请选择更强的密码');
            break;
          case 'form_param_format_invalid':
            setError('邮箱格式不正确，请检查输入');
            break;
          case 'form_password_length_too_short':
            setError('密码长度不足，至少需要8个字符');
            break;
          default:
            setError(err.errors[0].message || '注册失败，请重试');
        }
      } else {
        setError('网络错误，请检查您的网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success('注册成功，欢迎使用！');
        router.push('/dashboard');
      } else {
        setError('验证失败，请检查验证码是否正确');
      }
    } catch (err: any) {
      console.error('验证错误:', err);
      if (err.errors) {
        const errorCode = err.errors[0].code;
        switch (errorCode) {
          case 'form_code_incorrect':
            setError('验证码错误，请重新输入');
            break;
          case 'verification_expired':
            setError('验证码已过期，请重新发送');
            break;
          default:
            setError(err.errors[0].message || '验证失败，请重试');
        }
      } else {
        setError('网络错误，请稍后再试');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.success('验证码已重新发送');
      setError('');
    } catch (err: any) {
      console.error('重发验证码错误:', err);
      toast.error('重发验证码失败，请稍后再试');
    }
  };

  const handleOAuth = async (provider: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;
    
    setOauthLoading(provider);
    setError('');

    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${window.location.origin}/auth/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/dashboard`,
      });
    } catch (err: any) {
      console.error('OAuth 错误:', err);
      const providerName = provider === 'oauth_google' ? 'Google' : 'GitHub';
      setError(`${providerName} 注册失败，请重试`);
      toast.error(`${providerName} 注册失败`);
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

  const handleTermsChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreeToTerms: checked
    }));
    if (error) setError('');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 邮箱验证模式
  if (verificationMode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                验证您的邮箱
              </CardTitle>
              <CardDescription>
                我们已向 <strong>{formData.email}</strong> 发送了6位验证码，请查收邮件并输入验证码
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入6位验证码"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    disabled={loading}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? '验证中...' : '验证邮箱'}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  没收到验证码？请检查垃圾邮件文件夹
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-primary"
                  onClick={resendVerificationCode}
                  disabled={loading}
                >
                  重新发送验证码
                </Button>
                <div>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => setVerificationMode(false)}
                    disabled={loading}
                  >
                    返回修改注册信息
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 注册表单模式
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-center">
              创建账户
            </CardTitle>
            <CardDescription className="text-center">
              输入您的信息来创建新账户
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">名字 *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="名字"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">姓氏 *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="姓氏"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱 *</Label>
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
                <Label htmlFor="password">密码 *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
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
                <Label htmlFor="confirmPassword">确认密码 *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="请再次输入密码"
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

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={handleTermsChange}
                  disabled={loading}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  我已阅读并同意{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    服务条款
                  </Link>{' '}
                  和{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    隐私政策
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? '注册中...' : '创建账户'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或者使用第三方注册
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
              <span className="text-muted-foreground">已有账户？ </span>
              <Link
                href="/auth/signin"
                className="text-primary hover:underline font-medium"
              >
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
