"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Archive, DeleteIcon, MoreHorizontal } from "lucide-react";
import { delFileAction, getAllFileAction } from "@/app/actions/file-actions";
import { Database } from "@datatypes.types";
import { useRouter } from "next/navigation";

type rowFileProps = Database["public"]["Tables"]["file"]["Row"];

const FileList = () => {
  const router = useRouter();
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    getAllData();
  }, []);
  const getAllData = async () => {
    const { success, data, error } = await getAllFileAction();
    console.log(data);
    if (success) {
      setFileList(data);
    }
  };
  const updateFile = (id: number) => {
    router.push(`/document/${id}`);
  };

  const delFile = async (id: number) => {
    const { success } = await delFileAction(id);
    console.log(success);
    if (success) {
      getAllData();
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>文件名称</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>编辑时间</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileList.map((file: rowFileProps, index: number) => (
            <TableRow key={index}>
              <TableCell>{file.name}</TableCell>
              <TableCell>{file.created_at}</TableCell>
              <TableCell>{file.update_at}</TableCell>
              <TableCell>{file.id}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex gap-3">
                    <MoreHorizontal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="gap-3"
                      onClick={() => {
                        updateFile(file.id);
                      }}
                    >
                      <Archive className="h-4 w-4" /> 编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-3"
                      onClick={() => {
                        delFile(file.id);
                      }}
                    >
                      <DeleteIcon className="h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FileList;
