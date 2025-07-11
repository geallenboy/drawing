import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schemas/users';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export type CreateUserData = {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
};

/**
 * 创建或更新用户信息
 */
export async function createOrUpdateUser(userData: CreateUserData) {
  try {
    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userData.id))
      .limit(1);

    if (existingUser.length > 0) {
      // 更新用户信息
      const updatedUser = await db
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
        user: updatedUser[0],
        isNew: false,
      };
    } else {
      // 创建新用户
      const newUser = await db
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
        user: newUser[0],
        isNew: true,
      };
    }
  } catch (error) {
    console.error('创建或更新用户失败:', error);
    return {
      success: false,
      error: '用户操作失败',
    };
  }
}

/**
 * 根据ID获取用户信息
 */
export async function getUserById(userId: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      success: true,
      user: user[0] || null,
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
 * 同步当前登录用户到数据库
 */
export async function syncCurrentUserToDatabase() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return {
        success: false,
        error: '用户未登录',
      };
    }

    const userData: CreateUserData = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      avatarUrl: clerkUser.imageUrl,
    };

    return await createOrUpdateUser(userData);
  } catch (error) {
    console.error('同步用户信息失败:', error);
    return {
      success: false,
      error: '同步用户信息失败',
    };
  }
}

/**
 * 删除用户（软删除，保留数据但标记为已删除）
 */
export async function deleteUser(userId: string) {
  try {
    // 这里我们不实际删除用户，而是可以添加一个 deletedAt 字段来标记
    // 由于当前 schema 没有 deletedAt 字段，我们保留这个函数以备将来使用
    console.log('删除用户请求:', userId);
    
    return {
      success: true,
      message: '用户删除功能待实现',
    };
  } catch (error) {
    console.error('删除用户失败:', error);
    return {
      success: false,
      error: '删除用户失败',
    };
  }
}

/**
 * 更新用户个人资料
 */
export async function updateUserProfile(userId: string, updates: {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  try {
    const updatedUser = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return {
        success: false,
        error: '用户不存在',
      };
    }

    return {
      success: true,
      user: updatedUser[0],
    };
  } catch (error) {
    console.error('更新用户资料失败:', error);
    return {
      success: false,
      error: '更新用户资料失败',
    };
  }
}

// 创建 createUser
export async function createUser(userData: CreateUserData) {
  try {
    const newUser = await db
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
      user: newUser[0],
    };
  } catch (error) {
    console.error('创建用户失败:', error);
    return {
      success: false,
      error: '创建用户失败',
    };
  }  
}
