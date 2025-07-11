import { NextRequest, NextResponse } from 'next/server';
import { isMinioAvailable } from '@/lib/minio';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 开始测试MinIO连接...');
    
    const isAvailable = await isMinioAvailable();
    
    if (isAvailable) {
      return NextResponse.json({
        success: true,
        message: 'MinIO连接测试成功'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'MinIO连接测试失败'
      });
    }
  } catch (error) {
    console.error('❌ MinIO连接测试失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
} 