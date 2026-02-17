import React, { useState, useEffect } from 'react';
import { Users, Check, X, Clock, MessageSquare, Phone } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const RequestedClients = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchRequests = async () => {
            if (!currentUser) return;
            try {
                const q = query(collection(db, "requests")); // Fetch all for demo
                const querySnapshot = await getDocs(q);
                const fetchedReqs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

                // Enrich with phone numbers from users collection
                const enriched = await Promise.all(fetchedReqs.map(async (req) => {
                    if (req.userPhoneNumber) return req; // Already has phone
                    try {
                        const userDoc = await getDoc(doc(db, 'users', req.userId));
                        if (userDoc.exists()) {
                            return { ...req, userPhoneNumber: userDoc.data().phoneNumber || '' };
                        }
                    } catch (e) { /* ignore */ }
                    return req;
                }));

                // Sort by date
                enriched.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setRequests(enriched);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        fetchRequests();
    }, [currentUser]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, "requests", id), {
                status: newStatus
            });
            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center">
                <Users className="mr-3" /> Client Requests
            </h2>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading requests...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No new client requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="flex-1 mb-4 md:mb-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">{req.userName}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                            req.status === 'declined' ? 'bg-red-100 text-red-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    {req.caseTitle && (
                                        <p className="text-sm font-semibold text-gray-700 mb-1">{req.caseTitle}</p>
                                    )}
                                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{req.caseDescription}</p>

                                    {/* Phone Number + Call Button */}
                                    {req.userPhoneNumber ? (
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                <span>{req.userPhoneNumber}</span>
                                            </div>
                                            <a
                                                href={`tel:${req.userPhoneNumber}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                                                style={{ backgroundColor: '#2F6EA3' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F4E79'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F6EA3'}
                                            >
                                                <Phone className="w-3 h-3" />
                                                Call
                                            </a>
                                        </div>
                                    ) : req.userEmail ? (
                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <span className="text-xs text-gray-400 mr-1">✉</span>
                                            <span>{req.userEmail}</span>
                                        </div>
                                    ) : null}

                                    <div className="flex items-center text-xs text-text-secondary">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(req.createdAt?.seconds * 1000).toLocaleString()}
                                    </div>
                                </div>

                                {req.status === 'pending' && (
                                    <div className="flex items-center space-x-3 md:ml-6">
                                        <button
                                            onClick={() => handleStatusUpdate(req.id, 'declined')}
                                            className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Decline"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(req.id, 'accepted')}
                                            className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Accept Request
                                        </button>
                                    </div>
                                )}
                                {req.status === 'accepted' && (
                                    <div className="md:ml-6">
                                        <button className="flex items-center text-primary font-medium hover:underline">
                                            <MessageSquare className="w-4 h-4 mr-2" /> Match Chat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestedClients;
