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
  const fetchContent = useContentStore(state => state.fetchContent);
  const hasFetched = useContentStore(state => state.hasFetched);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Fetch public data only
    fetchServicesAndSpecialists();
    fetchContent();
  }, [
    fetchServicesAndSpecialists,
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

  // Auto open booking modal if ?reserva=true or Instagram source is in URL
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source') || params.get('utm_source');
      const isReserva = params.get('reserva') === 'true';
      const isInstagram = source === 'instagram' || source === 'ig';

      if (isReserva || isInstagram) {
        let category: 'barberia' | 'peluqueria' | 'terapias' | undefined = undefined;
        if (pathname.startsWith('/barberia')) {
          category = 'barberia';
        } else if (pathname.startsWith('/peluqueria')) {
          category = 'peluqueria';
        } else if (pathname.startsWith('/terapias')) {
          category = 'terapias';
        }
        openBooking(undefined, category);
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
            className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
          >
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

            <div className="relative flex flex-col items-center justify-center z-10">
              {/* Golden pulsing branding image */}
              <motion.div
                animate={{
                  scale: [0.97, 1.01, 0.97],
                  opacity: [0.85, 1, 0.85]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] select-none pointer-events-none"
              >
                <img
                  src="/loading-logo-v1.jpg"
                  alt="Santuario de Bienestar Logo"
                  className="object-contain w-full h-full filter brightness-110 contrast-105"
                />
              </motion.div>
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
