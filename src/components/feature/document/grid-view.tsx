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
import { useFileListStore } from "@/store/fileStore";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GridViewProps {
  files: AIDTFile[];
}

const GridView = ({ files }: GridViewProps) => {
  const router = useRouter();
  const { confirmDeleteFile, toggleFavorite, isFavoriteLoading } = useFileListStore();

  const editFile = (id: string) => {
    router.push(`/document/${id}`);
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
            <CardDescription className="text-xs mt-1"></CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>修改于 {dayjs(file.updatedAt).format("YYYY-MM-DD HH:mm")}</span>
              <div className="flex items-center">
                {<Share2 className="h-3 w-3 mr-1" />}
                <button
                  onClick={() => toggleFavorite(file.id)}
                  className="focus:outline-none"
                  disabled={isFavoriteLoading[file.id]}
                >
                  {file.isFavorite ? (
                    // 收藏状态 - 填充的星星
                    <Star
                      className={`h-4 w-4 text-yellow-500 ${
                        isFavoriteLoading[file.id] ? "opacity-50" : ""
                      }`}
                      fill="#EAB308" // 固定黄色填充
                    />
                  ) : (
                    // 未收藏状态 - 轮廓星星
                    <Star
                      className={`h-4 w-4 text-gray-400 ${
                        isFavoriteLoading[file.id] ? "opacity-50" : ""
                      }`}
                      fill="none" // 确保没有填充
                    />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GridView;
