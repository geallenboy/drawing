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
import { createDrawingAction } from "@/actions/drawing/drawing-action";
import { useUserStore } from "@/store/userStore";

const DialogPop = () => {
  const [val, setVal] = useState("");
  const [pop, setPop] = useState(false);
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const openDialog = () => {
    setPop(true);
  };

  const clickBtn = async () => {
    console.log("名称:", val);
    if (val !== "") {
      setLoading(true);
      const { data, error, success } = await createDrawingAction({
        name: val,
        data: [],
        desc: "",
        fileUrl: "",
        userId: user?.id || ""
      });
      console.log(data);
      if (success) {
        router.push(`/drawing/${data.drawing.id}`);
      } else {
        console.log(error);
        setLoading(false);
      }
      setPop(false);
    }
  };

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
          <FolderPlus className="h-4 w-4" /> 创建绘图
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>创建绘图</DialogTitle>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              绘图名称
            </Label>
            <Input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              id="name"
              placeholder="请输入绘图名称"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={clickBtn} disabled={loading} type="submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "处理中..." : "创建绘图"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPop;
