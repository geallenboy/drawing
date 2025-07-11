import { Client } from 'minio';

// 解析MinIO端点配置
const parseMinioEndpoint = () => {
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  
  // 如果endpoint包含协议，需要解析
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    try {
      const url = new URL(endpoint);
      return {
        endPoint: url.hostname,
        port: url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80),
        useSSL: url.protocol === 'https:'
      };
    } catch (error) {
      console.warn('MinIO端点URL解析失败，使用默认配置:', error);
      return {
        endPoint: 'localhost',
        port: 9000,
        useSSL: false
      };
    }
  }
  
  // 如果是纯域名格式
  return {
    endPoint: endpoint,
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true'
  };
};

// 获取MinIO配置
const getMinioConfig = () => {
  const endpointConfig = parseMinioEndpoint();
  
  return {
    ...endpointConfig,
    accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_USER || '',
    secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_PASSWORD || '',
  };
};

// 创建MinIO客户端时添加错误处理
let minioClient: Client | null = null;

const createMinioClient = () => {
  try {
    const config = getMinioConfig();
    console.log('MinIO配置:', {
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      hasAccessKey: !!config.accessKey,
      hasSecretKey: !!config.secretKey
    });
    
    return new Client(config);
  } catch (error) {
    console.error('MinIO客户端创建失败:', error);
    return null;
  }
};

// 懒加载MinIO客户端
const getMinioClient = () => {
  if (!minioClient) {
    minioClient = createMinioClient();
  }
  return minioClient;
};

export const DRAWING_BUCKET = 'drawings';

// 检查MinIO是否可用
export async function isMinioAvailable(): Promise<boolean> {
  try {
    const client = getMinioClient();
    if (!client) {
      console.warn('MinIO客户端未初始化，可能是配置问题');
      return false;
    }
    
    // 尝试列出存储桶来测试连接
    await client.listBuckets();
    return true;
  } catch (error) {
    console.warn('MinIO不可用:', error);
    return false;
  }
}

// 确保存储桶存在
export async function ensureBucketExists() {
    try {
    const client = getMinioClient();
    if (!client) {
      throw new Error('MinIO客户端未初始化');
    }
    
        // 检查存储桶是否存在
    const exists = await client.bucketExists(DRAWING_BUCKET);
        if (!exists) {
      await client.makeBucket(DRAWING_BUCKET);
      console.log(`✅ 存储桶 ${DRAWING_BUCKET} 创建成功`);
        }
    } catch (error) {
    console.error('❌ 检查或创建存储桶失败:', error);
        throw error;
    }
}

// 上传绘图数据到 MinIO
export async function uploadDrawingData(drawingId: string, data: any): Promise<string> {
    try {
    // 检查MinIO是否可用
    const isAvailable = await isMinioAvailable();
    if (!isAvailable) {
      console.warn('MinIO不可用，跳过文件上传');
      return ''; // 返回空字符串表示未上传
    }
    
    const client = getMinioClient();
    if (!client) {
      throw new Error('MinIO客户端未初始化');
    }
    
        await ensureBucketExists();
        
        const fileName = `${drawingId}.json`;
        const dataString = JSON.stringify(data);
        
    await client.putObject(DRAWING_BUCKET, fileName, dataString);
        
    console.log(`✅ 绘图数据上传成功: ${fileName}`);
        return fileName;
    } catch (error) {
    console.error('❌ 上传绘图数据失败:', error);
    // 不抛出错误，允许应用继续运行
    return '';
    }
}

// 从 MinIO 获取绘图数据
export async function getDrawingData(fileName: string): Promise<any> {
    try {
    if (!fileName) {
      return null;
    }
    
    const client = getMinioClient();
    if (!client) {
      throw new Error('MinIO客户端未初始化');
    }
    
    const stream = await client.getObject(DRAWING_BUCKET, fileName);
        const chunks: any[] = [];
        
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk: any) => chunks.push(chunk));
            stream.on('end', () => {
                try {
                    const data = Buffer.concat(chunks).toString();
                    resolve(JSON.parse(data));
                } catch (parseError) {
                    reject(new Error('解析绘图数据失败'));
                }
            });
            stream.on('error', (error: any) => {
                reject(new Error('获取绘图数据失败'));
            });
        });
    } catch (error) {
    console.error('❌ 获取绘图数据失败:', error);
    return null; // 返回null而不是抛出错误
    }
}

// 从 MinIO 删除绘图数据
export async function deleteDrawingData(fileName: string): Promise<void> {
    try {
    if (!fileName) {
      return;
    }
    
    const client = getMinioClient();
    if (!client) {
      console.warn('MinIO客户端未初始化，跳过文件删除');
      return;
    }
    
    await client.removeObject(DRAWING_BUCKET, fileName);
    console.log(`✅ 绘图数据删除成功: ${fileName}`);
    } catch (error) {
    console.error('❌ 删除绘图数据失败:', error);
    // 不抛出错误，允许应用继续运行
    }
}

// 导出MinIO客户端获取函数
export { getMinioClient as minioClient };
