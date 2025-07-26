"use client";

import React, { useState } from "react";
import { 
  Save, 
  Cloud, 
  HardDrive, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi, 
  WifiOff,
  RotateCcw,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";

export interface SaveState {
  local: {
    hasChanges: boolean;
    lastSaved: Date | null;
    size: string;
  };
  remote: {
    synced: boolean;
    lastSynced: Date | null;
    status: 'idle' | 'syncing' | 'error' | 'success';
  };
  network: {
    online: boolean;
    latency?: number;
  };
}

interface AdvancedSavePanelProps {
  saveState: SaveState;
  onLocalSave: () => void;
  onRemoteSync: () => void;
  onRestore: () => void;
  disabled?: boolean;
  className?: string;
}

const AdvancedSavePanel: React.FC<AdvancedSavePanelProps> = ({
  saveState,
  onLocalSave,
  onRemoteSync,
  onRestore,
  disabled = false,
  className = ""
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    if (!saveState.network.online) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (saveState.remote.status === 'syncing') {
      return <Cloud className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
    
    if (saveState.local.hasChanges || !saveState.remote.synced) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getMainActionButton = () => {
    if (!saveState.network.online) {
      return (
        <Button 
          onClick={onLocalSave} 
          disabled={disabled || !saveState.local.hasChanges}
          size="sm"
          className="min-w-[120px]"
        >
          <HardDrive className="h-4 w-4 mr-2" />
          本地保存
        </Button>
      );
    }

    if (saveState.local.hasChanges || !saveState.remote.synced) {
      return (
        <Button 
          onClick={onRemoteSync} 
          disabled={disabled}
          size="sm"
          className="min-w-[120px]"
        >
          <Cloud className="h-4 w-4 mr-2" />
          {saveState.remote.status === 'syncing' ? '同步中...' : '同步云端'}
        </Button>
      );
    }

    return (
      <Button 
        variant="outline" 
        disabled={true}
        size="sm"
        className="min-w-[120px]"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        已同步
      </Button>
    );
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '从未';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* 主状态指示器 */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="flex flex-col text-xs">
            <span className="font-medium">
              {saveState.network.online ? 
                (saveState.remote.synced ? '已同步' : '待同步') : 
                '离线模式'
              }
            </span>
            {saveState.local.lastSaved && (
              <span className="text-gray-500">
                本地: {formatTime(saveState.local.lastSaved)}
              </span>
            )}
          </div>
        </div>

        {/* 主操作按钮 */}
        {getMainActionButton()}

        {/* 详细信息切换 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="p-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>查看详细状态</p>
          </TooltipContent>
        </Tooltip>

        {/* 恢复按钮 */}
        {saveState.local.hasChanges && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRestore}
                className="p-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>恢复到上次同步状态</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 详细状态面板 */}
        {showDetails && (
          <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
            <CardContent className="p-4 space-y-3">
              <div className="text-sm font-medium">存储状态详情</div>
              
              {/* 本地状态 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">本地缓存</span>
                </div>
                <div className="text-right text-xs">
                  <Badge variant={saveState.local.hasChanges ? "default" : "secondary"}>
                    {saveState.local.hasChanges ? '有更改' : '已保存'}
                  </Badge>
                  {saveState.local.size && (
                    <div className="text-gray-500 mt-1">{saveState.local.size}</div>
                  )}
                </div>
              </div>

              {/* 云端状态 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">云端同步</span>
                </div>
                <div className="text-right text-xs">
                  <Badge variant={saveState.remote.synced ? "secondary" : "outline"}>
                    {saveState.remote.synced ? '已同步' : '待同步'}
                  </Badge>
                  {saveState.remote.lastSynced && (
                    <div className="text-gray-500 mt-1">
                      {formatTime(saveState.remote.lastSynced)}
                    </div>
                  )}
                </div>
              </div>

              {/* 网络状态 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {saveState.network.online ? 
                    <Wifi className="h-4 w-4 text-green-500" /> : 
                    <WifiOff className="h-4 w-4 text-red-500" />
                  }
                  <span className="text-sm">网络连接</span>
                </div>
                <div className="text-right text-xs">
                  <Badge variant={saveState.network.online ? "secondary" : "destructive"}>
                    {saveState.network.online ? '在线' : '离线'}
                  </Badge>
                  {saveState.network.latency && (
                    <div className="text-gray-500 mt-1">
                      {saveState.network.latency}ms
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AdvancedSavePanel;