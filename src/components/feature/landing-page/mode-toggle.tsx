"use client";

import * as React from "react";
import { ChevronDown, Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export const ModeToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // 获取当前主题对应的图标
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4 transition-all" />;
      case "dark":
        return <Moon className="h-4 w-4 transition-all" />;
      case "system":
      default:
        return <Laptop className="h-4 w-4 transition-all" />;
    }
  };

  // 获取当前主题的显示文本
  const getThemeText = () => {
    switch (theme) {
      case "light":
        return "浅色";
      case "dark":
        return "深色";
      case "system":
      default:
        return "系统";
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="flex items-center gap-1 w-[90px]">
          {getThemeIcon()}
          <span>{getThemeText()}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          浅色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          深色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="h-4 w-4 mr-2" />
          系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
