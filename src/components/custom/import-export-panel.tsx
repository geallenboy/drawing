"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Download, 
  FileImage, 
  FileText, 
  File,
  Settings,
  Copy,
  Share2,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ImportExportPanelProps {
  onImport: (file: File, options?: ImportOptions) => void;
  onExport: (format: ExportFormat, options?: ExportOptions) => void;
  onShare: () => void;
  onCopyLink: () => void;
  drawingData?: {
    elementCount: number;
    fileCount: number;
    hasImages: boolean;
  };
  disabled?: boolean;
}

export interface ImportOptions {
  mergeMode: 'replace' | 'append' | 'layer';
  preserveLayers: boolean;
}

export interface ExportOptions {
  quality: 'low' | 'medium' | 'high';
  includeBackground: boolean;
  scale: number;
  format: 'png' | 'excalidraw';
}

export type ExportFormat = 'png' | 'excalidraw';

const ImportExportPanel: React.FC<ImportExportPanelProps> = ({
  onImport,
  onExport,
  onShare,
  onCopyLink,
  drawingData,
  disabled = false
}) => {
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    mergeMode: 'replace',
    preserveLayers: true
  });

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    quality: 'high',
    includeBackground: true,
    scale: 1,
    format: 'png'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = (mergeMode: ImportOptions['mergeMode'] = 'replace') => {
    setImportOptions(prev => ({ ...prev, mergeMode }));
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = [
        'application/json',
        'image/png',
        'image/jpeg',
        'image/svg+xml',
        'application/pdf'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.excalidraw')) {
        toast.error("不支持的文件格式");
        return;
      }

      onImport(file, importOptions);
    }
    
    // 重置input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleExport = (format: ExportFormat) => {
    const options = { ...exportOptions, format };
    onExport(format, options);
  };

  const handleCopyLink = async () => {
    try {
      await onCopyLink();
      toast.success("链接已复制到剪贴板");
    } catch (error) {
      toast.error("复制链接失败");
    }
  };

  const getExportIcon = (format: ExportFormat) => {
    switch (format) {
      case 'png':
        return <FileImage className="h-4 w-4" />;
      case 'excalidraw':
        return <File className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case 'png':
        return '高质量图片，支持透明背景';
      case 'excalidraw':
        return 'Excalidraw原生格式';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 导入按钮 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>导入选项</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleImportClick('replace')}>
            <FileText className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">替换当前内容</div>
              <div className="text-xs text-gray-500">清空画布并导入新内容</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleImportClick('append')}>
            <Layers className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">追加到当前内容</div>
              <div className="text-xs text-gray-500">在现有内容基础上添加</div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleImportClick('layer')}>
            <Copy className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">作为新图层导入</div>
              <div className="text-xs text-gray-500">创建独立图层</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 导出按钮 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled || !drawingData?.elementCount}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            导出格式
            {drawingData && (
              <Badge variant="secondary" className="text-xs">
                {drawingData.elementCount} 元素
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {(['png', 'excalidraw'] as ExportFormat[]).map((format) => (
            <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
              {getExportIcon(format)}
              <div className="flex-1 ml-2">
                <div className="font-medium">{format.toUpperCase()}</div>
                <div className="text-xs text-gray-500">
                  {getFormatDescription(format)}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>


      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".excalidraw,.json,image/*,.pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImportExportPanel;