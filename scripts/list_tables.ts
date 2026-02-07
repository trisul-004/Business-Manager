import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Tables in database:");
        console.table(result);

        const attendanceColumns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attendance'`;
        console.log("\nColumns in 'attendance' table:");
        console.table(attendanceColumns);
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
}

main();
