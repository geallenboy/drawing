"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useParams } from "next/navigation";
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
import { getByIdFileAction } from "@/app/actions/file-actions";
import { updateFileAction } from "@/app/actions/file-actions";

const DocumentWorkspace = () => {
  const [inputVal, setInputVal] = useState("");
  const params = useParams();
  const id = (params.id || "") as string;
  const [fileData, setFileData] = useState<any>();

  const getFileData = useCallback(async () => {
    const { data, success } = await getByIdFileAction(id);

    if (success && data.length > 0) {
      setFileData(data[0]);
      setInputVal(data[0].name);
    } else {
      setFileData(null);
    }
  }, [id]);

  useEffect(() => {
    id && getFileData();
  }, [getFileData, id]);
  const editorRef = useRef<EditorJS>();
  const initEditor = useCallback(() => {
    const editor = new EditorJS({
      holder: "editorjs",
      tools: {
        header: {
          class: Header as any,
          shortcut: "CMD+SHIFT+H",
          config: {
            placeholder: "输入标题",
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
      placeholder: "让我们写一个精彩的故事吧！",
      autofocus: true, // 自动聚焦
      onReady: () => {
        console.log("Editor.js 已准备就绪，开始工作了！");
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
    return () => {
      if (editorRef.current) {
        editorRef.current
          .save()
          .then(async (outputData) => {
            await updateFileAction({
              ...fileData,
              name: inputVal,
              file_data: outputData as any
            });
            console.log("文档自动保存成功!");
          })
          .catch((error) => {
            console.error("文档自动保存失败:", error);
          });
      }
    };
  }, [fileData, initEditor, inputVal]);
  const onSave = async () => {
    if (editorRef.current) {
      try {
        const outputData = await editorRef.current.save();
        const { success } = await updateFileAction({
          ...fileData,
          name: inputVal,
          file_data: outputData as any
        });
        if (success) {
          toast.success("文档更新成功!");
        } else {
          toast.error("文档更新失败!");
        }
      } catch (error) {
        toast.error("文档更新失败!");
      }
    }
  };

  const inputChange = (e: any) => {
    setInputVal(e.target.value);
  };

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
      <div className="h-screen">
        <div className="w-full pl-10">
          <div className="w-full" id="editorjs"></div>
        </div>
      </div>
    </div>
  );
};

export default DocumentWorkspace;
