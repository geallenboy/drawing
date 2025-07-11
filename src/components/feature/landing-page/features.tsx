import React from "react";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { Palette, Share2, Cloud, Zap, Users, Shield } from "lucide-react";

const Features = () => {
  const featureData = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "强大的绘图工具",
      description: "基于 Excalidraw 的专业绘图功能，支持手绘风格的图形、文字和形状绘制"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "云端存储",
      description: "所有绘图数据安全存储在云端，随时随地访问您的创作内容"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "便捷分享",
      description: "一键分享您的绘图作品，支持导出多种格式，轻松协作"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "实时保存",
      description: "自动保存功能确保您的工作永不丢失，专注创作无需担心"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "用户管理",
      description: "完善的用户体系，个人作品管理，打造专属的创作空间"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "安全可靠",
      description: "企业级安全保障，数据加密传输，保护您的创作隐私"
    }
  ];
  return (
    <section
      id="features"
      className="w-full bg-muted py-32 flex flex-col items-center justify-center"
    >
      <div className="container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto relative bg-muted ">
        <div className="col-span-full space-y-4 ">
          <AnimatedGradientText className="ml-0 bg-background backdrop-blur-0">
            🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
            <span
              className={cn(
                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              产品特色
            </span>
          </AnimatedGradientText>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold">为什么选择我们的绘图平台</h2>
          <p className="text-base text-muted-foreground lg:max-w-[75%]">专业的在线绘图工具，让您的创意想法轻松实现。无论是设计图表、制作流程图还是艺术创作，我们都能满足您的需求。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-2 pr-2">
          {featureData.map((feature: any) => {
            return (
              <div
                key={feature.title}
                className="flex items-start gap-2 sm:gap-4 rounded-lg py-8 lg:p-12"
              >
                <span className="p-0 sm:p-2 rounded-md text-foreground sm:text-background bg-background sm:bg-foreground">
                  {feature.icon}
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium">{feature.title}</h3>
                  <p className="text-sm xs:text-base text-muted-foreground pt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
