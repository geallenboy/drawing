"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, MoreHorizontal, Star, Clock } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// 模拟文档数据
const mockDocuments = [
  {
    id: "1",
    name: "项目计划书",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
    favorite: true
  },
  {
    id: "2",
    name: "会议记录 - 产品讨论",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3小时前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2天前
    favorite: false
  },
  {
    id: "3",
    name: "用户需求规格说明书",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12小时前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3天前
    favorite: true
  },
  {
    id: "4",
    name: "周报 - 第32周",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2天前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7天前
    favorite: false
  },
  {
    id: "5",
    name: "产品发布计划",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4天前
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14天前
    favorite: false
  }
];

// 获取文档数据
const fetchRecentDocuments = async () => {
  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 600));
  return mockDocuments;
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

export const RecentDocuments = () => {
  const [documents, setDocuments] = useState<typeof mockDocuments>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const data = await fetchRecentDocuments();
        setDocuments(data);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // 切换收藏状态
  const toggleFavorite = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, favorite: !doc.favorite } : doc))
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

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileText className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">暂无文档</h3>
        <p className="text-sm text-gray-500 mb-4">您还没有创建任何文档</p>
        <Button asChild>
          <Link href="/document/new">创建文档</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 mr-3 rounded-full bg-blue-50 dark:bg-blue-950">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <Link href={`/document/${doc.id}`} className="hover:underline">
                    <h4 className="font-medium">{doc.name}</h4>
                  </Link>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>更新于 {formatTime(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => toggleFavorite(doc.id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Star
                    className={`h-4 w-4 ${
                      doc.favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
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
                      <Link href={`/document/${doc.id}`}>打开</Link>
                    </DropdownMenuItem>
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
          <Link href="/document">查看全部文档</Link>
        </Button>
      </div>
    </div>
  );
};
