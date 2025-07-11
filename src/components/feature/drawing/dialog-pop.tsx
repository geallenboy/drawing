"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { FolderPlus, Loader2, Sparkles, Folder } from "lucide-react";
import { createDrawingWithMinioAction } from "@/actions/drawing/drawing-action";
import { getFolders } from "@/actions/folder/folder-actions";
import { useUserStore } from "@/store/userStore";
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

const DialogPop = ({ currentFolderId }: { currentFolderId?: string | null }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId || "");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [open, setOpen] = useState(false);
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 加载文件夹列表
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const result = await getFolders();
        if (result.success) {
          setFolders(result.folders || []);
        }
      } catch (error) {
        console.error("加载文件夹失败:", error);
      }
    };

    if (open) {
      loadFolders();
    }
  }, [open]);

  // 当 currentFolderId 改变时，更新选中的文件夹
  useEffect(() => {
    if (currentFolderId) {
      setSelectedFolderId(currentFolderId);
    }
  }, [currentFolderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("请输入画图名称");
      return;
    }

    if (!selectedFolderId) {
      toast.error("请选择一个文件夹");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error, success } = await createDrawingWithMinioAction({
        name: name.trim(),
        desc: description.trim(),
        data: [],
        userId: user?.id || "",
        parentFolderId: selectedFolderId
      });

      if (success && data?.drawing) {
        toast.success("画图创建成功！");
        setOpen(false);
        setName("");
        setDescription("");
        router.push(`/drawing/${data.drawing.id}`);
      } else {
        toast.error(error || "创建画图失败");
      }
    } catch (err) {
      console.error("创建画图时发生错误:", err);
      toast.error("创建画图失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!loading) {
      setOpen(isOpen);
      if (!isOpen) {
        // 关闭时重置表单
        setName("");
        setDescription("");
      }
    }
  };

  const generateRandomName = () => {
    const adjectives = ["创意", "惊艳", "优雅", "精美", "现代", "简约", "炫酷", "温馨"];
    const nouns = ["画图", "设计", "作品", "创作", "艺术", "画作"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const timestamp = new Date().toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[/:\s]/g, '');
    
    setName(`${randomAdj}的${randomNoun}_${timestamp}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 flex text-sm h-8 hover:bg-blue-700 bg-blue-600 transition-colors"
        >
          <FolderPlus className="h-4 w-4" /> 创建画图
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogTitle className="text-xl font-semibold">创建新画图</DialogTitle>
        <DialogDescription className="text-gray-600">
          为您的新画图设置名称和描述，然后开始创作吧！
        </DialogDescription>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-sm font-medium">
                  画图名称 <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateRandomName}
                  className="text-xs h-6 px-2"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  随机生成
                </Button>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入画图名称..."
                className="w-full"
                disabled={loading}
                maxLength={50}
              />
              <div className="text-xs text-gray-500 text-right">
                {name.length}/50
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                描述 <span className="text-gray-400">(可选)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述一下这个画图的用途或内容..."
                className="w-full resize-none"
                rows={3}
                disabled={loading}
                maxLength={200}
              />
              <div className="text-xs text-gray-500 text-right">
                {description.length}/200
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder" className="text-sm font-medium">
                选择文件夹 <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择一个文件夹" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        <span>{folder.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {folders.length === 0 && (
                <p className="text-xs text-gray-500">
                  没有找到文件夹，请先创建一个文件夹
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || !name.trim() || !selectedFolderId}
              className="min-w-[100px]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "创建中..." : "创建画图"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPop;
