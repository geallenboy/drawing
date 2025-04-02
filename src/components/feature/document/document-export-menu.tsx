import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileText, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  exportToPdfAction,
  exportToWordAction,
  exportToMarkdownAction,
  exportToHtmlAction
} from "@/actions/file/file-action";

interface DocumentExportMenuProps {
  id: string;
  disabled?: boolean;
}

export function DocumentExportMenu({ id, disabled }: DocumentExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentFormat, setCurrentFormat] = useState("");

  // 将 Editor.js 内容转换为 HTML
  const editorJsToHtml = (data: any) => {
    if (!data || !data.blocks) return "<p>无内容</p>";

    let html = "";
    data.blocks.forEach((block: any) => {
      switch (block.type) {
        case "header":
          const headerLevel = block.data.level;
          html += `<h${headerLevel}>${block.data.text}</h${headerLevel}>`;
          break;
        case "paragraph":
          html += `<p>${block.data.text}</p>`;
          break;
        case "list":
          const listType = block.data.style === "ordered" ? "ol" : "ul";
          html += `<${listType}>`;
          if (Array.isArray(block.data.items)) {
            block.data.items.forEach((item: string) => {
              html += `<li>${item}</li>`;
            });
          }
          html += `</${listType}>`;
          break;
        case "image":
          if (block.data.file && block.data.file.url) {
            html += `<figure>
              <img src="${block.data.file.url}" alt="${block.data.caption || ""}">
              ${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ""}
            </figure>`;
          }
          break;
        case "quote":
          html += `<blockquote>${block.data.text}</blockquote>`;
          if (block.data.caption) {
            html += `<cite>${block.data.caption}</cite>`;
          }
          break;
        case "table":
          if (Array.isArray(block.data.content)) {
            html += `<table><tbody>`;
            block.data.content.forEach((row: string[]) => {
              html += `<tr>`;
              if (Array.isArray(row)) {
                row.forEach((cell: string) => {
                  html += `<td>${cell}</td>`;
                });
              }
              html += `</tr>`;
            });
            html += `</tbody></table>`;
          }
          break;
        case "code":
          html += `<pre><code>${block.data.code}</code></pre>`;
          break;
        default:
          // 处理纯文本内容
          if (block.data && block.data.text) {
            html += `<p>${block.data.text}</p>`;
          }
          break;
      }
    });

    return html;
  };

  // 创建完整HTML文档
  const createFullHtml = (content: any, title: string) => {
    const bodyHtml = editorJsToHtml(content);

    return `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { 
          font-family: "Microsoft YaHei", "PingFang SC", sans-serif; 
          line-height: 1.6; 
          margin: 0; 
          padding: 40px; 
          color: #333; 
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        p { margin-top: 0; margin-bottom: 16px; }
        img { max-width: 100%; height: auto; }
        pre { background-color: #f6f8fa; padding: 16px; border-radius: 3px; }
        code { font-family: monospace; }
        blockquote { margin-left: 0; padding-left: 16px; border-left: 4px solid #ddd; color: #666; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
        table, th, td { border: 1px solid #ddd; padding: 8px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${bodyHtml}
      <div style="margin-top: 50px; font-size: 12px; color: #666; text-align: center;">
        由 Draw-Text 导出 - ${new Date().toLocaleDateString("zh-CN")}
      </div>
    </body>
    </html>`;
  };

  // HTML转Markdown
  const htmlToMarkdown = (html: string, title: string) => {
    const markdown = `# ${title}\n\n`;

    // 简单的HTML转Markdown逻辑
    const temp = html
      .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
      .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
      .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
      .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
      .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
      .replace(/<em>(.*?)<\/em>/g, "*$1*")
      .replace(/<ul>([\s\S]*?)<\/ul>/g, (_, p1) => {
        return p1.replace(/<li>(.*?)<\/li>/g, "- $1\n") + "\n";
      })
      .replace(/<ol>([\s\S]*?)<\/ol>/g, (_, p1) => {
        let counter = 1;
        return (
          p1.replace(/<li>(.*?)<\/li>/g, (_: any, p2: any) => {
            return `${counter++}. ${p2}\n`;
          }) + "\n"
        );
      })
      .replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, "> $1\n\n")
      .replace(/<code>(.*?)<\/code>/g, "`$1`");

    return markdown + temp;
  };

  // 创建PDF格式的HTML (打印友好)
  const createPrintFriendlyHtml = (content: any, title: string, metadata: any) => {
    const bodyHtml = editorJsToHtml(content);

    return `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${title} - PDF打印版</title>
      <style>
        @media print {
          body { 
            font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20mm;
            color: #000;
          }
          h1 { font-size: 24pt; margin-bottom: 20pt; }
          h2 { font-size: 18pt; margin-top: 18pt; }
          h3 { font-size: 14pt; margin-top: 14pt; }
          p { margin-bottom: 10pt; }
          .footer { position: fixed; bottom: 10mm; text-align: center; width: 100%; font-size: 9pt; }
          .header { position: fixed; top: 10mm; text-align: right; width: 100%; font-size: 9pt; }
          .content { margin-top: 15mm; margin-bottom: 15mm; }
        }
        
        body { 
          font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20mm;
          color: #000;
        }
        h1 { font-size: 24pt; margin-bottom: 20pt; }
        h2 { font-size: 18pt; margin-top: 18pt; }
        h3 { font-size: 14pt; margin-top: 14pt; }
        p { margin-bottom: 10pt; }
        .note { 
          background-color: #f8f8f8; 
          padding: 10px; 
          border: 1px solid #ddd; 
          margin: 20px 0; 
          border-radius: 4px;
        }
        .footer { margin-top: 50px; text-align: center; font-size: 9pt; color: #666; }
      </style>
    </head>
    <body>


      <div class="content">
        <h1>${title}</h1>
        ${bodyHtml}
      </div>

      <div class="footer">
        Draw-Text 导出 | ${new Date().toLocaleDateString("zh-CN")} | 共 ${
      metadata?.wordCount || "0"
    } 字
      </div>
      
      <script>
        // 自动弹出打印对话框
        setTimeout(() => {
          window.print();
        }, 1000);
      </script>
    </body>
    </html>`;
  };

  // 下载文件通用方法
  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    // 清理
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };

  // PDF导出处理
  const handlePdfExport = async () => {
    try {
      const result = await exportToPdfAction(id);

      if (!result.success || !result.data) {
        throw new Error(result.error || "获取文档数据失败");
      }

      const fileName = result.data.name;
      const content = result.data.content;

      // 创建一个临时的HTML页面用于打印成PDF
      const printHtml = createPrintFriendlyHtml(content, fileName, {
        wordCount: result.data.wordCount,
        charCount: result.data.charCount
      });

      // 在新窗口打开打印视图
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        // 打印功能会在HTML中通过脚本自动触发
      } else {
        toast.error("无法打开打印窗口，请检查浏览器设置是否阻止弹窗");
      }

      toast.success("PDF导出视图已打开，请按照说明完成导出");
    } catch (error) {
      console.error("PDF导出失败:", error);
      toast.error("PDF导出失败，请重试");
    }
  };

  // Word导出处理 (简化版，实际上是返回HTML)
  const handleWordExport = async () => {
    try {
      const result = await exportToWordAction(id);

      if (!result.success || !result.data) {
        throw new Error(result.error || "获取文档数据失败");
      }

      const fileName = result.data.name;
      const content = result.data.content;

      // 生成HTML (简化版，实际应用应使用专用库如docx-js)
      const html = createFullHtml(content, fileName);

      // 下载为.html文件但保留.docx扩展名方便识别
      downloadFile(html, `${fileName}.html`, "text/html");

      toast.success(`Word格式文档已导出（HTML格式）`);
    } catch (error) {
      console.error("Word导出失败:", error);
      toast.error("Word导出失败，请重试");
    }
  };

  // Markdown导出处理
  const handleMarkdownExport = async () => {
    try {
      const result = await exportToMarkdownAction(id);

      if (!result.success || !result.data) {
        throw new Error(result.error || "获取文档数据失败");
      }

      const fileName = result.data.name;
      const content = result.data.content;

      // 先转为HTML
      const htmlContent = editorJsToHtml(content);

      // HTML转Markdown
      const markdownContent = htmlToMarkdown(htmlContent, fileName);

      // 下载Markdown文件
      downloadFile(markdownContent, `${fileName}.md`, "text/markdown");

      toast.success("Markdown文件已导出");
    } catch (error) {
      console.error("Markdown导出失败:", error);
      toast.error("Markdown导出失败，请重试");
    }
  };

  // HTML导出处理
  const handleHtmlExport = async () => {
    try {
      const result = await exportToHtmlAction(id);

      if (!result.success || !result.data) {
        throw new Error(result.error || "获取文档数据失败");
      }

      const fileName = result.data.name;
      const content = result.data.content;

      // 生成HTML
      const html = createFullHtml(content, fileName);

      // 下载HTML文件
      downloadFile(html, `${fileName}.html`, "text/html");

      toast.success("HTML文件已导出");
    } catch (error) {
      console.error("HTML导出失败:", error);
      toast.error("HTML导出失败，请重试");
    }
  };

  const handleExport = async (format: string) => {
    if (!id || id === "new" || isExporting) return;

    setIsExporting(true);
    setCurrentFormat(format);

    toast.info(`开始导出为${format.toUpperCase()}...`);

    try {
      // 根据不同格式调用不同的处理函数
      switch (format) {
        case "pdf":
          await handlePdfExport();
          break;
        case "docx":
          await handleWordExport();
          break;
        case "md":
          await handleMarkdownExport();
          break;
        case "html":
          await handleHtmlExport();
          break;
        default:
          throw new Error("不支持的导出格式");
      }
    } catch (error) {
      console.error(`导出${format}失败:`, error);
      toast.error(`导出失败，请重试`);
    } finally {
      setIsExporting(false);
      setCurrentFormat("");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || id === "new"}
          className="flex items-center gap-1"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden md:inline">导出中...</span>
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              <span className="hidden md:inline">导出</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {isExporting && currentFormat === "pdf" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          导出为 PDF 文档
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("docx")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {isExporting && currentFormat === "docx" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          导出为 Word 文档
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("md")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {isExporting && currentFormat === "md" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          导出为 Markdown 文件
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("html")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {isExporting && currentFormat === "html" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          导出为 HTML 网页
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
