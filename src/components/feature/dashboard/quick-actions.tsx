"use client";

import React from "react";
import {
  FileText,
  PenTool,
  Upload,
  Download,
  Share2,
  BookTemplateIcon,
  Users,
  Star
} from "lucide-react";
import Link from "next/link";

type QuickAction = {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
};

export const QuickActions = () => {
  const actions: QuickAction[] = [
    {
      icon: <FileText className="h-4 w-4" />,
      label: "新建文档",
      href: "/document/new",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
    },
    {
      icon: <PenTool className="h-4 w-4" />,
      label: "新建绘图",
      href: "/drawing/new",
      color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
    },
    {
      icon: <BookTemplateIcon className="h-4 w-4" />,
      label: "模板库",
      href: "/templates",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
    },
    {
      icon: <Upload className="h-4 w-4" />,
      label: "上传文件",
      href: "/upload",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
    },
    {
      icon: <Star className="h-4 w-4" />,
      label: "我的收藏",
      href: "/favorites",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400"
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "共享文档",
      href: "/shared",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
    },
    {
      icon: <Download className="h-4 w-4" />,
      label: "导出内容",
      href: "/export",
      color: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
    },
    {
      icon: <Share2 className="h-4 w-4" />,
      label: "分享链接",
      href: "/share",
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className={`p-2 rounded-full ${action.color} mb-2`}>{action.icon}</div>
          <span className="text-xs font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  );
};
