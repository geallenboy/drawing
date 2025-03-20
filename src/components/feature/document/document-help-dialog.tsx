"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export const DocumentHelpDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-4 right-4 rounded-full shadow-md z-10"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑器使用帮助</DialogTitle>
          <DialogDescription>了解如何使用编辑器的各项功能</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-medium mb-1">基本操作</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 使用工具栏格式化文本</li>
              <li>• 按 / 键打开块工具菜单</li>
              <li>• Ctrl+S 快速保存文档</li>
              <li>• 文档会自动保存</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">键盘快捷键</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ctrl+B：粗体</li>
              <li>• Ctrl+I：斜体</li>
              <li>• Ctrl+U：下划线</li>
              <li>• Ctrl+K：插入链接</li>
              <li>• Ctrl+Shift+X：代码块</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">协作和分享</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 使用分享按钮邀请他人</li>
              <li>• 可设置不同级别的访问权限</li>
              <li>• 查看文档历史版本</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">本地保存和恢复</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 文档会自动保存到云端（每30秒）</li>
              <li>• 草稿会定期保存到本地（每10秒）</li>
              <li>• 断网或关闭页面时会保留草稿</li>
              <li>• 下次打开时可选择恢复草稿</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button>了解更多</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
