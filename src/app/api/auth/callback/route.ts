import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithDbInfo } from '@/features/auth/auth-clerk';

export async function GET(request: NextRequest) {
  try {
    console.log('OAuth 回调处理开始...');
    
    // 获取用户信息并自动同步到数据库
    const { clerkUser, dbUser } = await getCurrentUserWithDbInfo();
    
    if (!clerkUser) {
      console.log('OAuth 回调：未找到 Clerk 用户');
      return NextResponse.json({ error: '用户未认证' }, { status: 401 });
    }

    console.log('OAuth 回调成功:', {
      clerkId: clerkUser.id,
      email: clerkUser.email,
      dbUserExists: !!dbUser
    });

    return NextResponse.json({
      success: true,
      user: {
        clerk: clerkUser,
        db: dbUser
      },
      message: dbUser ? '用户信息已同步' : '用户已认证，数据库同步失败'
    });
  } catch (error) {
    console.error('OAuth 回调处理失败:', error);
    return NextResponse.json({
      error: 'OAuth 回调处理失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
} 