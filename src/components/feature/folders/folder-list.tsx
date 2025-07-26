"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Folder,
  ArrowLeft,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import FolderGrid, { FolderGridRef } from "@/components/feature/folders/folder-grid";
import { createFolder } from "@/actions/folder/folder-actions";
import DialogPop from "@/components/feature/drawings/dialog-pop";


const FolderList = () => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  
  // 新建文件夹对话框状态
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  
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

  // 创建新文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("请输入文件夹名称");
      return;
    }

    setIsCreatingFolder(true);
    try {
      const result = await createFolder(newFolderName.trim(), newFolderDesc.trim());
      
      if (result.success) {
        toast.success("文件夹创建成功！");
        setCreateFolderDialogOpen(false);
        setNewFolderName("");
        setNewFolderDesc("");
       
        // 刷新 FolderGrid 的数据
        folderGridRef.current?.refreshFolders();
      } else {
        toast.error(result.error || "创建文件夹失败");
      }
    } catch (error) {
      console.error("创建文件夹失败:", error);
      toast.error("创建文件夹失败");
    } finally {
      setIsCreatingFolder(false);
    }
  };


 

  // 返回文件夹列表
  const handleBackToFolders = () => {
    setCurrentFolderId(null);
    setCurrentFolderName("");
    
    // 清除URL参数
    const url = new URL(window.location.href);
    url.searchParams.delete("folder");
    window.history.pushState({}, "", url.toString());
  };

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
          {currentFolderId ? (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToFolders}
                className="h-8 px-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{currentFolderName}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Folder className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">我的文件夹</h1>
            </div>
          )}
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center space-x-3">
          {/* 创建按钮 */}
          {currentFolderId && <DialogPop currentFolderId={currentFolderId} />}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="min-h-[500px]">
          <FolderGrid 
            ref={folderGridRef}
            selectedFolderId={currentFolderId}
          />
      </div>

      {/* 创建文件夹对话框 */}
      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新文件夹</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">文件夹名称</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="请输入文件夹名称"
                disabled={isCreatingFolder}
              />
            </div>
            <div>
              <Label htmlFor="folder-desc">描述（可选）</Label>
              <Input
                id="folder-desc"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="请输入文件夹描述"
                disabled={isCreatingFolder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateFolderDialogOpen(false)}
              disabled={isCreatingFolder}
            >
              取消
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
            >
              {isCreatingFolder ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderList;
