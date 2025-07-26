"use client";

interface DrawingCacheData {
  elements: any[];
  files: Record<string, any>;
  appState?: any;
  metadata: {
    drawingId: string;
    userId: string;
    version: number;
    timestamp: number;
    lastSyncTime?: number;
    syncStatus: 'synced' | 'pending' | 'conflict';
    sessionId: string;
    deviceId: string;
  };
}

interface StorageQuota {
  used: number;
  available: number;
  total: number;
}

class EnhancedStorageManager {
  private static instance: EnhancedStorageManager;
  private readonly keyPrefix = 'drawing_cache_';
  private readonly metaPrefix = 'drawing_meta_';
  private readonly maxCacheSize = 50 * 1024 * 1024; // 50MB
  private readonly maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7天
  private sessionId: string;
  private deviceId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.deviceId = this.getOrCreateDeviceId();
    this.setupStorageQuotaMonitoring();
    this.cleanupExpiredData();
  }

  static getInstance(): EnhancedStorageManager {
    if (!EnhancedStorageManager.instance) {
      EnhancedStorageManager.instance = new EnhancedStorageManager();
    }
    return EnhancedStorageManager.instance;
  }

  /**
   * 保存绘图数据到本地缓存
   */
  async saveDrawingData(
    drawingId: string,
    userId: string,
    data: {
      elements: any[];
      files: Record<string, any>;
      appState?: any;
    },
    version: number = 1,
    lastSyncTime?: number
  ): Promise<boolean> {
    try {
      // 检查存储空间
      await this.ensureStorageSpace();

      const cacheData: DrawingCacheData = {
        ...data,
        metadata: {
          drawingId,
          userId,
          version,
          timestamp: Date.now(),
          lastSyncTime,
          syncStatus: lastSyncTime ? 'synced' : 'pending',
          sessionId: this.sessionId,
          deviceId: this.deviceId,
        }
      };

      const key = this.getDrawingKey(drawingId);
      const metaKey = this.getMetaKey(drawingId);

      // 保存数据和元数据
      localStorage.setItem(key, JSON.stringify(cacheData));
      localStorage.setItem(metaKey, JSON.stringify(cacheData.metadata));

      // 更新全局索引
      await this.updateDrawingIndex(drawingId, userId);

      console.log(`✅ 绘图数据已保存到本地缓存: ${drawingId}`);
      return true;
    } catch (error) {
      console.error('❌ 保存绘图数据失败:', error);
      return false;
    }
  }

  /**
   * 从本地缓存加载绘图数据
   */
  loadDrawingData(drawingId: string): DrawingCacheData | null {
    try {
      const key = this.getDrawingKey(drawingId);
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;

      const data: DrawingCacheData = JSON.parse(cached);
      
      // 检查数据是否过期
      if (this.isDataExpired(data.metadata.timestamp)) {
        this.clearDrawingData(drawingId);
        return null;
      }

      console.log(`🔄 从本地缓存加载绘图数据: ${drawingId}`);
      return data;
    } catch (error) {
      console.error('❌ 加载绘图数据失败:', error);
      return null;
    }
  }

  /**
   * 获取绘图元数据
   */
  getDrawingMetadata(drawingId: string): DrawingCacheData['metadata'] | null {
    try {
      const metaKey = this.getMetaKey(drawingId);
      const cached = localStorage.getItem(metaKey);
      
      if (!cached) return null;

      return JSON.parse(cached);
    } catch (error) {
      console.error('❌ 获取绘图元数据失败:', error);
      return null;
    }
  }

  /**
   * 更新同步状态
   */
  updateSyncStatus(
    drawingId: string, 
    status: 'synced' | 'pending' | 'conflict',
    lastSyncTime?: number
  ): boolean {
    try {
      const data = this.loadDrawingData(drawingId);
      if (!data) return false;

      data.metadata.syncStatus = status;
      if (lastSyncTime) {
        data.metadata.lastSyncTime = lastSyncTime;
      }

      const key = this.getDrawingKey(drawingId);
      const metaKey = this.getMetaKey(drawingId);
      
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(metaKey, JSON.stringify(data.metadata));

      return true;
    } catch (error) {
      console.error('❌ 更新同步状态失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的所有未同步绘图
   */
  getPendingDrawings(userId: string): DrawingCacheData[] {
    const pendingDrawings: DrawingCacheData[] = [];
    
    try {
      const index = this.getUserDrawingIndex(userId);
      
      for (const drawingId of index) {
        const data = this.loadDrawingData(drawingId);
        if (data && data.metadata.syncStatus === 'pending') {
          pendingDrawings.push(data);
        }
      }
    } catch (error) {
      console.error('❌ 获取未同步绘图失败:', error);
    }

    return pendingDrawings;
  }

  /**
   * 清除绘图数据
   */
  clearDrawingData(drawingId: string): boolean {
    try {
      const key = this.getDrawingKey(drawingId);
      const metaKey = this.getMetaKey(drawingId);
      
      localStorage.removeItem(key);
      localStorage.removeItem(metaKey);

      // 从索引中移除
      this.removeFromDrawingIndex(drawingId);

      console.log(`🗑️ 已清除绘图缓存: ${drawingId}`);
      return true;
    } catch (error) {
      console.error('❌ 清除绘图数据失败:', error);
      return false;
    }
  }

  /**
   * 获取存储配额信息
   */
  async getStorageQuota(): Promise<StorageQuota | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          total: estimate.quota || 0
        };
      }
    } catch (error) {
      console.warn('无法获取存储配额信息:', error);
    }
    return null;
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    totalDrawings: number;
    totalSize: number;
    pendingCount: number;
    oldestCache: number | null;
  } {
    let totalDrawings = 0;
    let totalSize = 0;
    let pendingCount = 0;
    let oldestCache: number | null = null;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.keyPrefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            totalSize += data.length;
            totalDrawings++;

            try {
              const parsed: DrawingCacheData = JSON.parse(data);
              if (parsed.metadata.syncStatus === 'pending') {
                pendingCount++;
              }
              
              if (!oldestCache || parsed.metadata.timestamp < oldestCache) {
                oldestCache = parsed.metadata.timestamp;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ 获取缓存统计失败:', error);
    }

    return {
      totalDrawings,
      totalSize,
      pendingCount,
      oldestCache
    };
  }

  // 私有方法

  private getDrawingKey(drawingId: string): string {
    return `${this.keyPrefix}${drawingId}`;
  }

  private getMetaKey(drawingId: string): string {
    return `${this.metaPrefix}${drawingId}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrCreateDeviceId(): string {
    const key = 'drawing_device_id';
    let deviceId = localStorage.getItem(key);
    
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(key, deviceId);
    }
    
    return deviceId;
  }

  private async updateDrawingIndex(drawingId: string, userId: string): Promise<void> {
    const indexKey = `drawing_index_${userId}`;
    const existing = localStorage.getItem(indexKey);
    const index = existing ? JSON.parse(existing) : [];
    
    if (!index.includes(drawingId)) {
      index.push(drawingId);
      localStorage.setItem(indexKey, JSON.stringify(index));
    }
  }

  private getUserDrawingIndex(userId: string): string[] {
    const indexKey = `drawing_index_${userId}`;
    const existing = localStorage.getItem(indexKey);
    return existing ? JSON.parse(existing) : [];
  }

  private removeFromDrawingIndex(drawingId: string): void {
    // 从所有用户索引中移除
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('drawing_index_')) {
        const index = JSON.parse(localStorage.getItem(key) || '[]');
        const newIndex = index.filter((id: string) => id !== drawingId);
        if (newIndex.length !== index.length) {
          localStorage.setItem(key, JSON.stringify(newIndex));
        }
      }
    }
  }

  private isDataExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.maxCacheAge;
  }

  private async ensureStorageSpace(): Promise<void> {
    const quota = await this.getStorageQuota();
    if (quota && quota.available < 10 * 1024 * 1024) { // 小于10MB
      await this.cleanupOldData();
    }
  }

  private async cleanupOldData(): Promise<void> {
    const stats = this.getCacheStats();
    if (stats.totalSize > this.maxCacheSize) {
      // 清理最旧的数据
      const allDrawings: Array<{id: string, timestamp: number}> = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.metaPrefix)) {
          const drawingId = key.replace(this.metaPrefix, '');
          const metadata = this.getDrawingMetadata(drawingId);
          if (metadata) {
            allDrawings.push({
              id: drawingId,
              timestamp: metadata.timestamp
            });
          }
        }
      }

      // 按时间排序，删除最旧的
      allDrawings.sort((a, b) => a.timestamp - b.timestamp);
      const toDelete = allDrawings.slice(0, Math.ceil(allDrawings.length * 0.3));
      
      for (const item of toDelete) {
        this.clearDrawingData(item.id);
      }

      console.log(`🧹 已清理 ${toDelete.length} 个旧缓存`);
    }
  }

  private cleanupExpiredData(): void {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.metaPrefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const metadata = JSON.parse(data);
              if (now - metadata.timestamp > this.maxCacheAge) {
                const drawingId = key.replace(this.metaPrefix, '');
                expiredKeys.push(drawingId);
              }
            } catch (e) {
              // 删除损坏的数据
              expiredKeys.push(key.replace(this.metaPrefix, ''));
            }
          }
        }
      }

      for (const drawingId of expiredKeys) {
        this.clearDrawingData(drawingId);
      }

      if (expiredKeys.length > 0) {
        console.log(`🧹 已清理 ${expiredKeys.length} 个过期缓存`);
      }
    } catch (error) {
      console.error('❌ 清理过期数据失败:', error);
    }
  }

  private setupStorageQuotaMonitoring(): void {
    // 定期检查存储配额
    setInterval(async () => {
      const quota = await this.getStorageQuota();
      if (quota && quota.available < 5 * 1024 * 1024) { // 小于5MB
        console.warn('⚠️ 存储空间不足，开始清理');
        await this.cleanupOldData();
      }
    }, 5 * 60 * 1000); // 每5分钟检查一次
  }
}

export default EnhancedStorageManager;