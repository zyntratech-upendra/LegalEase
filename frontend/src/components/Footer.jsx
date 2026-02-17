import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { userRole } = useAuth();

    const footerLinks = [
        { name: 'How It Works', path: '/how-it-works' },
        { name: 'Find a Lawyer', path: '/user-dashboard/find-lawyers', userOnly: true },
        { name: 'Contact Support', path: '/support' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms & Conditions', path: '/terms' },
    ];

    // Filter out "Find a Lawyer" for lawyer role
    const visibleLinks = footerLinks.filter(link => {
        if (link.userOnly && userRole === 'lawyer') return false;
        return true;
    });

    return (
        <footer
            className="mt-auto border-t border-white/10"
            style={{
                background: '#1F4E79'
            }}
        >
            <div className="px-6 md:px-8 py-8">
                {/* Footer Links */}
                <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-4 md:gap-8 mb-6">
                    {visibleLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            to={link.path}
                            className="footer-link text-sm md:text-base font-medium transition-all"
                            style={{
                                color: '#FFFFFF'
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-white/60 text-xs md:text-sm">
                        © 2026 LegalEase. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Footer Link Styles */}
            <style>{`
                .footer-link:hover {
                    color: #6FA9DB !important;
                    text-decoration: underline;
                }
            `}</style>
        </footer>
    );
};

export default Footer;
