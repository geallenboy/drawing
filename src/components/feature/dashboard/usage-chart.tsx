"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, PenTool } from "lucide-react";

// 模拟图表数据
const mockChartData = {
  documents: {
    daily: [4, 6, 2, 8, 5, 10, 7],
    weekly: [15, 23, 18, 25, 14, 22, 30, 28],
    monthly: [45, 52, 38, 65, 72, 58, 40, 55, 66, 78, 60, 70]
  },
  drawings: {
    daily: [2, 4, 1, 5, 3, 7, 4],
    weekly: [8, 12, 10, 15, 9, 14, 18, 20],
    monthly: [25, 30, 22, 40, 45, 33, 28, 35, 42, 50, 38, 42]
  }
};

const fetchChartData = async () => {
  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockChartData;
};

export const UsageChart = () => {
  const [data, setData] = useState<typeof mockChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [contentType, setContentType] = useState<"documents" | "drawings">("documents");

  useEffect(() => {
    const loadData = async () => {
      try {
        const chartData = await fetchChartData();
        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 获取图表标签
  const getLabels = () => {
    switch (timeRange) {
      case "daily":
        return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
      case "weekly":
        return ["第1周", "第2周", "第3周", "第4周", "第5周", "第6周", "第7周", "第8周"];
      case "monthly":
        return [
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月"
        ];
      default:
        return [];
    }
  };

  // 获取活跃数据
  const getChartData = () => {
    if (!data) return [];
    return data[contentType][timeRange];
  };

  // 计算最大值以设置图表高度
  const maxValue = data ? Math.max(...getChartData()) : 0;

  // 渲染加载状态
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Tabs
          value={contentType}
          onValueChange={(v: string) => setContentType(v as "documents" | "drawings")}
        >
          <TabsList className="h-8">
            <TabsTrigger value="documents" className="text-xs h-7">
              <FileText className="h-3 w-3 mr-1" /> 文档
            </TabsTrigger>
            <TabsTrigger value="drawings" className="text-xs h-7">
              <PenTool className="h-3 w-3 mr-1" /> 绘图
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={timeRange}
          onValueChange={(v: string) => setTimeRange(v as "daily" | "weekly" | "monthly")}
        >
          <TabsList className="h-8">
            <TabsTrigger value="daily" className="text-xs h-7">
              日
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs h-7">
              周
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs h-7">
              月
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="w-full h-64 flex items-end justify-between">
            {getChartData().map((value, index) => {
              const height = (value / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-4/5 ${
                      contentType === "documents" ? "bg-blue-500" : "bg-green-500"
                    } rounded-t-md transition-all duration-500`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs mt-2 text-muted-foreground">{getLabels()[index]}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
