'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createOrUpdateUser, getUserById } from '@/services/user/user-service';

/**
 * 获取当前用户的Clerk信息和数据库信息
 * 如果数据库中不存在用户，会自动创建
 */
export async function getCurrentUserWithDbInfo() {
  try {
    // 获取当前Clerk用户
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return {
        clerkUser: null,
        dbUser: null,
        error: '用户未登录'
      };
    }

    // 尝试从数据库获取用户信息
    const dbUserResult = await getUserById(clerkUser.id);
    
    if (dbUserResult.success && dbUserResult.user) {
      // 用户已存在，返回现有信息
      return {
        clerkUser: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl,
        },
        dbUser: dbUserResult.user,
        isNew: false
      };
    } else {
      // 用户不存在，自动创建
      console.log('数据库中未找到用户，开始自动创建...');
      
      const createResult = await createOrUpdateUser({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      });

      if (createResult.success && 'user' in createResult) {
        return {
          clerkUser: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName ?? undefined,
            lastName: clerkUser.lastName ?? undefined,
            imageUrl: clerkUser.imageUrl,
          },
          dbUser: createResult.user,
          isNew: createResult.isNew || false
        };
      } else {
        return {
          clerkUser: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName ?? undefined,
            lastName: clerkUser.lastName ?? undefined,
            imageUrl: clerkUser.imageUrl,
          },
          dbUser: null,
          error: createResult.error || '创建用户失败'
        };
      }
    }
  } catch (error) {
    console.error('获取用户信息时发生错误:', error);
    return {
      clerkUser: null,
      dbUser: null,
      error: error instanceof Error ? error.message : '获取用户信息失败'
    };
  }
}

/**
 * 确保用户已登录并同步到数据库
 * 用于需要验证用户身份的页面和API
 */
export async function requireAuth() {
  const result = await getCurrentUserWithDbInfo();
  
  if (!result.clerkUser) {
    throw new Error('用户未登录');
  }
  
  if (!result.dbUser) {
    throw new Error('用户信息同步失败');
  }
  
  return {
    clerkUser: result.clerkUser,
    dbUser: result.dbUser,
    isNew: result.isNew || false
  };
}

/**
 * 验证用户权限
 * 可以根据需要扩展为基于角色的权限验证
 */
export async function checkUserPermission(requiredRole?: string) {
  const { dbUser } = await requireAuth();
  
  // 这里可以添加基于角色的权限检查
  // 目前只检查用户是否存在
  
  return {
    hasPermission: true,
    user: dbUser
  };
} 