'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, User, Gift } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import Image from 'next/image';

export function Navbar() {
  const pathname = usePathname();
  const { isMenuOpen, toggleMenu, setMenuOpen, openBooking } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll to trigger glassmorphism background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Barbería', path: '/barberia' },
    { name: 'Peluquería', path: '/peluqueria' },
    { name: 'Terapias', path: 'https://www.jeffersonlopes.cl/terapias' },
  ];

  const getLinkColors = (path: string) => {
    return {
      textActive: 'text-[#D7AF68]',
      borderActive: 'bg-[#D7AF68]',
      hoverText: 'group-hover:text-[#D7AF68]',
      borderHover: 'group-hover:bg-[#D7AF68]'
    };
  };

  const isPeluqueria = pathname.startsWith('/peluqueria');
  const isBarberia = pathname.startsWith('/barberia');
  const isTerapias = pathname.startsWith('/terapias');
  const isAdmin = pathname.startsWith('/admin');

  const menuVariants = {
    closed: {
      opacity: 0,
      y: '-100%',
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        when: 'afterChildren',
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isPeluqueria || isBarberia
            ? 'py-5 bg-transparent border-b border-transparent shadow-none'
            : isScrolled
            ? 'py-4 bg-bg-base/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40'
            : 'py-6 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3">
            {isAdmin ? (
              <>
                <div className="relative w-11 h-11 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                  <Image
                    src="/meditando-loto.png"
                    alt="Santuario de Bienestar Logo"
                    fill
                    sizes="44px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#D7AF68] text-gold-gradient transition-all duration-300">
                    SANTUARIO
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.35em] text-text-secondary group-hover:text-[#D7AF68] transition-colors duration-300 leading-none mt-0.5">
                    DE BIENESTAR
                  </span>
                </div>
              </>
            ) : !isPeluqueria && !isTerapias ? (
              <>
                <div className="relative w-11 h-11 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                  <Image
                    src="/hands-logo-v4.png"
                    alt="Valentes Barber Studio Logo"
                    fill
                    sizes="44px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#D7AF68] text-gold-gradient transition-all duration-300">
                    VALENTES
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.35em] text-text-secondary group-hover:text-[#D7AF68] transition-colors duration-300 leading-none mt-0.5">
                    BARBER STUDIO
                  </span>
                </div>
              </>
            ) : isPeluqueria ? (
              <>
                <div className="relative w-11 h-11 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                  <Image
                    src="/peluqueria-logo-v4.png"
                    alt="Alma Bela Studio Logo"
                    fill
                    sizes="44px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#D7AF68] text-gold-gradient transition-all duration-300">
                    ALMA BELA
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.35em] text-text-secondary group-hover:text-[#D7AF68] transition-colors duration-300 leading-none mt-0.5">
                    STUDIO
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-11 h-11 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                  <Image
                    src="/terapias-logo-v9.png"
                    alt="Jefïto Lopês Studio Logo"
                    fill
                    sizes="44px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#D7AF68] bg-gradient-to-r from-white via-[#D7AF68] to-text-secondary bg-clip-text text-transparent transition-all duration-300">
                    JEFÏTO LOPÊS
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? pathname === '/'
                  : link.path.startsWith('http')
                  ? pathname.startsWith('/terapias')
                  : pathname.startsWith(link.path);
              const colors = getLinkColors(link.path);

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className="relative text-sm tracking-widest uppercase font-medium transition-all duration-300 py-2 group"
                >
                  <span className={isActive ? colors.textActive : `text-text-secondary ${colors.hoverText}`}>
                    {link.name}
                  </span>
                  {/* Subtle hover line */}
                  <span
                    className={`absolute bottom-0 left-0 h-[1.5px] ${colors.borderActive} transition-all duration-400 ${
                      isActive ? 'w-full' : `w-0 ${colors.borderHover}`
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Action CTA Button & Admin Panel Access */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/giftcards"
              className="p-2.5 rounded-full border transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center border-[#D7AF68]/20 text-[#D7AF68]/75 hover:text-[#9C7442] hover:border-[#9C7442]/40 hover:bg-white/5"
              title="Comprar Tarjeta de Regalo"
            >
              <Gift size={16} />
            </Link>
            <Link
              href="/admin"
              className="p-2.5 rounded-full border transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center border-[#D7AF68]/20 text-[#D7AF68]/75 hover:text-[#9C7442] hover:border-[#9C7442]/40 hover:bg-white/5"
              title="Panel de Administración"
            >
              <User size={16} />
            </Link>
            <button
              onClick={() => openBooking()}
              className="px-6 py-2.5 rounded-full border text-sm tracking-wider uppercase font-semibold hover:text-bg-base transition-all duration-500 shadow-lg hover:scale-105 active:scale-95 border-[#D7AF68]/40 text-[#D7AF68] hover:bg-[#D7AF68] hover:shadow-[#D7AF68]/20 shadow-[#D7AF68]/5"
            >
              Agendar Ritual
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className={`md:hidden p-2 transition-colors focus:outline-none ${
              isPeluqueria ? 'text-gold hover:text-gold/80' : isTerapias ? 'text-text-primary hover:text-platinum' : 'text-text-primary hover:text-gold'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 w-full h-screen z-40 bg-bg-base flex flex-col justify-center px-8"
          >
            {/* Background design accents */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze/5 rounded-full blur-3xl" />

            <div className="flex flex-col space-y-8 relative z-10 max-w-lg mx-auto w-full">
              <span className={`text-[10px] uppercase tracking-[0.5em] border-b pb-4 ${
                isPeluqueria
                  ? 'text-bronze border-bronze/20'
                  : 'text-gold border-gold/20'
              }`}>
                Menú de Navegación
              </span>
              
              <nav className="flex flex-col space-y-6">
                {navLinks.map((link) => {
                  const isActive =
                    link.path === '/'
                      ? pathname === '/'
                      : link.path.startsWith('http')
                      ? pathname.startsWith('/terapias')
                      : pathname.startsWith(link.path);
                  const colors = getLinkColors(link.path);
                  const hoverClass = 
                    link.path === '/peluqueria' 
                      ? 'hover:text-bronze' 
                      : 'hover:text-gold';
                  return (
                    <motion.div key={link.path} variants={linkVariants}>
                      <Link
                        href={link.path}
                        onClick={() => setMenuOpen(false)}
                        className={`font-serif text-4xl sm:text-5xl font-light tracking-wide block transition-colors duration-300 ${hoverClass}`}
                      >
                        <span className={isActive ? `${colors.textActive} pl-2 border-l-2 ${
                          link.path === '/peluqueria' ? 'border-bronze' : 'border-gold'
                        }` : 'text-text-primary'}>
                          {link.name}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div variants={linkVariants} className="pt-8 border-t border-white/5 space-y-3">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openBooking();
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-4 rounded-full text-bg-base font-semibold uppercase tracking-wider text-sm transition-all duration-300 ${
                    isPeluqueria
                      ? 'bg-bronze hover:bg-bronze/90'
                      : 'bg-gold hover:bg-gold/90'
                  }`}
                >
                  <Calendar size={18} />
                  <span>Agendar Ritual</span>
                </button>
                <Link
                  href="/giftcards"
                  onClick={() => setMenuOpen(false)}
                  className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-full border text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                    isPeluqueria
                      ? 'border-bronze/40 text-bronze hover:bg-bronze/10'
                      : 'border-gold/40 text-gold hover:bg-gold/10'
                  }`}
                >
                  <Gift size={14} />
                  <span>Comprar Gift Card</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-xs uppercase tracking-widest font-semibold transition-all duration-300 bg-white/[0.01]"
                >
                  <User size={14} />
                  <span>Panel Administrativo</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
