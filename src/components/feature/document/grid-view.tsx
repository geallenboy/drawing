// file-list/grid-view.tsx
"use client";

import React from "react";
import { AIDTFile } from "@/drizzle/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, Edit, MoreHorizontal, Share2, Star, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useFileListStore, fileTypes, fileTags } from "@/store/fileStore";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GridViewProps {
  files: AIDTFile[];
}

const GridView = ({ files }: GridViewProps) => {
  const router = useRouter();
  const { confirmDeleteFile, toggleFavorite } = useFileListStore();

  // 模拟函数：获取文件类型
  const getFileType = (file: AIDTFile) => {
    const typeIndex = file.id.charCodeAt(0) % fileTypes.length;
    return fileTypes[typeIndex];
  };

  // 模拟函数：获取文件标签
  const getFileTags = (file: AIDTFile) => {
    const tagCount = (file.id.charCodeAt(2) % 3) + 1; // 1到3个标签
    const tags: string[] = [];

    for (let i = 0; i < tagCount; i++) {
      const tagIndex = file.id.charCodeAt(i + 1) % fileTags.length;
      if (!tags.includes(fileTags[tagIndex])) {
        tags.push(fileTags[tagIndex]);
      }
    }

    return tags;
  };

  const editFile = (id: string) => {
    router.push(`/document/${id}`);
  };

  const shareFile = (id: string) => {
    toast.success("分享链接已复制到剪贴板");
  };

  const duplicateFile = (id: string) => {
    toast.success("文件已复制");
  };

  const downloadFile = (id: string) => {
    toast.success("文件开始下载");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 space-y-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 overflow-hidden">
                <CardTitle className="text-base truncate">{file.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => editFile(file.id)}>
                    <Edit className="h-4 w-4 mr-2" /> 编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareFile(file.id)}>
                    <Share2 className="h-4 w-4 mr-2" /> 分享
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateFile(file.id)}>
                    <Copy className="h-4 w-4 mr-2" /> 复制
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadFile(file.id)}>
                    <Download className="h-4 w-4 mr-2" /> 下载
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => confirmDeleteFile(file.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" /> 删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="text-xs mt-1">{getFileType(file)}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>修改于 {dayjs(file.updatedAt).fromNow()}</span>
              <div className="flex items-center">
                {file.sharingLevel === "public" && <Share2 className="h-3 w-3 mr-1" />}
                <button onClick={() => toggleFavorite(file.id)} className="focus:outline-none">
                  <Star
                    className={`h-4 w-4 ${
                      file.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {getFileTags(file).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GridView;
