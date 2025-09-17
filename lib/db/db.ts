import { drizzle } from 'drizzle-orm/postgres-js'
import { env }  from "@/lib/env";
import postgres from "postgres";

export const db = drizzle(postgres(env.DATABASE_URL));