import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('OAuth 回调处理开始...');
    
    // 获取用户信息并自动同步到数据库
    const result = await getCurrentAuthUser();
    
    if (!result.success || !result.user) {
      console.log('OAuth 回调：用户认证失败');
      return NextResponse.json({ 
        error: result.error || '用户未认证' 
      }, { status: 401 });
    }

    console.log('OAuth 回调成功:', {
      userId: result.user.id,
      email: result.user.email,
      isNew: result.isNew
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      isNew: result.isNew,
      message: result.isNew ? '用户信息已创建并同步' : '用户信息已同步'
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