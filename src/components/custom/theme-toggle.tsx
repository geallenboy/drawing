"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch disabled />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun 
        className={cn(
          "h-4 w-4 transition-colors duration-200",
          !isDark ? "text-primary" : "text-muted-foreground"
        )} 
      />
      <Switch
        checked={isDark}
        onCheckedChange={handleThemeChange}
        className="data-[state=checked]:bg-primary"
        aria-label="切换主题"
      />
      <Moon 
        className={cn(
          "h-4 w-4 transition-colors duration-200",
          isDark ? "text-primary" : "text-muted-foreground"
        )} 
      />
    </div>
  );
} 