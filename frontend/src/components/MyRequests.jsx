import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
    pending: { label: 'Pending', color: '#EAB308', bg: '#FEF9C3', icon: Clock },
    accepted: { label: 'Accepted', color: '#22C55E', bg: '#DCFCE7', icon: CheckCircle },
    rejected: { label: 'Rejected', color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
};

const MyRequests = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!currentUser?.uid) return;
            try {
                const q = query(
                    collection(db, 'requests'),
                    where('userId', '==', currentUser.uid)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
                }));
                // Sort by date descending
                data.sort((a, b) => b.createdAt - a.createdAt);
                setRequests(data);
            } catch (err) {
                console.error('Error fetching requests:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [currentUser]);

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 mr-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <ClipboardList className="w-7 h-7 mr-3" style={{ color: '#1F4E79' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#1F4E79', fontFamily: "'Poppins', sans-serif" }}>
                    My Requests
                </h2>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#1F4E79' }} />
                </div>
            )}

            {/* Empty State */}
            {!loading && requests.length === 0 && (
                <div className="text-center py-20">
                    <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-500 mb-2">No Requests Yet</h3>
                    <p className="text-gray-400 text-sm">
                        When you send a consultation request to a lawyer, it will appear here.
                    </p>
                    <button
                        onClick={() => navigate('/user-dashboard/find-lawyers')}
                        className="mt-6 px-6 py-2.5 text-white rounded-xl font-medium transition-colors"
                        style={{ backgroundColor: '#1F4E79' }}
                    >
                        Find Lawyers
                    </button>
                </div>
            )}

            {/* Request Cards */}
            {!loading && requests.length > 0 && (
                <div className="space-y-4">
                    {requests.map(req => {
                        const status = statusConfig[req.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                            <div
                                key={req.id}
                                className="bg-white rounded-2xl border border-gray-100 p-6 transition-shadow hover:shadow-md"
                                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                            {req.caseTitle || 'Consultation Request'}
                                        </h3>
                                        <p className="text-sm font-medium mb-2" style={{ color: '#2F6EA3' }}>
                                            {req.lawyerName || 'Unknown Lawyer'}
                                        </p>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {req.caseDescription || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
                                        style={{ backgroundColor: status.bg, color: status.color }}
                                    >
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-400">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    {formatDate(req.createdAt)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyRequests;
