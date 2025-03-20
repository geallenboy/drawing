import React, { Suspense } from "react";
import Title from "@/components/feature/dashboard/title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  PenTool,
  Clock,
  Star,
  TrendingUp,
  Users,
  BarChart2,
  Activity,
  Plus,
  FileIcon,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RecentActivityList } from "@/components/feature/dashboard/recent-activity-list";
import { StatisticsCards } from "@/components/feature/dashboard/statistics-cards";
import { QuickActions } from "@/components/feature/dashboard/quick-actions";
import { RecentDocuments } from "@/components/feature/dashboard/recent-documents";
import { RecentDrawings } from "@/components/feature/dashboard/recent-drawings";
import { UsageChart } from "@/components/feature/dashboard/usage-chart";
import { Skeleton } from "@/components/ui/skeleton";

// 加载中状态组件
const LoadingState = () => (
  <div className="w-full space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

const DashboardPage = async () => {
  return (
    <section className="container mx-auto flex-1 space-y-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Title />
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/document/new">
              <FileText className="mr-2 h-4 w-4" /> 新建文档
            </Link>
          </Button>
          <Button asChild>
            <Link href="/drawing/new">
              <PenTool className="mr-2 h-4 w-4" /> 新建绘图
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        }
      >
        <StatisticsCards />
      </Suspense>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：最近活动和使用统计 */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">
                <Activity className="mr-2 h-4 w-4" />
                最近活动
              </TabsTrigger>
              <TabsTrigger value="usage">
                <BarChart2 className="mr-2 h-4 w-4" />
                使用统计
              </TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="space-y-4">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <RecentActivityList />
              </Suspense>
            </TabsContent>
            <TabsContent value="usage">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <UsageChart />
              </Suspense>
            </TabsContent>
          </Tabs>

          <Tabs defaultValue="documents" className="w-full">
            <TabsList>
              <TabsTrigger value="documents">
                <FileIcon className="mr-2 h-4 w-4" />
                最近文档
              </TabsTrigger>
              <TabsTrigger value="drawings">
                <PenTool className="mr-2 h-4 w-4" />
                最近绘图
              </TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="min-h-[300px]">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <RecentDocuments />
              </Suspense>
            </TabsContent>
            <TabsContent value="drawings" className="min-h-[300px]">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <RecentDrawings />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>

        {/* 右侧：快捷操作和提示 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>常用功能一键访问</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <QuickActions />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
              <CardDescription>您的账户和系统信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">积分余额</span>
                <span className="font-medium">42 点</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">存储空间</span>
                <span className="font-medium">3.2GB / 10GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">账户类型</span>
                <span className="font-medium text-yellow-600">专业版</span>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" /> 账户设置
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使用技巧</CardTitle>
              <CardDescription>充分利用 DrawText</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <h4 className="font-medium mb-1">文档协作</h4>
                <p className="text-sm text-muted-foreground">
                  使用分享功能邀请团队成员一起编辑文档。
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
                <h4 className="font-medium mb-1">键盘快捷键</h4>
                <p className="text-sm text-muted-foreground">
                  按{" "}
                  <code className="text-xs bg-gray-200 dark:bg-gray-800 p-1 rounded">Ctrl+/</code>{" "}
                  查看所有可用的快捷键。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
