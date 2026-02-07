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
    const attendanceMap = new Map<string, string>(todayAttendance.map((a: { employeeId: string; status: string }) => [a.employeeId, a.status]));

    // Calculate Summary Stats
    const summary = {
        total: siteEmployees.length,
        present: todayAttendance.filter((a: { status: string }) => a.status === 'present').length,
        absent: todayAttendance.filter((a: { status: string }) => a.status === 'absent').length,
        pending: siteEmployees.length - todayAttendance.length
    };

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

                <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                        <Link
                            href={`/manager/site/${siteId}/history`}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm"
                        >
                            <CalendarIcon className="w-5 h-5 text-gray-400" />
                            History
                        </Link>
                        <Link
                            href={`/manager/site/${siteId}/inventory`}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm"
                        >
                            <Boxes className="w-5 h-5 text-gray-400" />
                            Inventory
                        </Link>
                        <Link
                            href={`/manager/site/${siteId}/finances`}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm"
                        >
                            <IndianRupee className="w-5 h-5 text-gray-400" />
                            Finances
                        </Link>
                        <Link
                            href={`/manager/site/${siteId}/attendance`}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
                        >
                            <ScanFace className="w-5 h-5" />
                            Launch Scanner
                        </Link>
                        <UserButton />
                    </div>
                </header>

                {/* Daily Attendance Summary Card */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <Users className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-2xl font-black text-gray-900">{summary.total}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Size</span>
                    </div>
                    <div className="bg-green-50/50 p-6 rounded-2xl shadow-sm border border-green-100/50 flex flex-col items-center text-center group transition-colors hover:bg-green-50">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
                        <span className="text-2xl font-black text-green-700">{summary.present}</span>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Present</span>
                    </div>
                    <div className="bg-red-50/50 p-6 rounded-2xl shadow-sm border border-red-100/50 flex flex-col items-center text-center group transition-colors hover:bg-red-50">
                        <XCircle className="w-6 h-6 text-red-600 mb-2" />
                        <span className="text-2xl font-black text-red-700">{summary.absent}</span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Absent</span>
                    </div>
                    <div className="bg-indigo-50/50 p-6 rounded-2xl shadow-sm border border-indigo-100/50 flex flex-col items-center text-center group transition-colors hover:bg-indigo-50">
                        <Clock className="w-6 h-6 text-indigo-600 mb-2" />
                        <span className="text-2xl font-black text-indigo-700">{summary.pending}</span>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Awaiting Status</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Employee Form */}
                    <div className="lg:col-span-1">
                        <AddEmployeeForm siteId={siteId} />
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
                                    siteEmployees.map(emp => {
                                        const status = attendanceMap.get(emp.id);

                                        return (
                                            <div key={emp.id} className="group border border-gray-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg shadow-sm">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">{emp.name}</h3>
                                                        <p className="text-sm text-gray-500 font-medium">{emp.role}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {role === 'supervisor' && (
                                                        <DeleteEmployeeButton
                                                            employeeId={emp.id}
                                                            employeeName={emp.name}
                                                            siteId={siteId}
                                                        />
                                                    )}

                                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                                        {status ? (
                                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${status === 'present'
                                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                                : 'bg-red-50 border-red-200 text-red-700'
                                                                }`}>
                                                                {status === 'present' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                                {String(status).toUpperCase()}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 w-full">
                                                                <form action={markAttendance} className="flex gap-2 w-full">
                                                                    <input type="hidden" name="employeeId" value={emp.id} />
                                                                    <input type="hidden" name="siteId" value={siteId} />
                                                                    <button
                                                                        name="status"
                                                                        value="present"
                                                                        type="submit"
                                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors font-bold text-xs shadow-sm"
                                                                    >
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        Present
                                                                    </button>
                                                                    <button
                                                                        name="status"
                                                                        value="absent"
                                                                        type="submit"
                                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold text-xs shadow-sm"
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                        Absent
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        )}
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
