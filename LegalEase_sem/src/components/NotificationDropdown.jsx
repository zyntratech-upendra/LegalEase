import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    subscribeToNotifications,
    markAsRead,
    markAllAsRead,
    createWelcomeNotification,
} from '../utils/notificationService';

const NotificationDropdown = () => {
    const { currentUser, userRole } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Subscribe to real-time notifications
    useEffect(() => {
        if (!currentUser?.uid) return;

        // Create welcome notification on first visit
        createWelcomeNotification(currentUser.uid, userRole);

        const unsubscribe = subscribeToNotifications(currentUser.uid, (data) => {
            setNotifications(data);
        });

        return () => unsubscribe();
    }, [currentUser?.uid, userRole]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
    };

    const handleMarkAllRead = async () => {
        if (currentUser?.uid) {
            await markAllAsRead(currentUser.uid);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setOpen(!open)}
                className="p-2 text-white/80 hover:bg-white/10 rounded-full transition-colors relative"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                        style={{ background: '#EF4444' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.15)', zIndex: 200 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
                        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
                    >
                        <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                <Bell className="w-10 h-10 text-gray-300 mb-3" />
                                <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                                <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                    style={{
                                        background: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Unread indicator */}
                                        <div className="flex-shrink-0 mt-1.5">
                                            {n.isRead ? (
                                                <Check className="w-3.5 h-3.5 text-gray-300" />
                                            ) : (
                                                <span className="block w-2.5 h-2.5 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-tight ${n.isRead ? 'text-gray-500 font-normal' : 'text-gray-800 font-semibold'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-gray-300 mt-1">
                                                {formatTime(n.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
