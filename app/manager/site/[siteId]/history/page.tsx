import { db } from "@/db";
import { sites as sitesTable, siteManagers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getEmployees } from "@/actions/employees";
import { getAttendanceRange } from "@/actions/attendance";
import AttendanceHistory from "@/components/AttendanceHistory";

export default async function AttendanceHistoryPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params;
    const { userId, sessionClaims } = await auth();

    if (!userId) redirect("/sign-in");

    // Verify access
    const role = sessionClaims?.metadata?.role || "manager";
    if (role !== "supervisor") {
        const hasAccess = await db
            .select()
            .from(siteManagers)
            .where(and(eq(siteManagers.userId, userId), eq(siteManagers.siteId, siteId)));

        if (hasAccess.length === 0) {
            redirect("/manager");
        }
    }

    const site = await db.query.sites.findFirst({
        where: eq(sitesTable.id, siteId)
    });

    if (!site) notFound();

    const siteEmployees = await getEmployees(siteId);

    // Initial month range
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const initialAttendance = await getAttendanceRange(
        siteEmployees.map(e => e.id),
        start,
        end
    );

    return (
        <AttendanceHistory
            siteId={siteId}
            siteName={site.name}
            employees={siteEmployees.map(e => ({ id: e.id, name: e.name, role: e.role }))}
            initialAttendance={initialAttendance as any}
        />
    );
}
