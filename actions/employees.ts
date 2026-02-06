'use server';

import { db } from '@/db';
import { employees, siteManagers } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getEmployees(siteId?: string) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return [];

    const role = sessionClaims?.metadata?.role || 'manager';

    if (role === 'supervisor') {
        if (siteId) {
            return await db.select().from(employees).where(eq(employees.siteId, siteId));
        }
        return await db.select().from(employees);
    }

    // Manager Logic: Ensure they have access to this site
    const managedSites = await db
        .select({ siteId: siteManagers.siteId })
        .from(siteManagers)
        .where(eq(siteManagers.userId, userId));

    const siteIds = managedSites.map((ms) => ms.siteId);

    if (siteIds.length === 0) return [];

    // If a specific siteId is requested, check if the manager is assigned to it
    if (siteId) {
        if (!siteIds.includes(siteId)) return [];
        return await db.select().from(employees).where(eq(employees.siteId, siteId));
    }

    // Default: Return all employees from all sites assigned to this manager
    return await db.select().from(employees).where(inArray(employees.siteId, siteIds));
}

export async function createEmployee(formData: FormData) {
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const siteId = formData.get('siteId') as string;
    const faceDescriptor = formData.get('faceDescriptor') as string;

    if (!name || !role || !siteId) return;

    await db.insert(employees).values({
        name,
        role,
        siteId,
        faceDescriptor: faceDescriptor || null,
    });

    revalidatePath('/manager');
    revalidatePath('/supervisor');
}
