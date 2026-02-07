'use server';

import { db } from '@/db';
import { attendance } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { and, eq, sql, inArray, gte, lte } from 'drizzle-orm';

export async function markAttendance(formData: FormData) {
    const employeeId = formData.get('employeeId') as string;
    const status = formData.get('status') as string;
    const siteId = formData.get('siteId') as string;

    if (!employeeId || !status || !siteId) {
        throw new Error("Missing required fields");
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    try {
        await db.insert(attendance).values({
            employeeId,
            status,
            date: today,
        });

        revalidatePath(`/manager/site/${siteId}`);
    } catch (error: any) {
        // Drizzle/Postgres will throw if the unique constraint (employeeId, date) is violated
        console.error("Attendance already marked:", error.message);
    }
}

export async function getAttendanceToday(employeeIds: string[]) {
    if (employeeIds.length === 0) return [];

    const today = new Date().toISOString().split('T')[0];

    return await db
        .select()
        .from(attendance)
        .where(
            and(
                inArray(attendance.employeeId, employeeIds),
                eq(attendance.date, today)
            )
        );
}

export async function getAttendanceRange(employeeIds: string[], startDate: string, endDate: string) {
    if (employeeIds.length === 0) return [];

    return await db
        .select()
        .from(attendance)
        .where(
            and(
                inArray(attendance.employeeId, employeeIds),
                gte(attendance.date, startDate),
                lte(attendance.date, endDate)
            )
        );
}
