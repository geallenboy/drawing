// file-list/toolbar.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Grid3x3, List, Plus, RefreshCcw, Search, SortAsc, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useFileListStore } from "@/store/fileStore";

interface FileListToolbarProps {
  refreshData: () => Promise<void>;
}

const FileListToolbar = ({ refreshData }: FileListToolbarProps) => {
  const {
    searchQuery,
    setSearchQuery,
    viewType,
    setViewType,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    showFilterPanel,
    setShowFilterPanel,
    selectedTypes,
    selectedTags,
    dateRange,
    createNewFile
  } = useFileListStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索在setSearchQuery中处理
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (field: any) => {
    if (field === sortField) {
      toggleSortDirection();
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getTotalFilters = () => {
    return (
      selectedTypes.length + selectedTags.length + (dateRange.from ? 1 : 0) + (dateRange.to ? 1 : 0)
    );
  };

  return (
    <>
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的文件</h1>
          <p className="text-muted-foreground mt-1">管理您创建的所有文档、表格和其他文件</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={createNewFile}>
            <Plus className="mr-2 h-4 w-4" /> 新建文件
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> 上传
          </Button>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCcw className="mr-2 h-4 w-4" /> 刷新
          </Button>
        </div>
      </div>

      {/* 工具栏: 搜索, 筛选, 视图切换 */}
      <div className="flex flex-col md:flex-row items-start gap-4">
        <form onSubmit={handleSearch} className="flex-grow max-w-lg">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </form>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowFilterPanel(!showFilterPanel)}>
            <Filter className="mr-2 h-4 w-4" />
            筛选
            {getTotalFilters() > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {getTotalFilters()}
              </Badge>
            )}
          </Button>

          <div className="border rounded-md p-1 flex">
            <Button
              variant={viewType === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className="px-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewType("grid")}
              className="px-2"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="mr-2 h-4 w-4" />
                排序
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange("name")}>
                {sortField === "name" && sortDirection === "asc" && "✓ "}
                按名称 (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleSortChange("name");
                  toggleSortDirection();
                }}
              >
                {sortField === "name" && sortDirection === "desc" && "✓ "}
                按名称 (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  handleSortChange("updatedAt");
                  setSortDirection("desc");
                }}
              >
                {sortField === "updatedAt" && sortDirection === "desc" && "✓ "}
                最近修改
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleSortChange("createdAt");
                  setSortDirection("desc");
                }}
              >
                {sortField === "createdAt" && sortDirection === "desc" && "✓ "}
                最近创建
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleSortChange("createdAt");
                  setSortDirection("asc");
                }}
              >
                {sortField === "createdAt" && sortDirection === "asc" && "✓ "}
                最早创建
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
};

export default FileListToolbar;
