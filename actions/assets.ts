'use server';

import { db } from '@/db';
import { assets } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { createNotification } from './notifications';

export async function getAssets(siteId: string) {
    const { userId } = await auth();
    if (!userId) return [];

    return await db
        .select()
        .from(assets)
        .where(eq(assets.siteId, siteId));
}

export async function createAsset(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const siteId = formData.get('siteId') as string;
    const quantity = formData.get('quantity') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string; // Base64 or URL

    if (!name || !type || !siteId) {
        return { error: "Missing required fields" };
    }

    try {
        await db.insert(assets).values({
            siteId,
            name,
            type,
            quantity: quantity || null,
            description: description || null,
            imageUrl: imageUrl || null,
        });

        await createNotification(
            siteId,
            'New Asset Added',
            `${name} has been added to inventory (${type}).`,
            'asset'
        );

        revalidatePath(`/manager/site/${siteId}/inventory`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to create asset:", error);
        return { error: `Failed to create asset: ${error.message}` };
    }
}

export async function deleteAsset(assetId: string, siteId: string) {
    const { userId, sessionClaims } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const role = sessionClaims?.metadata?.role || 'manager';

    // Verify access: Only supervisor can delete? Let's check plan.
    // Plan doesn't specify, but consistent with employees, let's allow supervisor for now.
    // Or allow the site manager too. For now let's stick to supervisor for deletion as a precaution.
    if (role !== 'supervisor') {
        return { error: "Forbidden: Only supervisors can remove assets." };
    }

    try {
        await db.delete(assets).where(eq(assets.id, assetId));
        revalidatePath(`/manager/site/${siteId}/inventory`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete asset:", error);
        return { error: `Deletion failed: ${error.message}` };
    }
}
