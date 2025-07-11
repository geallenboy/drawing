import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/drizzle/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 开始测试数据库连接...');
    
    const isConnected = await testDatabaseConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '数据库连接测试成功'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '数据库连接测试失败'
      });
    }
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
} 