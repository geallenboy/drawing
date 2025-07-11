"use client";

import React from "react";
import { ArrowRight, Palette, FileText, Sparkles, Zap, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

const features = [
  {
    icon: Palette,
    title: "智能画图",
    description: "AI驱动的画图工具，让创意无限延伸"
  },
  {
    icon: FileText,
    title: "文件管理",
    description: "优雅的文件组织系统，让作品井然有序"
  },
  {
    icon: Sparkles,
    title: "实时协作",
    description: "与团队成员无缝协作，共同创造精彩"
  },
  {
    icon: Zap,
    title: "极速体验",
    description: "现代化的界面设计，流畅的交互体验"
  },
  {
    icon: Shield,
    title: "安全可靠",
    description: "企业级安全保障，数据隐私无忧"
  },
  {
    icon: Users,
    title: "团队协作",
    description: "强大的团队功能，提升工作效率"
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* 导航栏 */}
      <header className="relative z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">Drawing</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                登录
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                开始使用
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative">
        {/* Hero 区域 */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              全新体验，现已发布
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              重新定义
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                创意画图体验
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Drawing 结合了智能文本编辑和强大画图功能，为创作者提供无与伦比的创作体验。
              简洁直观，让创意自由流淌。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-105 px-8 py-3"
                >
                  立即开始创作
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-3 border-2 hover:bg-accent/50 transition-all duration-200"
                >
                  已有账户？登录
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 特性展示 */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                为什么选择 Drawing？
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                我们致力于打造最优秀的创作工具，让每个人都能轻松表达创意
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title} 
                  className="group hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 border-0 bg-background/60 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 行动召唤 */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                准备开始你的创作之旅吗？
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                加入千万创作者的行列，体验前所未有的创作自由
              </p>
              <Link href="/auth/signup">
                <Button 
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-105 px-12 py-4 text-lg"
                >
                  免费开始使用
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                <Palette className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">Drawing</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Drawing. 让创意无界限.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 