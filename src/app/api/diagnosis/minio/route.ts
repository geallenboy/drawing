import { NextRequest, NextResponse } from 'next/server';
import { isR2Available } from '@/lib/cloudflare-r2';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 开始测试Cloudflare R2连接...');
    
    const isAvailable = await isR2Available();
    
    if (isAvailable) {
      return NextResponse.json({
        success: true,
        message: 'Cloudflare R2连接测试成功'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Cloudflare R2连接测试失败'
      });
    }
  } catch (error) {
    console.error('❌ Cloudflare R2连接测试失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
} 