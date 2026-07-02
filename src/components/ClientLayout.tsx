'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useUIStore, SectionTheme } from '@/store/useUIStore';
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
  const [mounted, setMounted] = useState(false);

  // Load initial data actions from Supabase
  const fetchServicesAndSpecialists = useServicesStore(state => state.fetchServicesAndSpecialists);
  const fetchBookingsAndClients = useBookingStore(state => state.fetchBookingsAndClients);
  const fetchSchedules = useScheduleStore(state => state.fetchSchedules);
  const fetchGiftCards = useGiftCardStore(state => state.fetchGiftCards);
  const fetchContent = useContentStore(state => state.fetchContent);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Fetch all data from Supabase
    fetchServicesAndSpecialists();
    fetchBookingsAndClients();
    fetchSchedules();
    fetchGiftCards();
    fetchContent();
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans">
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-primary flex flex-col font-sans select-none relative">
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
