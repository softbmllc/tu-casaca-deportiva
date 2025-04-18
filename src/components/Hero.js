import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
export default function HeroSection() {
    return (_jsxs("section", { className: "relative min-h-[92vh] flex items-center justify-center text-white overflow-hidden", children: [_jsxs("video", { autoPlay: true, muted: true, loop: true, playsInline: true, className: "absolute inset-0 w-full h-full object-cover", children: [_jsx("source", { src: "/videos/hero-bg.webm", type: "video/webm" }), _jsx("source", { src: "/videos/hero-bg.mp4", type: "video/mp4" })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent backdrop-blur-sm z-0" }), _jsxs(motion.div, { className: "relative z-10 text-center px-4 py-10 sm:py-16 max-w-2xl", initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease: "easeOut" }, children: [_jsx(motion.h1, { className: "text-4xl sm:text-5xl font-extrabold uppercase tracking-tight leading-tight mb-4 whitespace-normal", initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2, duration: 0.8 }, children: "Llev\u00E1 la pasi\u00F3n puesta" }), _jsx(motion.p, { className: "text-lg sm:text-xl text-white/90 mb-6 font-light", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4, duration: 0.8 }, children: "Vest\u00ED tus colores con estilo." }), _jsx(motion.a, { href: "#catalogo", className: "relative inline-block px-6 py-3 font-semibold text-black bg-white rounded-full transition-all duration-300 hover:bg-white/90 hover:scale-105 hover:-translate-y-1 shadow-lg shadow-white/10", initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.6, duration: 0.6 }, children: "Ver cat\u00E1logo" })] }), _jsx(motion.a, { href: "#catalogo", className: "absolute bottom-10 left-1/2 -translate-x-1/2 z-10 cursor-pointer", initial: { opacity: 0, y: 0 }, animate: { opacity: 1, y: [0, 8, 0] }, transition: { delay: 2, duration: 2, repeat: Infinity }, children: _jsx(ChevronDown, { size: 28, className: "text-white/80" }) })] }));
}
