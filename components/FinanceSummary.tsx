'use client';

import { TrendingUp, TrendingDown, Wallet, IndianRupee } from 'lucide-react';

interface FinanceSummaryProps {
    transactions: any[];
}

export default function FinanceSummary({ transactions }: FinanceSummaryProps) {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-shadow">
                <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Income</span>
                    <span className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                        <IndianRupee className="w-5 h-5" />
                        {totalIncome.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-shadow">
                <div className="p-4 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <TrendingDown className="w-8 h-8" />
                </div>
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Expense</span>
                    <span className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                        <IndianRupee className="w-5 h-5" />
                        {totalExpense.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className={`p-6 rounded-3xl shadow-sm border flex items-center gap-5 group hover:shadow-md transition-shadow ${balance >= 0 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-orange-50/50 border-orange-100'}`}>
                <div className={`p-4 rounded-2xl transition-colors ${balance >= 0 ? 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'}`}>
                    <Wallet className="w-8 h-8" />
                </div>
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Net Balance</span>
                    <span className={`text-2xl font-black flex items-center tracking-tight ${balance >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>
                        <IndianRupee className="w-5 h-5" />
                        {balance.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
