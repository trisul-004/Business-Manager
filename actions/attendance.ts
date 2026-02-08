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
        // If status is "absent", we override or create an absent record
        if (status === 'absent') {
            const existing = await db.query.attendance.findFirst({
                where: and(
                    eq(attendance.employeeId, employeeId),
                    eq(attendance.date, today)
                )
            });

            if (existing) {
                await db.update(attendance)
                    .set({
                        status: 'absent',
                        checkInTime: null,
                        checkOutTime: null
                    })
                    .where(eq(attendance.id, existing.id));
            } else {
                await db.insert(attendance).values({
                    employeeId,
                    status: 'absent',
                    date: today,
                    checkInTime: null,
                });
            }
            revalidatePath(`/manager/site/${siteId}`);
            return { success: true, type: 'absent' };
        }

        // Check if record exists for today
        const existing = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.employeeId, employeeId),
                eq(attendance.date, today)
            )
        });

        if (!existing) {
            // New record: handles initial check-in
            await db.insert(attendance).values({
                employeeId,
                status: 'checked-in',
                date: today,
                checkInTime: new Date(),
            });
            revalidatePath(`/manager/site/${siteId}`);
            return { success: true, type: 'in' };
        } else if (!existing.checkOutTime) {
            // Check-out: can be manual (status='present') or scanned
            const isManual = status === 'present';

            if (!isManual) {
                // Cooldown check ONLY for automatic scans
                const checkInTime = new Date(existing.checkInTime!).getTime();
                const now = new Date().getTime();
                const diffMinutes = (now - checkInTime) / (1000 * 60);

                if (diffMinutes < 5) {
                    return { success: false, error: "Please wait at least 5 minutes before checking out (Automatic Scale)." };
                }
            }

            // Check-out (Manual or Scanned)
            await db.update(attendance)
                .set({
                    checkOutTime: new Date(),
                    status: 'present' // Only mark present after check-out
                })
                .where(eq(attendance.id, existing.id));
            revalidatePath(`/manager/site/${siteId}`);
            return { success: true, type: 'out' };
        } else {
            return { success: false, error: "Already checked out today" };
        }
    } catch (error: any) {
        console.error("Attendance error:", error.message);
        return { success: false, error: error.message };
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
