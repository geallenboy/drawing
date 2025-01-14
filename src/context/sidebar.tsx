import { Settings2, SquareTerminal, FileCode2, Eraser } from "lucide-react";

export const navList = {
  en: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Document",
      url: "/document",
      icon: FileCode2,
    },
    {
      title: "Document",
      url: "/document",
      icon: Settings2,
    },
    {
      title: "Drawing",
      url: "/drawing",
      icon: Eraser,
    },

    {
      title: "Settings",
      url: "/account-settings",
      icon: Settings2,
    },
  ],
  cn: [
    {
      title: "仪表盘",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "文档",
      url: "/document",
      icon: FileCode2,
    },
    {
      title: "绘图",
      url: "/drawing",
      icon: Eraser,
    },
    {
      title: "设置",
      url: "/account-settings",
      icon: Settings2,
    },
  ],
};
