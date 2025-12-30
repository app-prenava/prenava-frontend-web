import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import logoUrl from '@/assets/logo.png';
import mockupImage from '@/assets/mockup.png';
import waveImage from '@/assets/Wave.png';

// Typewriter effect component
function TypewriterText({ text, highlightWord, highlightColor }: { text: string; highlightWord: string; highlightColor: string }) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        const fullText = text;
        const typingSpeed = 50; // milliseconds per character

        const typeInterval = setInterval(() => {
            if (currentIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(typeInterval);
            }
        }, typingSpeed);

        return () => clearInterval(typeInterval);
    }, [text]);

    // Find the position of the highlight word in the displayed text
    const highlightIndex = displayedText.indexOf(highlightWord);
    const beforeHighlight = highlightIndex >= 0 ? displayedText.substring(0, highlightIndex) : displayedText;
    const highlightText = highlightIndex >= 0 ? highlightWord : '';
    const afterHighlight = highlightIndex >= 0 ? displayedText.substring(highlightIndex + highlightWord.length) : '';

    return (
        <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {beforeHighlight}
            {highlightText && (
                <span style={{ color: highlightColor }}>{highlightText}</span>
            )}
            {afterHighlight}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block ml-1"
                >
                    |
                </motion.span>
            )}
        </motion.h1>
    );
}

export default function LandingPage() {
    return (
        <section className="min-h-screen bg-white overflow-hidden relative">
            {/* Wave Background - True background layer */}
            <motion.img
                src={waveImage}
                alt="Wave Background"
                className="absolute bottom-0 right-0 w-full h-auto object-cover z-0"
                style={{
                    objectPosition: 'bottom right',
                    maxHeight: '100%'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* Content Container - Sits on top of wave */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <div className="order-2 lg:order-1">
                        {/* Logo - Link to /login */}
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity mb-8"
                        >
                            <img src={logoUrl} alt="Prenava Logo" className="w-10 h-10" />
                            <span
                                className="text-2xl font-semibold"
                                style={{ color: '#F88A9D' }}
                            >
                                Prenava
                            </span>
                        </Link>

                        {/* Headline with Typewriter Effect */}
                        <TypewriterText
                            text="Jalani Kehamilan dengan Tenang Bersama Prenava"
                            highlightWord="Prenava"
                            highlightColor="#F88A9D"
                        />

                        {/* Subheadline */}
                        <motion.p
                            className="text-lg md:text-xl mb-8 text-gray-600"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.6 }}
                        >
                            Pemantauan dan layanan kesehatan ibu hamil
                        </motion.p>

                        {/* CTA Button */}
                        <motion.button
                            className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                            style={{ backgroundColor: '#F88A9D', color: '#FFFFFF' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, duration: 0.6 }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f77a8f';
                                e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#F88A9D';
                                e.currentTarget.style.color = '#FFFFFF';
                            }}
                        >
                            Dapatkan Aplikasi Sekarang
                        </motion.button>
                    </div>

                    {/* Right Column - Phone Mockups */}
                    <div className="order-1 lg:order-2 relative flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        >
                            <img
                                src={mockupImage}
                                alt="Prenava App Screens"
                                className="w-full max-w-3xl lg:max-w-4xl drop-shadow-2xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
