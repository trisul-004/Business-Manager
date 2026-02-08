'use server';

import { db } from '@/db';
import { notifications } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getNotifications(siteId: string) {
    const { userId } = await auth();
    if (!userId) return [];

    return await db
        .select()
        .from(notifications)
        .where(eq(notifications.siteId, siteId))
        .orderBy(desc(notifications.createdAt))
        .limit(20);
}

export async function markNotificationAsRead(notificationId: string, siteId: string) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    try {
        await db.update(notifications)
            .set({ isRead: 'true' })
            .where(eq(notifications.id, notificationId));

        revalidatePath(`/manager/site/${siteId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to mark notification as read:", error);
        return { error: "Failed to update notification" };
    }
}

export async function createNotification(siteId: string, title: string, message: string, type: 'employee' | 'asset' | 'finance') {
    try {
        await db.insert(notifications).values({
            siteId,
            title,
            message,
            type,
        });
        revalidatePath(`/manager/site/${siteId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { error: "Failed to create notification" };
    }
}
