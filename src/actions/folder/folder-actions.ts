"use server";

import { db } from "@/drizzle/db";
import { AIDTFolderTable } from "@/drizzle/schemas/folder";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createFolder(name: string, description?: string, parentFolderId?: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("用户未登录");
  }

  try {
    const newFolder = await db.insert(AIDTFolderTable).values({
      name,
      desc: description || "",
      userId,
      parentFolderId: parentFolderId || null,
      filepath: parentFolderId ? `${parentFolderId}/${name}` : name,
    }).returning();

    revalidatePath("/");
    return { success: true, folder: newFolder[0] };
  } catch (error) {
    console.error("创建文件夹失败:", error);
    return { success: false, error: "创建文件夹失败" };
  }
}

export async function getFolders(parentFolderId?: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("用户未登录");
  }

  try {
    const folders = await db
      .select()
      .from(AIDTFolderTable)
      .where(
        and(
          eq(AIDTFolderTable.userId, userId),
          eq(AIDTFolderTable.isDeleted, false),
          parentFolderId ? eq(AIDTFolderTable.parentFolderId, parentFolderId) : isNull(AIDTFolderTable.parentFolderId)
        )
      );

    return { success: true, folders };
  } catch (error) {
    console.error("获取文件夹失败:", error);
    return { success: false, error: "获取文件夹失败", folders: [] };
  }
}

export async function updateFolder(folderId: string, name?: string, description?: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("用户未登录");
  }

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.desc = description;

    const updatedFolder = await db
      .update(AIDTFolderTable)
      .set(updateData)
      .where(
        and(
          eq(AIDTFolderTable.id, folderId),
          eq(AIDTFolderTable.userId, userId)
        )
      )
      .returning();

    revalidatePath("/");
    return { success: true, folder: updatedFolder[0] };
  } catch (error) {
    console.error("更新文件夹失败:", error);
    return { success: false, error: "更新文件夹失败" };
  }
}

export async function deleteFolder(folderId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("用户未登录");
  }

  try {
    await db
      .update(AIDTFolderTable)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(AIDTFolderTable.id, folderId),
          eq(AIDTFolderTable.userId, userId)
        )
      );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("删除文件夹失败:", error);
    return { success: false, error: "删除文件夹失败" };
  }
}

// 获取文件夹详情
export async function getFolderById(folderId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("用户未登录");
  }

  try {
    const folder = await db
      .select()
      .from(AIDTFolderTable)
      .where(
        and(
          eq(AIDTFolderTable.id, folderId),
          eq(AIDTFolderTable.userId, userId),
          eq(AIDTFolderTable.isDeleted, false)
        )
      )
      .limit(1);

    return { 
      success: true, 
      folder: folder.length > 0 ? folder[0] : null 
    };
  } catch (error) {
    console.error("获取文件夹详情失败:", error);
    return { success: false, error: "获取文件夹详情失败", folder: null };
  }
}

// 获取文件夹路径（面包屑导航）
export async function getFolderPath(folderId: string | null): Promise<{ success: boolean; path: any[]; error?: string }> {
  if (!folderId) {
    return { success: true, path: [] };
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("用户未登录");
  }

  try {
    const path = [];
    let currentId: string | null = folderId;

    // 递归获取父级文件夹
    while (currentId) {
      const folderResult = await getFolderById(currentId);
      if (!folderResult.success || !folderResult.folder) {
        break;
      }

      path.unshift(folderResult.folder);
      currentId = folderResult.folder.parentFolderId;
    }

    return { success: true, path };
  } catch (error) {
    console.error("获取文件夹路径失败:", error);
    return { success: false, path: [], error: "获取文件夹路径失败" };
  }
}

// 确保默认文件夹存在并返回其ID
export async function ensureDefaultFolder() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("用户未登录");
  }

  try {
    // 查找是否已有默认文件夹
    const existingDefault = await db
      .select()
      .from(AIDTFolderTable)
      .where(
        and(
          eq(AIDTFolderTable.userId, userId),
          eq(AIDTFolderTable.name, "默认文件夹"),
          isNull(AIDTFolderTable.parentFolderId),
          eq(AIDTFolderTable.isDeleted, false)
        )
      )
      .limit(1);

    if (existingDefault.length > 0) {
      return { success: true, folderId: existingDefault[0].id };
    }

    // 创建默认文件夹
    const newFolder = await db.insert(AIDTFolderTable).values({
      name: "默认文件夹",
      desc: "系统自动创建的默认文件夹",
      userId,
      parentFolderId: null,
      filepath: "默认文件夹",
    }).returning();

    return { success: true, folderId: newFolder[0].id };
  } catch (error) {
    console.error("创建默认文件夹失败:", error);
    return { success: false, error: "创建默认文件夹失败" };
  }
}
