// file-list/filter-panel.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useFileListStore } from "@/store/fileStore"; // 移除对 fileTypes, fileTags 的导入

const FileListFilterPanel = () => {
  const {
    showFilterPanel,
    setShowFilterPanel,
    selectedTypes,
    setSelectedTypes,
    selectedTags,
    setSelectedTags,
    dateRange,
    setDateRange,
    clearFilters,
    allTags, // 从 store 中获取真实标签
    allTypes // 从 store 中获取真实类型
  } = useFileListStore();

  if (!showFilterPanel) return null;

  return (
    <>
      {/* 筛选面板 */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>筛选文件</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowFilterPanel(false)}>
              关闭
            </Button>
          </div>
          <CardDescription>通过多个条件筛选文件</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">文件类型</h4>
              {allTypes.length > 0 ? (
                <div className="space-y-2">
                  {allTypes.map((type) => (
                    <div key={type} className="flex items-center">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(selectedTypes.filter((t) => t !== type));
                          }
                        }}
                      />
                      <label htmlFor={`type-${type}`} className="ml-2 text-sm">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">无可用文件类型</div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">文件标签</h4>
              {allTags.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {allTags.map((tag) => (
                    <div key={tag} className="flex items-center">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          }
                        }}
                      />
                      <label htmlFor={`tag-${tag}`} className="ml-2 text-sm">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">无可用文件标签</div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">创建日期</h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="date-from" className="text-xs text-muted-foreground">
                    从
                  </label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="text-xs text-muted-foreground">
                    到
                  </label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <Button variant="outline" onClick={clearFilters}>
              清除筛选
            </Button>
            <Button onClick={() => setShowFilterPanel(false)}>应用筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 已选标签显示 - 只在文件存在且应用了标签筛选时显示 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-md mb-4">
          <span className="text-sm font-medium">已选标签：</span>
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                className="ml-1 hover:bg-muted rounded-full"
                aria-label={`移除标签 ${tag}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
            清除全部
          </Button>
        </div>
      )}

      {/* 已选类型显示 */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-md mb-4">
          <span className="text-sm font-medium">已选类型：</span>
          {selectedTypes.map((type) => (
            <Badge key={type} variant="outline" className="flex items-center gap-1">
              {type}
              <button
                onClick={() => setSelectedTypes(selectedTypes.filter((t) => t !== type))}
                className="ml-1 hover:bg-muted rounded-full"
                aria-label={`移除类型 ${type}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setSelectedTypes([])}>
            清除全部
          </Button>
        </div>
      )}
    </>
  );
};

export default FileListFilterPanel;
