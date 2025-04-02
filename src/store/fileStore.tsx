// file-list/store.ts
import { create } from "zustand";
import { AIDTFile } from "@/drizzle/schema";
import dayjs from "dayjs";
import {
  updateFileAction,
  getFilesAction,
  softDeleteFileAction,
  getFavoriteFilesAction
} from "@/actions/file/file-action"; // 导入所需的 Actions
import { toast } from "sonner"; // 导入提示组件

// 类型定义
export type ViewType = "list" | "grid";
export type SortField = "name" | "createdAt" | "updatedAt";
export type SortDirection = "asc" | "desc";

// 文件标签和类型应从文件的元数据中获取，而不是模拟
interface FileListState {
  // 核心数据
  fileList: AIDTFile[];
  filteredFileList: AIDTFile[];
  currentData: AIDTFile[];
  allTags: string[]; // 存储所有可用的标签
  allTypes: string[]; // 存储所有可用的类型

  // UI状态
  loading: boolean;
  searchQuery: string;
  viewType: ViewType;
  isDeleteDialogOpen: boolean;
  fileToDelete: string | null;
  isFavoriteLoading: Record<string, boolean>;
  isDeleteLoading: boolean;

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
  toggleFavorite: (id: string) => Promise<void>;
  getFavoriteFiles: () => Promise<void>;
  createNewFile: () => void;
  setNavigate: (navigate: (path: string) => void) => void;
  loadFiles: (options?: { refresh?: boolean }) => Promise<void>;
  deleteSelectedFile: () => Promise<void>;

  // 通过应用筛选和排序更新过滤列表
  updateFilteredList: () => void;
  // 通过分页更新当前数据
  updateCurrentData: () => void;
  // 通过收藏状态筛选文件
  loadFavoriteFiles: () => Promise<void>;
  extractTagsAndTypes: () => void;
}

export const useFileListStore = create<FileListState>((set, get) => ({
  // 初始状态
  fileList: [],
  filteredFileList: [],
  currentData: [],
  allTags: [],
  allTypes: [],
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
  isFavoriteLoading: {},
  isDeleteLoading: false,

  // 加载文件列表
  loadFiles: async ({ refresh = false } = {}) => {
    if (get().loading && !refresh) return; // 如果正在加载并且不是刷新操作，则跳过

    set({ loading: true });

    try {
      const response = await getFilesAction();

      if (response.success) {
        set({ fileList: response.data.files || [] });
        get().extractTagsAndTypes();
        get().updateFilteredList();
      } else {
        toast.error("加载文件失败");
      }
    } catch (error) {
      console.error("加载文件失败:", error);
      toast.error("加载文件列表时出现错误");
    } finally {
      set({ loading: false });
    }
  },

  // 提取所有标签和类型
  extractTagsAndTypes: () => {
    const { fileList } = get();

    // 从文件元数据中提取所有唯一的标签
    const tagsSet = new Set<string>();
    const typesSet = new Set<string>();

    fileList.forEach((file) => {
      // 处理文件标签
      if (Array.isArray(file.tags)) {
        file.tags.forEach((tag) => tag && tagsSet.add(tag));
      }

      // // 处理文件类型 (假设类型存储在 metadata.type 中)
      // if (file.metadata && file.metadata.type) {
      //   typesSet.add(file.metadata.type);
      // }
    });

    set({
      allTags: Array.from(tagsSet).sort(),
      allTypes: Array.from(typesSet).sort()
    });
  },

  // 设置状态的方法
  setFileList: (files) => {
    set({ fileList: files });
    get().extractTagsAndTypes();
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

    // // 类型过滤 - 使用真实文件类型数据
    // if (selectedTypes.length > 0) {
    //   filtered = filtered.filter((file) => {
    //     const fileType = file.metadata?.type;
    //     return fileType && selectedTypes.includes(fileType);
    //   });
    // }

    // 标签过滤 - 使用真实标签数据
    if (selectedTags.length > 0) {
      filtered = filtered.filter((file) => {
        // 检查文件是否有指定的标签
        return Array.isArray(file.tags) && selectedTags.some((tag) => file.tags.includes(tag));
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

  // 获取收藏文件列表 - 从后端获取
  getFavoriteFiles: async () => {
    try {
      const response = await getFavoriteFilesAction();

      if (response.success && response.data?.files) {
        return response.data.files;
      } else {
        toast.error("获取收藏文件失败");
        return [];
      }
    } catch (error) {
      console.error("获取收藏文件失败:", error);
      toast.error("获取收藏文件列表时出现错误");
      return [];
    }
  },

  // 加载收藏文件
  loadFavoriteFiles: async () => {
    set({ loading: true });

    try {
      const response = await getFavoriteFilesAction();

      if (response.success) {
        set({
          fileList: response.data.files || [],
          filteredFileList: response.data.files || [],
          currentPage: 1
        });
        get().updateCurrentData();
      } else {
        toast.error("加载收藏文件失败");
      }
    } catch (error) {
      console.error("加载收藏文件失败:", error);
      toast.error("加载收藏文件列表时出现错误");
    } finally {
      set({ loading: false });
    }
  },

  // 切换收藏状态并与后端同步
  toggleFavorite: async (id) => {
    const { fileList, isFavoriteLoading } = get();

    // 如果该文件的收藏操作正在进行中，则不执行任何操作
    if (isFavoriteLoading[id]) return;

    // 查找文件和当前收藏状态
    const fileIndex = fileList.findIndex((file) => file.id === id);
    if (fileIndex === -1) return;

    const newFavoriteStatus = !fileList[fileIndex].isFavorite;

    // 设置该文件的收藏操作为加载状态
    set({
      isFavoriteLoading: { ...isFavoriteLoading, [id]: true }
    });

    // 先更新UI状态，提供即时反馈
    const updatedFiles = fileList.map((file) =>
      file.id === id ? { ...file, isFavorite: newFavoriteStatus } : file
    );
    set({ fileList: updatedFiles });

    try {
      // 调用API更新数据库
      const response = await updateFileAction(id, { isFavorite: newFavoriteStatus });

      if (response.success) {
        toast.success(newFavoriteStatus ? "已添加到收藏" : "已从收藏中移除");
        // 更新过滤后的列表
        get().updateFilteredList();
      } else {
        // 如果API调用失败，回滚UI状态
        const revertedFiles = fileList.map((file) =>
          file.id === id ? { ...file, isFavorite: !newFavoriteStatus } : file
        );
        set({ fileList: revertedFiles });
        get().updateFilteredList();
        toast.error(response.error || "更新收藏状态失败");
      }
    } catch (error) {
      console.error("收藏操作失败:", error);
      // 恢复状态
      const revertedFiles = fileList.map((file) =>
        file.id === id ? { ...file, isFavorite: !newFavoriteStatus } : file
      );
      set({ fileList: revertedFiles });
      get().updateFilteredList();
      toast.error("收藏操作失败，请重试");
    } finally {
      // 无论成功或失败，都结束加载状态
      set({
        isFavoriteLoading: { ...get().isFavoriteLoading, [id]: false }
      });
    }
  },

  // 删除对话框
  confirmDeleteFile: (id) => set({ fileToDelete: id, isDeleteDialogOpen: true }),
  closeDeleteDialog: () => set({ isDeleteDialogOpen: false, fileToDelete: null }),

  // 执行删除操作
  deleteSelectedFile: async () => {
    const { fileToDelete } = get();
    if (!fileToDelete) return;

    set({ isDeleteLoading: true });

    try {
      const response = await softDeleteFileAction(fileToDelete);

      if (response.success) {
        // 从列表中移除已删除的文件
        const updatedFiles = get().fileList.filter((file) => file.id !== fileToDelete);
        set({ fileList: updatedFiles });
        get().updateFilteredList();
        toast.success("文件已移至回收站");
      } else {
        toast.error(response.error || "删除文件失败");
      }
    } catch (error) {
      console.error("删除文件失败:", error);
      toast.error("删除文件时出现错误");
    } finally {
      set({
        isDeleteLoading: false,
        isDeleteDialogOpen: false,
        fileToDelete: null
      });
    }
  },

  // 清除筛选条件
  clearFilters: () => {
    set({
      selectedTypes: [],
      selectedTags: [],
      dateRange: { from: "", to: "" },
      searchQuery: ""
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
