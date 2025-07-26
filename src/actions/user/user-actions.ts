"use server";

import { getCurrentAuthUser, updateUserProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * 同步当前用户到数据库的 Server Action
 */
export async function syncUserAction() {
  try {
    const result = await getCurrentAuthUser();
    
    if (result.success && result.user) {
      // 重新验证相关路径
      revalidatePath('/dashboard');
      revalidatePath('/account-settings');
      
      return {
        success: true,
        user: result.user,
        isNew: result.isNew,
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

/**
 * 更新用户资料的 Server Action
 */
export async function updateUserProfileAction(updates: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  try {
    const authResult = await getCurrentAuthUser();
    
    if (!authResult.success || !authResult.user || !authResult.user.id) {
      return {
        success: false,
        error: '用户未登录',
      };
    }

    const result = await updateUserProfile(authResult.user.id, updates);
    
    if (result.success) {
      revalidatePath('/account-settings');
      return {
        success: true,
        user: result.user,
        message: '用户资料已更新',
      };
    } else {
      return {
        success: false,
        error: result.error || '更新用户资料失败',
      };
    }
  } catch (error) {
    console.error('更新用户资料 Action 错误:', error);
    return {
      success: false,
      error: '更新用户资料时发生错误',
    };
  }
}