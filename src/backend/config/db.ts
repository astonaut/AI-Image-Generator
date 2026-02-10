import { Pool } from "pg";

let globalPool: Pool | null = null;

function createMockDb() {
  console.warn("Database is not configured or unavailable. Using mock DB.");
  return {
    query: async (sql: string, params?: any[]) => {
      console.log("[mock-db] query:", sql, params);
      return { rows: [] };
    },
  } as any;
}

export function getDb() {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;

    if (
      !connectionString ||
      connectionString.includes("localhost:5432") ||
      connectionString.includes("[project-secret]") ||
      connectionString.includes("xxxx.com")
    ) {
      return createMockDb();
    }

    try {
      globalPool = new Pool({ connectionString });

      globalPool.query("SELECT 1").catch((error) => {
        console.error("Database health check failed, fallback to mock DB:", error.message);
        globalPool = null;
      });
    } catch (error) {
      console.error("Failed to initialize DB pool, fallback to mock DB:", error);
      return createMockDb();
    }
  }

  if (!globalPool) {
    return createMockDb();
  }

  return globalPool;
}
