"use client";

import React from "react";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
