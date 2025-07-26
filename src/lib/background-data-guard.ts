"use client";

import EnhancedStorageManager from './enhanced-storage-manager';
import { updateDrawingAction } from '@/actions/drawing/drawing-action';

interface BackgroundSyncOptions {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  quietMode: boolean;
}

class BackgroundDataGuard {
  private static instance: BackgroundDataGuard;
  private storageManager: EnhancedStorageManager;
  private syncQueue: Map<string, number> = new Map(); // drawingId -> retry count
  private isProcessing = false;
  private options: BackgroundSyncOptions = {
    maxRetries: 3,
    retryDelay: 5000, // 5秒
    batchSize: 5,
    quietMode: true
  };

  private visibilityChangeHandler?: () => void;
  private beforeUnloadHandler?: (e: BeforeUnloadEvent) => void;

  constructor() {
    this.storageManager = EnhancedStorageManager.getInstance();
    this.setupEventListeners();
  }

  static getInstance(): BackgroundDataGuard {
    if (!BackgroundDataGuard.instance) {
      BackgroundDataGuard.instance = new BackgroundDataGuard();
    }
    return BackgroundDataGuard.instance;
  }

  /**
   * 启动后台保护
   */
  startGuard(userId: string): void {
    console.log('🛡️ 启动后台数据保护');
    
    // 立即检查未同步数据
    this.processBackgroundSync(userId);
    
    // 设置定期同步
    setInterval(() => {
      if (!this.isProcessing) {
        this.processBackgroundSync(userId);
      }
    }, 30000); // 每30秒检查一次
  }

  /**
   * 停止后台保护
   */
  stopGuard(): void {
    console.log('🛡️ 停止后台数据保护');
    this.cleanup();
  }

  /**
   * 添加到同步队列
   */
  addToSyncQueue(drawingId: string): void {
    if (!this.syncQueue.has(drawingId)) {
      this.syncQueue.set(drawingId, 0);
      console.log(`📋 添加到同步队列: ${drawingId}`);
    }
  }

  /**
   * 从同步队列移除
   */
  removeFromSyncQueue(drawingId: string): void {
    if (this.syncQueue.has(drawingId)) {
      this.syncQueue.delete(drawingId);
      console.log(`✅ 从同步队列移除: ${drawingId}`);
    }
  }

  /**
   * 强制同步指定绘图
   */
  async forceSyncDrawing(drawingId: string): Promise<boolean> {
    const data = this.storageManager.loadDrawingData(drawingId);
    if (!data) {
      console.warn(`⚠️ 未找到绘图数据: ${drawingId}`);
      return false;
    }

    try {
      console.log(`🔄 强制同步绘图: ${drawingId}`);
      
      const { success, error } = await updateDrawingAction(drawingId, {
        name: data.metadata.drawingId,
        data: data.elements,
        files: data.files,
        appState: data.appState,
      });

      if (success) {
        this.storageManager.updateSyncStatus(drawingId, 'synced', Date.now());
        this.removeFromSyncQueue(drawingId);
        console.log(`✅ 强制同步成功: ${drawingId}`);
        return true;
      } else {
        console.error(`❌ 强制同步失败: ${drawingId}`, error);
        return false;
      }
    } catch (error) {
      console.error(`❌ 强制同步异常: ${drawingId}`, error);
      return false;
    }
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): {
    pending: number;
    processing: boolean;
    queueSize: number;
  } {
    return {
      pending: this.storageManager.getCacheStats().pendingCount,
      processing: this.isProcessing,
      queueSize: this.syncQueue.size
    };
  }

  // 私有方法

  private setupEventListeners(): void {
    // 页面可见性变化时同步
    this.visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，检查是否需要同步
        const userId = this.getCurrentUserId();
        if (userId) {
          setTimeout(() => this.processBackgroundSync(userId), 1000);
        }
      }
    };

    // 页面卸载前确保本地保存
    this.beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      const stats = this.storageManager.getCacheStats();
      if (stats.pendingCount > 0) {
        // 有未同步数据，静默保护
        console.log('🛡️ 页面卸载前保护未同步数据');
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private cleanup(): void {
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  private async processBackgroundSync(userId: string): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    
    try {
      const pendingDrawings = this.storageManager.getPendingDrawings(userId);
      
      if (pendingDrawings.length === 0) {
        return;
      }

      console.log(`🔄 开始后台同步 ${pendingDrawings.length} 个绘图`);

      // 分批处理
      const batches = this.createBatches(pendingDrawings, this.options.batchSize);
      
      for (const batch of batches) {
        await this.processBatch(batch);
        
        // 批次间延迟
        if (batches.length > 1) {
          await this.delay(1000);
        }
      }

    } catch (error) {
      console.error('❌ 后台同步处理失败:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBatch(drawings: any[]): Promise<void> {
    const promises = drawings.map(data => this.syncSingleDrawing(data));
    await Promise.allSettled(promises);
  }

  private async syncSingleDrawing(data: any): Promise<void> {
    const drawingId = data.metadata.drawingId;
    const retryCount = this.syncQueue.get(drawingId) || 0;

    if (retryCount >= this.options.maxRetries) {
      console.warn(`⚠️ 绘图同步达到最大重试次数: ${drawingId}`);
      this.syncQueue.delete(drawingId);
      return;
    }

    try {
      const { success, error } = await updateDrawingAction(drawingId, {
        name: data.metadata.drawingId,
        data: data.elements,
        files: data.files,
        appState: data.appState,
      });

      if (success) {
        this.storageManager.updateSyncStatus(drawingId, 'synced', Date.now());
        this.syncQueue.delete(drawingId);
        
        if (!this.options.quietMode) {
          console.log(`✅ 后台同步成功: ${drawingId}`);
        }
      } else {
        throw new Error(error || '同步失败');
      }
    } catch (error) {
      console.warn(`⚠️ 绘图同步失败: ${drawingId}`, error);
      
      // 增加重试计数
      this.syncQueue.set(drawingId, retryCount + 1);
      
      // 延迟重试
      setTimeout(() => {
        if (this.syncQueue.has(drawingId)) {
          this.addToSyncQueue(drawingId);
        }
      }, this.options.retryDelay * (retryCount + 1));
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCurrentUserId(): string | null {
    // 这里需要从认证系统获取当前用户ID
    // 暂时返回null，实际使用时需要集成认证系统
    return null;
  }
}

// 导出单例实例
export default BackgroundDataGuard;