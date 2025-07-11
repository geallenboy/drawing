"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser, useClerk } from "@clerk/nextjs";
import DialogPop from "./dialog-pop";

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentFolderId?: string | null;
};

const Header = ({ searchQuery, setSearchQuery, currentFolderId }: HeaderProps) => {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="w-full bg-background border-b p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* 左侧：Logo和标题 */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => window.location.href = '/'}>
            AI TextDraw
          </h1>
          <span className="text-sm text-muted-foreground">绘图管理</span>
        </div>

        {/* 中间：搜索框 */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索绘图..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 右侧：操作按钮和用户信息 */}
        <div className="flex items-center space-x-4">
          {/* 始终显示创建绘图按钮，但会弹出文件夹选择器 */}
          <DialogPop currentFolderId={currentFolderId} />
          
          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || "用户"} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || "用户"
                  }
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
