/**
 * 统一的认证管理模块
 * 简化auth逻辑，提供清晰的API接口
 */
'use server';

import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schemas/users';
import { eq } from 'drizzle-orm';

export type AuthUser = {
  id?: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AuthResult = {
  success: boolean;
  user?: AuthUser;
  error?: string;
  isNew?: boolean;
};

/**
 * 从Clerk用户数据创建用户数据对象
 */
function createUserDataFromClerk(clerkUser: any) {
  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
    avatarUrl: clerkUser.imageUrl || undefined,
  };
}

/**
 * 同步用户到数据库（创建或更新）
 */
async function syncUserToDatabase(userData: {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}): Promise<AuthResult> {
  try {
    // 检查用户是否存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userData.id))
      .limit(1);

    if (existingUser.length > 0) {
      // 更新现有用户
      const [updatedUser] = await db
        .update(users)
        .set({
          email: userData.email,
          fullName: userData.fullName,
          avatarUrl: userData.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();

      return {
        success: true,
        user: updatedUser as AuthUser,
        isNew: false,
      };
    } else {
      // 创建新用户
      const [newUser] = await db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email,
          fullName: userData.fullName,
          avatarUrl: userData.avatarUrl,
        })
        .returning();

      return {
        success: true,
        user: newUser as AuthUser,
        isNew: true,
      };
    }
  } catch (error) {
    console.error('同步用户到数据库失败:', error);
    return {
      success: false,
      error: '数据库同步失败',
    };
  }
}

/**
 * 获取当前认证用户（主要API）
 * 自动处理用户同步，确保数据库中有用户记录
 */
export async function getCurrentAuthUser(): Promise<AuthResult> {
  try {
    // 1. 获取Clerk用户
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        success: false,
        error: '用户未登录',
      };
    }

    // 2. 准备用户数据
    const userData = createUserDataFromClerk(clerkUser);

    // 3. 同步到数据库
    const syncResult = await syncUserToDatabase(userData);
    
    return syncResult;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return {
      success: false,
      error: '获取用户信息失败',
    };
  }
}

/**
 * 要求用户必须登录（用于保护路由）
 */
export async function requireAuth(): Promise<AuthUser> {
  const result = await getCurrentAuthUser();
  
  if (!result.success || !result.user) {
    throw new Error(result.error || '用户未登录');
  }
  
  return result.user;
}

/**
 * 获取当前用户ID（轻量级检查）
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

/**
 * 根据ID获取用户信息
 */
export async function getUserById(userId: string): Promise<AuthResult> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: '用户不存在',
      };
    }

    return {
      success: true,
      user: user as AuthUser,
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      success: false,
      error: '获取用户信息失败',
    };
  }
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
  }
): Promise<AuthResult> {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return {
        success: false,
        error: '用户不存在',
      };
    }

    return {
      success: true,
      user: updatedUser as AuthUser,
    };
  } catch (error) {
    console.error('更新用户资料失败:', error);
    return {
      success: false,
      error: '更新用户资料失败',
    };
  }
}