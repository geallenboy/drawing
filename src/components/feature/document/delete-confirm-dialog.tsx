// file-list/delete-confirm-dialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteFileAction } from "@/actions/file/file-action";

interface DeleteConfirmDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  fileId: string | null;
  onDelete: () => void;
}

const DeleteConfirmDialog = ({ open, setOpen, fileId, onDelete }: DeleteConfirmDialogProps) => {
  const deleteFile = async () => {
    if (!fileId) return;

    try {
      const { success } = await deleteFileAction(fileId);
      if (success) {
        toast.success("文件已删除");
        onDelete();
      } else {
        toast.error("删除文件失败");
      }
    } catch (error) {
      console.error("删除文件失败:", error);
      toast.error("删除文件失败");
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            您确定要删除此文件吗？此操作无法撤销，文件将被永久删除。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={deleteFile}>
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
