/**
 * 用户同步API端点
 * 简化的用户同步逻辑
 */
import { NextResponse } from 'next/server';
import { getCurrentAuthUser } from '@/lib/auth';

export async function POST() {
  try {
    const result = await getCurrentAuthUser();
    
    if (result.success && result.user) {
      return NextResponse.json({
        success: true,
        user: result.user,
        isNew: result.isNew,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || '用户同步失败',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('用户同步API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器错误',
    }, { status: 500 });
  }
}