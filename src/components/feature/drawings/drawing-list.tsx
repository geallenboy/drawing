"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Grid3X3, 
  List, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  RefreshCw, 
  Filter,
  Calendar,
  User,
  Eye,
  Palette,
  Search,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Edit2,
  Check,
  X,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { updateDrawingAction, getDrawingsByFolderIdAction } from "@/actions/drawing/drawing-action";

import { getFolders } from "@/actions/folder/folder-actions";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

type Drawing = {
  id: string;
  name: string;
  desc?: string;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  isFavorite?: boolean;
  isDeleted?: boolean;
  parentFolderId?: string;
  tags?: string[];
  viewCount?: number;
};

type Folder = {
  id: string;
  name: string;
  desc: string;
  parentFolderId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ViewMode = "grid" | "list";
type SortOption = "latest" | "oldest" | "title" | "popularity";
type FilterOption = "all" | "mine" | "favorites";

type DrawingListProps = {

  drawingId?: string | null;

};

  const DrawingList = ({ drawingId }: DrawingListProps) => {
  const router = useRouter();
  const { user } = useUser();
  
  // 状态管理
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  
  // 编辑名称状态
  const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 加载数据（只加载绘图，不加载文件夹）
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 不再加载文件夹，文件夹由 FolderGrid 组件管理
      setFolders([]);
      
      // 只有在选择了具体文件夹时才加载绘图
      if (drawingId) {
        const drawingsResult = await getDrawingsByFolderIdAction(drawingId);
        
        if (drawingsResult.error) {
          setError(drawingsResult.error);
        } else {
          setDrawings(drawingsResult.data?.drawings || []);
        }
      } else {
        // 没有选择文件夹时显示空状态
        setDrawings([]);
      }
    } catch (err) {
      setError("加载数据失败");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [drawingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 筛选和排序逻辑
  const filteredAndSortedDrawings = React.useMemo(() => {
    let filtered = drawings;

    // 搜索过滤
   

    // 类型过滤
    switch (filterBy) {
      case "mine":
        filtered = filtered.filter(drawing => drawing.userId === user?.id);
        break;
      case "favorites":
        filtered = filtered.filter(drawing => favorites.has(drawing.id));
        break;
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.name.localeCompare(b.name);
        case "popularity":
          return (b.viewCount || 0) - (a.viewCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [drawings, filterBy, sortBy, favorites, user?.id]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredAndSortedDrawings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDrawings = filteredAndSortedDrawings.slice(startIndex, startIndex + itemsPerPage);



  // 开始编辑名称
  const startEditingName = (drawing: Drawing) => {
    setEditingDrawingId(drawing.id);
    setEditingName(drawing.name);
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingDrawingId(null);
    setEditingName("");
  };

  // 保存名称
  const saveDrawingName = async () => {
    if (!editingDrawingId || !editingName.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
     
      const result = await updateDrawingAction(editingDrawingId, { name: editingName.trim() });
      
      if (result.success) {
        // 更新本地状态
        setDrawings(prev => 
          prev.map(drawing => 
            drawing.id === editingDrawingId 
              ? { ...drawing, name: editingName.trim() }
              : drawing
          )
        );
        toast.success("名称修改成功");
        cancelEditing();
      } else {
        toast.error(result.error || "修改名称失败");
      }
    } catch (error) {
      console.error("Error updating drawing name:", error);
      toast.error("修改名称失败");
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理按键事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveDrawingName();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    );
  }

  // 渲染绘图卡片
  const renderDrawingCard = (drawing: Drawing) => {
   

    return (
      <Card key={drawing.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              {editingDrawingId === drawing.id ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    className="h-8 text-sm"
                    disabled={isUpdating}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={saveDrawingName}
                    disabled={isUpdating}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={cancelEditing}
                    disabled={isUpdating}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <CardTitle 
                  className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors "
                  onDoubleClick={() => startEditingName(drawing)}
                  title="双击编辑名称"
                >
                  {drawing.name}
                </CardTitle>
              )}
            </div>
           
          </div>
          
          {drawing.desc && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {drawing.desc}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* 预览区域 */}
          <div 
            className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-3 flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-200 transition-colors"
            onClick={() => router.push(`/drawings/${drawing.id}`)}
          >
            <Palette className="h-8 w-8 text-blue-400" />
          </div>

          {/* 底部信息 */}
          <div className="space-y-2">
            {/* 用户信息和时间 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={drawing.user?.imageUrl} />
                  <AvatarFallback>
                    {drawing.user?.firstName?.[0] || drawing.user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{drawing.user?.firstName || drawing.user?.email?.split('@')[0] || '匿名用户'}</span>
              </div>
              <time>{format(new Date(drawing.updatedAt), 'yyyy/MM/dd HH:mm', { locale: zhCN })}</time>
            </div>

          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染列表项
  const renderDrawingListItem = (drawing: Drawing) => {
  

    return (
      <Card key={drawing.id} className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* 预览缩略图 */}
            <div 
              className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
              onClick={() => router.push(`/drawings/${drawing.id}`)}
            >
              <Palette className="h-6 w-6 text-blue-400" />
            </div>

            {/* 内容区域 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                {editingDrawingId === drawing.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      className="h-8"
                      disabled={isUpdating}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={saveDrawingName}
                      disabled={isUpdating}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={cancelEditing}
                      disabled={isUpdating}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <h3 
                    className="font-medium truncate cursor-pointer hover:text-blue-600 flex-1"
                    onClick={() => router.push(`/drawings/${drawing.id}`)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditingName(drawing);
                    }}
                    title="双击编辑名称，单击查看详情"
                  >
                    {drawing.name}
                  </h3>
                )}
                
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={drawing.user?.imageUrl} />
                      <AvatarFallback>
                        {drawing.user?.firstName?.[0] || drawing.user?.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{drawing.user?.firstName || drawing.user?.email?.split('@')[0] || '匿名用户'}</span>
                  </div>
                </div>

                <time>{format(new Date(drawing.updatedAt), 'yyyy/MM/dd HH:mm', { locale: zhCN })}</time>
              </div>
            </div>

           
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* 左侧：视图模式切换 */}
        <div className="flex items-center space-x-2">
          {/* 返回上一级 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
              <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">
            共 {filteredAndSortedDrawings.length} 个绘图
          </span>
        </div>

        {/* 右侧：筛选和排序 */}
        <div className="flex items-center space-x-2">
       

          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">最新更新</SelectItem>
              <SelectItem value="oldest">最早创建</SelectItem>
              <SelectItem value="title">标题排序</SelectItem>
              <SelectItem value="popularity">热门程度</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 绘图列表 */}
      {!drawingId ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Palette className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">请选择一个文件夹</h3>
          <p className="text-muted-foreground text-center mb-4">
            请在上方选择一个文件夹来查看其中的绘图文件
          </p>
        </div>
      ) : filteredAndSortedDrawings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Palette className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无绘图</h3>
          <p className="text-muted-foreground text-center mb-4">
            "这个文件夹中还没有绘图文件"
          </p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* 只显示绘图，不显示文件夹 */}
              {paginatedDrawings.map(renderDrawingCard)}
            </div>
          ) : (
            <div className="space-y-3">
              {/* 列表模式下只显示绘图 */}
              {paginatedDrawings.map(renderDrawingListItem)}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DrawingList;
