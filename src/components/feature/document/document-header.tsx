"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
// 修改 DocumentHeader 组件，添加导出菜单
import { DocumentExportMenu } from "./document-export-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Save,
  ArrowLeft,
  Share2,
  Download,
  History,
  Star,
  Menu,
  Lock,
  Users,
  Globe,
  Loader2
} from "lucide-react";
import dayjs from "dayjs";

// 在组件参数中添加 id 属性
interface DocumentHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  isFavorite: boolean;
  toggleFavorite: () => void;
  lastSaveTime: Date | null;
  isDirty: boolean;
  updatedAt?: string;
  onHistoryClick: () => void;
  onShareClick: () => void;
  onSave: () => void;
  onMenuClick: () => void;
  navigateBack: () => void;
  sharingLevel: string;
  setIsDirty: (dirty: boolean) => void;
  id: string; // 新增: 文档ID
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  title,
  onTitleChange,
  isFavorite,
  toggleFavorite,
  lastSaveTime,
  isDirty,
  updatedAt,
  onHistoryClick,
  onShareClick,
  onSave,
  onMenuClick,
  navigateBack,
  sharingLevel,
  setIsDirty,
  id
}) => {
  // 在 DocumentHeader 组件内
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(e.target.value);
    setIsDirty(true);
  };
  // 收藏按钮处理函数
  const handleFavoriteClick = async () => {
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      toggleFavorite();
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-14 items-center">
        <div className="mr-4">
          <Button variant="ghost" size="icon" onClick={navigateBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex items-center space-x-2">
          <Input
            value={title}
            onChange={handleTitleChange}
            className="max-w-60 md:max-w-md"
            placeholder="文档标题"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteClick}
                  className={`transition-all ${
                    isFavorite
                      ? "text-yellow-400 hover:text-yellow-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  disabled={favoriteLoading}
                  title={isFavorite ? "取消收藏" : "添加到收藏"}
                >
                  {favoriteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFavorite ? (
                    <Star className="h-4 w-4 fill-yellow-400" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? "从收藏中移除" : "添加到收藏"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {updatedAt && (
            <Badge variant="outline" className="hidden md:inline-flex">
              上次编辑: {dayjs(updatedAt).fromNow()}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center mr-1">
            {lastSaveTime && (
              <span className="text-xs text-muted-foreground">
                保存于 {lastSaveTime.toLocaleTimeString()}
              </span>
            )}
            {isDirty && (
              <span className="text-xs text-amber-500 animate-pulse ml-2">有未保存的更改</span>
            )}
          </div>

          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={onHistoryClick}>
              <History className="h-4 w-4 mr-1" /> 历史
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" /> 分享
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    // 实现复制链接功能
                    navigator.clipboard.writeText(
                      `https://example.com/shared/doc/${Math.random().toString(36).substring(7)}`
                    );
                  }}
                >
                  复制分享链接
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShareClick}>管理访问权限</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setIsDirty(true);
                    const newSharingLevel = "private";
                    // 在实际应用中这里应该调用 setSharingLevel("private")
                  }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  仅自己可见
                  {sharingLevel === "private" && " ✓"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsDirty(true);
                    const newSharingLevel = "limited";
                    // 在实际应用中这里应该调用 setSharingLevel("limited")
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  指定人员可见
                  {sharingLevel === "limited" && " ✓"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsDirty(true);
                    const newSharingLevel = "public";
                    // 在实际应用中这里应该调用 setSharingLevel("public")
                  }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  公开
                  {sharingLevel === "public" && " ✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 导出菜单 */}
            <DocumentExportMenu id={id} disabled={isDirty} />

            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              size="sm"
              onClick={onSave}
            >
              <Save className="h-4 w-4 mr-1" /> 保存
            </Button>

            <Button variant="ghost" size="sm" onClick={onMenuClick}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
