import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { currentUser, userRole } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser?.uid) return;
            const collectionName = userRole === 'lawyer' ? 'lawyers' : 'users';
            try {
                const docRef = doc(db, collectionName, currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Check firstName first, then fallback to fullName split
                    const fName = data.firstName || data.fullName?.split(' ')[0] || currentUser.displayName?.split(' ')[0] || '';
                    const lName = data.lastName || data.fullName?.split(' ').slice(1).join(' ') || currentUser.displayName?.split(' ').slice(1).join(' ') || '';
                    setFirstName(fName);
                    setLastName(lName);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, [currentUser, userRole]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!firstName.trim()) return;
        setSaving(true);

        try {
            const collectionName = userRole === 'lawyer' ? 'lawyers' : 'users';
            const docRef = doc(db, collectionName, currentUser.uid);
            await updateDoc(docRef, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });

            // Update Firebase Auth display name
            await updateProfile(auth.currentUser, {
                displayName: `${firstName.trim()} ${lastName.trim()}`.trim()
            });

            setToast('Profile updated successfully!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setToast('Failed to update profile.');
            setTimeout(() => setToast(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const roleLabel = userRole === 'lawyer' ? 'Lawyer' : 'Citizen';

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 mr-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <User className="w-7 h-7 mr-3" style={{ color: '#1F4E79' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#1F4E79', fontFamily: "'Poppins', sans-serif" }}>
                    Edit Profile
                </h2>
            </div>

            {/* Profile Card */}
            <div
                className="bg-white border border-gray-100"
                style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    padding: '24px'
                }}
            >
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3"
                        style={{ background: 'linear-gradient(135deg, #1F4E79, #2F6EA3)' }}
                    >
                        {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <p className="text-sm text-gray-400">
                        {currentUser?.email}
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1.5">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-colors text-gray-800"
                            style={{ focusBorderColor: '#2F6EA3' }}
                            onFocus={(e) => e.target.style.borderColor = '#2F6EA3'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Enter first name"
                            required
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1.5">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-colors text-gray-800"
                            onFocus={(e) => e.target.style.borderColor = '#2F6EA3'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            placeholder="Enter last name"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1.5">
                            <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
                        </label>
                        <input
                            type="email"
                            value={currentUser?.email || ''}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    {/* Role (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1.5">
                            <Shield className="w-3.5 h-3.5 inline mr-1" /> Role
                        </label>
                        <input
                            type="text"
                            value={roleLabel}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                        style={{
                            backgroundColor: saving ? '#64748b' : '#1F4E79',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg z-50 animate-pulse"
                    style={{
                        backgroundColor: toast.includes('success') ? '#22C55E' : '#EF4444',
                    }}
                >
                    <CheckCircle className="w-4 h-4" />
                    {toast}
                </div>
            )}
        </div>
    );
};

export default Profile;
