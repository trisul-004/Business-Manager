'use client';

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
    id: string;
    amount: string;
    type: string;
    category: string;
    description: string | null;
    date: string;
}

interface ExportFinancePDFProps {
    transactions: Transaction[];
    siteName: string;
}

export default function ExportFinancePDF({ transactions, siteName }: ExportFinancePDFProps) {
    const handleExport = () => {
        const doc = new jsPDF() as any;

        // Add Header
        doc.setFontSize(20);
        doc.text(`Finance Report: ${siteName}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Calculate Totals
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const balance = totalIncome - totalExpense;

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Income: Rs. ${totalIncome.toLocaleString()}`, 14, 40);
        doc.text(`Total Expense: Rs. ${totalExpense.toLocaleString()}`, 14, 46);
        doc.text(`Net Balance: Rs. ${balance.toLocaleString()}`, 14, 52);

        // Add Table
        const tableData = transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.category,
            t.type.toUpperCase(),
            `Rs. ${parseFloat(t.amount).toLocaleString()}`,
            t.description || '-'
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['Date', 'Category', 'Type', 'Amount', 'Description']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        doc.save(`${siteName}_Finance_Report.pdf`);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-bold shadow-sm"
        >
            <Download className="w-5 h-5 text-gray-400" />
            Export PDF
        </button>
    );
}
