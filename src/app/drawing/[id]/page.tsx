"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useBeforeUnload } from "react-use";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Upload, Share, Download } from "lucide-react";
import SaveStatusIndicator, { SaveStatus } from "@/components/custom/save-status-indicator";
import Image from "next/image";

// Actions
import { getDrawingWithDataAction, updateDrawingAction } from "@/actions/drawing/drawing-action";

// Types
interface ExcalidrawData {
  elements: any[];
  files: Record<string, any>;
  appState?: any;
}

interface DrawingState {
  id: string;
  name: string;
  data: ExcalidrawData;
  isLoaded: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
}

// Dynamic import Excalidraw
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

// Constants
const AUTO_SAVE_INTERVAL = 30000; // 30秒自动保存
const DEBOUNCE_DELAY = 1000; // 1秒防抖

const DrawingEditor: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const drawingId = params.id as string;

  // Core State
  const [drawing, setDrawing] = useState<DrawingState>({
    id: drawingId,
    name: "",
    data: { elements: [], files: {} },
    isLoaded: false,
    isDirty: false,
    lastSaved: null,
  });

  // 用于强制Excalidraw重新挂载的key
  const [excalidrawKey, setExcalidrawKey] = useState(0);

  // UI State
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string>("");

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();
  const lastChangeRef = useRef<number>(0);

  // Prevent navigation when unsaved changes exist
  useBeforeUnload(drawing.isDirty, "您有未保存的更改，确定要离开吗？");

  // Load drawing data
  const loadDrawing = useCallback(async () => {
    try {
      setSaveStatus("loading");
      const { data, success, error } = await getDrawingWithDataAction(drawingId);

      if (success && data?.drawing) {
        const drawingData = data.drawing;
        setDrawing({
          id: drawingId,
          name: drawingData.name || "未命名画图",
          data: {
            elements: Array.isArray(drawingData.data) ? drawingData.data : [],
            files: drawingData.files || {},
          },
          isLoaded: true,
          isDirty: false,
          lastSaved: drawingData.updatedAt ? new Date(drawingData.updatedAt) : null,
        });
        setSaveStatus("idle");
        toast.success("画图加载成功");
      } else {
        throw new Error(error || "加载画图失败");
      }
    } catch (error) {
      console.error("加载画图失败:", error);
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "加载失败");
      toast.error("加载画图失败");
    }
  }, [drawingId]);

  // Save drawing data
  const saveDrawing = useCallback(async (showToast = true) => {
    if (!drawing.isDirty || !drawing.isLoaded) return;

    try {
      setSaveStatus("saving");
      setSaveError("");

      const { success, error } = await updateDrawingAction(drawingId, {
        name: drawing.name,
        data: drawing.data.elements,
        files: drawing.data.files,
      });

      if (success) {
        setDrawing(prev => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date(),
        }));
        setSaveStatus("saved");
        if (showToast) {
          toast.success("保存成功");
        }
      } else {
        throw new Error(error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "保存失败");
      if (showToast) {
        toast.error("保存失败");
      }
    }
  }, [drawingId, drawing.isDirty, drawing.isLoaded, drawing.name, drawing.data]);

  // Debounced save
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveDrawing(false);
    }, DEBOUNCE_DELAY);
  }, [saveDrawing]);

  // Handle Excalidraw changes
  const handleExcalidrawChange = useCallback((elements: any, appState: any, files: any) => {
    const now = Date.now();
    
    // 防止过于频繁的更新
    if (now - lastChangeRef.current < 100) {
      return;
    }
    lastChangeRef.current = now;

    setDrawing(prev => {
      const newData = {
        elements: elements || [],
        files: files || {},
        appState,
      };

      // 检查是否真的有变化
      const hasElementsChanged = JSON.stringify(newData.elements) !== JSON.stringify(prev.data.elements);
      const hasFilesChanged = JSON.stringify(newData.files) !== JSON.stringify(prev.data.files);

      if (!hasElementsChanged && !hasFilesChanged) {
        return prev;
      }

      return {
        ...prev,
        data: newData,
        isDirty: true,
      };
    });

    // 自动保存（防抖）
    debouncedSave();
  }, [debouncedSave]);

  // Manual save
  const handleManualSave = useCallback(() => {
    saveDrawing(true);
  }, [saveDrawing]);

  // Export drawing
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify({
      type: "excalidraw",
      version: 2,
      elements: drawing.data.elements,
      files: drawing.data.files,
    });
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${drawing.name}.excalidraw`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("导出成功");
  }, [drawing.data, drawing.name]);

  // Import drawing
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".excalidraw,.json";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          
          if (importedData.elements && Array.isArray(importedData.elements)) {
            if (drawing.isDirty) {
              const shouldImport = window.confirm("导入将替换当前内容，您有未保存的更改，确定要继续吗？");
              if (!shouldImport) return;
            }
            
            setDrawing(prev => ({
              ...prev,
              data: {
                elements: importedData.elements,
                files: importedData.files || {},
                appState: importedData.appState || prev.data.appState,
              },
              isDirty: true,
            }));
            
            // 强制Excalidraw重新挂载以正确渲染导入的数据
            setExcalidrawKey(prev => prev + 1);
            
            toast.success(`成功导入 ${file.name}`);
          } else {
            toast.error("无效的文件格式");
          }
        } catch (error) {
          console.error("导入失败:", error);
          toast.error("文件解析失败");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [drawing.isDirty]);

  // Share drawing
  const handleShare = useCallback(async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: drawing.name,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("链接已复制到剪贴板");
      }
    } catch (error) {
      console.error("分享失败:", error);
      toast.error("分享失败");
    }
  }, [drawing.name]);

  // Go back
  const handleGoBack = useCallback(() => {
    if (drawing.isDirty) {
      const shouldLeave = window.confirm("您有未保存的更改，确定要离开吗？");
      if (!shouldLeave) return;
    }
    router.push("/");
  }, [drawing.isDirty, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  // Auto save interval
  useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      if (drawing.isDirty) {
        saveDrawing(false);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [drawing.isDirty, saveDrawing]);

  // Load data on mount
  useEffect(() => {
    loadDrawing();
  }, [loadDrawing]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
              <Image src="/logo.png" alt="logo" width={24} height={24} />
            </div>
            <h1 className="text-lg font-semibold">{drawing.name}</h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            分享
          </Button>

          <SaveStatusIndicator
            status={saveStatus}
            lastSaveTime={drawing.lastSaved}
            errorMessage={saveError}
          />

          <Button
            onClick={handleManualSave}
            disabled={!drawing.isDirty || saveStatus === "saving"}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveStatus === "saving" ? "保存中..." : drawing.isDirty ? "保存" : "已保存"}
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        {drawing.isLoaded ? (
          <Excalidraw
            key={`excalidraw-${drawingId}-${excalidrawKey}`}
            langCode="zh-CN"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            initialData={{
              elements: drawing.data.elements,
              files: drawing.data.files,
            }}
            onChange={handleExcalidrawChange}
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                toggleTheme: false,
              },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">加载画图数据中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingEditor;