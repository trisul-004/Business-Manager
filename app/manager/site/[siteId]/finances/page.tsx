import { db } from "@/db";
import { sites as sitesTable, siteManagers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, IndianRupee, MapPin, Calculator, FileText, Download } from "lucide-react";
import AddTransactionForm from "@/components/AddTransactionForm";
import TransactionList from "@/components/TransactionList";
import FinanceSummary from "@/components/FinanceSummary";
import ExportFinancePDF from "@/components/ExportFinancePDF";
import { getTransactions } from "@/actions/finances";
import { finances as financesTable } from '@/db/schema';
import NotificationBell from "@/components/NotificationBell";

export default async function FinancesPage({ params }: { params: Promise<{ siteId: string }> }) {
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

    // Fetch transactions
    const transactions = await db
        .select()
        .from(financesTable)
        .where(eq(financesTable.siteId, siteId))
        .orderBy(desc(financesTable.date), desc(financesTable.createdAt));

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
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Finances</h1>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">{site.name}</span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-1.5 text-sm font-medium">
                            <MapPin className="w-4 h-4 text-green-400" />
                            Manage day-to-day cash flow
                        </p>
                    </div>

                    <div className="w-full lg:w-auto flex items-center gap-3">
                        <NotificationBell siteId={siteId} />
                        <ExportFinancePDF transactions={transactions as any} siteName={site.name} />
                    </div>
                </header>

                <FinanceSummary transactions={transactions} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <AddTransactionForm siteId={siteId} />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <Calculator className="w-8 h-8 text-indigo-600" />
                                Transaction Logs
                            </h2>
                            <TransactionList transactions={transactions as any} siteId={siteId} role={role} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
