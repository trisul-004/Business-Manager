'use client';

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Asset {
    id: string;
    name: string;
    type: string;
    quantity: string | null;
    description: string | null;
    createdAt: Date;
}

interface ExportInventoryPDFProps {
    assets: Asset[];
    siteName: string;
}

export default function ExportInventoryPDF({ assets, siteName }: ExportInventoryPDFProps) {
    const handleExport = () => {
        const doc = new jsPDF() as any;

        doc.setFontSize(20);
        doc.text(`Inventory Report: ${siteName}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableData = assets.map(a => [
            a.name,
            a.type.toUpperCase(),
            a.quantity || '-',
            a.description || '-',
            new Date(a.createdAt).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Asset Name', 'Type', 'Quantity', 'Description', 'Added Date']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
        });

        doc.save(`${siteName}_Inventory_Report.pdf`);
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
