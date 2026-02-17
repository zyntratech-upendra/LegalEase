import React, { useState, useEffect } from 'react';
import { Shield, FileText, Trash2, Eye, Calendar, Clock, X } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SecureVault = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchDocs = async () => {
            if (!currentUser) return;
            try {
                const q = query(
                    collection(db, "vault"),
                    where("userId", "==", currentUser.uid)
                    // orderBy("createdAt", "desc") // requires index
                );
                const querySnapshot = await getDocs(q);
                const fetchedDocs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort client-side to avoid index requirement for prototype
                fetchedDocs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setDocs(fetchedDocs);
            } catch (error) {
                console.error("Error fetching vault docs:", error);
            }
            setLoading(false);
        };
        fetchDocs();
    }, [currentUser]);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this document permanently?")) return;
        try {
            await deleteDoc(doc(db, "vault", id));
            setDocs(docs.filter(d => d.id !== id));
        } catch (error) {
            console.error("Error deleting doc:", error);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center">
                <Shield className="mr-3" /> Secure Vault
            </h2>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading your secure documents...</div>
            ) : docs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No archived documents</h3>
                    <p className="text-gray-500">Scanned documents you archive will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {docs.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <button
                                    onClick={(e) => handleDelete(doc.id, e)}
                                    className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-1" title={doc.fileName}>{doc.fileName || "Untitled Document"}</h3>
                            <div className="flex items-center text-xs text-secondary space-x-3 mb-4">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(doc.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-gray-600">{doc.language || 'English'}</span>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                                {doc.summary}
                            </p>

                            <div className="flex items-center text-primary text-sm font-medium">
                                <Eye className="w-4 h-4 mr-2" /> View Analysis
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedDoc && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-primary">{selectedDoc.fileName}</h3>
                                    <p className="text-sm text-secondary">Archived on {new Date(selectedDoc.createdAt?.seconds * 1000).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                    {/* X icon needs import */}
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Analysis Summary</h4>
                                    <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-line">
                                        {selectedDoc.summary}
                                    </div>
                                </div>

                                {selectedDoc.originalText && (
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Original Text Clip</h4>
                                        <p className="text-xs text-gray-500 font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
                                            {selectedDoc.originalText.substring(0, 500)}...
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 mr-3"
                                >
                                    Close
                                </button>
                                <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                                    Download Report
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SecureVault;
