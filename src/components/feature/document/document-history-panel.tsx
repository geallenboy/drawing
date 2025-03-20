"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import dayjs from "dayjs";

interface DocumentHistoryPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  fileData: any;
}

// 修订历史数据（模拟）
const revisionHistory = [
  { id: 1, author: "当前用户", date: new Date(Date.now() - 1000 * 60 * 30), message: "当前版本" },
  {
    id: 2,
    author: "当前用户",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    message: "添加了新章节"
  },
  {
    id: 3,
    author: "当前用户",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    message: "修复了格式问题"
  },
  {
    id: 4,
    author: "当前用户",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    message: "更新了内容"
  },
  {
    id: 5,
    author: "当前用户",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    message: "创建文档"
  }
];

export const DocumentHistoryPanel: React.FC<DocumentHistoryPanelProps> = ({
  isOpen,
  setIsOpen,
  fileData
}) => {
  // 在实际应用中，这里需要从fileData或通过API获取真实的历史记录
  // const history = fileData?.revisionHistory || [];

  // 模拟恢复历史版本
  const restoreVersion = (revisionId: number) => {
    // 在实际应用中，这里应该调用API来恢复指定版本
    alert(`正在恢复版本 ${revisionId}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>文档修订历史</SheetTitle>
          <SheetDescription>查看和恢复文档的历史版本</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          <div className="space-y-4 pr-4">
            {revisionHistory.map((revision) => (
              <div
                key={revision.id}
                className="flex flex-col border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{revision.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(revision.date).format("YYYY-MM-DD HH:mm")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => revision.id !== 1 && restoreVersion(revision.id)}
                    disabled={revision.id === 1}
                  >
                    {revision.id === 1 ? "当前" : "恢复"}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">编辑者: {revision.author}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            查看更多历史记录
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
