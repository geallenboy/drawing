import { UserSync } from "@/components/custom/user-sync";
import React from "react";

const MainLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="min-h-screen bg-background">
      <UserSync />
      {children}
    </main>
  );
};

export default MainLayout;
