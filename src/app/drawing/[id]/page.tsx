"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDrawingWithDataAction, updateDrawingAction } from "@/actions/drawing/drawing-action";
import { useBeforeUnload } from "react-use";
import SaveStatusIndicator, { SaveStatus } from "@/components/custom/save-status-indicator";

// 本地存储键前缀
const STORAGE_KEY_PREFIX = "drawing_autosave_";
// 自动保存到数据库的间隔 (30秒)
const AUTO_SAVE_INTERVAL = 300000;
// 自动保存到本地的间隔 (10秒)
const LOCAL_SAVE_INTERVAL = 100000;
// 草稿过期时间 (24小时)
const DRAFT_EXPIRY_HOURS = 24;

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), {
  ssr: false
});

const DrawingWorkspace = () => {
  const [inputVal, setInputVal] = useState("");
  const params = useParams();
  const router = useRouter();
  const id = (params.id || "") as string;
  const [excalidrawData, setExcalidrawData] = useState<any[]>([]);
  const [drawingData, setDrawingData] = useState<any>();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string>("");

  const dataRef = useRef<any>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当用户想要离开页面时，如果有未保存的更改，显示确认对话框
  useBeforeUnload(isDirty, "您有未保存的绘图更改，确定要离开吗？");

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

  // 获取绘图数据或从本地存储中恢复
  const getDrawingData = useCallback(async () => {
    try {
      const { data, success } = await getDrawingWithDataAction(id);

      // 查找本地草稿
      const draft = loadDraft();

      if (success && data.drawing) {
        const serverData = data.drawing;

        // 如果有本地草稿且比服务器数据新，提示用户恢复
        if (draft) {
          const draftDate = new Date(draft.timestamp);
          const serverDate = new Date(serverData.updatedAt);

          if (draftDate > serverDate) {
            const shouldRestore = window.confirm(
              `发现本地保存的绘图草稿 (${draftDate.toLocaleString()}), 比服务器版本 (${serverDate.toLocaleString()}) 更新。是否恢复草稿？`
            );

            if (shouldRestore) {
              setDrawingData(serverData);
              setExcalidrawData(draft.data || []);
              setInputVal(draft.name);
              toast.info("已恢复本地草稿");
            } else {
              localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
              setDrawingData(serverData);
              setExcalidrawData(Array.isArray(serverData.data) ? serverData.data : []);
              setInputVal(serverData.name);
            }
          } else {
            // 服务器数据较新
            setDrawingData(serverData);
            setExcalidrawData(Array.isArray(serverData.data) ? serverData.data : []);
            setInputVal(serverData.name);
            // 清除较旧的草稿
            localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
          }
        } else {
          // 没有草稿，使用服务器数据
          setDrawingData(serverData);
          setExcalidrawData(Array.isArray(serverData.data) ? serverData.data : []);
          setInputVal(serverData.name);
        }
      } else if (draft) {
        // 如果服务器数据获取失败但有本地草稿，使用草稿
        toast.info("使用本地保存的草稿");
        setDrawingData(data.drawing || {});
        setExcalidrawData(draft.data || []);
        setInputVal(draft.name);
      } else {
        setDrawingData({});
        setExcalidrawData([]);
      }
    } catch (error) {
      console.error("获取绘图数据失败:", error);

      // 尝试使用本地草稿
      const draft = loadDraft();
      if (draft) {
        toast.info("使用本地保存的草稿");
        setDrawingData({});
        setExcalidrawData(draft.data || []);
        setInputVal(draft.name);
      }
    }
  }, [id, loadDraft]);

  useEffect(() => {
    id && getDrawingData();
  }, [id, getDrawingData]);

  // 更新引用值
  useEffect(() => {
    dataRef.current = excalidrawData;
  }, [excalidrawData]);  // 节流保存到数据库
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
          setSaveStatus('saved');
          // 保存成功后清除本地草稿
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
        } else {
          // 如果保存失败，保留本地草稿
          saveDraft(drawingElements, name);
          toast.error("自动保存到服务器失败，已保存草稿到本地");
          setSaveStatus('error');
          setSaveError(error || '保存失败');
        }
      } catch (error) {
        console.error("保存到数据库失败:", error);
        // 保存失败时，确保草稿存在
        saveDraft(drawingElements, name);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : '保存失败');
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
          await saveToDatabase(dataRef.current, inputVal);
          toast.success("绘图已自动保存");
        } catch (error) {
          console.error("自动保存失败:", error);
        }
      }
    }, AUTO_SAVE_INTERVAL);
  }, [isDirty, inputVal, saveToDatabase]);

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
        saveDraft(dataRef.current, inputVal);
      }
    }, LOCAL_SAVE_INTERVAL);

    return () => clearInterval(draftInterval);
  }, [isDirty, inputVal, saveDraft]);

  // 页面卸载前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && dataRef.current.length > 0) {
        saveDraft(dataRef.current, inputVal);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // 卸载时自动保存到本地
      if (dataRef.current.length > 0) {
        saveDraft(dataRef.current, inputVal);
      }
    };
  }, [inputVal, isDirty, saveDraft]);

  const onSave = async () => {
    if (excalidrawData.length > 0 && drawingData && drawingData.id) {
      try {
        setSaveStatus('saving');
        setSaveError('');
        
        // 立即保存到本地存储作为备份
        saveDraft(excalidrawData, inputVal);

        // 保存到数据库
        const { success, error } = await updateDrawingAction(drawingData.id, {
          ...drawingData,
          name: inputVal,
          data: excalidrawData
        });

        if (success) {
          toast.success("绘图保存成功!");
          setIsDirty(false);
          setLastSaveTime(new Date());
          setSaveStatus('saved');
          // 成功保存到服务器后，可以删除本地草稿
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
        } else {
          toast.error("绘图保存失败! 已保存到本地草稿");
          setSaveStatus('error');
          setSaveError(error || '保存失败');
        }
      } catch (error) {
        console.error("保存出错:", error);
        toast.error("绘图保存失败! 尝试保存到本地");
        saveDraft(excalidrawData, inputVal);
        setSaveStatus('error');
        setSaveError(error instanceof Error ? error.message : '保存失败');
      }
    } else {
      toast.error("没有可保存的绘图数据或缺少必要信息");
    }
  };

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setIsDirty(true); // 标记为已修改
  };

  const handleExcalidrawChange = (elements: any) => {
    setExcalidrawData(elements);
    setIsDirty(true); // 标记为已修改
  };

  // 返回上一页或文件夹
  const handleGoBack = () => {
    if (isDirty) {
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
    <div>
      <div className="flex items-center justify-between mb-4">
        {/* 左侧：返回按钮和标题输入 */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <Input
            value={inputVal}
            onChange={inputChange}
            className="flex-1"
            placeholder="绘图标题"
          />
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
          <div className="text-xs text-gray-400 hidden sm:block">
            Ctrl+S 保存
          </div>
          
          <Button
            className="h-8 text-[12px] gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50"
            onClick={onSave}
            disabled={!isDirty || !excalidrawData.length || saveStatus === 'saving'}
          >
            <Save className="h-4 w-4" /> 
            {saveStatus === 'saving' ? "保存中..." : isDirty ? "保存" : "已保存"}
          </Button>
        </div>
      </div>

      <div className="h-[88vh]">
        {drawingData && (
          <Excalidraw
            langCode="zh-CN"
            theme="light"
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
