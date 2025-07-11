"use server";

import * as userService from "@/services/user/user-service";
import { ActionResponse, errorResponse, successResponse } from "@/actions";

import { revalidatePath } from "next/cache";

/**
 * 同步当前用户到数据库的 Server Action
 */
export async function syncUserAction() {
  try {
    const result = await userService.syncCurrentUserToDatabase();
    
    if (result.success && 'user' in result) {
      // 重新验证相关路径
      revalidatePath('/dashboard');
      revalidatePath('/account-settings');
      
      return {
        success: true,
        user: result.user,
        message: result.isNew ? '用户信息已创建' : '用户信息已更新',
      };
    } else {
      return {
        success: false,
        error: result.error || '同步用户信息失败',
      };
    }
  } catch (error) {
    console.error('用户同步 Action 错误:', error);
    return {
      success: false,
      error: '同步用户信息时发生错误',
    };
  }
}