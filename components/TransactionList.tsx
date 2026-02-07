'use client';

import { useState } from 'react';
import { IndianRupee, Trash2, Calendar, FileText, ArrowUpCircle, ArrowDownCircle, Search, Filter } from 'lucide-react';
import { deleteTransaction } from '@/actions/finances';

interface Transaction {
    id: string;
    siteId: string;
    amount: string;
    type: string;
    category: string;
    description: string | null;
    date: string;
    createdAt: Date;
}

interface TransactionListProps {
    transactions: Transaction[];
    siteId: string;
}

export default function TransactionList({ transactions, siteId }: TransactionListProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction record?")) return;

        setIsDeleting(id);
        try {
            const result = await deleteTransaction(id, siteId);
            if (!result.success) {
                alert(result.error);
            }
        } catch (error) {
            alert("Failed to delete transaction.");
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (transactions.length === 0) {
        return (
            <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4 text-gray-300">
                    <FileText className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No Transactions Logged</h3>
                <p className="text-gray-500 max-w-sm">Start by adding your first income or expense for this site.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gray-100 p-2 rounded-2xl flex items-center gap-4 border border-transparent focus-within:border-indigo-600 focus-within:bg-white transition-all">
                <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by category or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none font-bold text-gray-900 w-full py-3"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{new Date(t.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{t.category}</span>
                                            {t.description && <span className="text-xs text-gray-500 font-medium max-w-[200px] truncate">{t.description}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${t.type === 'income'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                            {t.type === 'income' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-lg tracking-tight">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <IndianRupee className={`w-4 h-4 ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                                            <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                {parseFloat(t.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            disabled={isDeleting === t.id}
                                            className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Record"
                                        >
                                            <Trash2 className={`w-5 h-5 ${isDeleting === t.id ? 'animate-pulse' : ''}`} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
