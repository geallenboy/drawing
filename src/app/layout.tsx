import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/custom/theme-provider";
import Provider from "@/app/provider";

const MyAppFont = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI TextDraw",
  description:
    "是一个简洁、直观且易记的产品名称，非常适合描述一个结合文本编辑（Text）和绘图（Draw）功能的产品"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${MyAppFont.className} font-sans`}>
        <ClerkProvider>
          <Provider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors />
            </ThemeProvider>
          </Provider>
        </ClerkProvider>
      </body>
    </html>
  );
}
