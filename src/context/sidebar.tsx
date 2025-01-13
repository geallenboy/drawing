import {
  CreditCard,
  Frame,
  Image,
  Images,
  Layers,
  Settings2,
  Sparkles,
  SquareTerminal,
} from "lucide-react";

export const navList = {
  en: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Generate Image",
      url: "/image-generation",
      icon: Image,
    },
    {
      title: "My Models",
      url: "/models",
      icon: Frame,
    },
    {
      title: "Train Model",
      url: "/model-training",
      icon: Layers,
    },
    {
      title: "My Images",
      url: "/gallery",
      icon: Images,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
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
      title: "生成图像",
      url: "/image-generation",
      icon: Image,
    },
    {
      title: "我的模型",
      url: "/models",
      icon: Frame,
    },
    {
      title: "训练模型",
      url: "/model-training",
      icon: Layers,
    },
    {
      title: "我的图像",
      url: "/gallery",
      icon: Images,
    },
    {
      title: "账单",
      url: "/billing",
      icon: CreditCard,
    },
    {
      title: "设置",
      url: "/account-settings",
      icon: Settings2,
    },
  ],
};
