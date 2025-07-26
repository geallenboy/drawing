"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Cloud, 
  HardDrive, 
  Clock, 
  CheckCircle2,
  Info,
  ArrowLeft
} from "lucide-react";

export interface SmartDialogAction {
  key: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: React.ReactNode;
  description?: string;
}

interface SmartDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  icon?: React.ReactNode;
  actions: SmartDialogAction[];
  onAction: (actionKey: string) => void;
  showProgress?: boolean;
  progressText?: string;
  metadata?: Record<string, any>;
}

const SmartDialog: React.FC<SmartDialogProps> = ({
  open,
  onClose,
  title,
  description,
  type = 'info',
  icon,
  actions,
  onAction,
  showProgress = false,
  progressText,
  metadata
}) => {
  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getTypeColor()}`}>
              {getTypeIcon()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-sm text-gray-600">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* 元数据展示 */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="space-y-2 py-4">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{key}:</span>
                <Badge variant="outline">{String(value)}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* 进度指示器 */}
        {showProgress && (
          <div className="py-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-sm text-gray-600">
                {progressText || '处理中...'}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {actions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant || 'default'}
              onClick={() => onAction(action.key)}
              disabled={showProgress}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 预定义的对话框类型
export const createDataRecoveryDialog = (
  localChanges: number,
  lastSyncTime: Date | null,
  onAction: (actionKey: string) => void
) => ({
  title: "检测到未同步的本地更改",
  description: "在开始编辑之前，您需要选择如何处理这些更改。",
  type: 'warning' as const,
  icon: <Cloud className="h-5 w-5 text-blue-500" />,
  metadata: {
    "本地更改": `${localChanges} 个元素`,
    "上次同步": lastSyncTime ? 
      `${lastSyncTime.toLocaleDateString()} ${lastSyncTime.toLocaleTimeString()}` : 
      "从未同步"
  },
  actions: [
    {
      key: 'restore',
      label: '恢复本地更改',
      variant: 'default' as const,
      icon: <HardDrive className="h-4 w-4" />,
      description: '继续编辑本地保存的内容'
    },
    {
      key: 'discard',
      label: '使用云端数据',
      variant: 'outline' as const,
      icon: <Cloud className="h-4 w-4" />,
      description: '丢弃本地更改，使用服务器数据'
    }
  ],
  onAction
});

export const createSyncConfirmDialog = (
  hasLocalChanges: boolean,
  onAction: (actionKey: string) => void
) => ({
  title: "离开页面确认",
  description: hasLocalChanges ? 
    "您有未同步到服务器的更改，数据将保存在本地缓存中。" :
    "确定要离开当前页面吗？",
  type: hasLocalChanges ? 'warning' as const : 'info' as const,
  actions: hasLocalChanges ? [
    {
      key: 'sync',
      label: '同步后离开',
      variant: 'default' as const,
      icon: <Cloud className="h-4 w-4" />
    },
    {
      key: 'leave',
      label: '直接离开',
      variant: 'outline' as const,
      icon: <ArrowLeft className="h-4 w-4" />
    },
    {
      key: 'cancel',
      label: '继续编辑',
      variant: 'secondary' as const
    }
  ] : [
    {
      key: 'confirm',
      label: '确认离开',
      variant: 'default' as const,
      icon: <ArrowLeft className="h-4 w-4" />
    },
    {
      key: 'cancel',
      label: '取消',
      variant: 'outline' as const
    }
  ],
  onAction
});

export default SmartDialog;