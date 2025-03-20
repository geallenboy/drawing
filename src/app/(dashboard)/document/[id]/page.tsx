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
  DocumentSharingDialog,
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

const DocumentWorkspacePage = () => {
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
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [sharingLevel, setSharingLevel] = useState("private");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editorTheme, setEditorTheme] = useState("default");
  const [viewMode, setViewMode] = useState("edit");
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });

  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当用户想要离开页面时，如果有未保存的更改，显示确认对话框
  useBeforeUnload(isDirty, "您有未保存的更改，确定要离开吗？");

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

  // 节流保存到数据库
  const saveToDatabase = useCallback(
    async (content: any, name: string, description: string = "", tags: string[] = []) => {
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
          charCount: counts.characters
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
    [fileData, id, isNewDocument, saveDraft, updateWordCount, router]
  );

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
        } else {
          toast.error("文档保存失败!");
        }
      } catch (error) {
        console.error("保存失败:", error);
        toast.error("文档保存失败! 请重试");
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setIsDirty(true);
    toast.success(isFavorite ? "已从收藏中移除" : "已添加到收藏");
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    setIsDirty(true);
  };

  const handleShareLevelChange = (level: string) => {
    setSharingLevel(level);
    setIsDirty(true);
    const messages = {
      private: "文档已设为私密，仅自己可访问",
      limited: "文档已设为受限访问，仅特定用户可访问",
      public: "文档已设为公开，任何人都可以访问"
    };
    toast.success(messages[level as keyof typeof messages]);
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
        onShareClick={() => setIsSharingOpen(true)}
        onExport={handleExport}
        onSave={onSave}
        onMenuClick={() => setIsSheetOpen(true)}
        navigateBack={navigateToDocuments}
        sharingLevel={sharingLevel}
        setIsDirty={setIsDirty}
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
      />

      {/* 共享管理对话框 */}
      <DocumentSharingDialog
        isOpen={isSharingOpen}
        setIsOpen={setIsSharingOpen}
        id={id}
        sharingLevel={sharingLevel}
        setSharingLevel={handleShareLevelChange}
        fileData={fileData}
      />

      {/* 帮助按钮和对话框 */}
      <DocumentHelpDialog />
    </div>
  );
};

// 处理导出功能
const handleExport = (format: string) => {
  const formats = {
    pdf: "PDF 文档",
    docx: "Word 文档",
    md: "Markdown 文件",
    html: "HTML 网页"
  };
  toast.success(`已开始下载为 ${formats[format as keyof typeof formats]}`);
};

export default DocumentWorkspacePage;
