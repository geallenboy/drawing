'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * OAuth调试页面
 * 帮助用户诊断和解决第三方登录问题
 */
export default function OAuthDebugPage() {
  const [checks, setChecks] = useState({
    clerkKeys: false,
    redirectUrls: false,
    networkAccess: false,
    localStorage: false,
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 检查环境配置
  const runDiagnostics = async () => {
    setIsChecking(true);
    setErrors([]);
    const newChecks = { ...checks };
    const newErrors: string[] = [];

    // 检查Clerk密钥
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (publishableKey && publishableKey.startsWith('pk_')) {
      newChecks.clerkKeys = true;
    } else {
      newErrors.push('Clerk Publishable Key未正确配置');
    }

    // 检查重定向URL配置
    const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
    const afterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
    if (signInUrl === '/auth/signin' && afterSignInUrl === '/dashboard') {
      newChecks.redirectUrls = true;
    } else {
      newErrors.push('重定向URL配置不正确');
    }

    // 检查本地存储
    try {
      localStorage.setItem('oauth-test', 'test');
      localStorage.removeItem('oauth-test');
      newChecks.localStorage = true;
    } catch (e) {
      newErrors.push('本地存储不可用，可能影响认证状态');
    }

    // 检查网络访问
    try {
      const response = await fetch('https://clerk.com', { mode: 'no-cors' });
      newChecks.networkAccess = true;
    } catch (e) {
      newErrors.push('无法访问Clerk服务，请检查网络连接');
    }

    setChecks(newChecks);
    setErrors(newErrors);
    setIsChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const clerkDomain = 'eternal-squid-90.clerk.accounts.dev';
  const callbackUrl = `https://${clerkDomain}/v1/oauth_callback`;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OAuth第三方登录调试</h1>
        <p className="text-muted-foreground">
          诊断和解决Google、GitHub登录问题
        </p>
      </div>

      {/* 系统检查 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>系统环境检查</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runDiagnostics}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  检查中
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新检查
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            检查基础配置是否正确
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {checks.clerkKeys ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Clerk密钥配置</span>
              <Badge variant={checks.clerkKeys ? "secondary" : "destructive"}>
                {checks.clerkKeys ? "正常" : "错误"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {checks.redirectUrls ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>重定向URL配置</span>
              <Badge variant={checks.redirectUrls ? "secondary" : "destructive"}>
                {checks.redirectUrls ? "正常" : "错误"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {checks.networkAccess ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>网络连接</span>
              <Badge variant={checks.networkAccess ? "secondary" : "destructive"}>
                {checks.networkAccess ? "正常" : "错误"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {checks.localStorage ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>本地存储</span>
              <Badge variant={checks.localStorage ? "secondary" : "destructive"}>
                {checks.localStorage ? "正常" : "错误"}
              </Badge>
            </div>
          </div>
          
          {errors.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                发现以下问题：
                <ul className="list-disc list-inside mt-2">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 配置信息 */}
      <Card>
        <CardHeader>
          <CardTitle>重要配置信息</CardTitle>
          <CardDescription>
            以下信息需要在OAuth应用中正确配置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Clerk回调URL（重要！）</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm break-all">
                  {callbackUrl}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(callbackUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                这个URL必须在Google Cloud Console和GitHub OAuth App中设置为回调URL
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">开发环境域名</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                  http://localhost:3000
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard('http://localhost:3000')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Clerk实例域名</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                  https://{clerkDomain}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(`https://${clerkDomain}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置步骤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Google OAuth配置
              <Badge variant="outline">需要配置</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p><strong>1. 访问Google Cloud Console</strong></p>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
              >
                打开Google Cloud Console
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              
              <p><strong>2. 启用所需API</strong></p>
              <ul className="list-disc list-inside text-muted-foreground ml-2">
                <li>Google+ API 或 People API</li>
                <li>Google Identity API</li>
              </ul>
              
              <p><strong>3. 创建OAuth 2.0客户端</strong></p>
              <ul className="list-disc list-inside text-muted-foreground ml-2">
                <li>应用类型：Web应用</li>
                <li>授权回调URI：{callbackUrl}</li>
                <li>授权来源：localhost:3000</li>
              </ul>
              
              <p><strong>4. 在Clerk中配置</strong></p>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => window.open('https://dashboard.clerk.com/', '_blank')}
              >
                打开Clerk Dashboard
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* GitHub配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              GitHub OAuth配置
              <Badge variant="outline">需要配置</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p><strong>1. 访问GitHub Developer Settings</strong></p>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => window.open('https://github.com/settings/developers', '_blank')}
              >
                打开GitHub Developer Settings
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              
              <p><strong>2. 创建OAuth App</strong></p>
              <ul className="list-disc list-inside text-muted-foreground ml-2">
                <li>Application name: AI TextDraw</li>
                <li>Homepage URL: http://localhost:3000</li>
                <li>Authorization callback URL: {callbackUrl}</li>
              </ul>
              
              <p><strong>3. 获取凭据</strong></p>
              <ul className="list-disc list-inside text-muted-foreground ml-2">
                <li>复制Client ID</li>
                <li>生成Client Secret</li>
              </ul>
              
              <p><strong>4. 在Clerk中配置</strong></p>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={() => window.open('https://dashboard.clerk.com/', '_blank')}
              >
                打开Clerk Dashboard
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 测试建议 */}
      <Card>
        <CardHeader>
          <CardTitle>测试建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>配置完成后的测试步骤：</strong></p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>重启开发服务器：<code>pnpm dev</code></li>
              <li>清除浏览器缓存和Cookie</li>
              <li>访问登录页面：<code>http://localhost:3000/auth/signin</code></li>
              <li>尝试Google或GitHub登录</li>
              <li>如果失败，检查浏览器控制台错误信息</li>
              <li>访问 <code>/auth-test</code> 页面查看认证状态</li>
            </ol>
            
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>重要提醒：</strong>
                OAuth配置更改后可能需要几分钟才能生效。如果仍然失败，请等待5-10分钟后重试。
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 