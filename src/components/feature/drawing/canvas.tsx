"use client";
import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { updateDrawingAction } from "@/actions/drawing/drawing-action";
import { toast } from "sonner";
const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, {
  ssr: false
});

const Canvas = ({
  triggerSave,
  name,
  drawingData
}: {
  triggerSave: boolean;
  name: string;
  drawingData: any;
}) => {
  const [excalidrawDate, setExcalidrawDate] = useState<any>();

  useEffect(() => {
    const saveDrawingData = async () => {
      try {
        if (excalidrawDate && drawingData?.id) {
          const { success } = await updateDrawingAction(drawingData.id, {
            name,
            data: excalidrawDate
          });
          if (success) {
            toast.success("数据更新成功!");
          } else {
            toast.error("数据更新失败!");
          }
        }
      } catch (error) {
        console.error("保存绘图数据失败:", error);
        toast.error("数据更新失败!");
      }
    };
    saveDrawingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, triggerSave]);

  return (
    <div style={{ height: "100%" }}>
      <Excalidraw
        langCode="zh-CN"
        theme="light"
        initialData={{
          elements: Array.isArray(drawingData?.drawing_data) ? drawingData?.drawing_data : [] // 确保是数组
        }}
        onChange={(excalidrawElements: any) => setExcalidrawDate(excalidrawElements)}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
            export: false,
            toggleTheme: false
          }
        }}
      ></Excalidraw>
    </div>
  );
};

export default Canvas;
