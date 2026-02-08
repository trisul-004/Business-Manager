
import { getSites, createSite, removeManager } from "@/actions/sites";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Building2, MapPin, Users, Plus, ExternalLink, ShieldCheck, UserMinus } from "lucide-react";
import CopyUserId from "../components/CopyUserId";

export default async function SupervisorDashboard() {
    const sites = await getSites();

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <ShieldCheck className="w-9 h-9 text-indigo-600" />
                            Supervisor Portal
                        </h1>
                        <p className="text-gray-500 mt-1">Full oversight of sites, managers, and personnel</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">Supervisor Access</span>
                        <UserButton />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Create Site Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" />
                                Add Site
                            </h2>
                            <form action={createSite} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="e.g. West Campus"
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                    <input
                                        name="address"
                                        type="text"
                                        placeholder="Full Location"
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 text-gray-900 transition-all font-medium placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md font-medium text-lg transform hover:-translate-y-0.5"
                                >
                                    Launch Site
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sites Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sites.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500 text-lg">Your site registry is currently empty.</p>
                                </div>
                            ) : (
                                sites.map((site: any) => (
                                    <div key={site.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                                        <div className="p-6 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight">{site.name}</h3>
                                                <Link
                                                    href={`/manager/site/${site.id}`}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                            <p className="text-gray-500 text-xs flex items-center gap-1 font-medium">
                                                <MapPin className="w-3 h-3" />
                                                {site.address}
                                            </p>
                                        </div>

                                        <div className="p-6 flex-1 space-y-6">
                                            {/* Managers Section */}
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <ShieldCheck className="w-3 h-3 text-indigo-500" />
                                                    Active Managers ({site.managers.length})
                                                </h4>
                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    {site.managers.length === 0 ? (
                                                        <p className="text-xs text-gray-400 italic font-medium">No managers assigned</p>
                                                    ) : (
                                                        site.managers.map((m: any) => (
                                                            <div key={m.userId} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:border-indigo-300 group/manager">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xs text-white font-black uppercase shadow-inner shrink-0">
                                                                        {m.name.charAt(0)}
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="text-sm font-extrabold text-gray-900 leading-none mb-1 truncate">
                                                                            {m.name}
                                                                        </span>
                                                                        <CopyUserId userId={m.userId} />
                                                                    </div>
                                                                </div>

                                                                <form action={removeManager} className="opacity-100 lg:opacity-0 lg:group-hover/manager:opacity-100 transition-opacity">
                                                                    <input type="hidden" name="siteId" value={site.id} />
                                                                    <input type="hidden" name="userId" value={m.userId} />
                                                                    <button
                                                                        type="submit"
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                        title="Remove Manager"
                                                                    >
                                                                        <UserMinus className="w-4 h-4" />
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Employees Section */}
                                            <div>
                                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Users className="w-3 h-3 text-green-500" />
                                                    Site Workforce
                                                </h4>
                                                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50 flex items-center justify-between group">
                                                    <div className="flex flex-col">
                                                        <span className="text-2xl font-black text-green-700 tracking-tight">
                                                            {site.employeeCount}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-green-600/70 uppercase tracking-tighter">
                                                            Total Personnel
                                                        </span>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Users className="w-6 h-6 text-green-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                                            <AssignManagerForm siteId={site.id} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { assignManager } from "@/actions/sites";

function AssignManagerForm({ siteId }: { siteId: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter block ml-1">
                USER-ID TO ASSIGN SIGHT
            </label>
            <form action={assignManager} className="flex gap-2">
                <input type="hidden" name="siteId" value={siteId} />
                <input
                    type="text"
                    name="userId"
                    placeholder="e.g. user_2n..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                    required
                />
                <button
                    type="submit"
                    className="bg-gray-900 text-white p-1.5 rounded-lg hover:bg-black transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
