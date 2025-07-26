import React from "react";
import SimpleLanding from "@/components/custom/simple-landing";
import { HeaderLayout } from "@/components/custom/header-layout";
import { FolderPlus, FileText, Palette, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";


const steps = [
  {
    icon: FolderPlus,
    title: "创建文件夹",
    description: "先创建文件夹来组织您的作品"
  },
  {
    icon: FileText,
    title: "添加画图",
    description: "在文件夹中创建和管理画图文件"
  },
  {
    icon: Palette,
    title: "开始创作",
    description: "使用AI画图工具尽情创作"
  }
];

export default async function HomePage() {
  const { userId } = await auth();
  
  // 如果用户未登录，显示简化的着陆页
  if (!userId) {
    return <SimpleLanding />;
  }
  
  // 已登录用户显示头部布局
  return (
    <HeaderLayout>
         <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
      {/* 欢迎标题 */}
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-6">
          <Palette className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold">欢迎来到 Drawing</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          文件夹式管理让您的创作更有序。所有画图都保存在文件夹中，让作品井然有序。
        </p>
      </div>

      {/* 使用步骤 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <Card key={step.title} className="border-0 shadow-soft bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 开始按钮 */}
      <div className="pt-6 space-y-4">
      <Link href="/folders">
        <Button 
          size="lg"
          className="hover:opacity-90 transition-all duration-200 transform hover:scale-105 px-8 py-3 text-white"
        >
        
         开始使用
         <ArrowRight className="w-4 h-4 ml-2" />
        
        </Button>
        </Link>
       
      </div>
    </div>
    </HeaderLayout>
  );
}
