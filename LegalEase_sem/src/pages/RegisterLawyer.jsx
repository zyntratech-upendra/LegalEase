import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Mail, Lock, Upload, Check, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const RegisterLawyer = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        barCouncilId: '',
        password: '',
        confirmPassword: ''
    });
    const [files, setFiles] = useState({
        barCard: null,
        govtId: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        // Basic validation
        if (!formData.fullName || !formData.barCouncilId || !formData.email || !formData.password) {
            setError("Please fill all fields");
            return;
        }
        setStep(2);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!files.barCard || !files.govtId) {
            setError("Please upload both ID documents for verification.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Authentication User
            const res = await signup(formData.email, formData.password);
            const uid = res.user.uid;

            // 2. Upload Files (Simulated for this prototype if Storage rules block, but coding for real)
            // const storage = getStorage();
            // const barRef = ref(storage, `lawyers/${uid}/bar_id_${files.barCard.name}`);
            // const govtRef = ref(storage, `lawyers/${uid}/govt_id_${files.govtId.name}`);

            // await uploadBytes(barRef, files.barCard);
            // const barUrl = await getDownloadURL(barRef);
            // await uploadBytes(govtRef, files.govtId);
            // const govtUrl = await getDownloadURL(govtRef);

            // MOCK URLS for Prototype robustness (avoiding Storage errors without full config)
            const barUrl = "https://via.placeholder.com/300?text=Bar+ID+Card";
            const govtUrl = "https://via.placeholder.com/300?text=Govt+ID";

            // 3. Create Lawyer Doc in Firestore
            await setDoc(doc(db, "lawyers", uid), {
                fullName: formData.fullName,
                email: formData.email,
                barCouncilId: formData.barCouncilId,
                role: 'lawyer',
                isVerified: false, // Pending verification
                documents: {
                    barCouncilIdCard: barUrl,
                    govtIdCard: govtUrl
                },
                createdAt: new Date()
            });

            // Redirect
            navigate('/lawyer-dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to register. Please try again.");
            // If auth created but db failed, we might have an issue. 
            // In a real app we'd handle rollback.
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface w-full max-w-2xl p-8 rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="flex items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mr-4">
                        <Briefcase className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-text-main">
                            Partner Registration
                        </h2>
                        <p className="text-text-secondary">Join LegalEase as a verified legal practitioner</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>1</div>
                        <span className="font-medium hidden sm:block">Personal Info</span>
                    </div>
                    <div className={`w-16 h-1 bg-gray-200 mx-4 relative`}>
                        <div className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>2</div>
                        <span className="font-medium hidden sm:block">Verification</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-error p-3 rounded-lg mb-6 flex items-center text-sm">
                        <Shield className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={step === 1 ? handleStep1Submit : handleFinalSubmit}>
                    {step === 1 && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary transition-colors outline-none"
                                            placeholder="Advocate Name"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Bar Council ID</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="barCouncilId"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                                            placeholder="BC/XXXX/YYYY"
                                            value={formData.barCouncilId}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email Address (Official)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                                        placeholder="lawyer@firm.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center shadow-lg shadow-primary/30"
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-primary text-sm mb-4">
                                <p>Please upload valid identification documents. These will be verified before your account is fully active.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Bar Council ID Upload */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        name="barCard"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            {files.barCard ? <Check className="text-green-500" /> : <Upload className="text-gray-400" />}
                                        </div>
                                        <h4 className="font-semibold text-text-main">Bar Council ID</h4>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {files.barCard ? files.barCard.name : "Click to upload or drag & drop"}
                                        </p>
                                    </div>
                                </div>

                                {/* Govt ID Upload */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        name="govtId"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            {files.govtId ? <Check className="text-green-500" /> : <Upload className="text-gray-400" />}
                                        </div>
                                        <h4 className="font-semibold text-text-main">Govt ID (Aadhar)</h4>
                                        <p className="text-xs text-text-secondary mt-1">
                                            {files.govtId ? files.govtId.name : "Click to upload or drag & drop"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-text-secondary hover:text-primary font-medium flex items-center px-4 py-2"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-secondary text-white px-8 py-3 rounded-xl font-medium hover:bg-secondary/90 transition-all flex items-center shadow-lg shadow-secondary/30"
                                >
                                    {loading ? 'Registering...' : 'Complete Registration'}
                                    {!loading && <Check className="w-4 h-4 ml-2" />}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-text-secondary text-sm">
                        Already registered?
                        <Link to="/login" className="text-primary font-semibold hover:underline ml-1">
                            Login here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterLawyer;
