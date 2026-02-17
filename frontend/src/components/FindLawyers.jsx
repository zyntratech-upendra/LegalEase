import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Star, Phone, MessageSquare, X } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_LAWYERS = [
    { id: 1, name: "Adv. Rajesh Kumar", type: "Criminal Lawyer", experience: "15 Years", cases: 120, location: "Delhi", contact: "+91 9876543210" },
    { id: 2, name: "Adv. Priya Sharma", type: "Family Lawyer", experience: "8 Years", cases: 85, location: "Mumbai", contact: "+91 9876543211" },
    { id: 3, name: "Adv. Anil Verma", type: "Corporate Lawyer", experience: "12 Years", cases: 200, location: "Bangalore", contact: "+91 9876543212" },
    { id: 4, name: "Adv. Sneha Gupta", type: "Cyber Crime Lawyer", experience: "6 Years", cases: 45, location: "Hyderabad", contact: "+91 9876543213" },
    { id: 5, name: "Adv. Vikram Singh", type: "Civil Lawyer", experience: "20 Years", cases: 350, location: "Bhimavaram", contact: "+91 9876543214" },
    { id: 6, name: "Adv. Rohan Mehta", type: "Criminal Lawyer", experience: "12 Years", cases: 210, location: "Mumbai", contact: "+91 9823456712" },
    { id: 7, name: "Adv. Ananya Rao", type: "Family Lawyer", experience: "8 Years", cases: 145, location: "Narasaraopet", contact: "+91 9745123689" },
    { id: 8, name: "Adv. Arjun Verma", type: "Corporate Lawyer", experience: "15 Years", cases: 280, location: "Guntur", contact: "+91 9658741230" },
    { id: 9, name: "Adv. Sneha Kapoor", type: "Property Lawyer", experience: "10 Years", cases: 190, location: "Chennai", contact: "+91 9887612345" },
    { id: 10, name: "Adv. Kunal Sharma", type: "Cyber Crime Lawyer", experience: "6 Years", cases: 95, location: "Vijayawada", contact: "+91 9765432108" },
    { id: 11, name: "Adv. Priya Nair", type: "Divorce Lawyer", experience: "14 Years", cases: 260, location: "Vizac", contact: "+91 9847012345" },
    { id: 12, name: "Adv. Rahul Deshmukh", type: "Labour Lawyer", experience: "9 Years", cases: 175, location: "Rajahmundry", contact: "+91 9908123456" },
    { id: 13, name: "Adv. Meera Iyer", type: "Tax Lawyer", experience: "18 Years", cases: 320, location: "Eluru", contact: "+91 9876098765" },
    { id: 14, name: "Adv. Meerja Iyer", type: "civil Lawyer", experience: "15 Years", cases: 120, location: "Macherla", contact: "+91 9676098765" }

];

const FindLawyers = () => {
    const [lawyers, setLawyers] = useState(MOCK_LAWYERS); // Ideally fetch from 'lawyers' collection
    const [filteredLawyers, setFilteredLawyers] = useState(MOCK_LAWYERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterLocation, setFilterLocation] = useState('');

    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [caseTitle, setCaseTitle] = useState('');
    const [caseDesc, setCaseDesc] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [requestStatus, setRequestStatus] = useState('');

    const { currentUser } = useAuth();

    useEffect(() => {
        let result = lawyers;
        if (searchTerm) {
            result = result.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (filterType !== 'All') {
            result = result.filter(l => l.type.includes(filterType));
        }
        if (filterLocation) {
            result = result.filter(l => l.location.toLowerCase().includes(filterLocation.toLowerCase()));
        }
        setFilteredLawyers(result);
    }, [searchTerm, filterType, filterLocation, lawyers]);

    const handleRequest = async (e) => {
        e.preventDefault();
        if (!caseDesc.trim()) return;
        setRequestStatus('Sending...');

        try {
            await addDoc(collection(db, "requests"), {
                userId: currentUser.uid,
                lawyerId: selectedLawyer.id.toString(),
                lawyerName: selectedLawyer.name,
                userName: currentUser.displayName || currentUser.email,
                userEmail: currentUser.email || '',
                caseTitle: caseTitle.trim() || 'General Consultation',
                caseDescription: caseDesc,
                userPhoneNumber: phoneNumber.trim(),
                status: 'pending',
                createdAt: new Date()
            });
            setRequestStatus('Success');
            setTimeout(() => {
                setSelectedLawyer(null);
                setCaseTitle('');
                setCaseDesc('');
                setPhoneNumber('');
                setRequestStatus('');
            }, 1000);
        } catch (error) {
            console.error(error);
            setRequestStatus('Failed');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center">
                <Search className="mr-3" /> Find Verified Lawyers
            </h2>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-secondary"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-secondary bg-white"
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                >
                    <option value="All">All Types</option>
                    <option value="Criminal">Criminal Lawyer</option>
                    <option value="Civil">Civil Lawyer</option>
                    <option value="Family">Family Lawyer</option>
                    <option value="Corporate">Corporate Lawyer</option>
                    <option value="Cyber">Cyber Crime Lawyer</option>
                </select>
                <div className="flex-1 min-w-[200px] relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Location (e.g. Delhi)"
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-secondary"
                        value={filterLocation}
                        onChange={e => setFilterLocation(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLawyers.map(lawyer => (
                    <div key={lawyer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-primary">{lawyer.name}</h3>
                                <div className="text-sm text-secondary font-medium bg-secondary/10 px-2 py-0.5 rounded inline-block mt-1">
                                    {lawyer.type}
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-text-secondary mb-6">
                            <div className="flex items-center">
                                <Star className="w-4 h-4 text-accent mr-2" />
                                <span>{lawyer.experience} Experience • {lawyer.cases} Cases</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{lawyer.location}</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{lawyer.contact}</span>
                                <a
                                    href={`tel:${lawyer.contact}`}
                                    className="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors"
                                    style={{ backgroundColor: '#2F6EA3', fontSize: '10px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F4E79'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F6EA3'}
                                    title="Call"
                                >
                                    <Phone className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedLawyer(lawyer)}
                            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Request to Consult
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedLawyer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 relative"
                        >
                            <button
                                onClick={() => setSelectedLawyer(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>

                            <h3 className="text-xl font-bold text-primary mb-2">Request Consultation</h3>
                            <p className="text-text-secondary text-sm mb-4">
                                Send a request to <span className="font-semibold">{selectedLawyer.name}</span>. Briefly describe your legal issue.
                            </p>

                            <form onSubmit={handleRequest}>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-secondary outline-none mb-3 text-sm"
                                    placeholder="Case Title (e.g. Property Dispute)"
                                    value={caseTitle}
                                    onChange={e => setCaseTitle(e.target.value)}
                                    required
                                />
                                <input
                                    type="tel"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-secondary outline-none mb-3 text-sm"
                                    placeholder="Your Phone Number (e.g. +91 9876543210)"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    required
                                />
                                <textarea
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:border-secondary outline-none min-h-[120px] mb-4 text-sm"
                                    placeholder="Describe your case in 3-4 lines..."
                                    value={caseDesc}
                                    onChange={e => setCaseDesc(e.target.value)}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={!caseDesc.trim() || requestStatus === 'Sending...'}
                                    className={`w-full py-3 rounded-xl font-medium text-white transition-colors flex items-center justify-center ${requestStatus === 'Success' ? 'bg-green-600' : 'bg-secondary hover:bg-secondary/90'}`}
                                >
                                    {requestStatus === 'Sending...' ? 'Sending Request...' :
                                        requestStatus === 'Success' ? 'Request Sent!' :
                                            'Send Request'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FindLawyers;
