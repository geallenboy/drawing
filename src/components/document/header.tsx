"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { FolderPlus, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { addFileAction } from "@/app/actions/file-actions";

const Header = () => {
  const router = useRouter();
  const saveFile = async () => {
    const { data, error, success } = await addFileAction({
      name: "file name",
      file_data: { blocks: [] }
    });

    if (success) {
      router.push(`/document/${data[0].id}`);
    } else {
      console.log(error);
    }
  };
  return (
    <div className="flex justify-end w-full gap-2 items-center">
      <div className="flex gap-2 items-center  rounded-md p-1">
        <Input type="text" placeholder="搜索" />
        <Search className="h-4 w-4 " />
      </div>
      <Button className="gap-2 flex text-sm h-8 hover:bg-blue-700 bg-blue-600" onClick={saveFile}>
        <FolderPlus className="h-4 w-4" /> 新增
      </Button>
    </div>
  );
};

export default Header;
