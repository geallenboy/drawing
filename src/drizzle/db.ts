
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schemas"

// SSL配置函数
const getSSLConfig = () => {
  const dbUrl = process.env.DATABASE_URL!
  
  // 如果是本地开发环境，不使用SSL
  if (process.env.NODE_ENV === 'development' || dbUrl.includes('localhost')) {
    return false;
  }
  
  // 检测是否需要 SSL
  const needsSsl = dbUrl.includes('sslmode=require') || 
                   dbUrl.includes('neon.tech') || 
                   dbUrl.includes('supabase.co') ||
                   dbUrl.includes('planetscale.com') ||
                   dbUrl.includes('railway.app') ||
                   process.env.NODE_ENV === 'production';

  if (!needsSsl) {
    return false;
  }

  // SSL配置，解决证书验证问题
  return {
    rejectUnauthorized: false,
    // 允许自签名证书
    checkServerIdentity: () => undefined,
    // 强制使用TLS 1.2
    secureProtocol: 'TLSv1_2_method',
    // 忽略证书链验证
    ca: false
  };
}

// 创建数据库连接配置
const createConnectionConfig = () => {
  const connectionString = process.env.DATABASE_URL!;
  const sslConfig = getSSLConfig();
  
  // 添加SSL相关参数到连接字符串
  if (sslConfig !== false && !connectionString.includes('sslmode')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    return `${connectionString}${separator}sslmode=require&sslcert=&sslkey=&sslrootcert=`;
  }
  
  return connectionString;
};

export const db = drizzle({
  schema,
  connection: {
    connectionString: createConnectionConfig(),
    ssl: getSSLConfig(),
    // 连接池配置 - 增加超时时间和重试机制
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    // 添加重试配置
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  }
})

// 添加连接测试函数
export async function testDatabaseConnection() {
  try {
    await db.execute('SELECT 1 as test');
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}



