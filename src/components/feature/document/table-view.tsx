// file-list/table-view.tsx
"use client";

import React from "react";
import { AIDTFile } from "@/drizzle/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowDownUp,
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  Share2,
  Star,
  Trash
} from "lucide-react";
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

interface TableViewProps {
  files: AIDTFile[];
}

const TableView = ({ files }: TableViewProps) => {
  const router = useRouter();
  const {
    confirmDeleteFile,
    toggleFavorite,
    toggleSelectFile,
    selectAllFiles,
    selectedFiles,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection
  } = useFileListStore();

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

  // 格式化文件大小
  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };

  const editFile = (id: string) => {
    router.push(`/document/${id}`);
  };

  const shareFile = (id: string) => {
    toast.success("分享链接已复制到剪贴板");
  };

  const duplicateFile = (id: string) => {
    // 这个功能在store中没有实现，这里只是提示
    toast.success("文件已复制");
  };

  const downloadFile = (id: string) => {
    toast.success("文件开始下载");
  };

  const handleSortChange = (field: any) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedFiles.length > 0 && selectedFiles.length === files.length}
                onCheckedChange={selectAllFiles}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSortChange("name")}
                className="flex items-center p-0 h-auto font-semibold"
              >
                文件名
                {sortField === "name" && (
                  <ArrowDownUp
                    className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSortChange("createdAt")}
                className="flex items-center p-0 h-auto font-semibold"
              >
                创建时间
                {sortField === "createdAt" && (
                  <ArrowDownUp
                    className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSortChange("updatedAt")}
                className="flex items-center p-0 h-auto font-semibold"
              >
                更新时间
                {sortField === "updatedAt" && (
                  <ArrowDownUp
                    className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead>类型</TableHead>
            <TableHead>标签</TableHead>
            <TableHead>大小</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => toggleSelectFile(file.id)}
                  aria-label={`Select ${file.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleFavorite(file.id)}
                    className="mr-2 focus:outline-none"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        file.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                      }`}
                    />
                  </button>
                  <div className="flex flex-col">
                    <span>{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {file.sharingLevel === "public" && <Share2 className="h-3 w-3 inline mr-1" />}
                      ID: {file.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{dayjs(file.createdAt).format("YYYY-MM-DD HH:mm")}</TableCell>
              <TableCell>{dayjs(file.updatedAt).format("YYYY-MM-DD HH:mm")}</TableCell>
              <TableCell>{getFileType(file)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {getFileTags(file).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{formatFileSize(10)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => editFile(file.id)}
                    title="编辑"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => shareFile(file.id)}
                    title="分享"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableView;
