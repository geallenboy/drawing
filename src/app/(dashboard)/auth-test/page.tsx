import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getUserById } from '@/services/user/user-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Database, Settings } from 'lucide-react';

/**
 * 认证状态测试页面
 * 用于验证Clerk认证和数据库同步是否正常工作
 */
export default async function AuthTestPage() {
  // 获取Clerk用户信息
  const clerkUser = await currentUser();
  
  // 获取数据库用户信息
  let dbUser = null;
  let dbError = null;
  
  if (clerkUser) {
    try {
      const result = await getUserById(clerkUser.id);
      if (result.success && result.user) {
        dbUser = result.user;
      } else {
        dbError = result.error || '用户不存在于数据库中';
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : '数据库查询失败';
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">认证状态测试</h1>
        <p className="text-muted-foreground">
          检查Clerk认证和数据库同步状态
        </p>
      </div>

      {/* Clerk认证状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Clerk认证状态
          </CardTitle>
          <CardDescription>
            检查用户是否已通过Clerk成功登录
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clerkUser ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>已登录</span>
                <Badge variant="secondary">正常</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">用户ID:</span>
                  <p className="break-all">{clerkUser.id}</p>
                </div>
                <div>
                  <span className="font-medium">邮箱:</span>
                  <p>{clerkUser.emailAddresses[0]?.emailAddress || '未设置'}</p>
                </div>
                <div>
                  <span className="font-medium">姓名:</span>
                  <p>{`${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || '未设置'}</p>
                </div>
                <div>
                  <span className="font-medium">头像:</span>
                  <p>{clerkUser.imageUrl ? '已设置' : '未设置'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span>未登录</span>
              <Badge variant="destructive">需要登录</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据库同步状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            数据库同步状态
          </CardTitle>
          <CardDescription>
            检查用户信息是否已同步到数据库
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!clerkUser ? (
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-400" />
              <span>用户未登录，无法检查数据库状态</span>
              <Badge variant="outline">跳过</Badge>
            </div>
          ) : dbUser ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>数据库同步正常</span>
                <Badge variant="secondary">已同步</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">数据库ID:</span>
                  <p className="break-all">{dbUser.id}</p>
                </div>
                <div>
                  <span className="font-medium">邮箱:</span>
                  <p>{dbUser.email}</p>
                </div>
                <div>
                  <span className="font-medium">姓名:</span>
                  <p>{dbUser.fullName || '未设置'}</p>
                </div>
                <div>
                  <span className="font-medium">创建时间:</span>
                  <p>{new Date(dbUser.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>数据库同步失败</span>
                <Badge variant="destructive">需要修复</Badge>
              </div>
              {dbError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-700 text-sm">错误详情: {dbError}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 系统建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            系统建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!clerkUser ? (
            <div className="space-y-2">
              <p>请先登录以测试认证功能:</p>
              <a href="/auth/signin" className="text-blue-600 hover:underline">
                前往登录页面
              </a>
            </div>
          ) : !dbUser ? (
            <div className="space-y-2">
              <p className="text-amber-700">
                用户已登录但数据库同步失败。这可能是由于:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-amber-600">
                <li>数据库连接问题</li>
                <li>用户同步服务未正常运行</li>
                <li>权限配置问题</li>
              </ul>
              <p className="text-sm">
                请刷新页面或联系管理员。系统应该会自动重试同步。
              </p>
            </div>
          ) : (
            <div className="text-green-700">
              <p>✅ 认证系统工作正常！用户已成功登录并同步到数据库。</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 