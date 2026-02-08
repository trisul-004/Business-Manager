'use client';

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Employee {
    id: string;
    name: string;
    role: string;
}

interface AttendanceRecord {
    employeeId: string;
    date: string;
    status: string;
    checkInTime?: string | null;
    checkOutTime?: string | null;
}

interface ExportAttendancePDFProps {
    siteName: string;
    monthName: string;
    year: number;
    employees: Employee[];
    attendance: AttendanceRecord[];
}

export default function ExportAttendancePDF({ siteName, monthName, year, employees, attendance }: ExportAttendancePDFProps) {
    const handleExport = () => {
        const doc = new jsPDF() as any;

        doc.setFontSize(20);
        doc.text(`Attendance Report: ${siteName}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Month: ${monthName} ${year}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

        // Group attendance by employee for the table
        const tableData = employees.map(emp => {
            const empRecords = attendance.filter(a => a.employeeId === emp.id);
            const todayRecord = empRecords.find(r => r.date === new Date().toISOString().split('T')[0]); // Example: for simple reports

            const formatTime = (dateStr: string | undefined | null) => {
                if (!dateStr) return '--:--';
                return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            };

            const presentDays = empRecords.filter(r => r.status === 'present').length;
            const latestIn = empRecords.length > 0 ? formatTime(empRecords[empRecords.length - 1].checkInTime) : '--:--';
            const latestOut = empRecords.length > 0 ? formatTime(empRecords[empRecords.length - 1].checkOutTime) : '--:--';

            return [
                emp.name,
                emp.role,
                presentDays.toString(),
                latestIn,
                latestOut,
            ];
        });

        autoTable(doc, {
            startY: 45,
            head: [['Employee Name', 'Role', 'Days Present', 'Latest In', 'Latest Out']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
        });

        doc.save(`${siteName}_Attendance_${monthName}_${year}.pdf`);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-bold text-sm shadow-sm"
        >
            <Download className="w-4 h-4" />
            Export Monthly
        </button>
    );
}
