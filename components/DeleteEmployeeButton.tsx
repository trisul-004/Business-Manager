'use client';

import { deleteEmployee } from "@/actions/employees";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteEmployeeButton({ employeeId, employeeName, siteId }: { employeeId: string, employeeName: string, siteId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${employeeName}? This will also delete all their attendance records.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteEmployee(employeeId, siteId);
            if (result.error) {
                alert(result.error);
            }
        } catch (error) {
            console.error("Failed to delete employee:", error);
            alert("Failed to delete employee. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Delete Employee"
        >
            <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
        </button>
    );
}
