// lib/db/index.ts
import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// ============================================================================
// ১. Regular HTTP Connection (Superfast, No Connection Limits)
// ড্যাশবোর্ড, প্রোডাক্ট ফেচ বা সাধারণ কুয়েরির জন্য এটি ব্যবহার হবে (db)
// ============================================================================
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzleHttp(sql, { schema });

// ============================================================================
// ২. WebSocket Pool Connection (Strictly for Transactions like Checkout)
// চেকআউটের সময় স্টক কমানো এবং অর্ডার প্লেস করার জন্য এটি ব্যবহার হবে (txDb)
// ============================================================================

// Next.js এর বিল্ট-ইন গ্লোবাল WebSocket ব্যবহার করা হচ্ছে (ws প্যাকেজ ক্র্যাশ এড়াতে)
if (typeof globalThis.WebSocket !== 'undefined') {
  neonConfig.webSocketConstructor = globalThis.WebSocket;
}

// Singleton Pattern: ডেভেলপমেন্ট মুডে হট-রিলোডের কারণে কানেকশন লিমিট এরর ঠেকানোর জন্য
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

// আগে থেকে Pool থাকলে সেটিই ব্যবহার করবে, না থাকলে নতুন তৈরি করবে
const pool = globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL! });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// ট্রানজেকশনের জন্য আলাদা ইন্সট্যান্স এক্সপোর্ট করা হলো
export const txDb = drizzlePool(pool, { schema });