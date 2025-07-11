"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, 
  FolderOpen, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Plus,
  RefreshCw
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { getFolders, createFolder, updateFolder, deleteFolder } from "@/actions/folder/folder-actions";
import { getDrawingsByFolderIdAction } from "@/actions/drawing/drawing-action";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

type Folder = {
  id: string;
  name: string;
  desc: string;
  parentFolderId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type FolderGridProps = {
  onFolderSelect: (folderId: string) => void;
  selectedFolderId?: string | null;
};

const FolderGrid = ({ onFolderSelect, selectedFolderId }: FolderGridProps) => {
  const { user } = useUser();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  
  // 创建文件夹弹窗
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  
  // 编辑文件夹弹窗
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // 加载文件夹数据
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取根文件夹
      const foldersResult = await getFolders();
      if (foldersResult.success) {
        const foldersData = foldersResult.folders || [];
        setFolders(foldersData);
        
        // 获取每个文件夹的绘图数量
        const counts: Record<string, number> = {};
        for (const folder of foldersData) {
          try {
            const drawingsResult = await getDrawingsByFolderIdAction(folder.id);
            counts[folder.id] = drawingsResult.data?.drawings?.length || 0;
          } catch (err) {
            counts[folder.id] = 0;
          }
        }
        setFolderCounts(counts);
      } else {
        setError(foldersResult.error || "加载文件夹失败");
      }
    } catch (err) {
      setError("加载文件夹失败");
      console.error("Error loading folders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  // 创建文件夹
  const handleCreateFolder = async () => {
    if (!createName.trim()) {
      toast.error("请输入文件夹名称");
      return;
    }

    setCreateLoading(true);
    try {
      const result = await createFolder(createName.trim(), createDesc.trim());
      if (result.success) {
        toast.success("文件夹创建成功");
        setCreateDialogOpen(false);
        setCreateName("");
        setCreateDesc("");
        loadFolders();
      } else {
        toast.error(result.error || "创建文件夹失败");
      }
    } catch (error) {
      toast.error("创建文件夹失败");
      console.error("Error creating folder:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  // 编辑文件夹
  const handleEditFolder = async () => {
    if (!editingFolder || !editName.trim()) {
      toast.error("请输入文件夹名称");
      return;
    }

    setEditLoading(true);
    try {
      const result = await updateFolder(editingFolder.id, editName.trim(), editDesc.trim());
      if (result.success) {
        toast.success("文件夹更新成功");
        setEditDialogOpen(false);
        setEditingFolder(null);
        setEditName("");
        setEditDesc("");
        loadFolders();
      } else {
        toast.error(result.error || "更新文件夹失败");
      }
    } catch (error) {
      toast.error("更新文件夹失败");
      console.error("Error updating folder:", error);
    } finally {
      setEditLoading(false);
    }
  };

  // 删除文件夹
  const handleDeleteFolder = async (folder: Folder) => {
    const drawingCount = folderCounts[folder.id] || 0;
    
    if (drawingCount > 0) {
      toast.error(`无法删除文件夹：文件夹中还有 ${drawingCount} 个绘图文件`);
      return;
    }

    const confirmed = window.confirm(`确定要删除文件夹 "${folder.name}" 吗？`);
    if (!confirmed) return;

    try {
      const result = await deleteFolder(folder.id);
      if (result.success) {
        toast.success("文件夹删除成功");
        loadFolders();
        
        // 如果删除的是当前选中的文件夹，清空选择
        if (selectedFolderId === folder.id) {
          onFolderSelect("");
        }
      } else {
        toast.error(result.error || "删除文件夹失败");
      }
    } catch (error) {
      toast.error("删除文件夹失败");
      console.error("Error deleting folder:", error);
    }
  };

  // 打开编辑弹窗
  const openEditDialog = (folder: Folder) => {
    setEditingFolder(folder);
    setEditName(folder.name);
    setEditDesc(folder.desc);
    setEditDialogOpen(true);
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadFolders} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 创建文件夹按钮 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          共 {folders.length} 个文件夹
        </span>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          新建文件夹
        </Button>
      </div>

      {/* 文件夹网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <Card 
            key={folder.id} 
            className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${
              selectedFolderId === folder.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onFolderSelect(folder.id)}
          >
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium truncate flex-1">
                  {folder.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(folder);
                    }}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                {selectedFolderId === folder.id ? (
                  <FolderOpen className="w-12 h-12 text-blue-500 mb-2" />
                ) : (
                  <Folder className="w-12 h-12 text-gray-400 mb-2" />
                )}
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    {folderCounts[folder.id] || 0} 个文件
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {format(new Date(folder.createdAt), 'MM/dd', { locale: zhCN })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 创建文件夹弹窗 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新文件夹</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">文件夹名称</Label>
              <Input
                id="folder-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="请输入文件夹名称"
              />
            </div>
            <div>
              <Label htmlFor="folder-desc">描述（可选）</Label>
              <Input
                id="folder-desc"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="请输入文件夹描述"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateDialogOpen(false)}
              disabled={createLoading}
            >
              取消
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={createLoading || !createName.trim()}
            >
              {createLoading ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑文件夹弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑文件夹</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-folder-name">文件夹名称</Label>
              <Input
                id="edit-folder-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="请输入文件夹名称"
              />
            </div>
            <div>
              <Label htmlFor="edit-folder-desc">描述（可选）</Label>
              <Input
                id="edit-folder-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="请输入文件夹描述"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              取消
            </Button>
            <Button 
              onClick={handleEditFolder}
              disabled={editLoading || !editName.trim()}
            >
              {editLoading ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderGrid;
