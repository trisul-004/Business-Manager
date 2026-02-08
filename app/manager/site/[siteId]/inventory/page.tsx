import { db } from "@/db";
import { sites as sitesTable, siteManagers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Boxes, Construction, MapPin, Search } from "lucide-react";
import AddAssetForm from "@/components/AddAssetForm";
import AssetList from "@/components/AssetList";
import ExportInventoryPDF from "@/components/ExportInventoryPDF";
import { getAssets } from "@/actions/assets";

export default async function InventoryPage({ params }: { params: Promise<{ siteId: string }> }) {
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

    const assets = await getAssets(siteId);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <nav className="mb-6 md:mb-8">
                    <Link
                        href={`/manager/site/${siteId}`}
                        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors w-fit text-sm font-bold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </nav>

                <header className="mb-10 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="w-full lg:w-auto">
                        <div className="flex items-center justify-between lg:justify-start gap-4 mb-2">
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Inventory</h1>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">{site.name}</span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-1.5 text-sm font-medium">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            Track raw materials and machinery
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="flex-1 bg-gray-100 p-4 rounded-2xl flex items-center gap-3 border border-transparent focus-within:border-indigo-600 focus-within:bg-white transition-all h-14">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Search..." className="bg-transparent outline-none font-black text-xs uppercase tracking-widest text-gray-900 w-full" />
                        </div>
                        <ExportInventoryPDF assets={assets as any} siteName={site.name} />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Add Asset Form Column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <AddAssetForm siteId={siteId} />
                        </div>
                    </div>

                    {/* Asset List Column */}
                    <div className="lg:col-span-2">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <Boxes className="w-8 h-8 text-indigo-600" />
                                    Current Inventory
                                </h2>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                        {assets.filter(a => a.type === 'machinery').length} Machinery
                                    </span>
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                        {assets.filter(a => a.type === 'material').length} Materials
                                    </span>
                                </div>
                            </div>

                            <AssetList assets={assets as any} siteId={siteId} role={role} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
