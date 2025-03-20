"use client";
import React from "react";
import { Button } from "../../ui/button";
import { FolderPlus } from "lucide-react";
import { addFileAction } from "@/app/actions/file-actions";
import { useRouter } from "next/navigation";

const AddBtn = ({ id }: { id: string }) => {
  const router = useRouter();
  const saveFile = async () => {
    const data = addFileAction({ user_id: id });
    console.log(data);
    router.push("/document/1");
  };

  return (
    <Button className="gap-2 flex text-sm h-8 hover:bg-blue-700 bg-blue-600" onClick={saveFile}>
      <FolderPlus className="h-4 w-4" /> 新增
    </Button>
  );
};

export default AddBtn;
