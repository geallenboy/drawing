// file-list/store.ts
import { create } from "zustand";
import { AIDTFile } from "@/drizzle/schema";
import dayjs from "dayjs";

// 类型定义
export type ViewType = "list" | "grid";
export type SortField = "name" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

// 模拟数据（应该移到常量文件中）
export const fileTypes = ["文档", "表格", "演示文稿", "图表", "数据集", "其他"];
export const fileTags = ["项目计划", "会议记录", "产品文档", "设计稿", "研发文档", "市场资料"];

interface FileListState {
  // 核心数据
  fileList: AIDTFile[];
  filteredFileList: AIDTFile[];
  currentData: AIDTFile[];

  // UI状态
  loading: boolean;
  searchQuery: string;
  viewType: ViewType;
  isDeleteDialogOpen: boolean;
  fileToDelete: string | null;

  // 排序
  sortField: SortField;
  sortDirection: SortDirection;

  // 筛选
  showFilterPanel: boolean;
  selectedTypes: string[];
  selectedTags: string[];
  dateRange: { from: string; to: string };

  // 选择
  selectedFiles: string[];

  // 分页
  currentPage: number;
  totalPages: number;
  pageSize: number;

  // 导航函数
  navigate: ((path: string) => void) | null;

  // Actions
  setFileList: (files: AIDTFile[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setViewType: (type: ViewType) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  setShowFilterPanel: (show: boolean) => void;
  setSelectedTypes: (types: string[]) => void;
  setSelectedTags: (tags: string[]) => void;
  setDateRange: (range: { from: string; to: string }) => void;
  setSelectedFiles: (files: string[]) => void;
  toggleSelectFile: (id: string) => void;
  selectAllFiles: () => void;
  setCurrentPage: (page: number) => void;
  confirmDeleteFile: (id: string) => void;
  closeDeleteDialog: () => void;
  clearFilters: () => void;
  toggleFavorite: (id: string) => void;
  createNewFile: () => void;
  setNavigate: (navigate: (path: string) => void) => void;

  // 通过应用筛选和排序更新过滤列表
  updateFilteredList: () => void;
  // 通过分页更新当前数据
  updateCurrentData: () => void;
}

export const useFileListStore = create<FileListState>((set, get) => ({
  // 初始状态
  fileList: [],
  filteredFileList: [],
  currentData: [],
  loading: true,
  searchQuery: "",
  viewType: "list",
  sortField: "updatedAt",
  sortDirection: "desc",
  showFilterPanel: false,
  selectedTypes: [],
  selectedTags: [],
  dateRange: { from: "", to: "" },
  selectedFiles: [],
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  isDeleteDialogOpen: false,
  fileToDelete: null,
  navigate: null,

  // 设置状态的方法
  setFileList: (files) => {
    set({ fileList: files });
    get().updateFilteredList();
  },
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().updateFilteredList();
  },
  setViewType: (type) => set({ viewType: type }),
  setSortField: (field) => {
    set({ sortField: field });
    get().updateFilteredList();
  },
  setSortDirection: (direction) => {
    set({ sortDirection: direction });
    get().updateFilteredList();
  },
  setShowFilterPanel: (show) => set({ showFilterPanel: show }),
  setSelectedTypes: (types) => {
    set({ selectedTypes: types });
    get().updateFilteredList();
  },
  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
    get().updateFilteredList();
  },
  setDateRange: (range) => {
    set({ dateRange: range });
    get().updateFilteredList();
  },
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().updateCurrentData();
  },

  // 更复杂的状态更新
  updateFilteredList: () => {
    const {
      fileList,
      searchQuery,
      sortField,
      sortDirection,
      selectedTypes,
      selectedTags,
      dateRange
    } = get();

    let filtered = [...fileList];

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(
        (file) => file.name && file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 类型过滤（模拟）
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((file) => {
        // 这里模拟类型匹配，实际应该根据文件的类型字段进行过滤
        const fileTypeIndex = file.id.charCodeAt(0) % fileTypes.length;
        return selectedTypes.includes(fileTypes[fileTypeIndex]);
      });
    }

    // 标签过滤（模拟）
    if (selectedTags.length > 0) {
      filtered = filtered.filter((file) => {
        // 这里模拟标签匹配，实际应该根据文件的标签字段进行过滤
        const fileTagIndex = file.id.charCodeAt(1) % fileTags.length;
        return selectedTags.includes(fileTags[fileTagIndex]);
      });
    }

    // 日期范围过滤
    if (dateRange.from) {
      filtered = filtered.filter(
        (file) =>
          dayjs(file.createdAt).isAfter(dateRange.from) ||
          dayjs(file.createdAt).isSame(dateRange.from)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(
        (file) =>
          dayjs(file.createdAt).isBefore(dateRange.to) || dayjs(file.createdAt).isSame(dateRange.to)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    // 更新过滤后的文件列表
    set({
      filteredFileList: filtered,
      currentPage: 1
    });

    // 更新总页数
    get().updateCurrentData();
  },

  updateCurrentData: () => {
    const { filteredFileList, currentPage, pageSize } = get();

    // 计算总页数
    const total = Math.ceil(filteredFileList.length / pageSize);

    // 计算当前页的数据
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredFileList.slice(startIndex, startIndex + pageSize);

    set({
      currentData: paginatedData,
      totalPages: total || 1 // 确保至少有1页
    });
  },

  // 文件操作
  toggleSelectFile: (id) => {
    const { selectedFiles } = get();
    if (selectedFiles.includes(id)) {
      set({ selectedFiles: selectedFiles.filter((fileId) => fileId !== id) });
    } else {
      set({ selectedFiles: [...selectedFiles, id] });
    }
  },

  selectAllFiles: () => {
    const { currentData, selectedFiles } = get();
    if (selectedFiles.length === currentData.length) {
      set({ selectedFiles: [] });
    } else {
      set({ selectedFiles: currentData.map((file) => file.id) });
    }
  },

  toggleFavorite: (id) => {
    const { fileList } = get();
    const updatedFiles = fileList.map((file) =>
      file.id === id ? { ...file, isFavorite: !file.isFavorite } : file
    );
    set({ fileList: updatedFiles });
    get().updateFilteredList();
  },

  // 删除对话框
  confirmDeleteFile: (id) => set({ fileToDelete: id, isDeleteDialogOpen: true }),
  closeDeleteDialog: () => set({ isDeleteDialogOpen: false, fileToDelete: null }),

  // 清除筛选条件
  clearFilters: () => {
    set({
      selectedTypes: [],
      selectedTags: [],
      dateRange: { from: "", to: "" }
    });
    get().updateFilteredList();
  },

  // 设置导航函数
  setNavigate: (navigate) => set({ navigate }),

  // 创建新文件
  createNewFile: () => {
    const { navigate } = get();
    if (navigate) {
      navigate("/document/new");
    } else if (typeof window !== "undefined") {
      // 降级: 如果没有设置导航函数，使用window.location
      window.location.href = "/document/new";
    }
  }
}));
