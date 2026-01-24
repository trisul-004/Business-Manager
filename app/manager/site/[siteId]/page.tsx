import { getEmployees, createEmployee } from "@/actions/employees";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sites as sitesTable, siteManagers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, UserPlus, MapPin } from "lucide-react";

export default async function SiteDashboard({ params }: { params: Promise<{ siteId: string }> }) {
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

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <nav className="mb-8">
                    <Link
                        href={role === "supervisor" ? "/supervisor" : "/manager"}
                        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors w-fit"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to {role === "supervisor" ? "Supervisor Portal" : "Site Selection"}
                    </Link>
                </nav>

                <header className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{site.name}</h1>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase">Active Site</span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {site.address}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Employee Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-green-600" />
                                Add Member
                            </h2>
                            <form action={createEmployee} className="space-y-5">
                                <input type="hidden" name="siteId" value={siteId} />
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 py-3 px-4 bg-gray-50 transition-all placeholder:text-gray-400"
                                        placeholder="e.g. John Smith"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title / Role</label>
                                    <input
                                        name="role"
                                        type="text"
                                        placeholder="e.g. Site Supervisor"
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 py-3 px-4 bg-gray-50 transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-md font-medium text-lg transform hover:-translate-y-0.5"
                                >
                                    Add Employee
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Employee List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-green-600" />
                                    Employee Directory
                                </h2>
                                <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-bold">
                                    {siteEmployees.length} Total Members
                                </span>
                            </div>

                            <div className="grid gap-4">
                                {siteEmployees.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500">No employees registered for this site.</p>
                                    </div>
                                ) : (
                                    siteEmployees.map(emp => (
                                        <div key={emp.id} className="group border border-gray-100 p-5 rounded-2xl hover:bg-green-50/30 transition-all flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-700 font-bold text-lg shadow-sm">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{emp.name}</h3>
                                                    <p className="text-sm text-gray-500 font-medium">{emp.role}</p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                                                Active
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
