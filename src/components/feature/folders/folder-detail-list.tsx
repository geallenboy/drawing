"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Folder,
  ArrowLeft,
  Plus,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DrawingList from "../drawings/drawing-list";
import FolderGrid, { FolderGridRef } from "./folder-grid";
import { createFolder } from "@/actions/folder/folder-actions";
import { AIDTFolder } from "@/drizzle/schemas/folder";

interface FolderDetailContentProps {
  folder: AIDTFolder;
  folderPath: AIDTFolder[];
}

const FolderDetailList: React.FC<FolderDetailContentProps> = ({ 
  folder, 
  folderPath 
}) => {
  const router = useRouter();

  
  // 新建文件夹对话框状态
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  
  // FolderGrid 的 ref
  const folderGridRef = useRef<FolderGridRef>(null);

  // 处理文件夹选择
  const handleFolderSelect = (folderId: string, folderName: string) => {
    router.push(`/folders/${folderId}`);
  };

  // 返回上级文件夹
  const handleGoBack = () => {
    if (folder.parentFolderId) {
      router.push(`/folders/${folder.parentFolderId}`);
    } else {
      router.push("/");
    }
  };

  // 返回首页
  const handleGoHome = () => {
    router.push("/");
  };

  // 创建文件夹
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("请输入文件夹名称");
      return;
    }

    setIsCreatingFolder(true);
    try {
      const result = await createFolder(newFolderName, newFolderDesc, folder.id);
      
      if (result.success) {
        toast.success("文件夹创建成功");
        setCreateFolderDialogOpen(false);
        setNewFolderName("");
        setNewFolderDesc("");
        // 刷新文件夹列表
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 面包屑导航 */}
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoHome}
            className="p-1 h-auto"
          >
            <Home className="h-4 w-4" />
          </Button>
          
          {folderPath.map((pathFolder, index) => (
            <React.Fragment key={pathFolder.id}>
              <span>/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/folders/${pathFolder.id}`)}
                className="p-1 h-auto font-normal"
              >
                {pathFolder.name}
              </Button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Folder className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{folder.name}</h1>
            </div>
          </div>

          <Button onClick={() => setCreateFolderDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建文件夹
          </Button>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr]">
          

          {/* 右侧：绘图列表 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">绘图文件</h3>
            </div>
            <DrawingList
           
              currentFolderId={folder.id}
              onFolderClick={() => folderGridRef.current?.refreshFolders()}
            />
          </div>
        </div>
      </div>

      {/* 新建文件夹对话框 */}
      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建文件夹</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">文件夹名称</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="请输入文件夹名称"
              />
            </div>
            <div>
              <Label htmlFor="folderDesc">描述（可选）</Label>
              <Input
                id="folderDesc"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="请输入文件夹描述"
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
            <Button onClick={handleCreateFolder} disabled={isCreatingFolder}>
              {isCreatingFolder ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderDetailList;