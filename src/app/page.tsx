import React from "react";
import CanvasContent from "@/components/feature/drawing/canvas-content";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  
  // 如果用户未登录，跳转到登录页面
  if (!userId) {
    redirect("/auth/signin");
  }
  
  // 已登录用户显示绘图管理页面
  return <CanvasContent />;
}
