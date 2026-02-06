'use client';

import { useState } from 'react';
import { createEmployee } from "@/actions/employees";
import FaceRegistration from './FaceRegistration';
import { UserPlus, ChevronDown, ChevronUp } from "lucide-react";

export default function AddEmployeeForm({ siteId }: { siteId: string }) {
    const [faceDescriptor, setFaceDescriptor] = useState<string>('');
    const [showCamera, setShowCamera] = useState(false);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-green-600" />
                Add Member
            </h2>
            <form action={createEmployee} className="space-y-5">
                <input type="hidden" name="siteId" value={siteId} />
                <input type="hidden" name="faceDescriptor" value={faceDescriptor} />

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
                                // Optional: Hide camera after success if you want
                                // setShowCamera(false); 
                            }} />
                        </div>
                    )}

                    {faceDescriptor && (
                        <div className="text-xs text-green-600 font-bold mb-2 flex items-center gap-1">
                            ✓ Face data ready to submit
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-md font-medium text-lg transform hover:-translate-y-0.5"
                >
                    Add Employee
                </button>
            </form>
        </div>
    );
}
