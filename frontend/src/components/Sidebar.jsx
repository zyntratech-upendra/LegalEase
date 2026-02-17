import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scale, Search, Shield, Users, LogOut, FileText, MessageSquare, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/images/Logo.png';

const Sidebar = ({ userType = 'user' }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = userType === 'user' ? [
        { name: 'Dashboard', path: '/user-dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Smart Scanner', path: '/user-dashboard/scanner', icon: FileText },
        { name: 'AI Chat Assist', path: '/user-dashboard/chat', icon: MessageSquare },
        { name: 'Find Lawyers', path: '/user-dashboard/find-lawyers', icon: Search },
        { name: 'My Requests', path: '/user-dashboard/my-requests', icon: ClipboardList },
        { name: 'Secure Vault', path: '/user-dashboard/vault', icon: Shield },
    ] : [
        { name: 'Dashboard', path: '/lawyer-dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Smart Scanner', path: '/lawyer-dashboard/scanner', icon: FileText },
        { name: 'AI Chat Assist', path: '/lawyer-dashboard/chat', icon: MessageSquare },
        { name: 'Requested Clients', path: '/lawyer-dashboard/requests', icon: Users },
        { name: 'Secure Vault', path: '/lawyer-dashboard/vault', icon: Shield },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 text-white h-screen fixed left-0 top-0 z-20 shadow-xl overflow-hidden">
            {/* Dedicated Logo Header Section */}
            <div
                className="flex flex-col items-center justify-center text-center relative"
                style={{
                    height: '240px',
                    background: 'linear-gradient(135deg, #1F4E79 0%, #2F6EA3 100%)',
                    boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Single Refined Circular Logo Container */}
                <div
                    className="rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #1F4E79 0%, #2F6EA3 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    <img
                        src={Logo}
                        alt="LegalEase Logo"
                        className="w-[85%] h-[85%] object-contain drop-shadow-lg"
                    />
                </div>

                <h1
                    className="font-display font-bold tracking-wide text-white"
                    style={{
                        marginTop: '16px',
                        fontSize: '22px',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        letterSpacing: '1px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    LegalEase
                </h1>
            </div>

            {/* Navigation Section with Original Background */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#1F4E79' }}>
                <nav className="flex-1 overflow-y-auto py-6">
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) => `
                                    flex items-center px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive
                                            ? 'bg-[#2F6EA3] text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-[#6FA9DB]'
                                        }
                                `}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    <span className="font-medium">{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
