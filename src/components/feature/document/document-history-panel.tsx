import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileHistoryAction, restoreFileVersionAction } from "@/actions/file/file-history-action";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface DocumentHistoryPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  fileData: any;
  onRestoreVersion?: (version: any) => void;
}

export function DocumentHistoryPanel({
  isOpen,
  setIsOpen,
  fileData,
  onRestoreVersion
}: DocumentHistoryPanelProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  // 每次打开面板时加载历史记录
  useEffect(() => {
    if (isOpen && fileData?.id) {
      loadHistory();
    }
  }, [isOpen, fileData?.id]);

  const loadHistory = async () => {
    if (!fileData?.id) return;

    setLoading(true);
    try {
      console.log("正在加载历史记录...", fileData.id);
      const { data, success } = await getFileHistoryAction(fileData.id);

      if (success && data?.history) {
        console.log("成功获取历史记录:", data.history);
        setHistory(data.history);
      } else {
        console.error("加载历史记录失败，服务器返回:", data);
        toast.error("加载历史记录失败");
        setHistory([]);
      }
    } catch (error) {
      console.error("获取历史记录失败:", error);
      toast.error("加载历史记录失败");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!fileData?.id) return;

    setLoading(true);
    try {
      const { data, success } = await restoreFileVersionAction(fileData.id, versionId);
      if (success && data) {
        toast.success(`已恢复到版本 ${data.version}`);
        if (onRestoreVersion) {
          onRestoreVersion(data.versionData);
        }
        setIsOpen(false);
      } else {
        toast.error("恢复版本失败");
      }
    } catch (error) {
      console.error("恢复版本失败:", error);
      toast.error("恢复版本失败");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN
      });
    } catch {
      return "未知时间";
    }
  };

  // 如果没有历史记录，显示相应提示
  const renderHistoryContent = () => {
    if (loading) {
      return Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex flex-col space-y-2 mb-4">
            <Skeleton className="h-[24px] w-[200px]" />
            <Skeleton className="h-[20px] w-[150px]" />
            <Skeleton className="h-[40px] w-full" />
          </div>
        ));
    }

    if (history.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">没有找到历史记录</p>
          <p className="text-sm text-muted-foreground">当您保存文档时，系统会自动创建历史记录</p>
        </div>
      );
    }

    return history.map((item) => (
      <div
        key={item.id}
        className={`p-4 border rounded-lg cursor-pointer transition-colors mb-4 ${
          selectedVersion === item.id ? "bg-muted border-primary" : ""
        }`}
        onClick={() => setSelectedVersion(item.id)}
      >
        <div className="flex items-center justify-between">
          <div className="font-medium">
            版本 {item.version}
            {item.isAutosave ? " (自动保存)" : " (手动保存)"}
          </div>
          <div className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</div>
        </div>

        {item.changeDescription && <div className="text-sm mt-1">{item.changeDescription}</div>}

        <div className="mt-2 text-xs text-muted-foreground">
          {item.wordCount} 字 · {item.charCount} 字符
        </div>

        {selectedVersion === item.id && (
          <div className="mt-4 flex space-x-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVersion(null);
              }}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreVersion(item.id);
              }}
            >
              恢复此版本
            </Button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>文档历史记录</SheetTitle>
        </SheetHeader>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground mb-4">
            历史记录显示文档的所有保存版本，您可以查看和恢复任何版本
          </p>

          <Button variant="outline" size="sm" className="mb-6" onClick={loadHistory}>
            刷新历史记录
          </Button>
        </div>

        {renderHistoryContent()}
      </SheetContent>
    </Sheet>
  );
}
