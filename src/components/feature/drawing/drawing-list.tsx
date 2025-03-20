"use client";
import React, { useEffect, useState, useCallback } from "react";
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
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";
import { Archive, DeleteIcon, MoreHorizontal, PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AIDTDrawing } from "@/drizzle/schema";
import { deleteDrawingAction, listDrawingsAction } from "@/actions/drawing/drawing-action";

type DrawingListProps = {
  searchQuery: string;
};

const DrawingList = ({ searchQuery }: DrawingListProps) => {
  const router = useRouter();
  const [drawingList, setDrawingList] = useState<AIDTDrawing[]>([]);
  const [filteredDrawings, setFilteredDrawings] = useState<AIDTDrawing[]>([]);
  const [currentData, setCurrentData] = useState<AIDTDrawing[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10; // 每页显示 10 条数据

  // 获取所有绘图数据
  const getAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listDrawingsAction();

      if (response.success && Array.isArray(response.data?.drawings)) {
        setDrawingList(response.data.drawings);
      } else {
        // 确保即使 API 返回错误格式的数据，我们也设置一个空数组
        setDrawingList([]);
        setError(response.error || "无法获取绘图列表");
        toast.error("获取绘图列表失败");
      }
    } catch (err) {
      console.error("获取绘图列表时发生错误:", err);
      setDrawingList([]);
      setError("获取绘图列表失败");
      toast.error("获取绘图列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载获取数据
  useEffect(() => {
    getAllData();
  }, [getAllData]);

  // 当原始数据或搜索条件变化时，更新过滤后的列表
  useEffect(() => {
    if (!Array.isArray(drawingList)) {
      setFilteredDrawings([]);
      return;
    }

    const filtered = drawingList.filter(
      (drawing) => drawing.name && drawing.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredDrawings(filtered);
    // 重置到第一页
    setCurrentPage(1);
  }, [drawingList, searchQuery]);

  // 当过滤后的列表或当前页变化时，更新当前页显示的数据
  useEffect(() => {
    const total = Math.ceil(filteredDrawings.length / pageSize);
    setTotalPages(total || 1); // 确保至少有1页

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredDrawings.slice(startIndex, startIndex + pageSize);
    setCurrentData(paginatedData);
  }, [filteredDrawings, currentPage, pageSize]);

  // 编辑绘图
  const editDrawing = (id: string) => {
    router.push(`/drawing/${id}`);
  };

  // 删除绘图
  const deleteDrawing = async (id: string) => {
    try {
      const confirmed = window.confirm("确定要删除这个绘图吗？此操作不可撤销。");

      if (!confirmed) return;

      const { success } = await deleteDrawingAction(id);

      if (success) {
        toast.success("绘图已成功删除");
        getAllData(); // 重新加载列表
      } else {
        toast.error("删除绘图失败");
      }
    } catch (err) {
      console.error("删除绘图时发生错误:", err);
      toast.error("删除绘图失败");
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">加载失败</div>
        <div className="text-sm text-gray-600">{error}</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => getAllData()}
        >
          重试
        </button>
      </div>
    );
  }

  // 渲染空状态
  if (filteredDrawings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PencilIcon className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">暂无绘图</h3>
        <p className="text-sm text-gray-500 mb-4">
          {searchQuery ? `没有找到与 "${searchQuery}" 相关的绘图` : "您还没有创建任何绘图"}
        </p>
      </div>
    );
  }

  // 渲染数据表格
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>绘图名称</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>编辑时间</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((drawing: AIDTDrawing) => (
            <TableRow key={drawing.id}>
              <TableCell>{drawing.name}</TableCell>
              <TableCell>{dayjs(drawing.createdAt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
              <TableCell>{dayjs(drawing.updatedAt).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
              <TableCell>{drawing.userId}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex gap-3">
                    <MoreHorizontal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem className="gap-3" onClick={() => editDrawing(drawing.id)}>
                      <Archive className="h-4 w-4" /> 编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-3 text-red-600 hover:text-red-700 focus:text-red-700"
                      onClick={() => deleteDrawing(drawing.id)}
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

      {/* 只有在有多页数据时才显示分页 */}
      {totalPages > 1 && (
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
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default DrawingList;
