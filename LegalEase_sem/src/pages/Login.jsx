import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import loginBg from '../assets/images/login back.jpeg';
import Logo from '../assets/images/Logo.png';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, loginWithGoogle, currentUser, userRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && userRole) {
            if (userRole === 'lawyer') {
                navigate('/lawyer-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        }
    }, [currentUser, userRole, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                const res = await signup(email, password);
                await setDoc(doc(db, "users", res.user.uid), {
                    fullName,
                    email,
                    role: 'user',
                    createdAt: new Date()
                });
                navigate('/user-dashboard');
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            const res = await loginWithGoogle();

            const userDocRef = doc(db, "users", res.user.uid);
            const lawyerDocRef = doc(db, "lawyers", res.user.uid);

            const [userDoc, lawyerDoc] = await Promise.all([
                getDoc(userDocRef),
                getDoc(lawyerDocRef)
            ]);

            if (userDoc.exists()) {
                navigate('/user-dashboard');
            } else if (lawyerDoc.exists()) {
                navigate('/lawyer-dashboard');
            } else {
                await setDoc(userDocRef, {
                    fullName: res.user.displayName || '',
                    email: res.user.email,
                    role: 'user',
                    createdAt: new Date()
                });
                navigate('/user-dashboard');
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-end px-8 md:px-16">
            {/* Animated Background - Uses uploaded image or fallback gradient */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: loginBg ? `url(${loginBg})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    animation: 'zoomBg 20s ease-in-out infinite alternate'
                }}
            >
                <div className="absolute inset-0 backdrop-blur-sm bg-black/10"></div>
            </div>

            {/* Glassmorphism Login Box */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[380px] p-8"
                style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                }}
            >
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src={Logo}
                        alt="LegalEase Logo"
                        className="login-logo"
                        style={{
                            height: '70px',
                            width: 'auto',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
                        }}
                    />
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                    <h2
                        className="mb-2"
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#000000',
                            fontSize: '28px',
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p
                        style={{
                            color: '#333333',
                            fontSize: '14px',
                            fontWeight: '400'
                        }}
                    >
                        {isLogin ? 'Enter your credentials to access your account' : 'Sign up to get started with LegalEase'}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-white p-3 rounded-lg mb-4 flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label
                                className="block mb-1.5"
                                style={{
                                    color: '#000000',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/30 outline-none transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                        color: '#000000',
                                        fontWeight: '500'
                                    }}
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label
                            className="block mb-1.5"
                            style={{
                                color: '#000000',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/30 outline-none transition-all"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    color: '#000000',
                                    fontWeight: '500'
                                }}
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            className="block mb-1.5"
                            style={{
                                color: '#000000',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}
                        >
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/30 outline-none transition-all"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    color: '#000000',
                                    fontWeight: '500'
                                }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg font-medium text-white flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </button>
                </form>

                {/* Divider */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/30"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 text-white/80">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="mt-4 w-full bg-white/90 py-2.5 rounded-lg font-medium flex items-center justify-center transition-all hover:bg-white hover:shadow-lg"
                        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                            <path fill="#EA4335" d="M12 4.66c1.61 0 3.1.56 4.28 1.6l3.29-3.29C17.58 1.48 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                </div>

                {/* Bottom Links */}
                <div className="mt-6 text-center space-y-2">
                    <p style={{ color: '#111111', fontSize: '14px' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="transition-all"
                            style={{
                                color: '#1f3c88',
                                fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.color = '#163172';
                                e.target.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = '#1f3c88';
                                e.target.style.textDecoration = 'none';
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                    <div className="pt-2 border-t border-white/20">
                        <Link
                            to="/register-lawyer"
                            className="transition-all"
                            style={{
                                fontSize: '14px',
                                color: '#1f3c88',
                                fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.color = '#163172';
                                e.target.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = '#1f3c88';
                                e.target.style.textDecoration = 'none';
                            }}
                        >
                            Are you a lawyer? Register here
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* CSS Animation */}
            <style>{`
                @keyframes zoomBg {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                
                input::placeholder {
                    color: #666666 !important;
                    opacity: 1 !important;
                }
                
                input::-webkit-input-placeholder {
                    color: #666666 !important;
                    opacity: 1 !important;
                }
                
                input::-moz-placeholder {
                    color: #666666 !important;
                    opacity: 1 !important;
                }
                
                input:-ms-input-placeholder {
                    color: #666666 !important;
                    opacity: 1 !important;
                }
                
                /* Responsive logo sizing */
                @media (max-width: 768px) {
                    .login-logo {
                        height: 50px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
