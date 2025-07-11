"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Grid3X3, List, Plus, Home, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "./header";
import DrawingList from "./drawing-list";
import FolderNavigation from "./folder-navigation";
import FolderGrid from "./folder-grid";

type ViewMode = "grid" | "list";

const CanvasContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const searchParams = useSearchParams();
  const router = useRouter();

  // 初始化：确保默认文件夹存在
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 从 URL 参数中获取文件夹ID
        const folderParam = searchParams.get("folder");
        
        if (folderParam) {
          setCurrentFolderId(folderParam);
        }
        // 从本地存储恢复视图模式
        const savedViewMode = localStorage.getItem("file-manager-view-mode") as ViewMode;
        if (savedViewMode) {
          setViewMode(savedViewMode);
        }
      } catch (error) {
        console.error("初始化应用失败:", error);
        toast.error("初始化应用失败");
      } finally {
        setInitialized(true);
      }
    };

    initializeApp();
  }, [searchParams]);

  // 处理文件夹选择
  const handleFolderSelect = (folderId: string) => {
    setCurrentFolderId(folderId);
    // 更新 URL
    const url = folderId ? `/?folder=${folderId}` : "/";
    router.push(url);
  };

  // 处理视图模式切换
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("file-manager-view-mode", mode);
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery("");
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
      {/* 改进的顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">我的绘图</h1>
              <Badge variant="secondary">
                文件管理器
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 改进的搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索文件夹和绘图..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={clearSearch}
                  >
                    ×
                  </Button>
                )}
              </div>

              {/* 视图模式切换 */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 面包屑导航 */}
          <FolderNavigation 
            currentFolderId={currentFolderId} 
            setCurrentFolderId={handleFolderSelect}
          />
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 文件夹区域 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                📁 文件夹
              </h2>
              <Button 
                size="sm" 
                onClick={() => {
                  // 这里可以触发创建文件夹的逻辑
                  toast.info("请使用下方的新建文件夹按钮");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                快速创建
              </Button>
            </div>
            <FolderGrid 
              onFolderSelect={handleFolderSelect}
              selectedFolderId={currentFolderId}
            />
          </div>
        </div>
        
        {/* 绘图文件区域 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                🎨 
                {currentFolderId ? "绘图文件" : "选择文件夹查看绘图"}
              </h2>
              {currentFolderId && (
                <Button 
                  size="sm"
                  onClick={() => router.push(`/drawing/new?folder=${currentFolderId}`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新建绘图
                </Button>
              )}
            </div>
            
            {!currentFolderId ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  请选择一个文件夹
                </h3>
                <p className="text-gray-400">
                  在左侧选择文件夹以查看其中的绘图文件
                </p>
              </div>
            ) : (
              <DrawingList 
                searchQuery={searchQuery} 
                currentFolderId={currentFolderId}
                onFolderClick={handleFolderSelect}
              />
            )}
          </div>
        </div>

        {/* 快速操作面板 */}
        {currentFolderId && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">快速操作</h3>
                <p className="text-sm text-blue-700">在此文件夹中快速创建内容</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/drawing/new?folder=${currentFolderId}&template=sketch`)}
                >
                  📝 快速草图
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/drawing/new?folder=${currentFolderId}&template=design`)}
                >
                  🎨 设计项目
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/drawing/new?folder=${currentFolderId}&template=collaboration`)}
                >
                  👥 协作画板
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>视图模式: {viewMode === "grid" ? "网格" : "列表"}</span>
              {searchQuery && (
                <span>搜索: "{searchQuery}"</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>快捷键: Ctrl+N 新建文件夹</span>
              <Button variant="ghost" size="sm" className="h-6">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasContent;
