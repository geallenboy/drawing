"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { FolderPlus, Loader2 } from "lucide-react";
import { createFileAction } from "@/actions/file/file-action";
import { useUserStore } from "@/store/userStore";

const DialogPop = () => {
  const [val, setVal] = useState("");
  const [pop, setPop] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const openDialog = () => {
    setPop(true);
  };

  const clickBtn = async () => {
    console.log("文件名称:", val);

    if (val !== "") {
      setLoading(true);
      const { data, error, success } = await createFileAction({
        name: val,
        data: { blocks: [] },
        desc: "",
        fileUrl: "",
        userId: user?.id || "",
        metadata: undefined,
        tags: [],
        isFavorite: false,
        sharingLevel: "",
        collaborators: undefined,
        lastModifiedBy: null,
        revisionHistory: undefined,
        wordCount: 0,
        charCount: 0,
        isDeleted: false
      });
      console.log(data);
      if (success) {
        router.push(`/document/${data.file.id}`);
      } else {
        console.log(error);
        setLoading(false);
      }
      setPop(false);
    }
  };

  // Dialog 的 onOpenChange 处理弹框开关
  const onOpenChange = (isOpen: boolean) => {
    setPop(isOpen);
  };

  return (
    <Dialog open={pop} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 flex text-sm h-8 hover:bg-blue-700 bg-blue-600"
          onClick={openDialog}
        >
          <FolderPlus className="h-4 w-4" /> 创建文件
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>创建文件</DialogTitle>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              文件名称
            </Label>
            <Input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              id="name"
              placeholder="请输入文件名称"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={clickBtn} disabled={loading} type="submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "处理中..." : "添加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPop;
