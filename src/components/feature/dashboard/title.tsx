"use client";

import { useUserStore } from "@/store/userStore";
import React from "react";
import { useEffect, useState } from "react";

const Title = () => {
  const [greeting, setGreeting] = useState("");
  const { user } = useUserStore();

  useEffect(() => {
    // 根据时间设置问候语
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("早上好");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("下午好");
    } else {
      setGreeting("晚上好");
    }
  }, []);

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}，{user?.name}
      </h1>
      <p className="text-muted-foreground mt-1">欢迎回到您的工作区，让创意在这里展开！</p>
    </div>
  );
};

export default Title;
