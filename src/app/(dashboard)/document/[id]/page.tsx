"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBeforeUnload } from "react-use";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

import {
  DocumentHeader,
  DocumentToolbar,
  DocumentSettingsPanel,
  DocumentHistoryPanel,
  DocumentHelpDialog,
  DocumentEditor,
  LoadingState,
  ErrorState
} from "@/components/feature/document";

import { getFileByIdAction, updateFileAction, createFileAction } from "@/actions/file/file-action";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

// 本地存储键前缀
const STORAGE_KEY_PREFIX = "doc_autosave_";

const DocumentEditedPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = (params.id || "") as string;
  const isNewDocument = id === "new";

  const [inputVal, setInputVal] = useState("");
  const [description, setDescription] = useState("");
  const [fileData, setFileData] = useState<any>();
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sharingLevel, setSharingLevel] = useState("private");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editorTheme, setEditorTheme] = useState("default");
  const [viewMode, setViewMode] = useState("edit");
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });

  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 保存时创建历史记录
  const createHistoryEntry = async (
    content: any,
    isAutosave: boolean = true,
    changeDescription: string = ""
  ) => {
    if (!fileData?.id || isNewDocument) return;

    try {
      // 计算当前版本号
      const currentVersion = fileData.version || 1;
      // 使用当前版本号而不是增加版本号，因为版本号已经在saveToDatabase中增加了
      const historyVersion = currentVersion;

      // 计算字数
      const counts = updateWordCount(content);

      console.log(
        `创建历史记录: 版本 ${historyVersion}, 类型: ${
          isAutosave ? "自动" : "手动"
        }, 描述: ${changeDescription}`
      );

      // 创建历史记录
      await createFileAction(fileData.id, content, historyVersion, fileData.userId);
    } catch (error) {
      console.error("创建历史记录失败:", error);
    }
  };

  // 添加恢复版本的处理函数
  const handleRestoreVersion = (versionData: any) => {
    if (editorRef.current && versionData) {
      try {
        // 更新编辑器内容
        editorRef.current.render(versionData);
        setIsDirty(true);
      } catch (error) {
        console.error("恢复版本失败:", error);
        toast.error("恢复版本失败");
      }
    }
  };
  // 当用户想要离开页面时，如果有未保存的更改，显示确认对话框
  useBeforeUnload(isDirty, "您有未保存的更改，确定要离开吗？");

  // 添加定期历史记录创建逻辑
  useEffect(() => {
    if (isNewDocument || !fileData?.id || !editorRef.current) return;

    // 根据快照频率设置不同的间隔
    const getIntervalTime = () => {
      switch (fileData?.snapshotFrequency) {
        case "hourly":
          return 60 * 60 * 1000; // 1小时
        case "daily":
          return 24 * 60 * 60 * 1000; // 24小时
        case "manual":
        default:
          return null; // 不自动创建快照
      }
    };

    const intervalTime = getIntervalTime();
    if (!intervalTime) return;

    // 添加一个上次快照的时间追踪
    let lastSnapshotTime = Date.now();

    const snapshotInterval = setInterval(async () => {
      const now = Date.now();
      // 确保自上次保存后已经过了足够的时间（至少30分钟）
      // 这可以避免与常规自动保存过于接近
      if (now - lastSnapshotTime < 30 * 60 * 1000) return;

      // 只有当编辑器已初始化并且有内容变化时才创建快照
      if (editorRef.current && isDirty) {
        try {
          const content = await editorRef.current.save();
          await createHistoryEntry(
            content,
            true,
            `定期${fileData?.snapshotFrequency === "hourly" ? "小时" : "每日"}快照`
          );
          lastSnapshotTime = now;
        } catch (error) {
          console.error("创建历史快照失败:", error);
        }
      }
    }, Math.min(intervalTime, 15 * 60 * 1000)); // 最多每15分钟检查一次

    return () => clearInterval(snapshotInterval);
  }, [fileData?.id, fileData?.snapshotFrequency, isNewDocument, createHistoryEntry, isDirty]);

  // 从本地存储中加载草稿
  const loadDraft = useCallback(() => {
    if (typeof window === "undefined" || !id || isNewDocument) return null;

    try {
      const savedDraft = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (savedDraft) {
        const { data, name, description, tags, timestamp } = JSON.parse(savedDraft);

        // 检查草稿是否在24小时内
        const draftTime = new Date(timestamp);
        const now = new Date();
        const hoursSinceSave = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceSave < 24) {
          return { data, name, description, tags, timestamp };
        } else {
          // 清除过期草稿
          localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
        }
      }
    } catch (error) {
      console.error("加载草稿失败:", error);
    }

    return null;
  }, [id, isNewDocument]);

  // 保存草稿到本地存储
  const saveDraft = useCallback(
    (content: any, name: string, description: string = "", tags: string[] = []) => {
      if (typeof window === "undefined" || !id || isNewDocument) return;

      try {
        const draftData = {
          data: content,
          name,
          description,
          tags,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(draftData));
      } catch (error) {
        console.error("保存草稿失败:", error);
      }
    },
    [id, isNewDocument]
  );

  // 获取数据或从本地存储中恢复
  const getFileData = useCallback(async () => {
    if (isNewDocument) {
      // 创建新文档的逻辑
      setFileData({
        name: "新文档",
        desc: "",
        data: { blocks: [] },
        tags: [],
        isFavorite: false,
        sharingLevel: "private",
        collaborators: [],
        revisionHistory: [],
        metadata: {}
      });
      setInputVal("新文档");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, success } = await getFileByIdAction(id);
      let fileContent, fileName, fileDescription, fileTags;

      // 查找本地草稿
      const draft = loadDraft();

      if (success && data.file) {
        // 从服务器获取文件数据
        const serverFile = data.file;

        // 设置收藏和共享状态
        setIsFavorite(serverFile.isFavorite || false);
        setSharingLevel(serverFile.sharingLevel || "private");

        // 如果有本地草稿且比服务器数据新，提示用户恢复
        if (draft) {
          const draftDate = new Date(draft.timestamp);
          const serverDate = new Date(serverFile.updatedAt);

          if (draftDate > serverDate) {
            const shouldRestore = window.confirm(
              `发现本地保存的草稿 (${draftDate.toLocaleString()}), 比服务器版本 (${serverDate.toLocaleString()}) 更新。是否恢复草稿？`
            );

            if (shouldRestore) {
              fileContent = draft.data;
              fileName = draft.name;
              fileDescription = draft.description || serverFile.desc;
              fileTags = draft.tags || serverFile.tags || [];
            } else {
              localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
              fileContent = serverFile.data;
              fileName = serverFile.name;
              fileDescription = serverFile.desc;
              fileTags = serverFile.tags || [];
            }
          } else {
            fileContent = serverFile.data;
            fileName = serverFile.name;
            fileDescription = serverFile.desc;
            fileTags = serverFile.tags || [];
            // 清除较旧的草稿
            localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
          }
        } else {
          fileContent = serverFile.data;
          fileName = serverFile.name;
          fileDescription = serverFile.desc;
          fileTags = serverFile.tags || [];
        }

        setFileData({ ...serverFile, data: fileContent });
        setInputVal(fileName);
        setDescription(fileDescription);
        setSelectedTags(fileTags);
      } else if (draft) {
        // 如果服务器数据获取失败但有本地草稿，使用草稿
        toast.info("使用本地保存的草稿");
        setFileData({ data: draft.data });
        setInputVal(draft.name);
        setDescription(draft.description || "");
        setSelectedTags(draft.tags || []);
      } else {
        setFileData(null);
        toast.error("无法获取文档数据");
      }
    } catch (error) {
      console.error("获取文件数据失败:", error);
      // 尝试使用本地草稿
      const draft = loadDraft();
      if (draft) {
        toast.info("使用本地保存的草稿");
        setFileData({ data: draft.data });
        setInputVal(draft.name);
        setDescription(draft.description || "");
        setSelectedTags(draft.tags || []);
      }
    } finally {
      setLoading(false);
    }
  }, [id, isNewDocument, loadDraft]);

  useEffect(() => {
    getFileData();
  }, [getFileData]);

  // 更新单词计数
  const updateWordCount = useCallback((outputData: any) => {
    let text = "";
    if (outputData && outputData.blocks) {
      outputData.blocks.forEach((block: any) => {
        if (block.type === "paragraph" || block.type === "header") {
          text += block.data.text + " ";
        }
      });
    }

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const characters = text.replace(/\s+/g, "").length;

    setWordCount({ words, characters });
    return { words, characters };
  }, []);

  // 修改 saveToDatabase 函数，添加历史记录描述参数
  const saveToDatabase = useCallback(
    async (
      content: any,
      name: string,
      description: string = "",
      tags: string[] = [],
      historyDescription: string = "自动保存", // 添加历史记录描述参数
      isAutosave: boolean = true // 添加是否自动保存标志
    ) => {
      try {
        // 计算字数统计
        const counts = updateWordCount(content);

        // 准备要保存的数据
        const saveData = {
          ...fileData,
          name,
          desc: description,
          tags,
          data: content,
          wordCount: counts.words,
          charCount: counts.characters,
          version: (fileData?.version || 1) + 1 // 增加版本号
        };

        let success = false;

        if (isNewDocument) {
          // 如果是新文档，调用创建接口
          const response = await createFileAction({
            ...saveData,
            userId: "current-user-id" // 这里应该是实际用户ID
          });

          success = response.success;

          if (success && response.data && response.data.file) {
            // 创建成功后跳转到编辑新文档的URL
            router.push(`/document/${response.data.file.id}`);
          }
        } else {
          // 如果是已有文档，调用更新接口
          const response = await updateFileAction(id, saveData);
          success = response.success;

          // 保存成功后创建历史记录，使用传入的描述和自动保存标志
          if (success) {
            await createHistoryEntry(content, isAutosave, historyDescription);
            // 更新本地文件数据以反映新版本号
            setFileData({ ...saveData, id: fileData.id, userId: fileData.userId });
          }
        }

        if (success) {
          setLastSaveTime(new Date());
          setIsDirty(false);
          // 保存成功后清除本地草稿
          if (!isNewDocument) {
            localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
          }
        } else {
          // 如果保存失败，保留本地草稿
          if (!isNewDocument) {
            saveDraft(content, name, description, tags);
          }
          toast.error("自动保存到服务器失败，已保存草稿到本地");
        }

        return success;
      } catch (error) {
        console.error("保存到数据库失败:", error);
        // 保存失败时，确保草稿存在
        if (!isNewDocument) {
          saveDraft(content, name, description, tags);
        }
        return false;
      }
    },
    [fileData, id, isNewDocument, saveDraft, updateWordCount, router, createHistoryEntry]
  );

  // 修改手动保存函数，确保创建手动历史记录
  const onSave = async () => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();

        // 如果不是新文档，立即保存到本地存储作为备份
        if (!isNewDocument) {
          saveDraft(outputData, inputVal, description, selectedTags);
        }

        const success = await saveToDatabase(outputData, inputVal, description, selectedTags);

        if (success) {
          toast.success("文档保存成功!");
          setIsDirty(false);
          setLastSaveTime(new Date());

          // 手动保存时单独创建非自动保存的历史记录
        } else {
          toast.error("文档保存失败!");
        }
      } catch (error) {
        console.error("保存失败:", error);
        toast.error("文档保存失败! 请重试");
      }
    }
  };

  // 设置自动保存定时器
  const setupAutoSave = useCallback(() => {
    // 清除现有定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 创建新的自动保存定时器 (30秒)
    saveTimeoutRef.current = setTimeout(async () => {
      if (editorRef.current && isDirty) {
        try {
          const content = await editorRef.current.save();
          const success = await saveToDatabase(content, inputVal, description, selectedTags);

          if (success) {
            toast.success("文档已自动保存");
          }
        } catch (error) {
          console.error("自动保存失败:", error);
        }
      }
    }, 30000); // 30秒自动保存
  }, [isDirty, inputVal, description, selectedTags, saveToDatabase]);

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
    if (isNewDocument) return;

    // 每10秒保存一次本地草稿
    const draftInterval = setInterval(async () => {
      if (editorRef.current && isDirty) {
        try {
          const content = await editorRef.current.save();
          saveDraft(content, inputVal, description, selectedTags);
        } catch (error) {
          console.error("保存草稿失败:", error);
        }
      }
    }, 10000); // 10秒保存一次草稿

    return () => clearInterval(draftInterval);
  }, [isDirty, inputVal, description, selectedTags, saveDraft, isNewDocument]);

  // 页面卸载前保存草稿
  useEffect(() => {
    if (isNewDocument) return;

    const handleBeforeUnload = async () => {
      if (editorRef.current && isDirty) {
        try {
          const content = await editorRef.current.save();
          saveDraft(content, inputVal, description, selectedTags);
        } catch (error) {
          console.error("保存草稿失败:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [inputVal, description, selectedTags, isDirty, saveDraft, isNewDocument]);

  // 修改 toggleFavorite 函数，添加即时数据库更新功能
  // 替换现有的 toggleFavorite 函数

  const toggleFavorite = async () => {
    // 新的收藏状态
    const newFavoriteStatus = !isFavorite;

    if (isNewDocument) {
      // 如果是新文档，只更新本地状态，等待文档保存时一起保存
      setIsFavorite(newFavoriteStatus);
      setIsDirty(true); // 只有新文档才设置脏状态
      toast.success(newFavoriteStatus ? "已添加到收藏" : "已从收藏中移除");
      return;
    }

    try {
      // 立即更新UI状态
      setIsFavorite(newFavoriteStatus);

      // 准备更新数据
      const updateData = {
        id: id,
        isFavorite: newFavoriteStatus
      };

      // 调用API
      const response = await updateFileAction(id, updateData);

      if (response.success) {
        toast.success(newFavoriteStatus ? "已添加到收藏" : "已从收藏中移除");

        // 更新本地文件数据
        setFileData((prevData: any) => ({
          ...prevData,
          isFavorite: newFavoriteStatus
        }));
      } else {
        // 更新失败，恢复状态
        setIsFavorite(!newFavoriteStatus);
        toast.error("更新收藏状态失败");
      }
    } catch (error) {
      console.error("收藏操作失败:", error);
      // 恢复状态
      setIsFavorite(!newFavoriteStatus);
      toast.error("收藏操作失败，请重试");
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    setIsDirty(true);
  };

  const navigateToDocuments = () => {
    if (isDirty) {
      // 如果有未保存的更改，提示用户
      const confirmed = window.confirm("您有未保存的更改，确定要离开吗？");
      if (!confirmed) return;
    }
    router.push("/document");
  };

  // 渲染加载状态
  if (loading) {
    return <LoadingState />;
  }

  // 渲染错误状态
  if (!fileData && !loading && !isNewDocument) {
    return <ErrorState navigateToDocuments={navigateToDocuments} />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部导航栏 */}
      <DocumentHeader
        title={inputVal}
        onTitleChange={setInputVal}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        lastSaveTime={lastSaveTime}
        isDirty={isDirty}
        updatedAt={fileData?.updatedAt}
        onHistoryClick={() => setIsHistoryOpen(true)}
        onSave={onSave}
        onMenuClick={() => setIsSheetOpen(true)}
        navigateBack={navigateToDocuments}
        sharingLevel={sharingLevel}
        setIsDirty={setIsDirty}
        id={id} // 添加文档ID参数
      />

      {/* 编辑工具栏 */}
      <DocumentToolbar viewMode={viewMode} setViewMode={setViewMode} wordCount={wordCount} />

      {/* 主编辑区域 */}
      <DocumentEditor
        fileData={fileData}
        editorRef={editorRef}
        setEditorInitialized={setEditorInitialized}
        viewMode={viewMode}
        editorTheme={editorTheme}
        setIsDirty={setIsDirty}
        updateWordCount={updateWordCount}
      />

      {/* 设置侧边栏 */}
      <DocumentSettingsPanel
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        title={inputVal}
        setTitle={setInputVal}
        description={description}
        setDescription={setDescription}
        fileData={fileData}
        sharingLevel={sharingLevel}
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        onSave={onSave}
        setIsDirty={setIsDirty}
        navigateToDocuments={navigateToDocuments}
      />

      {/* 修订历史侧边栏 */}
      <DocumentHistoryPanel
        isOpen={isHistoryOpen}
        setIsOpen={setIsHistoryOpen}
        fileData={fileData}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* 帮助按钮和对话框 */}
      <DocumentHelpDialog />
    </div>
  );
};

export default DocumentEditedPage;
