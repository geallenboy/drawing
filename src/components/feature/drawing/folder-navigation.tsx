"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Folder, FolderPlus, ChevronRight, Home } from "lucide-react";
import { getFolders, createFolder, getFolderPath } from "@/actions/folder/folder-actions";
import { toast } from "sonner";

interface Folder {
  id: string;
  name: string;
  desc: string;
  parentFolderId: string | null;
}

interface FolderNavigationProps {
  currentFolderId: string | null;
  setCurrentFolderId: (folderId: string | null) => void;
}

const FolderNavigation: React.FC<FolderNavigationProps> = ({
  currentFolderId,
  setCurrentFolderId
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");

  // 加载文件夹列表
  const loadFolders = async (parentId?: string) => {
    try {
      const result = await getFolders(parentId);
      if (result.success) {
        setFolders(result.folders || []);
      }
    } catch (error) {
      console.error("加载文件夹失败:", error);
    }
  };

  // 创建新文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("文件夹名称不能为空");
      return;
    }

    try {
      const result = await createFolder(newFolderName, newFolderDesc, currentFolderId || undefined);
      if (result.success) {
        toast.success("文件夹创建成功");
        setNewFolderName("");
        setNewFolderDesc("");
        setIsCreateDialogOpen(false);
        loadFolders(currentFolderId || undefined);
      } else {
        toast.error(result.error || "创建文件夹失败");
      }
    } catch (error) {
      toast.error("创建文件夹失败");
    }
  };

  // 构建面包屑路径
  const buildBreadcrumb = async (folderId: string | null) => {
    if (!folderId) {
      setBreadcrumb([]);
      setCurrentFolder(null);
      return;
    }

    try {
      const pathResult = await getFolderPath(folderId);
      if (pathResult.success && pathResult.path.length > 0) {
        setBreadcrumb(pathResult.path.slice(0, -1)); // 除了当前文件夹之外的路径
        setCurrentFolder(pathResult.path[pathResult.path.length - 1]); // 当前文件夹
      } else {
        setBreadcrumb([]);
        setCurrentFolder(null);
      }
    } catch (error) {
      console.error("构建面包屑失败:", error);
      setBreadcrumb([]);
      setCurrentFolder(null);
    }
  };

  // 返回上级目录
  const goToParent = () => {
    if (currentFolder?.parentFolderId) {
      setCurrentFolderId(currentFolder.parentFolderId);
    } else {
      setCurrentFolderId(null);
    }
  };

  // 返回根目录
  const goToRoot = () => {
    setCurrentFolderId(null);
  };

  useEffect(() => {
    loadFolders(currentFolderId || undefined);
    buildBreadcrumb(currentFolderId);
  }, [currentFolderId]);

  return (
    <div className="space-y-4">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToRoot}
          className="h-8 px-2"
        >
          <Home className="h-4 w-4" />
          根目录
        </Button>
        
        {breadcrumb.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight className="h-4 w-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolderId(folder.id)}
              className="h-8 px-2"
            >
              {folder.name}
            </Button>
          </React.Fragment>
        ))}
      </div>

      {/* 文件夹操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                新建文件夹
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新文件夹</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">文件夹名称</label>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="输入文件夹名称"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">描述（可选）</label>
                  <Input
                    value={newFolderDesc}
                    onChange={(e) => setNewFolderDesc(e.target.value)}
                    placeholder="输入文件夹描述"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 文件夹列表 */}
      {folders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex flex-col items-center p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <Folder className="h-12 w-12 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-center">{folder.name}</span>
              {folder.desc && (
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {folder.desc}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderNavigation;
