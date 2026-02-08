'use client';

import { useState } from 'react';
import Link from "next/link";
import { Users, ScanFace, CheckCircle2, XCircle } from "lucide-react";
import DeleteEmployeeButton from "./DeleteEmployeeButton";
import EmployeeDetailModal from "./EmployeeDetailModal";
import { markAttendance } from "@/actions/attendance";
import { formatTime } from "@/utils/format";

interface Employee {
    id: string;
    siteId: string;
    name: string;
    role: string;
    mobileNumber: string | null;
    aadharNumber: string | null;
    bankAccountNumber: string | null;
    mothersName: string | null;
    fathersName: string | null;
    salaryPerDay: string | null;
}

interface AttendanceRecord {
    employeeId: string;
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
}

export default function EmployeeDirectory({
    siteEmployees,
    attendanceRecords,
    siteId,
    role
}: {
    siteEmployees: Employee[];
    attendanceRecords: AttendanceRecord[];
    siteId: string;
    role: string;
}) {
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const attendanceMap = new Map<string, AttendanceRecord>(
        attendanceRecords.map(a => [a.employeeId, a])
    );

    const formatTimeLocal = (dateStr: string | null) => {
        if (!dateStr) return '--:--';
        return formatTime(dateStr);
    };

    return (
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
                            <div
                                key={emp.id}
                                onClick={() => setSelectedEmployee(emp)}
                                className="group cursor-pointer border border-gray-100 p-5 rounded-3xl hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm border border-indigo-100">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{emp.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{emp.role}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto overflow-x-auto pb-2 md:pb-0" onClick={(e) => e.stopPropagation()}>
                                    {record && role !== 'supervisor' && (
                                        <>
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">In</p>
                                                <p className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200/50">
                                                    {formatTimeLocal(record.checkInTime)}
                                                </p>
                                            </div>
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Out</p>
                                                <p className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200/50">
                                                    {formatTimeLocal(record.checkOutTime)}
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
                                                <form action={async (fd) => { await markAttendance(fd); }} className="flex gap-2">
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

            {selectedEmployee && (
                <EmployeeDetailModal
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />
            )}
        </div>
    );
}
