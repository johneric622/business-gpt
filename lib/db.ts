import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

// Check if we're using a local PostgreSQL connection
function isLocalConnection(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    // If URL parsing fails, check if it contains localhost
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

let pgPool: Pool | null = null;

// Create a Neon-compatible template tag function for local pg
function createLocalSql(pool: Pool) {
  return async function sql(strings: TemplateStringsArray, ...values: any[]) {
    const client = await pool.connect();
    try {
      // Convert template literal to parameterized query
      let query = strings[0];
      const params: any[] = [];
      
      for (let i = 0; i < values.length; i++) {
        params.push(values[i]);
        query += `$${i + 1}` + (strings[i + 1] || "");
      }
      
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  };
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL!;
  
  // Use pg (node-postgres) for local connections
  if (isLocalConnection(databaseUrl)) {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: databaseUrl,
      });
    }
    
    // Return a Neon-compatible template tag function
    return createLocalSql(pgPool);
  }
  
  // Use Neon serverless for remote/cloud connections
  return neon(databaseUrl);
}
