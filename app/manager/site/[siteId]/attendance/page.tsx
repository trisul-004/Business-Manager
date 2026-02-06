import { getEmployees } from "@/actions/employees";
import AttendanceScanner from "@/components/AttendanceScanner";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { siteManagers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AttendancePage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params;
    const { userId, sessionClaims } = await auth();

    if (!userId) redirect("/sign-in");

    // Verify access (Manager or Supervisor)
    const role = sessionClaims?.metadata?.role || "manager";
    if (role !== "supervisor") {
        const hasAccess = await db
            .select()
            .from(siteManagers)
            .where(and(eq(siteManagers.userId, userId), eq(siteManagers.siteId, siteId)));

        if (hasAccess.length === 0) redirect("/manager");
    }

    // Get employees for this site
    // We need their face descriptors for the scanner
    const employees = await getEmployees(siteId);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <nav className="mb-6 flex items-center justify-between">
                <Link
                    href={`/manager/site/${siteId}`}
                    className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Dashboard
                </Link>
                <h1 className="font-bold text-xl">Attendance Scanner</h1>
            </nav>

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>📸</span> Face Recognition
                    </h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        Ensure the camera has good lighting. The system will automatically mark attendance when it recognizes an employee.
                    </p>

                    <AttendanceScanner siteId={siteId} employees={employees} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Registered Faces</h3>
                        <p className="text-3xl font-black">{employees.filter(e => e.faceDescriptor).length}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Employees</h3>
                        <p className="text-3xl font-black">{employees.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
