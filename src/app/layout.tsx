import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/custom/theme-provider";
import Provider from "@/app/provider";

// 使用系统字体而不是Google Fonts，避免构建时网络连接问题
const inter = {
  variable: "--font-inter",
  className: "font-sans",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Drawing - 重新定义创意画图体验",
  description: "Drawing 结合了智能文本编辑和强大画图功能，为创作者提供无与伦比的创作体验。简洁直观，让创意自由流淌。",
  keywords: ["AI画图", "文本编辑", "创意工具", "在线画图", "智能创作"],
  authors: [{ name: "Drawing Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Drawing - 重新定义创意画图体验",
    description: "Drawing 结合了智能文本编辑和强大画图功能，为创作者提供无与伦比的创作体验。",
    siteName: "Drawing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drawing - 重新定义创意画图体验",
    description: "Drawing 结合了智能文本编辑和强大画图功能，为创作者提供无与伦比的创作体验。",
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <ClerkProvider>
          <Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster 
                richColors 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </ThemeProvider>
          </Provider>
        </ClerkProvider>
      </body>
    </html>
  );
}
