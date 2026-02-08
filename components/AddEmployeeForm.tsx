'use client';

import { useState } from 'react';
import { createEmployee } from "@/actions/employees";
import FaceRegistration from './FaceRegistration';
import { UserPlus, ChevronDown, ChevronUp } from "lucide-react";

export default function AddEmployeeForm({ siteId }: { siteId: string }) {
    const [faceDescriptor, setFaceDescriptor] = useState<string>('');
    const [showCamera, setShowCamera] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        const formData = new FormData(e.currentTarget);
        formData.append('faceDescriptor', faceDescriptor);

        try {
            const result = await createEmployee(formData);
            if (result?.success) {
                setStatus({ type: 'success', message: 'Member added successfully!' });
                setFaceDescriptor('');
                setShowCamera(false);
                (e.target as HTMLFormElement).reset();
            } else {
                setStatus({ type: 'error', message: result?.error || 'Failed to add member' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-green-600" />
                Add Member
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <input type="hidden" name="siteId" value={siteId} />

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                        name="name"
                        type="text"
                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 py-3 px-4 bg-gray-50 text-gray-900 transition-all placeholder:text-gray-400"
                        placeholder="e.g. John Smith"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title / Role</label>
                    <input
                        name="role"
                        type="text"
                        placeholder="e.g. Site Supervisor"
                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 py-3 px-4 bg-gray-50 text-gray-900 transition-all placeholder:text-gray-400"
                        required
                    />
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <button
                        type="button"
                        onClick={() => setShowCamera(!showCamera)}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-3"
                    >
                        {showCamera ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {faceDescriptor ? 'Update Face Data' : 'Register Face (Recommended)'}
                    </button>

                    {showCamera && (
                        <div className="mb-4">
                            <FaceRegistration onDescriptorGenerated={(desc) => {
                                setFaceDescriptor(desc);
                            }} />
                        </div>
                    )}

                    {faceDescriptor && (
                        <div className="text-xs text-green-600 font-bold mb-2 flex items-center gap-1">
                            ✓ Face data ready to submit
                        </div>
                    )}
                </div>

                {status && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {status.type === 'success' ? '✓' : '⚠'} {status.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-md font-medium text-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                    {isSubmitting ? 'Adding...' : 'Add Employee'}
                </button>
            </form>
        </div>
    );
}
