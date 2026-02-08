'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { deleteSite } from '@/actions/sites';
import { useRouter } from 'next/navigation';

export default function DeleteSiteButton({ siteId, siteName }: { siteId: string, siteName: string }) {
    const [step, setStep] = useState<'initial' | 'confirm' | 'final'>('initial');
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteSite(siteId);
            if (result && result.success) {
                router.push('/supervisor');
            } else {
                alert(`Failed to delete site: ${result && result.error ? result.error : 'Unknown error'}`);
                setStep('initial');
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred');
            setStep('initial');
        } finally {
            setIsDeleting(false);
        }
    };

    if (step === 'initial') {
        return (
            <button
                onClick={() => setStep('confirm')}
                className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors font-bold text-sm shadow-sm"
            >
                <Trash2 className="w-4 h-4" />
                Delete Site
            </button>
        );
    }

    if (step === 'confirm') {
        return (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <span className="text-amber-600 font-bold text-sm flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4" />
                    Are you sure?
                </span>
                <button
                    onClick={() => setStep('final')}
                    className="bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors font-bold text-xs"
                >
                    Yes, Continue
                </button>
                <button
                    onClick={() => setStep('initial')}
                    className="text-gray-400 hover:text-gray-600 p-1"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-red-600 font-black text-sm flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 uppercase tracking-tight">
                <AlertTriangle className="w-4 h-4" />
                Permanent Delete
            </span>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-bold text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
            </button>
            <button
                onClick={() => setStep('initial')}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 p-1"
            >
                <XCircle className="w-5 h-5" />
            </button>
        </div>
    );
}
