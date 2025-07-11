"use client";

import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { Home, PenTool, Settings, TestTube, Stethoscope } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NavMain = () => {
  const pathname = usePathname();
  
  const navData = [
    {
      title: "仪表板",
      url: "/dashboard",
      icon: Home
    },
    {
      title: "绘图",
      url: "/drawing", 
      icon: PenTool
    },
    {
      title: "系统诊断",
      url: "/system-diagnosis",
      icon: Stethoscope
    },
    {
      title: "OAuth调试",
      url: "/oauth-debug",
      icon: Settings
    },
    {
      title: "认证测试",
      url: "/auth-test",
      icon: TestTube
    }
  ];
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
      <SidebarMenu>
        {navData.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === item.url}
            className={cn(
                "w-full justify-start",
                pathname === item.url && "bg-accent text-accent-foreground"
            )}
          >
              <Link href={item.url}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
