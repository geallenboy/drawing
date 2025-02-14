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
import dayjs from "dayjs";
import { Archive, DeleteIcon, MoreHorizontal } from "lucide-react";
import { Database } from "@datatypes.types";
import { useRouter } from "next/navigation";
import { delDrawingAction, getAllDrawingAction } from "@/app/actions/drawing-action";

type rowFileProps = Database["public"]["Tables"]["drawing"]["Row"];
type FileListProps = {
  searchQuery: string;
};

const FileList = ({ searchQuery }: FileListProps) => {
  const router = useRouter();
  const [fileList, setFileList] = useState<rowFileProps[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4; // 每页显示 10 条数据
  useEffect(() => {
    getAllData();
  }, []);
  const getAllData = async () => {
    const { success, data, error } = await getAllDrawingAction();
    console.log(data);
    if (success) {
      setFileList(data);
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

  // 根据搜索条件过滤文件（不区分大小写）
  const filteredFileList = fileList.filter(
    (file) => file.name && file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // 分页逻辑
  const totalItems = filteredFileList.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredFileList.slice(startIndex, startIndex + pageSize);

  // 当搜索条件或数据总条数变化时重置当前页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, totalItems]);
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
          {currentData.map((drawing: rowFileProps, index: number) => (
            <TableRow key={index}>
              <TableCell>{drawing.name}</TableCell>
              <TableCell>{dayjs(drawing.created_at).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
              <TableCell>{dayjs(drawing.update_at).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
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
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          上一页
        </button>
        <span className="text-sm font-serif">
          第 {currentPage} 页 / 共 {totalPages} 页
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default FileList;
