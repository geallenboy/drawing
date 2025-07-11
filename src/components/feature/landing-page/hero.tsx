import React from "react";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const Hero = () => {
  const avatars = [
    { src: "/avatars/AutumnTechFocus.jpeg", fallback: "A" },
    { src: "/avatars/Casual Creative Professional.jpeg", fallback: "C" },
    { src: "/avatars/Golden Hour Contemplation.jpeg", fallback: "G" },
    { src: "/avatars/Portrait of a Woman in Rust-Colored Top.jpeg", fallback: "P" },
    { src: "/avatars/Radiant Comfort.jpeg", fallback: "R" }
  ];
  return (
    <section className="w-full relative overflow-hidden min-h-screen flex flex-col items-center justify-center">
      <div className="relative w-fit px-6 xs:px-8 sm:px-0 mx-auto flex flex-col items-center justify-center space-y-4 text-center z-40 backdrop-blur-[2px]">
        <AnimatedGradientText>
          🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />
          <span
            className={cn(
              `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
            )}
          >
            全新的文本绘图体验
          </span>
          <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedGradientText>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
          AI TextDraw - 智能文本绘图工具
        </h1>
        <p className="mx-auto max-w-3xl text-sm xs:text-base sm:text-lg md:text-xl mb-8 text-gray-600">
          结合人工智能的力量，让文本编辑与绘图创作变得更加简单高效，为您的创意提供无限可能。
        </p>
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center -space-x-5 sm:-space-x-4 overflow-hidden">
            {avatars.map((avatar, index) => {
              return (
                <Avatar key={index} className="inline-block border-2 border-background">
                  <AvatarImage src={avatar.src} className="h-full object-cover" />
                  <AvatarFallback>{avatar.fallback}</AvatarFallback>
                </Avatar>
              );
            })}
          </div>
          <span className="text-sm font-medium">已有 1000+ 用户在使用</span>
        </div>
        <Link href="/dashboard">
          <Button className="rounded-md text-base h-12">立即开始创作</Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
