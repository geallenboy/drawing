"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Palette } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDrawingWithDataAction, updateDrawingAction } from "@/actions/drawing/drawing-action";
import { useBeforeUnload } from "react-use";
import SaveStatusIndicator, { SaveStatus } from "@/components/custom/save-status-indicator";
import { useTheme } from "next-themes";
import Image from "next/image";

// 本地存储键前缀
const STORAGE_KEY_PREFIX = "drawing_autosave_";
// 自动保存到数据库的间隔 (300秒)
const AUTO_SAVE_INTERVAL = 300000;
// 自动保存到本地的间隔 (10秒)
const LOCAL_SAVE_INTERVAL = 10000;
// 草稿过期时间 (24小时)
const DRAFT_EXPIRY_HOURS = 24;

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), {
  ssr: false
});

const DrawingWorkspace = () => {
  const params = useParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const id = (params.id || "") as string;
  const [excalidrawData, setExcalidrawData] = useState<any[]>([]);
  const [drawingData, setDrawingData] = useState<any>();
  const [isDirty, setIsDirty] = useState(false); // 是否修改
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string>("");
  // 新增：标记是否真正需要保存提示
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const dataRef = useRef<any>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当用户想要离开页面时，只有真正有未保存的更改时才显示确认对话框
  useBeforeUnload(hasUnsavedChanges, "您有未保存的画图更改，确定要离开吗？");

  // 从本地存储中加载草稿
  const loadDraft = useCallback(() => {
    if (typeof window === "undefined" || !id) return null;

    try {
      const savedDraft = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (savedDraft) {
        const { data, name, timestamp } = JSON.parse(savedDraft);

        // 检查草稿是否在24小时内
        const draftTime = new Date(timestamp);
        const now = new Date();
        const hoursSinceSave = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceSave < DRAFT_EXPIRY_HOURS) {
          return { data, name, timestamp };
        } else {
          // 清除过期草稿
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
        }
      }
    } catch (error) {
      console.error("加载草稿失败:", error);
    }

    return null;
  }, [id]);

  // 保存草稿到本地存储
  const saveDraft = useCallback(
    (drawingElements: any[], name: string) => {
      if (typeof window === "undefined" || !id) return;

      try {
        const draftData = {
          data: drawingElements,
          name,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(draftData));
      } catch (error) {
        console.error("保存草稿失败:", error);
      }
    },
    [id]
  );

  // 获取画图数据或从本地存储中恢复
  const getDrawingData = useCallback(async () => {
    try {
      const { data, success } = await getDrawingWithDataAction(id);

      // 查找本地草稿
      const draft = loadDraft();

      if (success && data.drawing) {
        const serverData = data.drawing;

        // 如果有本地草稿且比服务器数据新，自动恢复草稿
        if (draft) {
          const draftDate = new Date(draft.timestamp);
          const serverDate = new Date(serverData.updatedAt);

          if (draftDate > serverDate) {
            // 自动使用更新的草稿，不弹出确认对话框
            setDrawingData(serverData);
            setExcalidrawData(draft.data || []);
            setHasUnsavedChanges(true); // 恢复草稿时标记为有未保存的更改
            toast.info(`已自动恢复更新的本地草稿 (${draftDate.toLocaleString()})`);
          } else {
            // 服务器数据较新，自动使用服务器数据
            setDrawingData(serverData);
            setExcalidrawData(Array.isArray(serverData.data) ? serverData.data : []);
            setHasUnsavedChanges(false); // 使用服务器数据时没有未保存的更改
            // 清除较旧的草稿
            localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
            toast.info(`已自动使用最新的服务器版本 (${serverDate.toLocaleString()})`);
          }
        } else {
          // 没有草稿，使用服务器数据
          setDrawingData(serverData);
          setExcalidrawData(Array.isArray(serverData.data) ? serverData.data : []);
          setHasUnsavedChanges(false); // 使用服务器数据时没有未保存的更改
        }
      } else if (draft) {
        // 如果服务器数据获取失败但有本地草稿，使用草稿
        toast.info("使用本地保存的草稿");
        setDrawingData(data.drawing || {});
        setExcalidrawData(draft.data || []);
        setHasUnsavedChanges(true); // 使用草稿时标记为有未保存的更改
      } else {
        setDrawingData({});
        setExcalidrawData([]);
        setHasUnsavedChanges(false); // 空数据时没有未保存的更改
      }
    } catch (error) {
      console.error("获取画图数据失败:", error);

      // 尝试使用本地草稿
      const draft = loadDraft();
      if (draft) {
        toast.info("使用本地保存的草稿");
        setDrawingData({});
        setExcalidrawData(draft.data || []);
        setHasUnsavedChanges(true); // 使用草稿时标记为有未保存的更改
      } else {
        setHasUnsavedChanges(false); // 没有数据时没有未保存的更改
      }
    }
  }, [id, loadDraft]);

  useEffect(() => {
    id && getDrawingData();
  }, [id, getDrawingData]);

  // 更新引用值
  useEffect(() => {
    dataRef.current = excalidrawData;
  }, [excalidrawData]);

  // 节流保存到数据库
  const saveToDatabase = useCallback(
    async (drawingElements: any[], name: string) => {
      if (!drawingData || !drawingData.id) return;

      try {
        setSaveStatus('saving');
        setSaveError('');
        
        const { success, error } = await updateDrawingAction(drawingData.id, {
          ...drawingData,
          name,
          data: drawingElements
        });
        
        if (success) {
          setLastSaveTime(new Date());
          setIsDirty(false);
          setHasUnsavedChanges(false); // 保存成功后清除未保存标记
          setSaveStatus('saved');
          // 保存成功后清除本地草稿
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
        } else {
          // 如果保存失败，保留本地草稿
          saveDraft(drawingElements, name);
          toast.error("自动保存到服务器失败，已保存草稿到本地");
          setSaveStatus('error');
          setSaveError(error || '保存失败');
          // 保存失败时保持未保存标记
          setHasUnsavedChanges(true);
        }
      } catch (error) {
        console.error("保存到数据库失败:", error);
        // 保存失败时，确保草稿存在
        saveDraft(drawingElements, name);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : '保存失败');
        setHasUnsavedChanges(true);
      }
    },
    [drawingData, id, saveDraft]
  );

  // 设置自动保存定时器
  const setupAutoSave = useCallback(() => {
    // 清除现有定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 创建新的自动保存定时器
    saveTimeoutRef.current = setTimeout(async () => {
      if (isDirty && dataRef.current.length > 0) {
        try {
          await saveToDatabase(dataRef.current, drawingData?.name || "未命名画图");
          toast.success("画图已自动保存");
        } catch (error) {
          console.error("自动保存失败:", error);
        }
      }
    }, AUTO_SAVE_INTERVAL);
  }, [isDirty, drawingData?.name, saveToDatabase]);

  // 当内容变为脏状态时，设置自动保存
  useEffect(() => {
    if (isDirty) {
      setupAutoSave();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isDirty, setupAutoSave]);

  // 设置定期本地备份
  useEffect(() => {
    // 定期保存本地草稿
    const draftInterval = setInterval(() => {
      if (isDirty && dataRef.current.length > 0) {
        saveDraft(dataRef.current, drawingData?.name || "未命名画图");
      }
    }, LOCAL_SAVE_INTERVAL);

    return () => clearInterval(draftInterval);
  }, [isDirty, drawingData?.name, saveDraft]);

  // 页面卸载前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges && dataRef.current.length > 0) {
        saveDraft(dataRef.current, drawingData?.name || "未命名画图");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // 卸载时自动保存到本地
      if (dataRef.current.length > 0) {
        saveDraft(dataRef.current, drawingData?.name || "未命名画图");
      }
    };
  }, [drawingData?.name, hasUnsavedChanges, saveDraft]);

  const onSave = useCallback(async () => {
    if (excalidrawData.length > 0 && drawingData && drawingData.id) {
      try {
        setSaveStatus('saving');
        setSaveError('');
        
        // 立即保存到本地存储作为备份
        saveDraft(excalidrawData, drawingData?.name || "未命名画图");

        // 保存到数据库
        const { success, error } = await updateDrawingAction(drawingData.id, {
          ...drawingData,
          name: drawingData?.name || "未命名画图",
          data: excalidrawData
        });

        if (success) {
          toast.success("画图保存成功!");
          setIsDirty(false);
          setHasUnsavedChanges(false); // 保存成功后清除未保存标记
          setLastSaveTime(new Date());
          setSaveStatus('saved');
          // 成功保存到服务器后，可以删除本地草稿
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
        } else {
          toast.error("画图保存失败! 已保存到本地草稿");
          setSaveStatus('error');
          setSaveError(error || '保存失败');
          setHasUnsavedChanges(true);
        }
      } catch (error) {
        console.error("保存出错:", error);
        toast.error("画图保存失败! 尝试保存到本地");
        saveDraft(excalidrawData, drawingData?.name || "未命名画图");
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : '保存失败');
        setHasUnsavedChanges(true);
      }
    } else {
      toast.error("没有可保存的画图数据或缺少必要信息");
    }
  }, [excalidrawData, drawingData, saveDraft, id]);

  const handleExcalidrawChange = (elements: any) => {
    setExcalidrawData(elements);
    
    // 只有当数据真正发生变化时才标记为脏状态
    if (JSON.stringify(elements) !== JSON.stringify(dataRef.current)) {
      setIsDirty(true); // 标记为已修改
      setHasUnsavedChanges(true); // 标记有未保存的更改
    }
  };

  // 返回上一页或文件夹
  const handleGoBack = () => {
    // 只有真正有未保存的更改时才显示确认对话框
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm("您有未保存的更改，确定要离开吗？");
      if (!shouldLeave) return;
    }
    
    // 返回到首页，如果有父文件夹则通过 URL 参数传递
    if (drawingData?.parentFolderId) {
      router.push(`/?folder=${drawingData.parentFolderId}`);
    } else {
      router.push("/");
    }
  };

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && excalidrawData.length > 0) {
          onSave();
        }
      }
      
      // Esc 键清除选择状态（如果需要）
      if (e.key === 'Escape') {
        // 可以在这里添加其他 Esc 键行为
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, excalidrawData, onSave]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 优化的头部导航 */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* 左侧：返回按钮和标题 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              {drawingData?.name || "画图详情"}
            </h1>
          </div>
        </div>
        
        {/* 右侧：保存相关控件 */}
        <div className="flex items-center gap-3">
          {/* 保存状态指示器 */}
          <SaveStatusIndicator 
            status={saveStatus}
            lastSaveTime={lastSaveTime}
            errorMessage={saveError}
          />
          
          {/* 快捷键提示 */}
          <div className="text-xs text-muted-foreground hidden sm:block">
            Ctrl+S 保存
          </div>
          
          <Button
            className="h-9 text-sm gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50"
            onClick={onSave}
            disabled={!isDirty || !excalidrawData.length || saveStatus === 'saving'}
          >
            <Save className="h-4 w-4" /> 
            {saveStatus === 'saving' ? "保存中..." : isDirty ? "保存" : "已保存"}
          </Button>
        </div>
      </div>

      {/* 绘图画布区域 - 占满剩余空间 */}
      <div className="flex-1 relative">
        {drawingData && (
          <Excalidraw
            langCode="zh-CN"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            initialData={{
              elements: Array.isArray(excalidrawData) ? excalidrawData : []
            }}
            onChange={handleExcalidrawChange}
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                toggleTheme: false
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DrawingWorkspace;