"use client";
import React from "react";
import { Check, Clock, AlertCircle, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline' | 'loading';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaveTime?: Date | null;
  errorMessage?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaveTime,
  errorMessage
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-3 w-3 animate-pulse" />,
          text: 'Loading...',
          variant: 'secondary' as const,
          className: 'text-blue-600 border-blue-200'
        };
      case 'saving':
        return {
          icon: <Clock className="h-3 w-3 animate-pulse" />,
          text: '保存中...',
          variant: 'secondary' as const,
          className: 'text-blue-600 border-blue-200'
        };
      case 'saved':
        return {
          icon: <Check className="h-3 w-3" />,
          text: '已保存',
          variant: 'secondary' as const,
          className: 'text-green-600 border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: '保存失败',
          variant: 'destructive' as const,
          className: 'text-red-600 border-red-200'
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: '离线模式',
          variant: 'secondary' as const,
          className: 'text-orange-600 border-orange-200'
        };
      default:
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: '在线',
          variant: 'outline' as const,
          className: 'text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2 text-sm">
      <Badge 
        variant={config.variant}
        className={`flex items-center gap-1 ${config.className}`}
      >
        {config.icon}
        {config.text}
      </Badge>
      
      {lastSaveTime && status === 'saved' && (
        <span className="text-xs text-gray-500">
          {lastSaveTime.toLocaleTimeString()}
        </span>
      )}
      
      {status === 'error' && errorMessage && (
        <span className="text-xs text-red-500" title={errorMessage}>
          {errorMessage.length > 30 ? `${errorMessage.substring(0, 30)}...` : errorMessage}
        </span>
      )}
    </div>
  );
};

export default SaveStatusIndicator;
