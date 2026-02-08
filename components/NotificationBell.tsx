'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, Users, Package, Calculator, X } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '@/actions/notifications';
import { formatTime } from '@/utils/format';

interface Notification {
    id: string;
    siteId: string;
    title: string;
    message: string;
    type: string;
    isRead: string;
    createdAt: Date;
}

export default function NotificationBell({ siteId }: { siteId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getNotifications(siteId);
            setNotifications(data as any);
        };
        fetchNotifications();

        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [siteId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => n.isRead === 'false').length;

    const handleMarkAsRead = async (id: string) => {
        const result = await markNotificationAsRead(id, siteId);
        if (result.success) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: 'true' } : n)
            );
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'employee': return <Users className="w-4 h-4 text-blue-500" />;
            case 'asset': return <Package className="w-4 h-4 text-emerald-500" />;
            case 'finance': return <Calculator className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Activity</h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Bell className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 flex gap-4 hover:bg-gray-50/50 transition-colors relative group ${n.isRead === 'false' ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <div className="mt-1">
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                                            {getIcon(n.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-black text-gray-900 mb-0.5 truncate">{n.title}</h4>
                                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-1.5">{n.message}</p>
                                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                            {formatTime(n.createdAt)}
                                        </span>
                                    </div>
                                    {n.isRead === 'false' && (
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="p-1.5 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                            title="Mark as read"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                            <button className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                                View all site activity
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
