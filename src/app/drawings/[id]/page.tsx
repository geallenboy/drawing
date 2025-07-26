"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useBeforeUnload } from "react-use";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Upload, Share, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import ImportExportPanel, { ImportOptions, ExportOptions, ExportFormat } from "@/components/custom/import-export-panel";
import EnhancedStorageManager from "@/lib/enhanced-storage-manager";
import BackgroundDataGuard from "@/lib/background-data-guard";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

// Actions
import { getDrawingWithDataAction, updateDrawingAction } from "@/actions/drawing/drawing-action";

// Types
interface ExcalidrawData {
  elements: any[];
  files: Record<string, any>;
  appState?: any;
}

interface DrawingMetadata {
  id: string;
  name: string;
  desc: string;
  userId: string;
  parentFolderId: string;
  version: number;
  elementCount: number;
  fileCount: number;
  lastModified: Date;
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DrawingState {
  id: string;
  metadata: DrawingMetadata | null;
  data: ExcalidrawData;
  isLoaded: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  error: string | null;
}

// Dynamic import Excalidraw with proper error handling
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => {
    return {
      default: mod.Excalidraw
    };
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>加载绘图编辑器...</p>
        </div>
      </div>
    )
  }
);

// 动态导入exportToCanvas函数
const getExportToCanvas = async () => {
  const excalidrawModule = await import("@excalidraw/excalidraw");
  return excalidrawModule.exportToCanvas;
};

// Constants
const AUTO_SAVE_INTERVAL = 10000; // 10秒自动保存
const DEBOUNCE_DELAY = 500; // 500ms防抖，更快响应
const IMMEDIATE_SAVE_DELAY = 100; // 立即保存的短延迟
const MAX_RETRY_ATTEMPTS = 3; // 最大重试次数
const LOCAL_STORAGE_KEY_PREFIX = 'drawing_cache_'; // localStorage前缀
const LOCAL_SAVE_DEBOUNCE = 200; // 本地保存防抖时间

const DrawingEditor: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const drawingId = params.id as string;

  // Core State
  const [drawing, setDrawing] = useState<DrawingState>({
    id: drawingId,
    metadata: null,
    data: { elements: [], files: {} },
    isLoaded: false,
    isDirty: false,
    lastSaved: null,
    error: null,
   
  });

  // 用于强制Excalidraw重新挂载的key
  const [excalidrawKey, setExcalidrawKey] = useState(0);

  // UI State
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();
  const localSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastChangeRef = useRef<number>(0);
  const isLoadingRef = useRef(false);
  const excalidrawAPIRef = useRef<any>(null);  // Excalidraw API引用
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  
  // 网络状态检测
  const [isOnline, setIsOnline] = useState(true);
  
  // 增强存储管理器
  const storageManager = useRef<EnhancedStorageManager>();
  const backgroundGuard = useRef<BackgroundDataGuard>();

  // localStorage 工具函数
  const getLocalStorageKey = useCallback(() => `${LOCAL_STORAGE_KEY_PREFIX}${drawingId}`, [drawingId]);
  
  const saveToLocalStorage = useCallback(async (data: ExcalidrawData) => {
    try {
      if (!storageManager.current) {
        storageManager.current = EnhancedStorageManager.getInstance();
      }
      
      const success = await storageManager.current.saveDrawingData(
        drawingId,
        drawing.metadata?.userId || 'unknown',
        data,
        drawing.metadata?.version || 1
      );
      
      if (success) {
        setHasLocalChanges(true);
        
        // 添加到后台同步队列
        if (backgroundGuard.current) {
          backgroundGuard.current.addToSyncQueue(drawingId);
        }
      }
    } catch (error) {
      console.warn('增强本地缓存保存失败:', error);
      // 降级到原始localStorage
      try {
        const key = getLocalStorageKey();
        const saveData = {
          data,
          timestamp: Date.now(),
          version: drawing.metadata?.version || 1,
        };
        localStorage.setItem(key, JSON.stringify(saveData));
        setHasLocalChanges(true);
      } catch (fallbackError) {
        console.error('降级保存也失败:', fallbackError);
      }
    }
  }, [drawingId, drawing.metadata, getLocalStorageKey]);

  const loadFromLocalStorage = useCallback((): ExcalidrawData | null => {
    try {
      if (!storageManager.current) {
        storageManager.current = EnhancedStorageManager.getInstance();
      }
      
      const cachedData = storageManager.current.loadDrawingData(drawingId);
      if (cachedData) {
        return {
          elements: cachedData.elements,
          files: cachedData.files,
          appState: cachedData.appState
        };
      }
    } catch (error) {
      console.warn('增强本地缓存读取失败:', error);
      // 降级到原始localStorage
      try {
        const key = getLocalStorageKey();
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed.data;
        }
      } catch (fallbackError) {
        console.error('降级读取也失败:', fallbackError);
      }
    }
    return null;
  }, [drawingId, getLocalStorageKey]);

  const clearLocalStorage = useCallback(() => {
    try {
      if (storageManager.current) {
        const success = storageManager.current.clearDrawingData(drawingId);
        if (success) {
          setHasLocalChanges(false);
          
          // 从后台同步队列移除
          if (backgroundGuard.current) {
            backgroundGuard.current.removeFromSyncQueue(drawingId);
          }
          return;
        }
      }
      
      // 降级到原始localStorage
      const key = getLocalStorageKey();
      localStorage.removeItem(key);
      setHasLocalChanges(false);
      console.log('🗑️ 已清除本地缓存');
    } catch (error) {
      console.warn('清除本地缓存失败:', error);
    }
  }, [drawingId, getLocalStorageKey]);

  // 初始化存储管理器和后台保护
  useEffect(() => {
    storageManager.current = EnhancedStorageManager.getInstance();
    backgroundGuard.current = BackgroundDataGuard.getInstance();
    
    // 启动后台保护（需要userId）
    if (drawing.metadata?.userId) {
      backgroundGuard.current.startGuard(drawing.metadata.userId);
    }
    
    return () => {
      if (backgroundGuard.current) {
        backgroundGuard.current.stopGuard();
      }
    };
  }, [drawing.metadata?.userId]);

  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 网络恢复时尝试同步
      if (drawing.metadata?.userId && backgroundGuard.current) {
        backgroundGuard.current.startGuard(drawing.metadata.userId);
      }
    };
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [drawing.metadata?.userId]);

  // Prevent navigation when unsaved changes exist
  useBeforeUnload(hasLocalChanges, "您有未同步到服务器的更改，确定要离开吗？数据将保存在本地缓存中。");
  
  // 页面卸载时确保本地保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 确保当前数据已保存到本地缓存
      if (drawing.isDirty && drawing.isLoaded) {
        saveToLocalStorage(drawing.data);
      }
      
      // 静默保存到本地，不显示任何警告
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [drawing.isDirty, drawing.isLoaded, drawing.data, hasLocalChanges, saveToLocalStorage]);



  // Load drawing data with enhanced error handling
  const loadDrawing = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      setSaveStatus("saving");
      // setDrawing(prev => ({ ...prev, error: null }));

      const { data, success, error } = await getDrawingWithDataAction(drawingId);

      if (success && data?.drawing) {
        const drawingData = data.drawing;
        console.log(drawingData,"drawingData");
        // 构建元数据对象
        const metadata: DrawingMetadata = {
          id: drawingData.id,
          name: drawingData.name || "未命名画图",
          desc: drawingData.desc || "",
          userId: drawingData.userId,
          parentFolderId: drawingData.parentFolderId,
          version: drawingData.version || 1,
          elementCount: drawingData.elementCount || 0,
          fileCount: drawingData.fileCount || 0,
          lastModified: new Date(drawingData.lastModified || drawingData.updatedAt),
          isFavorite: drawingData.isFavorite || false,
          isDeleted: drawingData.isDeleted || false,
          createdAt: new Date(drawingData.createdAt),
          updatedAt: new Date(drawingData.updatedAt),
        };

        // 尝试从本地缓存恢复数据
        const localData = loadFromLocalStorage();
        let finalData: ExcalidrawData;
        const isDataFromCache = false;
        
        // 优先使用本地数据，如果没有则使用服务器数据
        if (localData && localData.elements && localData.elements.length > 0) {
          finalData = localData;
        } else {
          finalData = {
            elements: Array.isArray(drawingData.data) ? drawingData.data : [],
            files: drawingData.files || {},
            appState: drawingData.appState,
          };
        }

        setDrawing({
          id: drawingId,
          metadata,
          data: finalData,
          isLoaded: true,
          isDirty: isDataFromCache,
          lastSaved: isDataFromCache ? null : metadata.lastModified,
          error: null,
         
        });


        setSaveStatus(isDataFromCache ? "saving" : "idle");
        setRetryCount(0);
        toast.success("画图加载成功");
      } else {
        throw new Error(error || "加载画图失败");
      }
    } catch (error) {
      console.error("加载画图失败:", error);
      const errorMessage = error instanceof Error ? error.message : "加载失败";
      
      setSaveStatus("error");
      setSaveError(errorMessage);
      setDrawing(prev => ({
        ...prev,
        error: errorMessage,
        isLoaded: true, // 仍然标记为已加载，以显示错误状态
      }));
      
      toast.error(`加载画图失败: ${errorMessage}`);
    } finally {
      isLoadingRef.current = false;
    }
  }, [drawingId]);

  // Enhanced save function with retry logic
  const saveDrawing = useCallback(async (showToast = true) => {
    if (!drawing.isDirty || !drawing.isLoaded || saveStatus === "saving") return;

    try {
      setSaveStatus("saving");
      setSaveError("");

      const { success, error } = await updateDrawingAction(drawingId, {
        data: drawing.data.elements,
        files: drawing.data.files,
        appState: drawing.data.appState,
      });

      if (success) {
        const now = new Date();
        setDrawing(prev => ({
          ...prev,
          isDirty: false,
          lastSaved: now,
          metadata: prev.metadata ? {
            ...prev.metadata,
            version: prev.metadata.version + 1,
            elementCount: drawing.data.elements.length,
            fileCount: Object.keys(drawing.data.files).length,
            lastModified: now,
          } : null,
          error: null,
        }));
        
        setSaveStatus("saved");
        setRetryCount(0);
        
        // 清除本地缓存，因为已成功同步到服务器
        clearLocalStorage();
        
        if (showToast) {
          toast.success("保存成功");
        }
      } else {
        throw new Error(error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      const errorMessage = error instanceof Error ? error.message : "保存失败";
      
      setSaveStatus("error");
      setSaveError(errorMessage);
      
      // 实现重试逻辑
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          saveDrawing(false); // 静默重试
        }, 2000 * (retryCount + 1)); // 递增延迟
        
        if (showToast) {
          toast.error(`保存失败，正在重试 (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
        }
      } else {
        if (showToast) {
          toast.error(`保存失败: ${errorMessage}`);
        }
      }
    }
  }, [drawingId, drawing.isDirty, drawing.isLoaded, drawing.metadata, drawing.data, saveStatus, retryCount]);

  // 移除防抖保存 - 不再自动同步到R2服务器

  // Enhanced Excalidraw change handler with safe data handling
  const handleExcalidrawChange = useCallback((elements: any, appState: any, files: any) => {
    const now = Date.now();
    
    // 防止过于频繁的更新
    if (now - lastChangeRef.current < 100) {
      return;
    }
    lastChangeRef.current = now;

    setDrawing(prev => {
      // 安全地处理数据，确保类型正确
      const safeElements = Array.isArray(elements) ? elements : [];
      const safeFiles = files && typeof files === 'object' ? files : {};
      const safeAppState = appState && typeof appState === 'object' ? appState : {};
      
      const newData = {
        elements: safeElements,
        files: safeFiles,
        appState: safeAppState,
      };

      // 只在真正有变化时才更新
      try {
        const hasElementsChanged = JSON.stringify(newData.elements) !== JSON.stringify(prev.data.elements);
        const hasFilesChanged = JSON.stringify(newData.files) !== JSON.stringify(prev.data.files);
        const hasAppStateChanged = JSON.stringify(newData.appState) !== JSON.stringify(prev.data.appState);

        if (!hasElementsChanged && !hasFilesChanged && !hasAppStateChanged) {
          return prev;
        }

        return {
          ...prev,
          data: newData,
          isDirty: true, // 标记为有本地更改
          error: null, // 清除之前的错误状态
        };
      } catch (error) {
        console.warn("数据比较时出错，跳过此次更新:", error);
        return prev;
      }
    });

    // 只触发本地保存（快速）
    if (localSaveTimeoutRef.current) {
      clearTimeout(localSaveTimeoutRef.current);
    }
    localSaveTimeoutRef.current = setTimeout(() => {
      const currentData = {
        elements: elements,
        files: files,
        appState: appState,
      };
      saveToLocalStorage(currentData);
    }, LOCAL_SAVE_DEBOUNCE);

    // 注意：不再自动触发远程保存，只有用户主动保存时才同步到R2
  }, [saveToLocalStorage]);

  // Manual save with immediate feedback - 同时保存到本地和R2
  const handleManualSave = useCallback(() => {
    if (drawing.isDirty || hasLocalChanges) {
      // 先保存到本地缓存
      saveToLocalStorage(drawing.data);
      
      // 然后同步到R2服务器
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = undefined;
      }
      saveDrawing(true);
    } else {
      toast.info("没有需要保存的更改");
    }
  }, [saveDrawing, drawing.isDirty, hasLocalChanges, drawing.data, saveToLocalStorage]);

  // Enhanced export with metadata
  const handleExport = useCallback(() => {
    const exportData = {
      type: "excalidraw",
      version: 2,
      source: "AIDT Drawing App",
      elements: drawing.data.elements,
      files: drawing.data.files,
      appState: drawing.data.appState,
      metadata: {
        name: drawing.metadata?.name,
        createdAt: drawing.metadata?.createdAt,
        version: drawing.metadata?.version,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${drawing.metadata?.name || "drawing"}.excalidraw`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("导出成功");
  }, [drawing.data, drawing.metadata]);

  // Enhanced import with validation
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
          
          // 验证导入数据的格式
          if (!importedData.elements || !Array.isArray(importedData.elements)) {
            throw new Error("无效的文件格式：缺少elements数组");
          }

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
            error: null,
          }));
          
          // 强制Excalidraw重新挂载
          setExcalidrawKey(prev => prev + 1);
          
          toast.success(`成功导入 ${file.name}`);
        } catch (error) {
          console.error("导入失败:", error);
          const errorMessage = error instanceof Error ? error.message : "文件解析失败";
          toast.error(`导入失败: ${errorMessage}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [drawing.isDirty]);


  // Enhanced go back with smart dialog
  const handleGoBack = useCallback(() => {
    // 如果有本地更改，静默保存到本地
    if (hasLocalChanges && drawing.isDirty) {
      saveToLocalStorage(drawing.data);
    }
    
    // 直接返回到更直观的路径结构
    const parentFolderId = drawing.metadata?.parentFolderId;
    if (parentFolderId) {
      // 使用更直观的文件夹路径: /folders/{folderId}
      router.push(`/folders/${parentFolderId}`);
    } else {
      // 返回到主仪表板
      router.push("/folders");
    }
  }, [hasLocalChanges, drawing.isDirty, drawing.data, drawing.metadata, router, saveToLocalStorage]);

  // Enhanced import with advanced options
  const handleAdvancedImport = useCallback((file: File, options?: ImportOptions) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.elements && Array.isArray(data.elements)) {
          const mergeMode = options?.mergeMode || 'replace';
          
          setDrawing(prev => {
            let newElements = data.elements;
            let newFiles = data.files || {};
            
            if (mergeMode === 'append') {
              newElements = [...prev.data.elements, ...data.elements];
              newFiles = { ...prev.data.files, ...data.files };
            } else if (mergeMode === 'layer') {
              const offset = { x: 100, y: 100 };
              newElements = [
                ...prev.data.elements,
                ...data.elements.map((el: any) => ({
                  ...el,
                  x: el.x + offset.x,
                  y: el.y + offset.y
                }))
              ];
              newFiles = { ...prev.data.files, ...data.files };
            }
            
            return {
              ...prev,
              data: {
                elements: newElements,
                files: newFiles,
                appState: mergeMode === 'replace' ? data.appState : prev.data.appState,
              },
              isDirty: true,
            };
          });
          
          setExcalidrawKey(prev => prev + 1);
          const modeText = { 'replace': '替换', 'append': '追加', 'layer': '新图层' }[mergeMode];
          toast.success(`导入成功 (${modeText}模式)`);
        } else {
          throw new Error("无效的Excalidraw文件格式");
        }
      } catch (error) {
        toast.error(`导入失败: ${error instanceof Error ? error.message : "未知错误"}`);
      }
    };
    reader.readAsText(file);
  }, []);

  // Enhanced export with multiple formats
  const handleAdvancedExport = useCallback(async (format: ExportFormat, options?: ExportOptions) => {
    const drawingName = drawing.metadata?.name || "drawing";
    
    if (format === 'excalidraw') {
      const exportData = {
        type: "excalidraw",
        version: 2,
        source: window.location.href,
        elements: drawing.data.elements,
        files: drawing.data.files,
        appState: drawing.data.appState,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportOptions: options
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${drawingName}.excalidraw`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("导出为 Excalidraw 格式成功");
    } else if (format === 'png') {
      try {
        // 动态导入exportToCanvas函数
        const exportToCanvas = await getExportToCanvas();
        
        // 使用 exportToCanvas 导出为 PNG
        const canvas = await exportToCanvas({
          elements: drawing.data.elements,
          files: drawing.data.files,
          appState: {
            ...drawing.data.appState,
            exportBackground: options?.includeBackground !== false,
            exportScale: options?.scale || 1,
            exportWithDarkMode: resolvedTheme === "dark",
          },
        });

        // 创建下载链接
        canvas.toBlob((blob: Blob | null) => {
          if (!blob) {
            toast.error("生成PNG失败");
            return;
          }
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${drawingName}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success("导出为 PNG 格式成功");
        }, 'image/png');

      } catch (error) {
        console.error("PNG导出失败:", error);
        toast.error("PNG导出失败");
      }
    }
  }, [drawing.data, drawing.metadata, resolvedTheme]);



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        handleImport();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        handleExport();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave, handleImport, handleExport]);

 

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

 
  console.log(drawing,"drawing");

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur relative z-10">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex flex-col gap-1">
            
            
            {/* 主标题 */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                <Image src="/logo.png" alt="logo" width={24} height={24} />
              </div>
              <h1 className="text-lg font-semibold">
                {drawing.metadata?.name}
              </h1>
              <div className="text-xs text-muted-foreground">
                ID: {drawingId}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* 导出面板 */}
          <ImportExportPanel
            onImport={handleAdvancedImport}
            onExport={handleAdvancedExport}
            onShare={() => {}} // 空函数
            onCopyLink={() => {}} // 空函数
            drawingData={{
              elementCount: drawing.data.elements.length,  
              fileCount: Object.keys(drawing.data.files).length,
              hasImages: Object.keys(drawing.data.files).length > 0
            }}
            disabled={!drawing.isLoaded}
          />

          {/* 保存按钮 */}
          <Button 
            onClick={handleManualSave}
            disabled={saveStatus === "saving" || !drawing.isLoaded}
            variant="default"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveStatus === "saving" ? "保存中..." : "保存"}
          </Button>
          
          {/* 本地同步按钮 - 仅在有本地未同步数据时显示 */}
          {hasLocalChanges && (
            <Button 
              onClick={handleManualSave}
              disabled={saveStatus === "saving"}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              同步到云端
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        {drawing.error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">加载失败</h3>
              <p className="text-muted-foreground mb-4">{drawing.error}</p>
              <Button onClick={loadDrawing} disabled={isLoadingRef.current}>
                重新加载
              </Button>
            </div>
          </div>
        ) : drawing.isLoaded ? (
          <Excalidraw
            key={`excalidraw-${drawingId}-${excalidrawKey}`}
            langCode="zh-CN"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            initialData={{
              elements: drawing.data.elements || [],
              files: drawing.data.files || {},
              appState: {
                ...drawing.data.appState,
                collaborators: new Map(), // 确保协作者在appState中
              },
            }}
            onChange={handleExcalidrawChange}
            excalidrawAPI={(api) => { excalidrawAPIRef.current = api; }}
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