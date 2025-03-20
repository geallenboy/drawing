"use client";

import React, { useCallback, useEffect } from "react";

interface DocumentEditorProps {
  fileData: any;
  editorRef: React.MutableRefObject<any>;
  setEditorInitialized: (value: boolean) => void;
  viewMode: string;
  editorTheme: string;
  setIsDirty: (value: boolean) => void;
  updateWordCount: (data: any) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  fileData,
  editorRef,
  setEditorInitialized,
  viewMode,
  editorTheme,
  setIsDirty,
  updateWordCount
}) => {
  // 异步初始化编辑器
  const initEditor = useCallback(async () => {
    if (typeof window === "undefined" || !fileData) return;

    try {
      // 动态导入所有需要的模块
      const EditorJS = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;
      const Warning = (await import("@editorjs/warning")).default;
      const List = (await import("@editorjs/list")).default;
      const Code = (await import("@editorjs/code")).default;
      const Quote = (await import("@editorjs/quote")).default;
      const Table = (await import("@editorjs/table")).default;
      const InlineCode = (await import("@editorjs/inline-code")).default;

      const editor = new EditorJS({
        holder: "editorjs",
        tools: {
          header: {
            class: Header as any,
            shortcut: "CMD+SHIFT+H",
            config: {
              placeholder: "输入标题",
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            }
          },
          paragraph: {
            class: Paragraph as any,
            inlineToolbar: true
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            shortcut: "CMD+SHIFT+W",
            config: {
              titlePlaceholder: "Title",
              messagePlaceholder: "Message"
            }
          },
          list: {
            class: List as any,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered"
            }
          },
          code: {
            class: Code,
            shortcut: "CMD+SHIFT+C"
          },
          quote: {
            class: Quote as any,
            inlineToolbar: true,
            shortcut: "CMD+SHIFT+Q",
            config: {
              quotePlaceholder: "Enter a quote",
              captionPlaceholder: "Quote's author"
            }
          },
          table: {
            class: Table as any,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3
            }
          },
          inlineCode: {
            class: InlineCode,
            shortcut: "CMD+SHIFT+I"
          }
        },
        data: fileData.data || { blocks: [] },
        placeholder: "让我们写一个精彩的故事吧！",
        autofocus: true,
        readOnly: viewMode === "preview",
        onReady: () => {
          console.log("Editor.js 已准备就绪，开始工作了！");
          setEditorInitialized(true);

          // 初始化时更新字数统计
          if (editorRef.current) {
            editorRef.current.save().then((outputData: any) => {
              updateWordCount(outputData);
            });
          }
        },
        onChange: () => {
          // 仅标记为已修改，不立即保存
          setIsDirty(true);

          // 延迟更新字数统计，避免频繁更新
          const wordCountTimeout = setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.save().then((outputData: any) => {
                updateWordCount(outputData);
              });
            }
          }, 1000);
          return () => clearTimeout(wordCountTimeout);
        },
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  "Click to tune": "点击调整"
                }
              },
              toolbar: {
                toolbox: {
                  Add: "添加"
                }
              }
            },
            toolNames: {
              Text: "文本",
              Heading: "标题",
              List: "列表",
              Checklist: "检查列表",
              Quote: "引用",
              Code: "代码",
              Table: "表格",
              Warning: "警告"
            }
          }
        }
      });

      editorRef.current = editor;
    } catch (error) {
      console.error("初始化编辑器失败:", error);
    }
  }, [fileData, viewMode, setEditorInitialized, editorRef, setIsDirty, updateWordCount]);

  // 监听视图模式变化
  useEffect(() => {
    if (editorRef.current) {
      if (viewMode === "preview") {
        editorRef.current.readOnly.toggle(true);
      } else {
        editorRef.current.readOnly.toggle(false);
      }
    }
  }, [viewMode, editorRef]);

  useEffect(() => {
    if (fileData && !editorRef.current && typeof window !== "undefined") {
      initEditor();
    }

    // 清理函数 - 编辑器卸载时执行
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [fileData, initEditor, editorRef]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto py-6">
        <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm">
          <div className={`p-6 ${editorTheme === "paper" ? "bg-amber-50 dark:bg-amber-950" : ""}`}>
            <div className="w-full" id="editorjs"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
