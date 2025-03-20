"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PenTool, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";

// 在实际应用中，这些数据应该从服务器获取
// 这里使用模拟数据演示
const fetchStatistics = async () => {
  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    documentsCount: 24,
    drawingsCount: 18,
    recentEdits: 7,
    favorites: 12
  };
};

export const StatisticsCards = () => {
  const [stats, setStats] = useState({
    documentsCount: 0,
    drawingsCount: 0,
    recentEdits: 0,
    favorites: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchStatistics();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  const cards = [
    {
      title: "文档总数",
      value: stats.documentsCount,
      description: "所有创建的文档",
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "绘图总数",
      value: stats.drawingsCount,
      description: "所有创建的绘图",
      icon: <PenTool className="h-8 w-8 text-green-500" />,
      color: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "近期编辑",
      value: stats.recentEdits,
      description: "最近7天的编辑",
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-950"
    },
    {
      title: "收藏内容",
      value: stats.favorites,
      description: "已标记为收藏",
      icon: <Star className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-950"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold">
                  {loading ? <span className="animate-pulse">...</span> : card.value}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
              <div className={`p-2 rounded-full ${card.color}`}>{card.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
