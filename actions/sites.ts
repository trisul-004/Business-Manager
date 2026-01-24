'use server';

import { db } from '@/db';
import { sites, siteManagers, employees } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { sql, eq, and } from 'drizzle-orm';
import { createClerkClient } from '@clerk/nextjs/server';


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
