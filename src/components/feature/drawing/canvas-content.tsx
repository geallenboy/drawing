"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "./header";
import DrawingList from "./drawing-list";
import FolderNavigation from "./folder-navigation";
import FolderGrid from "./folder-grid";

const CanvasContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const searchParams = useSearchParams();

  // 初始化：确保默认文件夹存在
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 从 URL 参数中获取文件夹ID
        const folderParam = searchParams.get("folder");
        
        if (folderParam) {
          setCurrentFolderId(folderParam);
        }
        // 不再自动选择第一个文件夹，让用户手动选择
      } catch (error) {
        console.error("初始化应用失败:", error);
      } finally {
        setInitialized(true);
      }
    };

    initializeApp();
  }, [searchParams]);

  // 处理文件夹选择
  const handleFolderSelect = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        currentFolderId={currentFolderId}
      />
      
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 文件夹导航面包屑 */}
        <FolderNavigation 
          currentFolderId={currentFolderId} 
          setCurrentFolderId={setCurrentFolderId}
        />
        
        {/* 上半部分：文件夹网格 */}
        <div className="border-2 border-red-500 border-dashed rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">文件夹</h2>
          <FolderGrid 
            onFolderSelect={handleFolderSelect}
            selectedFolderId={currentFolderId}
          />
        </div>
        
        {/* 下半部分：绘图列表 */}
        <div className="border-2 border-red-500 border-dashed rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            {currentFolderId ? "绘图文件" : "请选择一个文件夹"}
          </h2>
          <DrawingList 
            searchQuery={searchQuery} 
            currentFolderId={currentFolderId}
            onFolderClick={handleFolderSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasContent;
