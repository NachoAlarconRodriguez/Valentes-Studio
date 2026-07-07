'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useUIStore, SectionTheme } from '@/store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import BookingModal from './BookingModal';

import { useServicesStore } from '@/store/useServicesStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useGiftCardStore } from '@/store/useGiftCardStore';
import { useContentStore } from '@/store/useContentStore';

// Dynamically import the WebGL Canvas, disabling server-side rendering
// because WebGL, Three.js, and browser events require client-side execution.
const WebGLCanvas = dynamic(() => import('./WebGLCanvas'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-bg-base" />
});

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setCurrentTheme = useUIStore((state) => state.setCurrentTheme);
  const setMenuOpen = useUIStore((state) => state.setMenuOpen);
  const openBooking = useUIStore((state) => state.openBooking);
  const [mounted, setMounted] = useState(false);

  // Load initial data actions from Supabase
  const fetchServicesAndSpecialists = useServicesStore(state => state.fetchServicesAndSpecialists);
  const fetchBookingsAndClients = useBookingStore(state => state.fetchBookingsAndClients);
  const fetchSchedules = useScheduleStore(state => state.fetchSchedules);
  const fetchGiftCards = useGiftCardStore(state => state.fetchGiftCards);
  const fetchContent = useContentStore(state => state.fetchContent);
  const hasFetched = useContentStore(state => state.hasFetched);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Fetch all data from Supabase
    fetchServicesAndSpecialists();
    fetchBookingsAndClients();
    fetchSchedules();
    fetchGiftCards();
    fetchContent();

    // Poll every 10 seconds to keep client availability, bookings, and specialists list fresh
    const interval = setInterval(() => {
      fetchBookingsAndClients();
      fetchSchedules();
      fetchServicesAndSpecialists();
    }, 10000);

    // Refresh immediately when client focuses the tab
    const handleFocus = () => {
      fetchBookingsAndClients();
      fetchSchedules();
      fetchServicesAndSpecialists();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [
    fetchServicesAndSpecialists,
    fetchBookingsAndClients,
    fetchSchedules,
    fetchGiftCards,
    fetchContent
  ]);

  // Update theme in store when path changes
  useEffect(() => {
    let theme: SectionTheme = 'home';
    if (pathname.startsWith('/barberia')) {
      theme = 'barberia';
    } else if (pathname.startsWith('/peluqueria')) {
      theme = 'peluqueria';
    } else if (pathname.startsWith('/terapias')) {
      theme = 'terapias';
    }
    
    setCurrentTheme(theme);
    setMenuOpen(false); // Auto close mobile menu on route change
  }, [pathname, setCurrentTheme, setMenuOpen]);

  // Auto open booking modal if ?reserva=true is in URL
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reserva') === 'true') {
        openBooking();
      }
    }
  }, [mounted, pathname, openBooking]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans">
        <main className="flex-grow">{children}</main>
      </div>
    );
  }


  return (
    <div className="min-h-screen text-text-primary flex flex-col font-sans select-none relative">
      {/* Global Transition Loader */}
      <AnimatePresence>
        {!hasFetched && !pathname.startsWith('/admin') && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-[999] bg-[#070707] flex flex-col items-center justify-center"
          >
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

            <div className="relative flex flex-col items-center space-y-8 z-10">
              {/* Golden pulsing logo */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-28 h-28 select-none pointer-events-none"
              >
                <img
                  src="/lotus-transparent.png"
                  alt="Santuario Logo"
                  className="object-contain w-full h-full filter brightness-95 contrast-105"
                />
              </motion.div>

              {/* Brand Title */}
              <div className="flex flex-col items-center space-y-3 text-center">
                <span className="font-serif text-3xl md:text-4xl font-bold tracking-[0.25em] text-gold-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] select-none uppercase">
                  Santuario
                </span>
                <span className="text-[9px] uppercase tracking-[0.5em] text-white/50 font-light select-none">
                  DE BIENESTAR & AUTORÍA
                </span>
              </div>

              {/* Elegant golden spinning line */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-gold/10 rounded-full" />
                <div className="absolute inset-0 border-2 border-t-gold/70 border-r-gold/30 border-b-transparent border-l-transparent rounded-full animate-spin" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background WebGL canvas */}
      <WebGLCanvas />

      {/* Global Navigation Header */}
      {pathname !== '/' && !pathname.startsWith('/admin') && <Navbar />}

      {/* Main UI Layer */}
      <main className={`flex-grow relative z-10 w-full ${pathname === '/' || pathname.startsWith('/barberia') || pathname.startsWith('/terapias') || pathname.startsWith('/admin') ? '' : 'pt-24'}`}>
        {children}
      </main>

      {/* Booking Form Overlay */}
      <BookingModal />
    </div>
  );
}

export default ClientLayout;
