"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, PenTool, User, Edit, Trash, Clock } from "lucide-react";
import Link from "next/link";

// 模拟活动数据
const mockActivities = [
  {
    id: 1,
    type: "document",
    action: "created",
    name: "项目计划书",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    path: "/document/1"
  },
  {
    id: 2,
    type: "drawing",
    action: "edited",
    name: "系统架构图",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2小时前
    path: "/drawing/1"
  },
  {
    id: 3,
    type: "document",
    action: "deleted",
    name: "旧版需求文档",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5小时前
    path: ""
  },
  {
    id: 4,
    type: "drawing",
    action: "created",
    name: "产品流程图",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
    path: "/drawing/2"
  },
  {
    id: 5,
    type: "document",
    action: "edited",
    name: "会议记录",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 1天多前
    path: "/document/2"
  }
];

// 获取活动数据的函数
const fetchActivities = async () => {
  // 模拟API请求延迟
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockActivities;
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

// 活动图标映射
const getActivityIcon = (type: string, action: string) => {
  if (type === "document") {
    return <FileText className="h-4 w-4 text-blue-500" />;
  } else if (type === "drawing") {
    return <PenTool className="h-4 w-4 text-green-500" />;
  }
  return <Clock className="h-4 w-4" />;
};

// 活动动作图标映射
const getActionIcon = (action: string) => {
  switch (action) {
    case "created":
      return <Edit className="h-3 w-3 text-green-500" />;
    case "edited":
      return <Edit className="h-3 w-3 text-amber-500" />;
    case "deleted":
      return <Trash className="h-3 w-3 text-red-500" />;
    default:
      return null;
  }
};

export const RecentActivityList = () => {
  const [activities, setActivities] = useState<typeof mockActivities>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await fetchActivities();
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>暂无活动记录</p>
        </div>
      ) : (
        activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 mr-3">
                    {getActivityIcon(activity.type, activity.action)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-medium">
                        {activity.action === "deleted" ? (
                          activity.name
                        ) : (
                          <Link href={activity.path} className="hover:underline">
                            {activity.name}
                          </Link>
                        )}
                      </h4>
                      <span className="flex items-center justify-center rounded-full w-5 h-5 bg-gray-100 dark:bg-gray-800">
                        {getActionIcon(activity.action)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.action === "created" && "创建了"}
                      {activity.action === "edited" && "编辑了"}
                      {activity.action === "deleted" && "删除了"}{" "}
                      {activity.type === "document" ? "文档" : "绘图"}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTime(activity.timestamp)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
