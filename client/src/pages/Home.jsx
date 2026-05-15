import React from 'react';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

const Home = () => {
    return (
        <div className="pt-16 bg-[#fffdf7] transition-colors duration-300 text-slate-800">
            <section className="relative overflow-hidden bg-gradient-to-b from-[#fffefb] via-[#fff8df] to-[#f6f8f2] py-16 sm:py-20 lg:py-24 min-h-[calc(100vh-4rem)] flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            className="mb-4"
                        >
                            <span className="inline-block text-5xl sm:text-6xl lg:text-7xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-500 to-accent drop-shadow-[0_10px_30px_rgba(245,182,27,0.18)]">
                                ELOGIXA
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-800 mb-6 leading-tight"
                        >
                            Empowering Digital <span className="text-accent">Transformation</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                            className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
                        >
                            End-to-end IT infrastructure management, cloud solutions, and enterprise security for the modern world.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="flex flex-col sm:flex-row justify-center gap-4"
                        >
                            <Link to="/services" className="btn-primary flex items-center justify-center gap-2 group w-full sm:w-auto shadow-lg shadow-amber-200/60">
                                Our Services <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/#contact"
                                onClick={() => {
                                    setTimeout(() => {
                                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 50);
                                }}
                                className="btn-outline w-full sm:w-auto text-center bg-white/80 border-[#d7d0b9] text-slate-700 hover:bg-white"
                            >
                                Contact Us
                            </Link>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-0 pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute top-[-10%] right-[-10%] w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] bg-amber-300/30 rounded-full blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute bottom-[-10%] left-[-10%] w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] lg:w-[500px] lg:h-[500px] bg-lime-300/25 rounded-full blur-3xl"
                    ></motion.div>
                </div>
            </section>

            <section className="py-16 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-sm font-medium text-amber-700 mb-5">
                                Trusted IT Transformation Partner
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">Who We Are</h2>
                            <p className="text-slate-600 mb-4 text-base sm:text-lg leading-relaxed">
                                ELOGIXA is a premier IT infrastructure management provider, dedicated to delivering seamless operations, enhanced performance, and robust security for global enterprises.
                            </p>
                            <p className="text-slate-600 mb-6 text-base sm:text-lg leading-relaxed">
                                Founded in 2023 in Bangalore, we combine technical expertise with a customer-centric approach to drive digital transformation.
                            </p>
                            <ul className="space-y-3">
                                {['Global Reach', '24/7 Support', 'Certified Experts'].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 }}
                                        className="flex items-center gap-2 text-slate-700 font-medium"
                                    >
                                        <CheckCircle className="text-[#44b649]" size={20} /> {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-[#fff8e8] p-2 rounded-2xl shadow-xl shadow-amber-100 transition-all duration-500 max-w-2xl w-full mx-auto border border-[#efe2b8]"
                        >
                            <img
                                src="/team.jpg"
                                alt="Team working"
                                className="rounded-xl w-full min-h-[240px] sm:min-h-[320px] h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section id="services" className="py-16 sm:py-20 lg:py-24 bg-[#f7f8f2] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 sm:mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Our Core Services</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
                            Delivering innovative IT infrastructure and services that integrate state-of-the-art technologies.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                image: "/service-managed-it.jpg",
                                title: "Fully Managed IT Services",
                                description: "End-to-end management of your IT operations, ensuring reliability, security, and peak performance."
                            },
                            {
                                image: "/service-infrastructure.jpg",
                                title: "IT Infrastructure Solutions",
                                description: "Robust framework design for networks, servers, and storage to engage your digital transformation."
                            },
                            {
                                image: "/Data_centers.webp",
                                title: "Data Center Solutions",
                                description: "Scalable, secure, and efficient data center management and design solutions."
                            },
                            {
                                image: "/service-printing.jpg",
                                title: "Managed Printing Services",
                                description: "Cost-effective and efficient printing solutions to streamline your document workflow."
                            },
                            {
                                image: "/service-software.jpg",
                                title: "Software Solutions",
                                description: "Custom software development and integration to meet your unique business challenges."
                            },
                            {
                                image: "/service-repairs.jpg",
                                title: "Desktop & Laptop Repairs",
                                description: "Expert repair and maintenance services for your hardware assets including UPS systems."
                            }
                        ].map((service, index) => (
                            <ServiceCard
                                key={index}
                                index={index}
                                image={service.image}
                                title={service.title}
                                description={service.description}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="py-16 sm:py-20 bg-[#fffcf4] text-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-800">Ready to Transform Your Business?</h2>
                            <p className="text-slate-600 mb-8 max-w-lg text-base sm:text-lg">
                                Get in touch with our experts to discover how ELOGIXA can elevate your IT infrastructure.
                            </p>
                            <div className="space-y-4 text-slate-700">
                                <p className="flex items-center gap-3 break-all sm:break-normal">
                                    <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                        <Mail size={18} />
                                    </span>
                                    contact@elogixa.co.in
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center text-[#44b649]">
                                        <MapPin size={18} />
                                    </span>
                                    Bangalore, India
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-[#ece7d8] shadow-xl shadow-amber-100/50">
                            <h3 className="text-xl font-bold mb-4 text-slate-800">Send us a Message</h3>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20 bg-[#f7f8f2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Our Location</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
                            Visit our Bangalore base or connect with us remotely for infrastructure, support, and transformation projects.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6 lg:gap-8 items-stretch">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bg-[#0f172a] text-white rounded-2xl p-6 shadow-xl shadow-slate-300/40 flex flex-col justify-between"
                        >
                            <div>
                                <img src="/elogixa-logo.png" alt="Elogixa" className="h-10 w-auto object-contain brightness-0 invert mb-5" />
                                <h3 className="text-xl font-semibold mb-2">Elogixa Technology</h3>
                                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                    2nd floor, Prime City Center, Sadanand Kamath Road, Karkala, Karnataka 574104. Enterprise IT infrastructure, cloud operations, and managed support built for growing teams.
                                </p>
                                <div className="space-y-3 text-sm text-slate-200">
                                    <p className="flex items-start gap-2">
                                        <MapPin size={16} className="mt-0.5 text-amber-300 shrink-0" />
                                        2nd floor, Prime City Center, Sadanand Kamath Road, Karkala, Karnataka 574104
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <Mail size={16} className="mt-0.5 text-amber-300 shrink-0" />
                                        contact@elogixa.co.in
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <Phone size={16} className="mt-0.5 text-amber-300 shrink-0" />
                                        +91 8123 175 247
                                    </p>
                                </div>
                            </div>

                            <a
                                href="https://www.google.com/maps?q=Elogixa%20Technology%20India%20Private%20Limited%20Karkala&z=17"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center mt-6 px-4 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-colors"
                            >
                                Open in Maps
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="rounded-2xl overflow-hidden border border-[#ddd7c8] bg-white shadow-lg shadow-slate-200/70 min-h-[320px] sm:min-h-[420px]"
                        >
                            <iframe
                                title="Elogixa location map"
                                src="https://www.google.com/maps?q=Elogixa%20Technology%20India%20Private%20Limited%20Karkala&z=17&output=embed"
                                className="w-full h-full min-h-[320px] sm:min-h-[420px]"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ContactForm = () => {
    const [formData, setFormData] = React.useState({ name: '', email: '', country: '', service: '', message: '' });
    const [status, setStatus] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit contact form');
            }

            const data = await response.json();
            setStatus(data.emailSent ? 'success' : 'warning');
            setFormData({ name: '', email: '', country: '', service: '', message: '' });
            setTimeout(() => setStatus(null), 3000);
        } catch {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {status === 'success' && <div className="bg-green-100 text-green-800 p-3 rounded-xl text-sm">Message sent successfully!</div>}
            {status === 'warning' && <div className="bg-amber-100 text-amber-800 p-3 rounded-xl text-sm">Message saved, but the email notification could not be sent yet.</div>}
            {status === 'error' && <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm">Failed to send message.</div>}

            <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#d8d4c8] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#d8d4c8] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
                type="text"
                placeholder="Country"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#d8d4c8] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
            <select
                className={`w-full px-4 py-3 rounded-xl bg-white border border-[#d8d4c8] focus:outline-none focus:ring-2 focus:ring-accent ${formData.service ? 'text-slate-800' : 'text-slate-400'}`}
                required
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            >
                <option value="" disabled>Select a Service</option>
                <option value="Fully Managed IT Services">Fully Managed IT Services</option>
                <option value="IT Infrastructure Solutions">IT Infrastructure Solutions</option>
                <option value="Data Center Solutions">Data Center Solutions</option>
                <option value="Managed Printing Services">Managed Printing Services</option>
                <option value="Software Solutions">Software Solutions</option>
                <option value="Desktop & Laptop Repairs">Desktop & Laptop Repairs</option>
                <option value="Other">Other</option>
            </select>
            <textarea
                placeholder="How can we help?"
                rows="4"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#d8d4c8] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            ></textarea>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:bg-accent/70"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                    </>
                ) : (
                    'Send Message'
                )}
            </button>
        </form>
    );
};

const ServiceCard = ({ image, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -10 }}
        className="card group overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white border-[#ece7d8] p-0"
    >
        <div className="h-48 sm:h-52 overflow-hidden">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
        </div>
        <div className="p-6">
            <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

export default Home;
