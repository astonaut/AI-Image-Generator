import { Pool } from "pg";

// 链接池，所有的连接都维护在这个连接池里面
let globalPool: Pool | null = null;

function createMockDb() {
  console.warn('⚠️  数据库未配置或连接失败，使用模拟数据');
  return {
    query: async (sql: string, params?: any[]) => {
      console.log('🗄️  模拟 SQL 查询:', sql, params);
      return { rows: [] };
    }
  } as any;
}

export function getDb() {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;

    // 如果没有数据库连接字符串或者是本地开发环境
    if (!connectionString ||
        connectionString.includes('localhost:5432') ||
        connectionString.includes('[项目秘钥]') ||
        connectionString.includes('xxxx.com')) {
      return createMockDb();
    }

    try {
      globalPool = new Pool({
        connectionString,
      });

      // 测试连接
      globalPool.query('SELECT 1').catch((error) => {
        console.error('数据库连接失败，切换到模拟模式:', error.message);
        globalPool = null;
      });

    } catch (error) {
      console.error('数据库池创建失败，使用模拟模式:', error);
      return createMockDb();
    }
  }

  // 如果连接池创建失败，返回模拟数据库
  if (!globalPool) {
    return createMockDb();
  }

  return globalPool;
}
