// file-list/content.tsx
"use client";

import React, { useState, useEffect } from "react";
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
    createNewFile,
    loadFiles,

    fileList
  } = useFileListStore();

  // 添加各标签页的状态管理
  const [activeTab, setActiveTab] = useState("all");
  const [recentFiles, setRecentFiles] = useState<typeof fileList>([]);
  const [favoriteFiles, setFavoriteFiles] = useState<typeof fileList>([]);
  const [tabLoading, setTabLoading] = useState({
    recent: false,
    favorites: false,
    shared: false
  });

  // 处理标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // 根据标签加载相应数据
    switch (tab) {
      case "all":
        // 全部文件默认在打开页面时已加载
        break;

      case "recent":
        loadRecentFiles();
        break;

      case "favorites":
        loadFavoriteFiles();
        break;

        break;
    }
  };

  // 加载最近修改的文件
  const loadRecentFiles = async () => {
    if (recentFiles.length > 0) return; // 如果已加载则不重复加载

    setTabLoading((prev) => ({ ...prev, recent: true }));

    try {
      // 从当前文件列表中筛选最近7天修改的文件
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 首先确保文件列表已加载
      if (fileList.length === 0) {
        await loadFiles({ refresh: true });
      }

      // 筛选并按修改时间排序
      const recent = fileList
        .filter((file) => new Date(file.updatedAt) > sevenDaysAgo)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setRecentFiles(recent);
    } catch (error) {
      console.error("加载最近文件失败:", error);
    } finally {
      setTabLoading((prev) => ({ ...prev, recent: false }));
    }
  };

  // 加载收藏的文件
  const loadFavoriteFiles = async () => {
    if (favoriteFiles.length > 0) return; // 如果已加载则不重复加载

    setTabLoading((prev) => ({ ...prev, favorites: true }));

    try {
      // 从当前文件列表中筛选收藏的文件，或者调用专门的API
      if (fileList.length === 0) {
        await loadFiles({ refresh: true });
      }

      const favorites = fileList.filter((file) => file.isFavorite === true);
      setFavoriteFiles(favorites);
    } catch (error) {
      console.error("加载收藏文件失败:", error);
    } finally {
      setTabLoading((prev) => ({ ...prev, favorites: false }));
    }
  };

  // 首次加载全部文件
  useEffect(() => {
    loadFiles();
  }, []);

  // 渲染分页
  const renderPagination = (totalItems: number, currentItems: any[]) => {
    const totalPageCount = Math.ceil(totalItems / pageSize);
    if (totalPageCount <= 1) return null;

    const goToPreviousPage = () => {
      setCurrentPage(Math.max(currentPage - 1, 1));
    };

    const goToNextPage = () => {
      setCurrentPage(Math.min(currentPage + 1, totalPageCount));
    };

    const goToPage = (page: number) => {
      setCurrentPage(page);
    };

    return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          当前显示 {totalItems} 个文件中的 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, totalItems)} 个
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
            {Array.from({ length: totalPageCount }, (_, i) => i + 1).map((page) => (
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
            disabled={currentPage === totalPageCount}
          >
            下一页
          </Button>
        </div>
      </div>
    );
  };

  // 获取当前标签页要显示的文件
  const getCurrentTabFiles = () => {
    const startIndex = (currentPage - 1) * pageSize;

    switch (activeTab) {
      case "all":
        return currentData; // 使用已分页的数据
      case "recent":
        return recentFiles.slice(startIndex, startIndex + pageSize);
      case "favorites":
        return favoriteFiles.slice(startIndex, startIndex + pageSize);

      default:
        return [];
    }
  };

  // 渲染文件列表或空状态
  const renderFileList = (files: typeof fileList, isLoading: boolean, emptyMessage: string) => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (files.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <p>{emptyMessage}</p>
          <Button onClick={createNewFile} className="mt-4">
            创建新文件
          </Button>
        </div>
      );
    }

    return <>{viewType === "list" ? <TableView files={files} /> : <GridView files={files} />}</>;
  };

  // 主内容渲染
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList>
        <TabsTrigger value="all">全部文件</TabsTrigger>
        <TabsTrigger value="recent">最近修改</TabsTrigger>
        <TabsTrigger value="favorites">收藏文件</TabsTrigger>
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
            {renderPagination(filteredFileList.length, currentData)}
          </>
        )}
      </TabsContent>

      <TabsContent value="recent" className="space-y-4">
        {renderFileList(getCurrentTabFiles(), tabLoading.recent, "过去7天内没有修改过的文件")}
        {recentFiles.length > 0 && renderPagination(recentFiles.length, getCurrentTabFiles())}
      </TabsContent>

      <TabsContent value="favorites" className="space-y-4">
        {renderFileList(getCurrentTabFiles(), tabLoading.favorites, "您还没有收藏任何文件")}
        {favoriteFiles.length > 0 && renderPagination(favoriteFiles.length, getCurrentTabFiles())}
      </TabsContent>
    </Tabs>
  );
};

export default FileListContent;
