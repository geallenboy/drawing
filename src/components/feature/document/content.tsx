// file-list/content.tsx
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFileListStore } from "@/store/fileStore";
import EmptyState from "./empty-state";
import LoadingState from "./loading-state";
import GridView from "./grid-view";
import TableView from "./table-view";

const FileListContent = () => {
  const {
    loading,
    filteredFileList,
    currentData,
    viewType,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    searchQuery,
    selectedTypes,
    selectedTags,
    dateRange,
    clearFilters,
    createNewFile
  } = useFileListStore();

  // 渲染分页
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const goToPreviousPage = () => {
      setCurrentPage(Math.max(currentPage - 1, 1));
    };

    const goToNextPage = () => {
      setCurrentPage(Math.min(currentPage + 1, totalPages));
    };

    const goToPage = (page: number) => {
      setCurrentPage(page);
    };

    return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          当前显示 {filteredFileList.length} 个文件中的 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, filteredFileList.length)} 个
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      </div>
    );
  };

  // 主内容渲染
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">全部文件</TabsTrigger>
        <TabsTrigger value="recent">最近修改</TabsTrigger>
        <TabsTrigger value="favorites">收藏文件</TabsTrigger>
        <TabsTrigger value="shared">共享文件</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="space-y-4">
        {loading ? (
          <LoadingState />
        ) : filteredFileList.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            hasFilters={
              selectedTypes.length > 0 ||
              selectedTags.length > 0 ||
              Boolean(dateRange.from) ||
              Boolean(dateRange.to)
            }
            createNewFile={createNewFile}
            clearFilters={clearFilters}
          />
        ) : (
          <>
            {viewType === "list" ? (
              <TableView files={currentData} />
            ) : (
              <GridView files={currentData} />
            )}
            {renderPagination()}
          </>
        )}
      </TabsContent>
      <TabsContent value="recent">
        <div className="p-8 text-center text-muted-foreground">
          <p>最近修改的文件将显示在这里</p>
        </div>
      </TabsContent>
      <TabsContent value="favorites">
        <div className="p-8 text-center text-muted-foreground">
          <p>收藏的文件将显示在这里</p>
        </div>
      </TabsContent>
      <TabsContent value="shared">
        <div className="p-8 text-center text-muted-foreground">
          <p>共享的文件将显示在这里</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default FileListContent;
