import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const sql = neon(process.env.DATABASE_URL!);
    // Using a random UUID that likely exists or doesn't, just to see if the query runs
    const testEmployeeId = 'f4cd2361-27a8-49b4-a5bf-5c6b7efda047';

    console.log(`Attempting to delete attendance for employee: ${testEmployeeId}`);
    try {
        const result = await sql`DELETE FROM attendance WHERE employee_id = ${testEmployeeId}`;
        console.log("Delete successful (from attendance):", result);

        const empResult = await sql`DELETE FROM employees WHERE id = ${testEmployeeId}`;
        console.log("Delete successful (from employees):", empResult);
    } catch (error: any) {
        console.error("DEBUG QUERY FAILED:");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Detail:", error.detail);
        console.error("Hint:", error.hint);
    }
}

main();
