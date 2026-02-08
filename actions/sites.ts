'use server';

import { db } from '@/db';
import { sites, siteManagers, employees, attendance, assets, finances, notifications } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { sql, eq, and, inArray } from 'drizzle-orm';
import { createClerkClient } from '@clerk/nextjs/server';
import { auth } from "@clerk/nextjs/server";


export async function removeManager(formData: FormData) {
    const siteId = formData.get('siteId') as string;
    const userId = formData.get('userId') as string;

    if (!siteId || !userId) return;

    await db.delete(siteManagers)
        .where(
            and(
                eq(siteManagers.siteId, siteId),
                eq(siteManagers.userId, userId)
            )
        );

    revalidatePath('/supervisor');
}

export async function getSites() {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const allSites = await db.select().from(sites);

    // Enhance with personnel names and counts
    const sitesWithPersonnel = await Promise.all(allSites.map(async (site) => {
        const managers = await db.select().from(siteManagers).where(eq(siteManagers.siteId, site.id));
        const siteEmployees = await db.select().from(employees).where(eq(employees.siteId, site.id));

        // Fetch manager names from Clerk
        const managersWithNames = await Promise.all(managers.map(async (m) => {
            try {
                const user = await clerk.users.getUser(m.userId);
                return {
                    ...m,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown Manager'
                };
            } catch (error) {
                return { ...m, name: 'Unknown Manager' };
            }
        }));

        return {
            ...site,
            managers: managersWithNames,
            employeeCount: siteEmployees.length
        };
    }));

    return sitesWithPersonnel;
}

export async function createSite(formData: FormData) {
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;

    if (!name || !address) return;

    await db.insert(sites).values({
        name,
        address,
    });

    revalidatePath('/supervisor');
}

export async function assignManager(formData: FormData) {
    const siteId = formData.get('siteId') as string;
    const userId = formData.get('userId') as string;

    if (!siteId || !userId) return;

    await db.insert(siteManagers).values({
        siteId,
        userId,
    });

    revalidatePath('/supervisor');
}

export async function deleteSite(siteId: string) {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;

    if (role !== 'supervisor') {
        throw new Error("Unauthorized: Only supervisors can delete sites.");
    }

    try {
        // 1. Delete Notifications
        await db.delete(notifications).where(eq(notifications.siteId, siteId));

        // 2. Delete Finances
        await db.delete(finances).where(eq(finances.siteId, siteId));

        // 3. Delete Assets
        await db.delete(assets).where(eq(assets.siteId, siteId));

        // 4. Delete Attendance (Needs employee IDs)
        const siteEmployees = await db.select({ id: employees.id }).from(employees).where(eq(employees.siteId, siteId));
        const employeeIds = siteEmployees.map(e => e.id);

        if (employeeIds.length > 0) {
            await db.delete(attendance).where(inArray(attendance.employeeId, employeeIds));
        }

        // 5. Delete Employees
        await db.delete(employees).where(eq(employees.siteId, siteId));

        // 6. Delete Site Managers
        await db.delete(siteManagers).where(eq(siteManagers.siteId, siteId));

        // 7. Delete Site
        await db.delete(sites).where(eq(sites.id, siteId));

        revalidatePath('/supervisor');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete site:", error);
        return { success: false, error: error.message };
    }
}
