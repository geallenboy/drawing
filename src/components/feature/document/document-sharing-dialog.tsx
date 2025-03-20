"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Lock, Users, Globe, Copy } from "lucide-react";
import { toast } from "sonner";

interface DocumentSharingDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  id: string;
  sharingLevel: string;
  setSharingLevel: (level: string) => void;
  fileData: any;
}

// 协作者数据（模拟）
const collaborators = [
  { id: 1, name: "当前用户", email: "user@example.com", role: "所有者", avatar: "U" },
  { id: 2, name: "团队成员1", email: "member1@example.com", role: "编辑者", avatar: "T" },
  { id: 3, name: "团队成员2", email: "member2@example.com", role: "查看者", avatar: "M" }
];

export const DocumentSharingDialog: React.FC<DocumentSharingDialogProps> = ({
  isOpen,
  setIsOpen,
  id,
  sharingLevel,
  setSharingLevel,
  fileData
}) => {
  // 复制分享链接
  const copyShareLink = () => {
    navigator.clipboard.writeText(`https://example.com/shared/doc/${id}`);
    toast.success("分享链接已复制到剪贴板");
  };

  // 添加新协作者
  const [newCollaboratorEmail, setNewCollaboratorEmail] = React.useState("");

  const addCollaborator = () => {
    if (
      newCollaboratorEmail.trim() &&
      !collaborators.some((c) => c.email === newCollaboratorEmail.trim())
    ) {
      // 在真实应用中，这里应该调用API添加协作者
      toast.success(`邀请已发送至 ${newCollaboratorEmail}`);
      setNewCollaboratorEmail("");
    }
  };

  // 更改用户权限
  const changeUserRole = (userId: number, newRole: string) => {
    // 在真实应用中，这里应该调用API更改用户权限
    toast.success(`用户权限已更改为 ${newRole}`);
  };

  // 移除用户访问权限
  const removeAccess = (userId: number) => {
    // 在真实应用中，这里应该调用API移除用户访问权限
    toast.success("已移除用户访问权限");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>共享文档</DialogTitle>
          <DialogDescription>邀请其他人查看或编辑此文档</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm">共享链接</Label>
            <div className="flex mt-1.5">
              <Input
                value={`https://example.com/shared/doc/${id}`}
                readOnly
                className="rounded-r-none"
              />
              <Button className="rounded-l-none" onClick={copyShareLink}>
                <Copy className="h-4 w-4 mr-1" /> 复制
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm">访问权限</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              <Button
                variant={sharingLevel === "private" ? "default" : "outline"}
                className="h-auto py-2 justify-start"
                onClick={() => setSharingLevel("private")}
              >
                <div className="flex flex-col items-start">
                  <span className="flex items-center">
                    <Lock className="h-3.5 w-3.5 mr-1" /> 私密
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">仅自己可见</span>
                </div>
              </Button>
              <Button
                variant={sharingLevel === "limited" ? "default" : "outline"}
                className="h-auto py-2 justify-start"
                onClick={() => setSharingLevel("limited")}
              >
                <div className="flex flex-col items-start">
                  <span className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1" /> 受限
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">指定人可见</span>
                </div>
              </Button>
              <Button
                variant={sharingLevel === "public" ? "default" : "outline"}
                className="h-auto py-2 justify-start"
                onClick={() => setSharingLevel("public")}
              >
                <div className="flex flex-col items-start">
                  <span className="flex items-center">
                    <Globe className="h-3.5 w-3.5 mr-1" /> 公开
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">所有人可见</span>
                </div>
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm">协作者</Label>
            <div className="mt-1.5 space-y-2">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between border rounded-md p-2"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2">
                      {collaborator.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {collaborator.role} <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => changeUserRole(collaborator.id, "所有者")}>
                        所有者
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeUserRole(collaborator.id, "编辑者")}>
                        编辑者
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeUserRole(collaborator.id, "评论者")}>
                        评论者
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeUserRole(collaborator.id, "查看者")}>
                        查看者
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => removeAccess(collaborator.id)}
                      >
                        移除访问权限
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Input
                placeholder="添加协作者的邮箱地址"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCollaborator();
                  }
                }}
              />
              <div className="flex items-center mt-2">
                <Button variant="outline" size="sm" className="mr-1" onClick={addCollaborator}>
                  添加
                </Button>
                <p className="text-xs text-muted-foreground">添加后系统会向对方发送邀请邮件</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
          <Button onClick={() => setIsOpen(false)}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
