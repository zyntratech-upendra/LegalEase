import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'user' or 'lawyer'
    const [loading, setLoading] = useState(true);

    const googleProvider = new GoogleAuthProvider();

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if user exists in 'users' or 'lawyers'
                // This logic is simplified. Ideally, we separate collections or have a 'roles' field.
                // For this prototype, we'll check both or assume based on registration flow.
                // But on reload, we need to know.

                let role = null;
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    role = "user";
                } else {
                    const lawyerDoc = await getDoc(doc(db, "lawyers", user.uid));
                    if (lawyerDoc.exists()) {
                        role = "lawyer";
                    }
                }
                setUserRole(role);
                setCurrentUser({ ...user, role });
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        signup,
        login,
        loginWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Loading LegalEase...</h2>
                        <p style={{ color: '#64748b' }}>Initializing secure connection...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
