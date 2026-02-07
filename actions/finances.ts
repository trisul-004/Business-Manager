'use server';

import { db } from '@/db';
import { finances } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getTransactions(siteId: string, startDate?: string, endDate?: string) {
    const { userId } = await auth();
    if (!userId) return [];

    let query = db
        .select()
        .from(finances)
        .where(eq(finances.siteId, siteId));

    if (startDate && endDate) {
        query = db
            .select()
            .from(finances)
            .where(
                and(
                    eq(finances.siteId, siteId),
                    gte(finances.date, startDate),
                    lte(finances.date, endDate)
                )
            );
    }

    return await query;
}

export async function createTransaction(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const siteId = formData.get('siteId') as string;
    const amount = formData.get('amount') as string;
    const type = formData.get('type') as string; // 'income' or 'expense'
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;

    if (!siteId || !amount || !type || !category || !date) {
        return { error: "Missing required fields" };
    }

    try {
        await db.insert(finances).values({
            siteId,
            amount,
            type,
            category,
            description: description || null,
            date,
        });

        revalidatePath(`/manager/site/${siteId}/finances`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create transaction:", error);
        return { error: `Failed to create transaction: ${error.message}` };
    }
}

export async function deleteTransaction(transactionId: string, siteId: string) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const role = sessionClaims?.metadata?.role || 'manager';

    if (role !== 'supervisor') {
        // Optional: restriction to supervisor or site manager
    }

    try {
        await db.delete(finances).where(eq(finances.id, transactionId));
        revalidatePath(`/manager/site/${siteId}/finances`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete transaction:", error);
        return { error: `Deletion failed: ${error.message}` };
    }
}
