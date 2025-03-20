"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Eye,
  Pencil,
  Bold,
  Italic,
  Underline,
  Link,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  ListTodo,
  Table as TableIcon,
  Image
} from "lucide-react";

// 编辑工具按钮数据
const textFormatButtons = [
  { icon: <Bold className="h-4 w-4" />, tooltip: "粗体 (Ctrl+B)", command: "CMD+B" },
  { icon: <Italic className="h-4 w-4" />, tooltip: "斜体 (Ctrl+I)", command: "CMD+I" },
  { icon: <Underline className="h-4 w-4" />, tooltip: "下划线 (Ctrl+U)", command: "CMD+U" },
  { icon: <Code className="h-4 w-4" />, tooltip: "代码 (Ctrl+E)", command: "CMD+E" },
  { icon: <Link className="h-4 w-4" />, tooltip: "链接 (Ctrl+K)", command: "CMD+K" }
];

const alignButtons = [
  { icon: <AlignLeft className="h-4 w-4" />, tooltip: "左对齐", value: "left" },
  { icon: <AlignCenter className="h-4 w-4" />, tooltip: "居中", value: "center" },
  { icon: <AlignRight className="h-4 w-4" />, tooltip: "右对齐", value: "right" }
];

interface DocumentToolbarProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
  wordCount: { words: number; characters: number };
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  viewMode,
  setViewMode,
  wordCount
}) => {
  return (
    <div className="border-b bg-background/80 backdrop-blur-sm sticky top-14 z-10">
      <div className="container flex flex-wrap items-center py-2 gap-1">
        <div className="flex items-center border rounded-md p-1 mr-2">
          <Button
            variant={viewMode === "edit" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("edit")}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" /> 编辑
          </Button>
          <Button
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("preview")}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> 预览
          </Button>
        </div>

        {viewMode === "edit" && (
          <>
            <div className="flex items-center gap-1 mr-2">
              {textFormatButtons.map((button, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        {button.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{button.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <div className="flex items-center gap-1 mr-2">
              {alignButtons.map((button, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        {button.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{button.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <div className="flex items-center gap-1 mr-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <ListOrdered className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>有序列表</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <ListTodo className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>无序列表</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <TableIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>插入表格</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Image className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>插入图片</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}

        <div className="ml-auto flex items-center text-xs text-muted-foreground">
          <span>
            {wordCount.words} 词 · {wordCount.characters} 字符
          </span>
        </div>
      </div>
    </div>
  );
};
