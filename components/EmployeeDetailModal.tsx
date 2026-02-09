'use client';

import { useState } from 'react';
import { updateEmployee } from "@/actions/employees";
import { X, User, Phone, CreditCard, Users, IndianRupee, Save, Loader2 } from "lucide-react";

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

export default function EmployeeDetailModal({
    employee,
    onClose
}: {
    employee: Employee;
    onClose: () => void
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        const formData = new FormData(e.currentTarget);
        formData.append('id', employee.id);
        formData.append('siteId', employee.siteId);

        try {
            const result = await updateEmployee(formData);
            if (result?.success) {
                setStatus({ type: 'success', message: 'Employee updated successfully!' });
                setIsEditing(false);
                // Refresh is handled by revalidatePath in the action
                setTimeout(() => onClose(), 1500);
            } else {
                setStatus({ type: 'error', message: result?.error || 'Failed to update employee' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="relative p-5 md:p-8 overflow-y-auto custom-scrollbar">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-indigo-50">
                            {employee.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">{employee.name}</h2>
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{employee.role}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    Personal Details
                                </h3>

                                <div className="space-y-3">
                                    <DetailField
                                        label="Full Name"
                                        name="name"
                                        defaultValue={employee.name}
                                        isEditing={isEditing}
                                        required
                                    />
                                    <DetailField
                                        label="Job Title / Role"
                                        name="role"
                                        defaultValue={employee.role}
                                        isEditing={isEditing}
                                        required
                                    />
                                    <DetailField
                                        label="Mobile Number"
                                        name="mobileNumber"
                                        defaultValue={employee.mobileNumber || ''}
                                        isEditing={isEditing}
                                        placeholder="e.g. +91 98765 43210"
                                        icon={<Phone className="w-3.5 h-3.5" />}
                                    />
                                </div>
                            </div>

                            {/* Family & Finance Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    Family & Finance
                                </h3>

                                <div className="space-y-3">
                                    <DetailField
                                        label="Mother's Name"
                                        name="mothersName"
                                        defaultValue={employee.mothersName || ''}
                                        isEditing={isEditing}
                                        placeholder="Not provided"
                                    />
                                    <DetailField
                                        label="Father's Name"
                                        name="fathersName"
                                        defaultValue={employee.fathersName || ''}
                                        isEditing={isEditing}
                                        placeholder="Not provided"
                                    />
                                    <DetailField
                                        label="Salary Per Day"
                                        name="salaryPerDay"
                                        defaultValue={employee.salaryPerDay || ''}
                                        isEditing={isEditing}
                                        placeholder="e.g. 500"
                                        icon={<IndianRupee className="w-3.5 h-3.5" />}
                                    />
                                </div>
                            </div>

                            {/* Identification Section */}
                            <div className="md:col-span-2 space-y-4 pt-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" />
                                    Identification & Banking
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailField
                                        label="Aadhar Card Number"
                                        name="aadharNumber"
                                        defaultValue={employee.aadharNumber || ''}
                                        isEditing={isEditing}
                                        placeholder="12-digit Aadhar Number"
                                    />
                                    <DetailField
                                        label="Bank Account Number"
                                        name="bankAccountNumber"
                                        defaultValue={employee.bankAccountNumber || ''}
                                        isEditing={isEditing}
                                        placeholder="Not provided"
                                    />
                                </div>
                            </div>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {status.type === 'success' ? '✓' : '⚠'} {status.message}
                            </div>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setStatus(null);
                                        }}
                                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 font-bold shadow-lg shadow-indigo-100 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full bg-gray-900 text-white px-6 py-4 rounded-[1.5rem] hover:bg-gray-800 transition-all active:scale-[0.98] font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
                                >
                                    Update Information
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function DetailField({
    label,
    name,
    defaultValue,
    isEditing,
    placeholder,
    required,
    icon
}: {
    label: string,
    name: string,
    defaultValue: string,
    isEditing: boolean,
    placeholder?: string,
    required?: boolean,
    icon?: React.ReactNode
}) {
    if (isEditing) {
        return (
            <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">{label}</label>
                <div className="relative group">
                    <input
                        name={name}
                        defaultValue={defaultValue}
                        placeholder={placeholder}
                        required={required}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:bg-white focus:border-indigo-500 outline-none transition-all group-hover:border-gray-200"
                    />
                    {icon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-center justify-between">
                <p className={`font-bold text-sm ${defaultValue ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                    {defaultValue || placeholder || 'Not specified'}
                </p>
                {icon && <div className="text-gray-300 group-hover:text-indigo-200 transition-colors">{icon}</div>}
            </div>
        </div>
    );
}
