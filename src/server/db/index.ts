// src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "./schema"

config({ path: ".env" }); // or .env.local

const sql = neon('postgres://neondb_owner:npg_sGfm3TSuRF0r@ep-mute-shadow-a5d76grn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');
export const db = drizzle(sql, { schema });