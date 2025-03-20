"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { fileTagsList } from "@/config/file";

interface DocumentSettingsPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  fileData: any;
  sharingLevel: string;
  editorTheme: string;
  setEditorTheme: (theme: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onSave: () => void;
  setIsDirty: (dirty: boolean) => void;
  navigateToDocuments: () => void;
}

export const DocumentSettingsPanel: React.FC<DocumentSettingsPanelProps> = ({
  isOpen,
  setIsOpen,
  title,
  setTitle,
  description,
  setDescription,
  fileData,
  sharingLevel,
  editorTheme,
  setEditorTheme,
  selectedTags,
  onTagToggle,
  onSave,
  setIsDirty,
  navigateToDocuments
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setIsDirty(true);
  };

  const handleThemeChange = (theme: string) => {
    setEditorTheme(theme);
    setIsDirty(true);
  };

  // 模拟添加自定义标签
  const [customTagInput, setCustomTagInput] = React.useState("");

  const addCustomTag = () => {
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      onTagToggle(customTagInput.trim());
      setCustomTagInput("");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>文档信息</SheetTitle>
          <SheetDescription>查看和编辑文档属性</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info">基本信息</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
              <TabsTrigger value="tags">标签</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 py-4">
              <div>
                <Label htmlFor="docTitle">文档标题</Label>
                <Input
                  id="docTitle"
                  value={title}
                  onChange={handleTitleChange}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="docDescription">文档描述</Label>
                <Textarea
                  id="docDescription"
                  value={description}
                  onChange={handleDescriptionChange}
                  className="mt-1.5 resize-none"
                  rows={3}
                  placeholder="添加文档描述..."
                />
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>
                    {fileData?.createdAt
                      ? dayjs(fileData.createdAt).format("YYYY-MM-DD HH:mm")
                      : "新文档"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">最后修改</span>
                  <span>
                    {fileData?.updatedAt ? dayjs(fileData.updatedAt).fromNow() : "未保存"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">文档大小</span>
                  <span>{fileData?.fileSize || Math.floor(Math.random() * 100) + 10} KB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">访问权限</span>
                  <Badge
                    variant={
                      sharingLevel === "private"
                        ? "outline"
                        : sharingLevel === "limited"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {sharingLevel === "private"
                      ? "私密"
                      : sharingLevel === "limited"
                      ? "受限"
                      : "公开"}
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>编辑器主题</Label>
                    <p className="text-sm text-muted-foreground">更改编辑器的外观</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        {editorTheme === "default"
                          ? "默认主题"
                          : editorTheme === "paper"
                          ? "纸张主题"
                          : editorTheme === "dark"
                          ? "暗色主题"
                          : "自定义主题"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleThemeChange("default")}>
                        默认主题
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleThemeChange("paper")}>
                        纸张主题
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                        暗色主题
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动保存</Label>
                    <p className="text-sm text-muted-foreground">自动保存您的编辑内容</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>拼写检查</Label>
                    <p className="text-sm text-muted-foreground">在编辑时检查拼写错误</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-red-600">删除文档</Label>
                    <p className="text-sm text-muted-foreground">永久删除此文档（不可恢复）</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        删除
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认删除文档</DialogTitle>
                        <DialogDescription>
                          此操作无法撤销。文档将被永久删除，且无法恢复。
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">取消</Button>
                        <Button variant="destructive" onClick={navigateToDocuments}>
                          确认删除
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tags" className="py-4">
              <Label>文档标签</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                添加标签以便更好地组织和查找文档
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {fileTagsList.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags?.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-4">
                <Label>自定义标签</Label>
                <div className="flex mt-1.5">
                  <Input
                    placeholder="输入自定义标签"
                    className="rounded-r-none"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                  />
                  <Button className="rounded-l-none" onClick={addCustomTag}>
                    添加
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button className="w-full" onClick={onSave}>
              保存更改
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
