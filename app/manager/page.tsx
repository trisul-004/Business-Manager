
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { siteManagers, sites as sitesTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { ChevronRight, Building2, LayoutDashboard } from "lucide-react";

async function getManagedSites(userId: string) {
    const managed = await db
        .select({ siteId: siteManagers.siteId })
        .from(siteManagers)
        .where(eq(siteManagers.userId, userId));

    const siteIds = managed.map(m => m.siteId);
    if (siteIds.length === 0) return [];

    return await db
        .select()
        .from(sitesTable)
        .where(inArray(sitesTable.id, siteIds));
}

export default async function ManagerPortal() {
    const { userId } = await auth();
    if (!userId) return <div>Not authenticated</div>;

    const mySites = await getManagedSites(userId);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Manager Portal</h1>
                        <p className="text-sm md:text-base text-gray-500 mt-1">Select a site to manage its specific operations</p>
                    </div>
                    <div className="flex flex-col-reverse md:flex-row items-end md:items-center gap-2 md:gap-3">
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] md:text-sm font-medium whitespace-nowrap">Manager Access</span>
                        <UserButton />
                    </div>
                </header>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-green-600" />
                        Available Sites
                    </h2>

                    {mySites.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                            <p className="text-gray-500 text-lg">No sites have been assigned to you yet.</p>
                            <p className="text-sm text-gray-400 mt-2">Please contact your supervisor for assignment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mySites.map(site => (
                                <Link
                                    key={site.id}
                                    href={`/manager/site/${site.id}`}
                                    className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            <LayoutDashboard className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{site.name}</h3>
                                            <p className="text-gray-500 text-sm mt-1">{site.address}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-green-500 transform group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
