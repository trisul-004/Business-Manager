'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import { getAttendanceRange } from '@/actions/attendance';
import ExportAttendancePDF from '@/components/ExportAttendancePDF';
import Link from 'next/link';

interface Employee {
    id: string;
    name: string;
    role: string;
}

interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string;
    status: string;
}

interface AttendanceHistoryProps {
    siteId: string;
    siteName: string;
    employees: Employee[];
    initialAttendance: AttendanceRecord[];
}

export default function AttendanceHistory({ siteId, siteName, employees, initialAttendance }: AttendanceHistoryProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
    const [isLoading, setIsLoading] = useState(false);

    // Calendar logic
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthDays = useMemo(() => {
        const days = [];
        const prevMonthDays = daysInMonth(year, month - 1);
        const startDay = firstDayOfMonth(year, month);
        const totalDays = daysInMonth(year, month);

        // Padding from previous month
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthDays - i).toISOString().split('T')[0] });
        }

        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            days.push({ day: i, currentMonth: true, date: new Date(year, month, i).toISOString().split('T')[0] });
        }

        // Padding for next month
        const remainingSlots = 42 - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i).toISOString().split('T')[0] });
        }

        return days;
    }, [year, month]);

    const handlePrevMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        setCurrentDate(newDate);
        fetchMonthAttendance(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(year, month + 1, 1);
        setCurrentDate(newDate);
        fetchMonthAttendance(newDate);
    };

    const fetchMonthAttendance = async (date: Date) => {
        setIsLoading(true);
        const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

        try {
            const data = await getAttendanceRange(employees.map(e => e.id), start, end);
            setAttendance(data as any);
        } catch (err) {
            console.error("Failed to fetch attendance range", err);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedDayAttendance = useMemo(() => {
        return attendance.filter(a => a.date === selectedDate);
    }, [attendance, selectedDate]);

    const attendanceStats = useMemo(() => {
        const present = selectedDayAttendance.filter(a => a.status === 'present').length;
        const absent = selectedDayAttendance.filter(a => a.status === 'absent').length;
        const total = employees.length;
        const pending = total - selectedDayAttendance.length;

        return { present, absent, total, pending };
    }, [selectedDayAttendance, employees]);

    const getDayStatus = (dateStr: string) => {
        const dayRecord = attendance.filter(a => a.date === dateStr);
        if (dayRecord.length === 0) return null;
        const present = dayRecord.filter(a => a.status === 'present').length;
        const total = employees.length;
        return { present, total };
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <nav className="mb-8">
                    <Link
                        href={`/manager/site/${siteId}`}
                        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors w-fit"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </nav>

                <header className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance History</h1>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">{siteName}</span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            View historical logs and daily statistics
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ExportAttendancePDF
                            siteName={siteName}
                            monthName={monthNames[month]}
                            year={year}
                            employees={employees}
                            attendance={attendance}
                        />
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-indigo-600">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-4 font-bold text-gray-800 min-w-32 text-center">
                                {monthNames[month]} {year}
                            </span>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-all text-gray-600 hover:text-indigo-600">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Side */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="grid grid-cols-7 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {monthDays.map((dateObj, idx) => {
                                    const isSelected = selectedDate === dateObj.date;
                                    const isToday = new Date().toISOString().split('T')[0] === dateObj.date;
                                    const status = getDayStatus(dateObj.date);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDate(dateObj.date)}
                                            className={`
                                                relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all p-1
                                                ${!dateObj.currentMonth ? 'text-gray-300 opacity-50' : 'text-gray-700'}
                                                ${isSelected ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100 z-10' : 'hover:bg-gray-50'}
                                                ${isToday && !isSelected ? 'border-2 border-indigo-600 text-indigo-600' : ''}
                                            `}
                                        >
                                            <span className="text-sm font-bold">{dateObj.day}</span>
                                            {status && dateObj.currentMonth && !isSelected && (
                                                <div className="mt-1 flex gap-0.5">
                                                    <div className={`w-1 h-1 rounded-full ${status.present === status.total ? 'bg-green-500' : 'bg-orange-400'}`} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Date Stats Overview */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Daily Stats — {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-2xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl text-green-600 shadow-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-green-700">Present</span>
                                    </div>
                                    <span className="text-lg font-black text-green-700">{attendanceStats.present}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-2xl border border-red-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm">
                                            <XCircle className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-red-700">Absent</span>
                                    </div>
                                    <span className="text-lg font-black text-red-700">{attendanceStats.absent}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-bold text-indigo-700">Awaiting</span>
                                    </div>
                                    <span className="text-lg font-black text-indigo-700">{attendanceStats.pending}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-full">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Attendance Logs</h2>
                                    <p className="text-sm font-medium text-gray-500">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />}
                            </div>

                            <div className="space-y-3">
                                {employees.map(emp => {
                                    const record = selectedDayAttendance.find(a => a.employeeId === emp.id);
                                    const status = record?.status;

                                    return (
                                        <div key={emp.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{emp.name}</p>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{emp.role}</p>
                                                </div>
                                            </div>

                                            {status ? (
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status === 'present'
                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {status}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                                                    No Record
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
