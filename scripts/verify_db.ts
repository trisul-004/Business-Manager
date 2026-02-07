import { db } from '../db';
import { employees } from '../db/schema';
import { sql } from 'drizzle-orm';

async function checkColumn() {
    try {
        // Attempt to select the specific column. If it doesn't exist, this should throw.
        const result = await db.execute(sql`SELECT face_descriptor FROM employees LIMIT 1`);
        console.log("✅ Check Successful: 'face_descriptor' column exists.");
    } catch (error) {
        console.error("❌ Check Failed: 'face_descriptor' column might be missing.", error);
    }
    process.exit(0);
}

checkColumn();
