import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

const FirebaseTest = () => {
    const [status, setStatus] = useState('Initializing...');
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!auth) {
            setStatus('Firebase Auth not initialized');
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
                setStatus('Connected: User is signed in');
            } else {
                setUser(null);
                setStatus('Connected: No user signed in');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleTestLogin = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error(error);
            setStatus(`Login failed: ${error.message}`);
        }
    };

    return (
        <div className="p-4 border border-gray-300 rounded m-4 bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-2">Firebase Integration Test</h3>
            <p className="mb-2">Status: <span className={user ? "text-green-600 font-medium" : "text-orange-600"}>{status}</span></p>
            {user && <p className="text-sm text-gray-500 mb-2">UID: {user.uid}</p>}
            {!user && (
                <button
                    onClick={handleTestLogin}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Test Anonymous Login
                </button>
            )}
        </div>
    );
};

export default FirebaseTest;
