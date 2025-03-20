import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DialogPop from "./dialog-pop";

type HeaderProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const Header = ({ searchQuery, setSearchQuery }: HeaderProps) => {
  return (
    <div className="flex justify-end w-full gap-2 items-center">
      <div className="flex gap-2 items-center  rounded-md p-1">
        <Input
          type="text"
          placeholder="搜索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="h-5 w-5" />
      </div>
      <DialogPop />
    </div>
  );
};

export default Header;
