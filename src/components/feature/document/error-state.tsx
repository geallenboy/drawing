"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

// 加载状态组件
export const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-muted-foreground">正在加载文档...</p>
      </div>
    </div>
  );
};

// 错误状态组件
interface ErrorStateProps {
  navigateToDocuments: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ navigateToDocuments }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">无法加载文档</h2>
      <p className="text-muted-foreground mb-6">无法找到或加载请求的文档</p>
      <Button onClick={navigateToDocuments}>返回文档列表</Button>
    </div>
  );
};
