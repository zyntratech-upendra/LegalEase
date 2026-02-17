import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Subscribe to real-time notifications for a user.
 * Returns an unsubscribe function.
 */
export const subscribeToNotifications = (userId, callback) => {
    if (!userId) return () => { };

    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            // Convert Firestore Timestamp to JS Date string
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));
        callback(notifications);
    }, (error) => {
        console.error('Notification listener error:', error);
        callback([]);
    });
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (notificationId) => {
    try {
        await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch (error) {
        console.error('Mark as read error:', error);
    }
};

/**
 * Mark all notifications as read for a user.
 */
export const markAllAsRead = async (userId) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('isRead', '==', false)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
            batch.update(d.ref, { isRead: true });
        });
        await batch.commit();
    } catch (error) {
        console.error('Mark all as read error:', error);
    }
};

/**
 * Create a new notification for a user.
 */
export const createNotification = async ({ userId, title, message }) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            message,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Create notification error:', error);
    }
};

/**
 * Create a welcome notification if user doesn't already have one.
 */
export const createWelcomeNotification = async (userId, role) => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('title', '==', 'Welcome to LegalEase!')
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            await createNotification({
                userId,
                title: 'Welcome to LegalEase!',
                message: role === 'lawyer'
                    ? 'Your lawyer account is set up. You can now receive client requests and manage cases.'
                    : 'Your account is ready. Explore legal tools, find lawyers, and scan documents.',
            });
        }
    } catch (error) {
        console.error('Welcome notification error:', error);
    }
};
