// file-list/bulk-actions-bar.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Tag, Trash } from "lucide-react";
import { useFileListStore } from "@/store/fileStore";
import { toast } from "sonner";

const BulkActionsBar = () => {
  const { selectedFiles, setSelectedFiles } = useFileListStore();

  const bulkDownload = () => {
    toast.success(`正在下载 ${selectedFiles.length} 个文件`);
  };

  const bulkShare = () => {
    toast.success(`分享链接已复制到剪贴板`);
  };

  const bulkAddTags = () => {
    toast.success(`为 ${selectedFiles.length} 个文件添加标签`);
  };

  const bulkDelete = () => {
    toast.success(`已删除 ${selectedFiles.length} 个文件`);
    setSelectedFiles([]);
  };

  if (selectedFiles.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border shadow-lg rounded-lg p-2 flex items-center gap-2 z-10">
      <span className="ml-2 text-sm font-medium">已选择 {selectedFiles.length} 个文件</span>
      <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
        取消选择
      </Button>
      <Button variant="ghost" size="sm" onClick={bulkDownload}>
        <Download className="h-4 w-4 mr-1" /> 下载
      </Button>
      <Button variant="ghost" size="sm" onClick={bulkShare}>
        <Share2 className="h-4 w-4 mr-1" /> 分享
      </Button>
      <Button variant="ghost" size="sm" onClick={bulkAddTags}>
        <Tag className="h-4 w-4 mr-1" /> 添加标签
      </Button>
      <Button variant="ghost" size="sm" className="text-red-600" onClick={bulkDelete}>
        <Trash className="h-4 w-4 mr-1" /> 删除
      </Button>
    </div>
  );
};

export default BulkActionsBar;
