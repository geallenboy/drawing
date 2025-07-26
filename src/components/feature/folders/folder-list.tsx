"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Folder,

} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import FolderGrid, { FolderGridRef } from "@/components/feature/folders/folder-grid";


const FolderList = () => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const searchParams = useSearchParams();
  const { user } = useUser();
  // FolderGrid 的 ref
  const folderGridRef = useRef<FolderGridRef>(null);

  

  // 初始化应用和创建默认文件夹
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const folderParam = searchParams.get("folder");
        
        if (folderParam) {
          setCurrentFolderId(folderParam);
        }
        
      } catch (error) {
        console.error("初始化应用失败:", error);
        toast.error("初始化应用失败");
      } finally {
        setInitialized(true);
      }
    };

    if (user) {
      initializeApp();
    }
  }, [searchParams, user]);



  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 面包屑导航 */}
          <div className="flex items-center space-x-2">
              <Folder className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">我的文件夹</h1>
            </div>
        </div>

      </div>

      {/* 主要内容区域 */}
      <div className="min-h-[500px]">
          <FolderGrid 
            ref={folderGridRef}
            selectedFolderId={currentFolderId}
          />
      </div>

    </div>
  );
};

export default FolderList;
