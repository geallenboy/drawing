import React from "react";
import CanvasContent from "@/components/feature/drawing/canvas-content";
import SimpleLanding from "@/components/custom/simple-landing";
import { HeaderLayout } from "@/components/custom/header-layout";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();
  
  // 如果用户未登录，显示简化的着陆页
  if (!userId) {
    return <SimpleLanding />;
  }
  
  // 已登录用户显示头部布局
  return (
    <HeaderLayout>
      <CanvasContent />
    </HeaderLayout>
  );
}
