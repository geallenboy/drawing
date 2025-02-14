"use client";
import React, { useCallback, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import Warning from "@editorjs/warning";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import InlineCode from "@editorjs/inline-code";
import { toast } from "sonner";
import { updateFileAction } from "@/app/actions/file-actions";

const Editor = ({
  fileData,
  triggerSave,
  name
}: {
  fileData: any;
  triggerSave: boolean;
  name: string;
}) => {
  const editorRef = useRef<EditorJS>();
  const initEditor = useCallback(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      tools: {
        header: {
          class: Header as any,
          shortcut: "CMD+SHIFT+H",
          config: {
            placeholder: "Enter a Header",
            levels: [1, 2, 3, 4], // 支持的标题级别
            defaultLevel: 2 // 默认标题级别
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
            defaultStyle: "unordered" // 默认列表样式（有序或无序）
          }
        },
        code: {
          class: Code,
          shortcut: "CMD+SHIFT+C"
        },
        quote: {
          class: Quote,
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
      data: fileData?.file_data || { blocks: [] }, // 默认空数据
      placeholder: "Let's write an awesome story!",
      autofocus: true, // 自动聚焦
      onReady: () => {
        console.log("Editor.js is ready to work!");
      },
      onChange: async () => {
        if (editorRef.current) {
          const outputData = await editorRef.current.save();
          console.log("Editor content changed:", outputData);
          await updateFileAction({
            ...fileData,
            file_data: outputData as any
          });
        }
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
  }, [fileData]);
  useEffect(() => {
    if (fileData && !editorRef.current) {
      initEditor();
    }
  }, [fileData, initEditor]);

  const onSaveDocument = useCallback(async () => {
    console.log("editorRef.current:", editorRef.current, editorRef);
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();

        const { success } = await updateFileAction({
          ...fileData,
          name,
          file_data: outputData as any
        });
        console.log(success, "success");
        if (success) {
          toast.success("文档更新成功!");
        } else {
          toast.error("文档更新失败!");
        }
      } catch (error) {
        toast.error("文档更新失败!");
      }
    }
  }, [fileData, name]);

  useEffect(() => {
    if (editorRef.current) {
      onSaveDocument();
    }
  }, [onSaveDocument, triggerSave]);

  return (
    <div className="w-full pl-10">
      <div className="w-full" id="editorjs"></div>
    </div>
  );
};

export default Editor;
