import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithDbInfo } from '@/features/auth/auth-clerk';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 开始测试用户同步...');
    
    // 检查用户是否已认证
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '用户未登录'
      });
    }
    
    // 尝试获取用户信息并同步到数据库
    const result = await getCurrentUserWithDbInfo();
    
    if (result.clerkUser && result.dbUser) {
      return NextResponse.json({
        success: true,
        user: result.dbUser,
        isNew: result.isNew,
        message: result.isNew ? '用户信息已创建并同步' : '用户信息已更新并同步'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || '用户同步失败'
      });
    }
  } catch (error) {
    console.error('❌ 用户同步测试失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
} 