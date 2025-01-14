import React from "react";
import { Input } from "@/components/ui/input";
import { Search, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <div className="flex justify-end w-full gap-2 items-center">
      <div className="flex gap-2 items-center  rounded-md p-1">
        <Input type="text" placeholder="搜索" />
        <Search className="h-4 w-4 " />
      </div>
      <Button className="gap-2 flex text-sm h-8 hover:bg-blue-700 bg-blue-600">
        <FolderPlus className="h-4 w-4" /> 新增
      </Button>
    </div>
  );
};

export default Header;
