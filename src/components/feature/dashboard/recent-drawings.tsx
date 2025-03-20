"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PenTool, MoreHorizontal, Star, Clock } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// 模拟绘图数据
const mockDrawings = [
  {
    id: "1",
    name: "系统架构图",
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2小时前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2天前
    favorite: true,
    thumbnail: "/thumbnails/architecture.png" // 实际上会是真实的缩略图路径
  },
  {
    id: "2",
    name: "产品流程图",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3天前
    favorite: false,
    thumbnail: "/thumbnails/flow.png"
  },
  {
    id: "3",
    name: "页面布局设计",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5天前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5天前
    favorite: true,
    thumbnail: "/thumbnails/layout.png"
  },
  {
    id: "4",
    name: "数据模型图",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3天前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10天前
    favorite: false,
    thumbnail: "/thumbnails/data-model.png"
  }
];

// 获取绘图数据
const fetchRecentDrawings = async () => {
  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 600));
  return mockDrawings;
};

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else {
    return `${diffDays}天前`;
  }
};

export const RecentDrawings = () => {
  const [drawings, setDrawings] = useState<typeof mockDrawings>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDrawings = async () => {
      try {
        const data = await fetchRecentDrawings();
        setDrawings(data);
      } catch (error) {
        console.error("Failed to fetch drawings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDrawings();
  }, []);

  // 切换收藏状态
  const toggleFavorite = (id: string) => {
    setDrawings((prev) =>
      prev.map((drawing) =>
        drawing.id === id ? { ...drawing, favorite: !drawing.favorite } : drawing
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (drawings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <PenTool className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">暂无绘图</h3>
        <p className="text-sm text-gray-500 mb-4">您还没有创建任何绘图</p>
        <Button asChild>
          <Link href="/drawing/new">创建绘图</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {drawings.map((drawing) => (
        <Card key={drawing.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 mr-3 rounded-full bg-green-50 dark:bg-green-950">
                  <PenTool className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <Link href={`/drawing/${drawing.id}`} className="hover:underline">
                    <h4 className="font-medium">{drawing.name}</h4>
                  </Link>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>更新于 {formatTime(drawing.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => toggleFavorite(drawing.id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Star
                    className={`h-4 w-4 ${
                      drawing.favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                    }`}
                  />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/drawing/${drawing.id}`}>打开</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>导出图片</DropdownMenuItem>
                    <DropdownMenuItem>复制链接</DropdownMenuItem>
                    <DropdownMenuItem>重命名</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center mt-4">
        <Button variant="outline" asChild>
          <Link href="/drawing">查看全部绘图</Link>
        </Button>
      </div>
    </div>
  );
};
