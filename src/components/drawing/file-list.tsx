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
import { Database } from "@datatypes.types";
import { useRouter } from "next/navigation";
import { delDrawingAction, getAllDrawingAction } from "@/app/actions/drawing-action";

type rowFileProps = Database["public"]["Tables"]["drawing"]["Row"];

const FileList = () => {
  const router = useRouter();
  const [drawingList, setDrawingList] = useState([]);
  useEffect(() => {
    getAllData();
  }, []);
  const getAllData = async () => {
    const { success, data, error } = await getAllDrawingAction();
    console.log(data);
    if (success) {
      setDrawingList(data);
    }
  };
  const updateFile = (id: number) => {
    router.push(`/drawing/${id}`);
  };

  const delFile = async (id: number) => {
    const { success } = await delDrawingAction(id);
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
          {drawingList.map((drawing: rowFileProps, index: number) => (
            <TableRow key={index}>
              <TableCell>{drawing.name}</TableCell>
              <TableCell>{drawing.created_at}</TableCell>
              <TableCell>{drawing.update_at}</TableCell>
              <TableCell>{drawing.id}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex gap-3">
                    <MoreHorizontal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="gap-3"
                      onClick={() => {
                        updateFile(drawing.id);
                      }}
                    >
                      <Archive className="h-4 w-4" /> 编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-3"
                      onClick={() => {
                        delFile(drawing.id);
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
