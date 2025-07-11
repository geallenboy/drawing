import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    console.log('收到密码重置请求，邮箱:', trimmedEmail);

    try {
      // 使用 Clerk 的 API 查找用户
      const clerk = await clerkClient();
      const userList = await clerk.users.getUserList({
        emailAddress: [trimmedEmail],
        limit: 1
      });

      if (userList.data.length === 0) {
        // 用户不存在，但为了安全不暴露这个信息
        console.log('用户不存在:', trimmedEmail);
        return NextResponse.json({
          success: true,
          message: '如果该邮箱已注册，您将收到重置密码的邮件'
        });
      }

      const user = userList.data[0];
      
      // 检查用户是否有密码（OAuth用户可能没有密码）
      if (!user.passwordEnabled) {
        console.log('用户使用OAuth登录，无需重置密码:', trimmedEmail);
        return NextResponse.json({
          success: false,
          message: '该账户使用第三方登录，无需重置密码'
        });
      }

      // 发送密码重置邮件
      // 注意：Clerk 目前不支持通过后端API直接发送密码重置邮件
      // 密码重置需要在前端通过 useSignIn hook 来处理
      // 这里我们只是验证用户存在，前端需要调用相应的方法

      console.log('用户存在且可以重置密码:', {
        userId: user.id,
        email: trimmedEmail,
        passwordEnabled: user.passwordEnabled
      });

      return NextResponse.json({
        success: true,
        message: '验证成功，请在前端页面继续重置密码操作',
        userExists: true,
        passwordEnabled: user.passwordEnabled
      });

    } catch (clerkError: any) {
      console.error('Clerk API 错误:', {
        message: clerkError.message,
        status: clerkError.status,
        clerkTraceId: clerkError.clerkTraceId,
        errors: clerkError.errors
      });

      // 如果是404错误，说明用户不存在
      if (clerkError.status === 404) {
        return NextResponse.json({
          success: true,
          message: '如果该邮箱已注册，您将收到重置密码的邮件'
        });
      }

      // 其他 Clerk 错误
      return NextResponse.json({
        success: false,
        message: '验证邮箱时出现问题，请稍后重试'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('忘记密码 API 错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
} 