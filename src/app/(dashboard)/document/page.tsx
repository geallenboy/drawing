"use client";

import React from "react";
import dynamic from "next/dynamic";
// 使用动态导入，禁用 SSR
const DocumentWorkspace = dynamic(
  () => import("@/components/feature/document/document-workspace"),
  { ssr: false } // 这确保组件只在客户端渲染
);
const DocumentPage = () => {
  return <DocumentWorkspace />;
};

export default DocumentPage;
