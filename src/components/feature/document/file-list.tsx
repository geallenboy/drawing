// file-list/index.tsx
"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import { useFileListStore } from "@/store/fileStore";
import FileListToolbar from "./toolbar";
import FileListFilterPanel from "./filter-panel";
import FileListContent from "./content";
import BulkActionsBar from "./bulk-actions-bar";
import DeleteConfirmDialog from "./delete-confirm-dialog";
import { useRouter } from "next/navigation";
import { getFilesByUserIdAction } from "@/actions/file/file-action";

type FileListProps = {
  searchQuery?: string;
};

const FileList = ({ searchQuery: initialSearchQuery = "" }: FileListProps) => {
  const router = useRouter();

  // 从Zustand获取状态和操作
  const {
    setFileList,
    setLoading,
    setSearchQuery,
    isDeleteDialogOpen,
    fileToDelete,
    closeDeleteDialog,
    setNavigate
  } = useFileListStore();

  // 注册导航函数
  useEffect(() => {
    setNavigate((path: string) => router.push(path));
  }, [router, setNavigate]);

  // 组件加载时获取数据
  useEffect(() => {
    getAllData();
  }, []);

  // 当初始搜索查询变化时更新状态
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery, setSearchQuery]);

  // 获取所有文件数据
  const getAllData = async () => {
    setLoading(true);
    try {
      const { success, data, error } = await getFilesByUserIdAction();
      if (success && data) {
        // 为演示添加一些随机属性
        const enhancedFiles = (data.files || []).map((file: any) => ({
          ...file,
          isFavorite: Math.random() > 0.7, // 随机收藏状态
          shared: Math.random() > 0.8, // 随机共享状态
          fileSize: Math.floor(Math.random() * 10000) + 50 // 随机文件大小 (KB)
        }));
        setFileList(enhancedFiles);
      } else {
        toast.error("获取文件列表失败");
      }
    } catch (error) {
      console.error("获取文件列表失败:", error);
      toast.error("获取文件列表失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <FileListToolbar refreshData={getAllData} />
      <FileListFilterPanel />
      <FileListContent />
      <BulkActionsBar />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        setOpen={closeDeleteDialog}
        fileId={fileToDelete}
        onDelete={getAllData}
      />
    </div>
  );
};

export default FileList;
