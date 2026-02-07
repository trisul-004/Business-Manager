'use client';

import { useState } from 'react';
import { IndianRupee, PlusCircle, MinusCircle, Calendar, FileText, Save, X } from 'lucide-react';
import { createTransaction } from '@/actions/finances';

interface AddTransactionFormProps {
    siteId: string;
}

const CATEGORIES = [
    "Advance Payment",
    "Final Payment",
    "Salaries",
    "Material Purchase",
    "Fuel",
    "Maintenance",
    "Electricity",
    "Water",
    "Other"
];

export default function AddTransactionForm({ siteId }: AddTransactionFormProps) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('siteId', siteId);
        formData.append('amount', amount);
        formData.append('type', type);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('date', date);

        try {
            const result = await createTransaction(formData);
            if (result.success) {
                setAmount('');
                setDescription('');
                alert("Transaction logged successfully!");
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Failed to log transaction.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <IndianRupee className="w-6 h-6 text-indigo-600" />
                Log Transaction
            </h2>

            <div className="space-y-6">
                <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <PlusCircle className="w-4 h-4" />
                        Income
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MinusCircle className="w-4 h-4" />
                        Expense
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
                        <input
                            type="number"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold appearance-none"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a remark..."
                        rows={3}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !amount}
                    className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${type === 'income' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                >
                    {isSubmitting ? 'Processing...' : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Transaction
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
