// file-list/empty-state.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface EmptyStateProps {
  searchQuery?: string;
  hasFilters?: boolean;
  createNewFile: () => void;
  clearFilters: () => void;
}

const EmptyState = ({ searchQuery, hasFilters, createNewFile, clearFilters }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-gray-400 mb-4">
        <FileText size={64} strokeWidth={1} />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">暂无文件</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {searchQuery || hasFilters
          ? "没有找到符合筛选条件的文件，请尝试调整筛选条件。"
          : "开始创建您的第一个文件，记录您的想法和创意。"}
      </p>
      <div className="flex gap-3">
        <Button onClick={createNewFile}>
          <Plus className="mr-2 h-4 w-4" /> 新建文件
        </Button>
        {(searchQuery || hasFilters) && (
          <Button variant="outline" onClick={clearFilters}>
            清除筛选条件
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
