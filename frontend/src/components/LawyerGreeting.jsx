import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Users, Clock } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const LawyerGreeting = () => {
    const { currentUser } = useAuth();
    const [lawyerName, setLawyerName] = useState('');

    useEffect(() => {
        const fetchName = async () => {
            if (!currentUser?.uid) return;
            try {
                const docSnap = await getDoc(doc(db, 'lawyers', currentUser.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.firstName) {
                        setLawyerName(data.firstName);
                        return;
                    }
                    if (data.fullName) {
                        setLawyerName(data.fullName.split(' ')[0]);
                        return;
                    }
                }
            } catch (e) { /* ignore */ }
            // Fallback to displayName or email
            if (currentUser.displayName) {
                setLawyerName(currentUser.displayName.split(' ')[0]);
            } else if (currentUser.email) {
                setLawyerName(currentUser.email.split('@')[0]);
            } else {
                setLawyerName('');
            }
        };
        fetchName();
    }, [currentUser]);

    const stats = [
        { label: 'Total Requests', value: '12', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Active Cases', value: '5', icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Pending Reviews', value: '3', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <div
            className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-sm border border-gray-100"
            style={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
        >
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1F4E79] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Welcome{lawyerName ? `, ${lawyerName}` : ''}
                </h1>
                <p className="text-gray-500 text-sm md:text-base">
                    Here's your case overview for today.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className={`w-12 h-12 ${stat.bg} rounded-full flex items-center justify-center mr-4`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LawyerGreeting;
