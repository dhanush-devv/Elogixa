import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleUserRound, LogOut, Menu, Phone, UserRound, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [authUser, setAuthUser] = useState(() => {
        const storedUser = localStorage.getItem('elogixaUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const handleNavClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsOpen(false);
    };

    const handleAuthSuccess = (user) => {
        setAuthUser(user);
        setIsProfileOpen(false);
        setIsOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('elogixaUser');
        setAuthUser(null);
        setIsProfileOpen(false);
        setIsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    

    const renderProfileButton = () => (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#e7e0c6] bg-white px-3 py-2 text-slate-700 hover:bg-amber-50 transition-colors"
            >
                <CircleUserRound size={18} className="text-accent" />
                <span className="hidden sm:inline text-sm font-medium">{authUser?.username || 'Profile'}</span>
            </button>

            {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#ece7d8] bg-white shadow-xl p-2">
                    <div className="px-3 py-2 border-b border-[#f0eadc]">
                        <p className="text-sm font-semibold text-slate-800">{authUser?.username}</p>
                        <p className="text-xs text-slate-500 break-all">{authUser?.email}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#ece7d8] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" onClick={handleNavClick} className="flex items-center">
                            <img src="/elogixa-logo.png" alt="Elogixa" className="h-10 sm:h-11 w-auto object-contain" />
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/" onClick={handleNavClick}className="text-sm font-medium text-slate-700 hover:text-accent transition-colors">Home</Link>
                            <Link to="/jobs" onClick={handleNavClick} className="text-sm font-medium text-slate-700 hover:text-accent transition-colors">Careers</Link>
                            <Link to="/services" onClick={handleNavClick} className="text-sm font-medium text-slate-700 hover:text-accent transition-colors">Our Services</Link>
                            <Link
                                to="/#contact"
                                onClick={() => {
                                    setIsOpen(false);
                                    setTimeout(() => {
                                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 50);
                                }}
                                className="text-sm font-medium text-slate-700 hover:text-accent transition-colors"
                            >
                                Contact Us
                            </Link>

                            {authUser ? (
                                renderProfileButton()
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAuthOpen(true)}
                                    className="btn-outline px-4 py-2"
                                >
                                    Register
                                </button>
                            )}

                            <a href="tel:+918123175247" className="flex items-center gap-2 text-sm font-medium text-white bg-accent px-4 py-2 rounded-full hover:bg-accent-hover transition-all shrink-0">
                                <Phone size={14} /> +91 8123 175 247
                            </a>
                        </div>

                        <div className="md:hidden flex items-center gap-3">
                            {authUser ? (
                                <button
                                    type="button"
                                    onClick={() => setIsProfileOpen((prev) => !prev)}
                                    className="text-accent"
                                    aria-label="Open profile menu"
                                >
                                    <UserRound size={21} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAuthOpen(true)}
                                    className="text-sm font-medium text-accent"
                                >
                                    Register
                                </button>
                            )}

                            <a href="tel:+918123175247" className="text-accent">
                                <Phone size={20} />
                            </a>
                            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 hover:text-accent" aria-label="Toggle navigation menu">
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-b border-[#ece7d8] overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-4 space-y-2">
                                <Link  onClick={()=>{scrollTo(0,0);setIsOpen(false)}} to='/' className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-accent hover:bg-amber-50">Home</Link>
                                <Link  onClick={()=>{scrollTo(0,0);setIsOpen(false)}} to='/jobs' className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-accent hover:bg-amber-50">Careers</Link>
                                <Link  onClick={()=>{scrollTo(0,0);setIsOpen(false)}} to='/services' className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-accent hover:bg-amber-50">Our Services</Link>
                                <Link
                                    to="/#contact"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setTimeout(() => {
                                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                        }, 50);
                                    }}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-accent hover:bg-amber-50"
                                >
                                    Contact Us
                                </Link>

                                {authUser ? (
                                    <>
                                        <div className="px-3 py-2 rounded-md bg-[#f7f5ec]">
                                            <p className="text-sm font-semibold text-slate-800">{authUser.username}</p>
                                            <p className="text-xs text-slate-500 break-all">{authUser.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsAuthOpen(true);
                                        }}
                                        className="w-full px-3 py-2 rounded-md text-base font-medium text-accent border border-accent hover:bg-amber-50"
                                    >
                                        Register
                                    </button>
                                )}

                                <a href="tel:+918123175247" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-white bg-accent hover:bg-accent-hover">
                                    <Phone size={16} /> +91 8123 175 247
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onUserAuthenticated={handleAuthSuccess}
            />
        </>
    );
};

export default Navbar;
