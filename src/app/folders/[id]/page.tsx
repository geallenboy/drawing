import React from "react";

import { HeaderLayout } from "@/components/custom/header-layout";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFolderById } from "@/actions/folder/folder-actions";
import { notFound } from "next/navigation";
import DrawingList from "@/components/feature/drawings/drawing-list";

interface FolderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function FolderDetailPage({ params }: FolderDetailPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/auth/signin");
  }

  // 获取文件夹信息
  const folderResult = await getFolderById(params.id);
  
  if (!folderResult.success || !folderResult.folder) {
    notFound();
  }

  return (
    <HeaderLayout>
      <DrawingList drawingId={params.id} />
    </HeaderLayout>
  );
}