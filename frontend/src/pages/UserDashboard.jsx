import React from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import SmartScanner from '../components/SmartScanner';
import AIChat from '../components/AIChat';
import FindLawyers from '../components/FindLawyers';
import SecureVault from '../components/SecureVault';
import MyRequests from '../components/MyRequests';
import Profile from '../components/Profile';
import { useAuth } from '../context/AuthContext';
import { FileText, MessageSquare, Search, Shield, ArrowRight, User } from 'lucide-react';

const UserDashboardHome = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Get user's display name or email prefix
    const getUserName = () => {
        if (currentUser?.displayName) {
            return currentUser.displayName.split(' ')[0]; // Get first name
        } else if (currentUser?.email) {
            return currentUser.email.split('@')[0]; // Get email prefix
        }
        return 'User';
    };

    const cards = [
        { title: 'Smart Scanner', icon: FileText, path: 'scanner', desc: 'Scan & Analyze Documents', color: 'bg-blue-500' },
        { title: 'AI Chat Assist', icon: MessageSquare, path: 'chat', desc: 'Ask Legal Questions', color: 'bg-purple-500' },
        { title: 'Find Lawyers', icon: Search, path: 'find-lawyers', desc: 'Connect with Experts', color: 'bg-orange-500' },
        { title: 'Secure Vault', icon: Shield, path: 'vault', desc: 'Access Archived Docs', color: 'bg-green-500' },
    ];

    return (
        <div className="p-6 md:p-8">
            {/* Welcome Greeting Section */}
            <div
                className="relative overflow-hidden mb-8"
                style={{
                    background: 'linear-gradient(135deg, #2F6EA3 0%, #4F8CC9 100%)',
                    borderRadius: '18px',
                    boxShadow: '0 8px 32px 0 rgba(47, 110, 163, 0.15)',
                    padding: '2rem'
                }}
            >
                {/* Inner Glow Effect */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)'
                    }}
                />

                <div className="relative z-10 flex items-center mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 shadow-inner border border-white/10">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            Welcome back, {getUserName()} 👋
                        </h1>
                    </div>
                </div>
                <p className="text-white/85 text-sm md:text-base ml-0 md:ml-16 font-medium">
                    Here's what's happening with your account today.
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(card.path)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
                    >
                        <div className={`w-12 h-12 ${card.color} bg-opacity-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">{card.desc}</p>
                        <div className="flex items-center text-primary font-medium text-sm">
                            Open Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};



const UserDashboard = () => {
    const location = useLocation();

    // Check if we're on the main dashboard route
    const isMainDashboard = location.pathname === '/user-dashboard' || location.pathname === '/user-dashboard/';

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar userType="user" />
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Conditionally render TopBar only on main dashboard */}
                {isMainDashboard && <TopBar title="User Dashboard" />}

                <main className="flex-1 flex flex-col">
                    <Routes>
                        <Route path="/" element={<UserDashboardHome />} />
                        <Route path="scanner" element={<SmartScanner />} />
                        <Route path="chat" element={<AIChat />} />
                        <Route path="find-lawyers" element={<FindLawyers />} />
                        <Route path="my-requests" element={<MyRequests />} />
                        <Route path="vault" element={<SecureVault />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>

                    {/* Conditionally render Footer only on main dashboard */}
                    {isMainDashboard && <Footer />}
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;
