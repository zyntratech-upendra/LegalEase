import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import SmartScanner from '../components/SmartScanner';
import AIChat from '../components/AIChat';
import SecureVault from '../components/SecureVault';
import RequestedClients from '../components/RequestedClients';
import Profile from '../components/Profile';
import { FileText, MessageSquare, Users, Shield, ArrowRight } from 'lucide-react';
import LawyerGreeting from '../components/LawyerGreeting';
import Footer from '../components/Footer';

const LawyerDashboardHome = () => {
    const navigate = useNavigate();

    const cards = [
        { title: 'Smart Scanner', icon: FileText, path: 'scanner', desc: 'Scan & Analyze Documents', color: 'bg-blue-500' },
        { title: 'AI Chat Assist', icon: MessageSquare, path: 'chat', desc: 'Legal Research Assistant', color: 'bg-purple-500' },
        { title: 'Requested Clients', icon: Users, path: 'requests', desc: 'Case Requests', color: 'bg-orange-500' },
        { title: 'Secure Vault', icon: Shield, path: 'vault', desc: 'Access Archived Docs', color: 'bg-green-500' },
    ];

    return (
        <div className="p-6 md:p-8">
            <LawyerGreeting />
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

const LawyerDashboard = () => {
    const location = useLocation();

    // Check if we're on the main dashboard route
    const isMainDashboard = location.pathname === '/lawyer-dashboard' || location.pathname === '/lawyer-dashboard/';

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar userType="lawyer" />
            <div className="flex-1 md:ml-64 flex flex-col">
                {/* Conditionally render TopBar only on main dashboard */}
                {isMainDashboard && <TopBar title="Lawyer Dashboard" />}
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<LawyerDashboardHome />} />
                        <Route path="scanner" element={<SmartScanner />} />
                        <Route path="chat" element={<AIChat />} />
                        <Route path="requests" element={<RequestedClients />} />
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

export default LawyerDashboard;
