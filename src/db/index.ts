import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

let db: LibSQLDatabase<typeof schema> | null = null;

export function createDb() {
  if (!db) {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    db = drizzle(client, { schema });
  }
  return db;
}
