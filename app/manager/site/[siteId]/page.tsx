import { getEmployees, createEmployee } from "@/actions/employees";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import DeleteEmployeeButton from "@/components/DeleteEmployeeButton";
import { getAttendanceToday, markAttendance } from "@/actions/attendance";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { sites as sitesTable, siteManagers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, UserPlus, MapPin, CheckCircle2, XCircle, Clock, ScanFace, Calendar as CalendarIcon, Boxes, IndianRupee } from "lucide-react";

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

    // Fetch today's attendance
    const employeeIds = siteEmployees.map(e => e.id);
    const todayAttendance = await getAttendanceToday(employeeIds);

    // Create a map for quick lookup
    const attendanceMap = new Map<string, any>(todayAttendance.map((a: any) => [a.employeeId, a]));

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate Summary Stats
    const summary = {
        total: siteEmployees.length,
        present: todayAttendance.filter((a: { status: string }) => a.status === 'present').length,
        checkedIn: todayAttendance.filter((a: { status: string }) => a.status === 'checked-in').length,
        absent: todayAttendance.filter((a: { status: string }) => a.status === 'absent').length,
        pending: siteEmployees.length - todayAttendance.length
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <nav className="mb-6 md:mb-8">
                    <Link
                        href={role === "supervisor" ? "/supervisor" : "/manager"}
                        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors w-fit text-sm font-bold"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to {role === "supervisor" ? "Supervisor Portal" : "Site Selection"}
                    </Link>
                </nav>

                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-full lg:w-auto">
                        <div className="flex items-center justify-between lg:justify-start gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{site.name}</h1>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">Active</span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-1 text-sm font-medium">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            {site.address}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full lg:w-auto">
                        <Link
                            href={`/manager/site/${siteId}/history`}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors font-bold text-xs md:text-sm shadow-sm"
                        >
                            <CalendarIcon className="w-5 h-5 text-indigo-500" />
                            <span className="sm:inline">History</span>
                        </Link>
                        <Link
                            href={`/manager/site/${siteId}/inventory`}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors font-bold text-xs md:text-sm shadow-sm"
                        >
                            <Boxes className="w-5 h-5 text-emerald-500" />
                            <span className="sm:inline">Inventory</span>
                        </Link>
                        <Link
                            href={`/manager/site/${siteId}/finances`}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors font-bold text-xs md:text-sm shadow-sm"
                        >
                            <IndianRupee className="w-5 h-5 text-orange-500" />
                            <span className="sm:inline">Finances</span>
                        </Link>
                        <div className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto flex items-center">
                            <UserButton />
                        </div>
                    </div>
                </header>

                {/* Daily Attendance Summary Card */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <Users className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-2xl font-black text-gray-900">{summary.total}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Size</span>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-2xl shadow-sm border border-blue-100/50 flex flex-col items-center text-center group transition-colors hover:bg-blue-50">
                        <ScanFace className="w-6 h-6 text-blue-600 mb-2" />
                        <span className="text-2xl font-black text-blue-700">{summary.checkedIn}</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">On Site</span>
                    </div>
                    <div className="bg-green-50/50 p-6 rounded-2xl shadow-sm border border-green-100/50 flex flex-col items-center text-center group transition-colors hover:bg-green-50">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
                        <span className="text-2xl font-black text-green-700">{summary.present}</span>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Completed</span>
                    </div>
                    <div className="bg-red-50/50 p-6 rounded-2xl shadow-sm border border-red-100/50 flex flex-col items-center text-center group transition-colors hover:bg-red-50">
                        <XCircle className="w-6 h-6 text-red-600 mb-2" />
                        <span className="text-2xl font-black text-red-700">{summary.absent}</span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Absent</span>
                    </div>
                    <div className="bg-indigo-50/50 p-6 rounded-2xl shadow-sm border border-indigo-100/50 flex flex-col items-center text-center group transition-colors hover:bg-indigo-50">
                        <Clock className="w-6 h-6 text-indigo-600 mb-2" />
                        <span className="text-2xl font-black text-indigo-700">{summary.pending}</span>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Awaiting</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Employee Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:sticky lg:top-8">
                            <h2 className="text-xl md:text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-indigo-600" />
                                Add Member
                            </h2>
                            <AddEmployeeForm siteId={siteId} />
                        </div>
                    </div>

                    {/* Employee List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2 leading-tight">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                        Directory
                                    </h2>
                                    <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit">
                                        {siteEmployees.length} Members
                                    </span>
                                </div>
                                <Link
                                    href={`/manager/site/${siteId}/attendance`}
                                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 font-bold text-xs md:text-sm shadow-lg shadow-indigo-100 w-full sm:w-auto"
                                >
                                    <ScanFace className="w-5 h-5" />
                                    <span>Scan Face</span>
                                </Link>
                            </div>

                            <div className="grid gap-4">
                                {siteEmployees.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500">No employees registered for this site.</p>
                                    </div>
                                ) : (
                                    siteEmployees.map(emp => {
                                        const record = attendanceMap.get(emp.id);

                                        return (
                                            <div key={emp.id} className="group border border-gray-100 p-5 rounded-3xl hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm border border-indigo-100">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{emp.name}</h3>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{emp.role}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                                    {record && (
                                                        <>
                                                            <div className="text-center min-w-[60px]">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">In</p>
                                                                <p className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200/50">
                                                                    {formatTime(record.checkInTime)}
                                                                </p>
                                                            </div>
                                                            <div className="text-center min-w-[60px]">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Out</p>
                                                                <p className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200/50">
                                                                    {formatTime(record.checkOutTime)}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
                                                        {role === 'supervisor' && (
                                                            <DeleteEmployeeButton
                                                                employeeId={emp.id}
                                                                employeeName={emp.name}
                                                                siteId={siteId}
                                                            />
                                                        )}

                                                        <div className="flex items-center gap-3">
                                                            {record && (
                                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-sm ${record.status === 'present'
                                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                                    : record.status === 'checked-in'
                                                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                                        : 'bg-red-50 border-red-200 text-red-700'
                                                                    }`}>
                                                                    {record.status === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : record.status === 'checked-in' ? <ScanFace className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                                    {record.status === 'checked-in' ? 'On Site' : record.status}
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-2">
                                                                <form action={async (fd) => { 'use server'; await markAttendance(fd); }} className="flex gap-2">
                                                                    <input type="hidden" name="employeeId" value={emp.id} />
                                                                    <input type="hidden" name="siteId" value={siteId} />

                                                                    {record?.status === 'checked-in' && role === 'supervisor' && (
                                                                        <button
                                                                            name="status"
                                                                            value="present"
                                                                            type="submit"
                                                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors font-bold text-[10px] uppercase tracking-wider shadow-sm"
                                                                        >
                                                                            <CheckCircle2 className="w-3 h-3" />
                                                                            Set Present
                                                                        </button>
                                                                    )}

                                                                    {(!record || record.status !== 'absent') && (
                                                                        <button
                                                                            name="status"
                                                                            value="absent"
                                                                            type="submit"
                                                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold text-[10px] uppercase tracking-wider shadow-sm"
                                                                        >
                                                                            <XCircle className="w-3 h-3" />
                                                                            {record ? "Set Absent" : "Mark Absent"}
                                                                        </button>
                                                                    )}
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
