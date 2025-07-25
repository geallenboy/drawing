import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

// Cloudflare R2配置
const getR2Config = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('缺少Cloudflare R2配置: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID 和 CLOUDFLARE_R2_SECRET_ACCESS_KEY 是必需的');
  }

  return {
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  };
};

// 创建R2客户端
let r2Client: S3Client | null = null;

const createR2Client = () => {
  try {
    const config = getR2Config();
    console.log('Cloudflare R2配置:', {
      region: config.region,
      endpoint: config.endpoint,
      hasCredentials: !!config.credentials.accessKeyId
    });
    
    return new S3Client(config);
  } catch (error) {
    console.error('Cloudflare R2客户端创建失败:', error);
    return null;
  }
};

// 懒加载R2客户端
const getR2Client = () => {
  if (!r2Client) {
    r2Client = createR2Client();
  }
  return r2Client;
};

export const DRAWING_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'drawings';

// 检查R2是否可用
export async function isR2Available(): Promise<boolean> {
  try {
    const client = getR2Client();
    if (!client) {
      console.warn('Cloudflare R2客户端未初始化，可能是配置问题');
      return false;
    }
    
    // 尝试检查存储桶是否存在来测试连接
    const command = new HeadBucketCommand({ Bucket: DRAWING_BUCKET });
    await client.send(command);
    return true;
  } catch (error) {
    console.warn('Cloudflare R2不可用:', error);
    return false;
  }
}

// 确保存储桶存在
export async function ensureBucketExists() {
  try {
    const client = getR2Client();
    if (!client) {
      throw new Error('Cloudflare R2客户端未初始化');
    }
    
    // 检查存储桶是否存在
    try {
      const headCommand = new HeadBucketCommand({ Bucket: DRAWING_BUCKET });
      await client.send(headCommand);
      console.log(`✅ 存储桶 ${DRAWING_BUCKET} 已存在`);
    } catch (error: any) {
      if (error.name === 'NotFound') {
        // 存储桶不存在，创建它
        const createCommand = new CreateBucketCommand({ Bucket: DRAWING_BUCKET });
        await client.send(createCommand);
        console.log(`✅ 存储桶 ${DRAWING_BUCKET} 创建成功`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ 检查或创建存储桶失败:', error);
    throw error;
  }
}

// 上传画图数据到Cloudflare R2
export async function uploadDrawingData(drawingId: string, data: any): Promise<string> {
  try {
    // 检查R2是否可用
    const isAvailable = await isR2Available();
    if (!isAvailable) {
      console.warn('Cloudflare R2不可用，跳过文件上传');
      return ''; // 返回空字符串表示未上传
    }
    
    const client = getR2Client();
    if (!client) {
      throw new Error('Cloudflare R2客户端未初始化');
    }
    
    await ensureBucketExists();
    
    const fileName = `${drawingId}.json`;
    const dataString = JSON.stringify(data);
    
    const command = new PutObjectCommand({
      Bucket: DRAWING_BUCKET,
      Key: fileName,
      Body: dataString,
      ContentType: 'application/json',
    });
    
    await client.send(command);
    
    console.log(`✅ 画图数据上传成功: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error('❌ 上传画图数据失败:', error);
    // 不抛出错误，允许应用继续运行
    return '';
  }
}

// 从Cloudflare R2获取画图数据
export async function getDrawingData(fileName: string): Promise<any> {
  try {
    if (!fileName) {
      return null;
    }
    
    const client = getR2Client();
    if (!client) {
      throw new Error('Cloudflare R2客户端未初始化');
    }
    
    const command = new GetObjectCommand({
      Bucket: DRAWING_BUCKET,
      Key: fileName,
    });
    
    const response = await client.send(command);
    
    if (!response.Body) {
      throw new Error('未找到数据');
    }
    
    // 将流转换为字符串
    const streamToString = async (stream: any): Promise<string> => {
      const chunks: any[] = [];
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString()));
      });
    };
    
    const dataString = await streamToString(response.Body);
    return JSON.parse(dataString);
  } catch (error) {
    console.error('❌ 获取画图数据失败:', error);
    return null; // 返回null而不是抛出错误
  }
}

// 从Cloudflare R2删除画图数据
export async function deleteDrawingData(fileName: string): Promise<void> {
  try {
    if (!fileName) {
      return;
    }
    
    const client = getR2Client();
    if (!client) {
      console.warn('Cloudflare R2客户端未初始化，跳过文件删除');
      return;
    }
    
    const command = new DeleteObjectCommand({
      Bucket: DRAWING_BUCKET,
      Key: fileName,
    });
    
    await client.send(command);
    console.log(`✅ 画图数据删除成功: ${fileName}`);
  } catch (error) {
    console.error('❌ 删除画图数据失败:', error);
    // 不抛出错误，允许应用继续运行
  }
}

// 导出R2客户端获取函数
export { getR2Client as r2Client };