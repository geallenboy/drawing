import React from "react";

const MainLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="min-h-screen bg-background">
      {children}
    </main>
  );
};

export default MainLayout;
