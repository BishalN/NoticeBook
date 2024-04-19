// import postgres from "postgres";
// import { env } from "@/env";
import { env } from "@/env";
import * as schema from "./schema";
// import { drizzle } from "drizzle-orm/postgres-js";

// export const connection = postgres(env.DATABASE_URL, {
//   max_lifetime: 10, // Remove this line if you're deploying to Docker / VPS
//   // idle_timeout: 20, // Uncomment this line if you're deploying to Docker / VPS
// });

// export const db = drizzle(connection, { schema });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
