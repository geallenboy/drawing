import React from "react";
import FolderList from "@/components/feature/folders/folder-list";
import { HeaderLayout } from "@/components/custom/header-layout";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  // 如果用户未登录，重定向到登录页
  if (!userId) {
    redirect("/auth/signin");
  }
  
  // 已登录用户显示仪表板内容
  return (
    <HeaderLayout>
      <FolderList />
    </HeaderLayout>
  );
}