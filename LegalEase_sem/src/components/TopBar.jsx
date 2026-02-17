import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, UserCircle, Edit, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/images/Logo.png';

const TopBar = ({ title }) => {
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const basePath = location.pathname.startsWith('/lawyer-dashboard') ? '/lawyer-dashboard' : '/user-dashboard';

    const handleLogout = async () => {
        try {
            setDropdownOpen(false);
            await logout();
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div
                className="h-16 px-6 md:px-8 border-b border-white/10"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #1F4E79 0%, #2F6EA3 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    zIndex: 50
                }}
            >
                {/* Logo Section */}
                <div className="flex items-center space-x-4">
                    <img
                        src={Logo}
                        alt="LegalEase Logo"
                        onClick={() => navigate('/')}
                        className="navbar-logo cursor-pointer transition-transform hover:scale-105"
                        style={{
                            height: '45px',
                            width: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                    <h2 className="text-xl font-display font-bold text-white hidden md:block">
                        {title || 'Dashboard'}
                    </h2>
                </div>
                <div className="flex items-center space-x-4 ml-auto">
                    <NotificationDropdown />
                    <div className="relative" ref={dropdownRef}>
                        <div className="flex items-center space-x-3 pl-4 border-l border-white/20">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-white leading-tight">
                                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-white/70">
                                    {currentUser?.email}
                                </p>
                            </div>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold border border-white/20 hover:bg-white/20 transition-colors">
                                    {currentUser?.email ? currentUser.email[0].toUpperCase() : <User />}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 overflow-hidden"
                                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100 }}
                            >
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate(`${basePath}/profile`); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <UserCircle className="w-4 h-4 text-gray-400" />
                                    View Profile
                                </button>
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate(`${basePath}/profile`); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4 text-gray-400" />
                                    Edit Profile
                                </button>
                                <div className="border-t border-gray-100" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive CSS */}
            <style>{`
                @media (max-width: 768px) {
                    .navbar-logo {
                        height: 35px !important;
                    }
                }
            `}</style>
        </>
    );
};

export default TopBar;
