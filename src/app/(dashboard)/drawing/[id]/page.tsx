"use client";
import { getByIdDrawingAction, updateDrawingAction } from "@/app/actions/drawing-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), {
  ssr: false
});
const DrawingWorkspace = () => {
  const [inputVal, setInputVal] = useState("");
  const params = useParams();
  const id = (params.id || "") as string;
  const [excalidrawDate, setExcalidrawDate] = useState<any>();
  const [drawingData, setDrawingData] = useState<any>();
  const dataRef = useRef<any>([]);
  const getDrawingData = useCallback(async () => {
    const { data, success } = await getByIdDrawingAction(id);
    console.log(data, success);
    if (success && data.length > 0) {
      setDrawingData(data[0]);
      setInputVal(data[0].name);
    } else {
      setDrawingData([]);
    }
  }, [id]);

  useEffect(() => {
    id && getDrawingData();
  }, [id, getDrawingData]);
  // ========== 实时更新 ref ==========
  useEffect(() => {
    dataRef.current = excalidrawDate;
  }, [excalidrawDate]);
  const onSave = async () => {
    if (excalidrawDate) {
      console.log({ ...drawingData }, "--->");
      const { success, error } = await updateDrawingAction({
        ...drawingData,
        name: inputVal,
        drawing_data: excalidrawDate
      });
      console.log(success, error);
      if (success) {
        toast.success("数据更新成功!");
      } else {
        toast.error("数据更新失败!");
      }
    }
  };
  // ========== 卸载时自动保存 ==========
  useEffect(() => {
    return () => {
      (async () => {
        // 如果有最新内容和 drawingData
        if (dataRef.current && drawingData) {
          try {
            const { success } = await updateDrawingAction({
              ...drawingData,
              name: inputVal,
              drawing_data: dataRef.current
            });
            if (success) {
              console.log("页面离开时：数据更新成功!");
            } else {
              console.log("页面离开时：数据更新失败!");
            }
          } catch (error) {
            console.error("离开时更新出错:", error);
          }
        }
      })();
    };
  }, [drawingData, inputVal]);
  const inputChange = (e: any) => {
    setInputVal(e.target.value);
  };
  console.log("drawingData:", drawingData);
  return (
    <div>
      <div className="flex items-center justify-end">
        <Input value={inputVal} onChange={inputChange} className="w-[200px] mr-2" />
        <Button
          className="h-8 text-[12px] gap-2 bg-yellow-500 hover:bg-yellow-600"
          onClick={onSave}
        >
          <Save className="h-4 w-4" /> 保存
        </Button>
      </div>
      <div className="h-[88vh]">
        {drawingData && (
          <Excalidraw
            langCode="zh-CN"
            theme="light"
            initialData={{
              elements: Array.isArray(drawingData?.drawing_data) ? drawingData?.drawing_data : [] // 确保是数组
            }}
            onChange={(excalidrawElements) => setExcalidrawDate(excalidrawElements)}
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                toggleTheme: false
              }
            }}
          ></Excalidraw>
        )}
      </div>
    </div>
  );
};

export default DrawingWorkspace;
