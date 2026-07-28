'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Star } from 'lucide-react';
import { crossSellingMap } from '@/data/mockData';
import { useServicesStore } from '@/store/useServicesStore';
import { useUIStore } from '@/store/useUIStore';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import useContentStore from '@/store/useContentStore';
import JsonLd from '@/components/SEO/JsonLd';

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.ogg') ||
    url.includes('video') ||
    url.startsWith('data:video/')
  );
};

// Dynamically import the 3D Canvas to disable SSR
const BarberPoleCanvas = dynamic(() => import('@/components/BarberPoleCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center min-h-[400px]">
      <span className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

// Photo mapping for barbers to make it look high-fidelity and professional
const barberPhotos: Record<string, string> = {
  sb1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', // Carlos Mendoza
  sb2: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', // Enrique Soto
  sb3: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', // Marcos Delgado
  sb4: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80', // Javier Ortega
};

export default function BarberiaLayout() {
  const { content } = useContentStore();
  const { servicesData } = useServicesStore();
  const data = React.useMemo(() => {
    const original = servicesData.barberia;
    if (!original) return null;
    return {
      ...original,
      title: content.barberia.pageTitle,
      description: content.barberia.pageDescription
    };
  }, [content, servicesData]);
  const crossSell = crossSellingMap.barberia;
  const { openBooking } = useUIStore();

  // Splitscreen panel state management
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);
  const [activePanel, setActivePanel] = useState<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Selected sub-services
  const [selectedHair, setSelectedHair] = useState('b_corte_general');
  const [selectedBarba, setSelectedBarba] = useState('b_barba_perfilado_navaja');
  const [selectedCombo, setSelectedCombo] = useState('b_combo_corte_barba');
  const [addCejas, setAddCejas] = useState(false);

  if (!data) return null;

  // Custom data arrays for the 3 rituals resolved dynamically from the store
  const hairServices: any[] = [];
  const barbaServices: any[] = [];
  const comboServices: any[] = [];

  const barberiaServices = data.services || [];
  barberiaServices.forEach(s => {
    if (s.isActive === false) return;
    
    // Determine short display name
    let shortName = s.name;
    if (s.id === 'b_corte_general') shortName = 'Adulto';
    else if (s.id === 'b_corte_nino') shortName = 'Niño';
    else if (s.id === 'b_corte_3era') shortName = 'Tercera Edad';
    else if (s.id === 'b_barba_retoque') shortName = 'Retoque';
    else if (s.id === 'b_barba_perfilado_navaja') shortName = 'Perfilado Navaja';
    else if (s.id === 'b_barba_rasurado_ras') shortName = 'Rasurado al Ras';
    else if (s.id === 'b_barba_perfilado_retoque') shortName = 'Perfilado + Retoque';
    
    const item = {
      id: s.id,
      name: shortName,
      label: s.name,
      price: typeof s.price === 'number' ? `$${s.price.toLocaleString('es-CL')}` : s.price,
      duration: typeof s.duration === 'number' ? `${s.duration} min` : s.duration,
      notice: (s.description || '').includes('VÁLIDO') ? 'VÁLIDO SOLO CON PAGO EN EFECTIVO O TRANSFERENCIA' : undefined
    };
    
    // Categorize
    if (s.id.includes('combo') || s.name.toLowerCase().includes('+') || s.name.toLowerCase().includes('y barba') || s.name.toLowerCase().includes('& barba')) {
      comboServices.push(item);
    } else if (s.id.includes('barba') || s.id.includes('rasurado') || s.id.includes('perfilado') || s.name.toLowerCase().includes('barba') || s.name.toLowerCase().includes('afeitado') || s.name.toLowerCase().includes('perfilado')) {
      barbaServices.push(item);
    } else {
      hairServices.push(item);
    }
  });

  const currentHairService = hairServices.find(s => s.id === selectedHair) || hairServices[0];
  const currentBarbaService = barbaServices.find(s => s.id === selectedBarba) || barbaServices[0];
  const currentComboService = comboServices.find(s => s.id === selectedCombo) || comboServices[0];

  // Helper to parse duration strings to minutes
  const parseDuration = (d: string) => {
    if (d.includes('hrs')) {
      const parts = d.split(' ');
      const hrs = parseInt(parts[0], 10);
      const mins = parts.length > 2 ? parseInt(parts[2], 10) : 0;
      return hrs * 60 + mins;
    }
    return parseInt(d, 10);
  };

  // Helper to format combined prices with cejas add-on
  const getCombinedPrice = (basePriceStr: string) => {
    const base = parseInt(basePriceStr.replace(/[^0-9]/g, ''), 10);
    const total = addCejas ? base + 3500 : base;
    return `$${total.toLocaleString('es-CL')}`;
  };

  // Helper to format combined durations with cejas add-on
  const getCombinedDuration = (baseDurationStr: string) => {
    const baseMins = parseDuration(baseDurationStr);
    const total = addCejas ? baseMins + 15 : baseMins;
    if (total >= 60) {
      const hrs = Math.floor(total / 60);
      const mins = total % 60;
      return mins > 0 ? `${hrs} hrs ${mins} min` : `${hrs} hrs`;
    }
    return `${total} min`;
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    "name": "Valentes Studio - Barbería Tradicional",
    "image": "https://valentes.cl/hands-logo-v4.png",
    "priceRange": "$$$",
    "telephone": "+56953332492",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Santiago",
      "addressCountry": "CL"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "20:00"
    }
  };

  return (
    <div className="bg-[#000000] text-[#F0F0F0] min-h-screen relative font-sans transition-colors duration-700 overflow-x-hidden">
      <JsonLd data={schemaData} />
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="intro-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* 1. HERO SECTION (PORTADA / CUBIERTA) */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black px-6 md:px-16">
              {/* Subtle background radial glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/[0.015] rounded-full blur-[120px] pointer-events-none" />

              <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center justify-between z-10 gap-6 md:gap-10">
                {/* Left Side: Minimalist branding & Action button */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center md:text-left space-y-5 select-none order-2 md:order-1 flex-1 md:self-end md:pb-20"
                >
                   <div className="space-y-4">
                     {/* Premium Client Logo */}
                     <div className="relative w-36 h-36 md:w-28 md:h-28 mx-auto md:mx-0 transition-transform duration-700 hover:scale-105 hover:rotate-1">
                       <Image
                         src="/hands-logo-v4.png"
                         alt="Valentes Studio Logo"
                         fill
                         sizes="(max-width: 768px) 144px, 112px"
                         className="object-contain"
                         priority
                       />
                     </div>
                     <div className="space-y-2">
                       <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-[0.25em] text-gold animate-text-gold-flow leading-none select-none">
                         {content.barberia.heroTitle}
                       </h1>
                       <h2 className="font-serif text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.6em] text-[#D7AF68] uppercase font-medium leading-none pl-1 select-none">
                         {content.barberia.heroSubtitle}
                       </h2>
                     </div>
                   </div>
                   
                   <div className="pt-6">
                     <button
                       onClick={() => setShowIntro(false)}
                       className="px-8 py-3.5 rounded-full border border-[#D7AF68]/30 text-[#D7AF68] text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#D7AF68] hover:text-black hover:border-[#D7AF68] transition-all duration-500 flex items-center space-x-2 mx-auto md:mx-0 cursor-pointer shadow-lg hover:shadow-[#D7AF68]/15 hover:scale-105 active:scale-95 group shimmer-button"
                     >
                       <span>{content.barberia.discoverBtn}</span>
                       <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                     </button>
                   </div>
                </motion.div>

                {/* Right Side: Floating 3D Barber Pole (Hidden on mobile) */}
                <div className="hidden md:flex w-[240px] h-[300px] md:w-[260px] md:h-[360px] relative items-center justify-center order-1 md:order-2 md:mt-12">
                  <BarberPoleCanvas />
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="catalog-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full relative z-10"
          >
            {/* Back to Home Button (floating below navbar, hidden on mobile) */}
            <button
              onClick={() => {
                setShowIntro(true);
                setActivePanel(null);
              }}
              className="hidden md:flex absolute left-6 top-28 z-30 text-[9px] uppercase tracking-widest text-white/50 hover:text-gold hover:border-gold/30 transition-all border border-white/10 rounded-full px-4.5 py-2 bg-black/40 backdrop-blur-sm items-center space-x-1.5 cursor-pointer shadow-lg"
            >
              <span>← Inicio</span>
            </button>

            {/* Tríptico Container: Occupies full screen height and integrates with navbar */}
            <div className="flex flex-col lg:flex-row w-full min-h-screen lg:h-screen overflow-hidden bg-black relative z-10">
                
                {/* Panel 1: Cabello */}
                <div
                  onClick={() => setActivePanel(activePanel === 1 ? null : 1)}
                  onMouseEnter={() => setHoveredPanel(1)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out flex flex-col justify-end p-8 border-b lg:border-b-0 lg:border-r border-white/5 ${
                    activePanel === null
                      ? hoveredPanel === 1
                        ? 'flex-[1.5] min-h-[300px] lg:min-h-0'
                        : hoveredPanel !== null
                          ? 'flex-[0.75] min-h-[200px] lg:min-h-0'
                          : 'flex-1 min-h-[250px] lg:min-h-0'
                      : activePanel === 1
                        ? 'flex-[3] min-h-[450px] lg:min-h-0'
                        : 'flex-[0.5] min-h-[120px] lg:min-h-0'
                  }`}
                >
                  <div className="absolute inset-0 z-0 select-none pointer-events-none">
                    {isVideoUrl(content.barberia.imageCabello) ? (
                      <video
                        src={content.barberia.imageCabello}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`object-cover w-full h-full transition-all duration-1000 ${
                          activePanel === 1 || hoveredPanel === 1
                            ? 'grayscale-0 scale-105 brightness-75'
                            : 'grayscale opacity-60 brightness-[0.55]'
                        }`}
                      />
                    ) : (
                      <Image
                        src={content.barberia.imageCabello}
                        alt="Ritual de Cabello"
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className={`object-cover transition-all duration-1000 ${
                          activePanel === 1 || hoveredPanel === 1
                            ? 'grayscale-0 scale-105 brightness-75'
                            : 'grayscale opacity-60 brightness-[0.55]'
                        }`}
                      />
                    )}
                    {/* Warm brand tint overlay (mix-blend-color) */}
                    <div 
                      className={`absolute inset-0 transition-colors duration-700 pointer-events-none z-1 ${
                        activePanel === 1 || hoveredPanel === 1
                          ? 'bg-gold/15'
                          : 'bg-gold/5'
                      }`}
                      style={{ mixBlendMode: 'color' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
                  </div>

                  {/* Label and titles */}
                  <div className="relative z-10 text-left transition-all duration-500">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-1">
                      Ritual 01
                    </span>
                    <h3 className="font-serif text-2xl lg:text-3xl text-white tracking-wide font-medium">
                      {content.barberia.titleCabello || 'Ritual de Cabello'}
                    </h3>
                    
                    {activePanel !== 1 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-xs text-text-secondary font-light"
                      >
                        {content.barberia.priceCabello || 'Desde $12.000'} • 45 min
                      </motion.div>
                    )}
                  </div>

                  {/* Panel 1 Drawer (Cabello Options) */}
                  <AnimatePresence>
                    {activePanel === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-25 mt-6 bg-[#070707]/95 backdrop-blur-md border border-gold/15 rounded-2xl p-5 space-y-4 text-left shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">
                            Selecciona tu Perfil:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {hairServices.map((service) => {
                              const isSelected = selectedHair === service.id || (!hairServices.some(s => s.id === selectedHair) && service.id === currentHairService?.id);
                              return (
                                <button
                                  key={service.id}
                                  onClick={() => setSelectedHair(service.id)}
                                  className={`p-3 rounded-xl border text-xs text-left transition-all duration-300 ${
                                    isSelected
                                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.15)]'
                                      : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20'
                                  }`}
                                >
                                  <div className="font-bold text-[11px] uppercase tracking-wider">{service.name}</div>
                                  <div className="text-[10px] text-text-secondary font-medium mt-0.5">{service.price}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Cejas Add-on */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                          <div className="text-left space-y-0.5">
                            <div className="text-[11px] font-semibold text-white">Perfilado de Cejas</div>
                            <div className="text-[9px] text-text-secondary leading-tight">Agrega perfilado de cejas y/o líneas por solo +$3.500 (+15 min)</div>
                          </div>
                          <button
                            onClick={() => setAddCejas(!addCejas)}
                            className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center space-x-1 ${
                              addCejas
                                ? 'bg-gold text-black shadow-md'
                                : 'border border-white/10 text-white hover:border-gold/30 hover:text-gold'
                            }`}
                          >
                            {addCejas ? 'Añadido' : 'Añadir'}
                          </button>
                        </div>

                        {/* Notice for child/senior */}
                        {currentHairService?.notice && (
                          <div className="text-[9px] text-gold/80 bg-gold/5 border border-gold/10 px-3 py-2 rounded-lg font-light leading-relaxed">
                            * {currentHairService.notice}
                          </div>
                        )}

                        {/* Booking Trigger */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="text-left">
                            <span className="text-[8px] uppercase tracking-widest text-text-secondary block leading-none">Precio Total</span>
                            <div className="flex items-baseline space-x-1.5 mt-0.5">
                              <span className="text-lg font-serif font-bold text-gold">
                                {currentHairService ? getCombinedPrice(currentHairService.price) : ''}
                              </span>
                              <span className="text-[9px] text-text-secondary uppercase">
                                {currentHairService ? getCombinedDuration(currentHairService.duration) : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const s = currentHairService;
                                if (!s) return;
                                openBooking({
                                  id: s.id,
                                  name: s.label + (addCejas ? ' + Cejas' : ''),
                                  price: getCombinedPrice(s.price)
                                });
                              }}
                              className="px-5 py-2.5 rounded-full bg-gold hover:bg-gold/90 text-black text-[9px] uppercase tracking-widest font-bold transition-all hover:scale-105 active:scale-95 shimmer-button"
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Panel 2: Barba */}
                <div
                  onClick={() => setActivePanel(activePanel === 2 ? null : 2)}
                  onMouseEnter={() => setHoveredPanel(2)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out flex flex-col justify-end p-8 border-b lg:border-b-0 lg:border-r border-white/5 ${
                    activePanel === null
                      ? hoveredPanel === 2
                        ? 'flex-[1.5] min-h-[300px] lg:min-h-0'
                        : hoveredPanel !== null
                          ? 'flex-[0.75] min-h-[200px] lg:min-h-0'
                          : 'flex-1 min-h-[250px] lg:min-h-0'
                      : activePanel === 2
                        ? 'flex-[3] min-h-[450px] lg:min-h-0'
                        : 'flex-[0.5] min-h-[120px] lg:min-h-0'
                  }`}
                >
                  <div className="absolute inset-0 z-0 select-none pointer-events-none">
                    {isVideoUrl(content.barberia.imageBarba) ? (
                      <video
                        src={content.barberia.imageBarba}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`object-cover w-full h-full transition-all duration-1000 ${
                          activePanel === 2 || hoveredPanel === 2
                            ? 'grayscale-0 scale-105 brightness-75'
                            : 'grayscale opacity-60 brightness-[0.55]'
                        }`}
                      />
                    ) : (
                      <Image
                        src={content.barberia.imageBarba}
                        alt="Ritual de Barba"
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className={`object-cover transition-all duration-1000 ${
                          activePanel === 2 || hoveredPanel === 2
                            ? 'grayscale-0 scale-105 brightness-75'
                            : 'grayscale opacity-60 brightness-[0.55]'
                        }`}
                      />
                    )}
                    {/* Warm brand tint overlay (mix-blend-color) */}
                    <div 
                      className={`absolute inset-0 transition-colors duration-700 pointer-events-none z-1 ${
                        activePanel === 2 || hoveredPanel === 2
                          ? 'bg-gold/15'
                          : 'bg-gold/5'
                      }`}
                      style={{ mixBlendMode: 'color' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
                  </div>

                  {/* Label and titles */}
                  <div className="relative z-10 text-left transition-all duration-500">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-1">
                      Ritual 02
                    </span>
                    <h3 className="font-serif text-2xl lg:text-3xl text-white tracking-wide font-medium">
                      {content.barberia.titleBarba || 'Ritual de Barba'}
                    </h3>
                    
                    {activePanel !== 2 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-xs text-text-secondary font-light"
                      >
                        {content.barberia.priceBarba || 'Desde $12.000'} • 30-45 min
                      </motion.div>
                    )}
                  </div>

                  {/* Panel 2 Drawer (Barba Options) */}
                  <AnimatePresence>
                    {activePanel === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-25 mt-6 bg-[#070707]/95 backdrop-blur-md border border-gold/15 rounded-2xl p-5 space-y-4 text-left shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">
                            Selecciona el Estilo:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {barbaServices.map((service) => {
                              const isSelected = selectedBarba === service.id || (!barbaServices.some(s => s.id === selectedBarba) && service.id === currentBarbaService?.id);
                              return (
                                <button
                                  key={service.id}
                                  onClick={() => setSelectedBarba(service.id)}
                                  className={`p-3 rounded-xl border text-xs text-left transition-all duration-300 ${
                                    isSelected
                                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.15)]'
                                      : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20'
                                  }`}
                                >
                                  <div className="font-bold text-[11px] uppercase tracking-wider">{service.name}</div>
                                  <div className="text-[10px] text-text-secondary font-medium mt-0.5">{service.price}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Cejas Add-on */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                          <div className="text-left space-y-0.5">
                            <div className="text-[11px] font-semibold text-white">Perfilado de Cejas</div>
                            <div className="text-[9px] text-text-secondary leading-tight">Agrega perfilado de cejas y/o líneas por solo +$3.500 (+15 min)</div>
                          </div>
                          <button
                            onClick={() => setAddCejas(!addCejas)}
                            className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center space-x-1 ${
                              addCejas
                                ? 'bg-gold text-black shadow-md'
                                : 'border border-white/10 text-white hover:border-gold/30 hover:text-gold'
                            }`}
                          >
                            {addCejas ? 'Añadido' : 'Añadir'}
                          </button>
                        </div>

                        {/* Booking Trigger */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="text-left">
                            <span className="text-[8px] uppercase tracking-widest text-text-secondary block leading-none">Precio Total</span>
                            <div className="flex items-baseline space-x-1.5 mt-0.5">
                              <span className="text-lg font-serif font-bold text-gold">
                                {currentBarbaService ? getCombinedPrice(currentBarbaService.price) : ''}
                              </span>
                              <span className="text-[9px] text-text-secondary uppercase">
                                {currentBarbaService ? getCombinedDuration(currentBarbaService.duration) : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const s = currentBarbaService;
                                if (!s) return;
                                openBooking({
                                  id: s.id,
                                  name: s.label + (addCejas ? ' + Cejas' : ''),
                                  price: getCombinedPrice(s.price)
                                });
                              }}
                              className="px-5 py-2.5 rounded-full bg-gold hover:bg-gold/90 text-black text-[9px] uppercase tracking-widest font-bold transition-all hover:scale-105 active:scale-95 shimmer-button"
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Panel 3: Completo */}
                <div
                  onClick={() => setActivePanel(activePanel === 3 ? null : 3)}
                  onMouseEnter={() => setHoveredPanel(3)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out flex flex-col justify-end p-8 ${
                    activePanel === null
                      ? hoveredPanel === 3
                        ? 'flex-[1.5] min-h-[300px] lg:min-h-0'
                        : hoveredPanel !== null
                          ? 'flex-[0.75] min-h-[200px] lg:min-h-0'
                          : 'flex-1 min-h-[250px] lg:min-h-0'
                      : activePanel === 3
                        ? 'flex-[3] min-h-[450px] lg:min-h-0'
                        : 'flex-[0.5] min-h-[120px] lg:min-h-0'
                  }`}
                >
                  <div className="absolute inset-0 z-0 select-none pointer-events-none">
                    {isVideoUrl(content.barberia.imageCompleto) ? (
                      <video
                        src={content.barberia.imageCompleto}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`object-cover w-full h-full transition-all duration-1000 ${
                          activePanel === 3 || hoveredPanel === 3
                            ? 'grayscale-0 scale-105 brightness-75'
                            : 'grayscale opacity-60 brightness-[0.55]'
                        }`}
                      />
                    ) : (
                      <Image
                        src={content.barberia.imageCompleto}
                        alt="Ritual Completo"
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className={`object-cover transition-all duration-1000 ${
                          activePanel === 3 || hoveredPanel === 3
                            ? 'grayscale-0 scale-105 brightness-75'
                            : 'grayscale opacity-60 brightness-[0.55]'
                        }`}
                      />
                    )}
                    {/* Warm brand tint overlay (mix-blend-color) */}
                    <div 
                      className={`absolute inset-0 transition-colors duration-700 pointer-events-none z-1 ${
                        activePanel === 3 || hoveredPanel === 3
                          ? 'bg-gold/15'
                          : 'bg-gold/5'
                      }`}
                      style={{ mixBlendMode: 'color' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-1" />
                  </div>

                  {/* Label and titles */}
                  <div className="relative z-10 text-left transition-all duration-500">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-1">
                      Ritual 03
                    </span>
                    <h3 className="font-serif text-2xl lg:text-3xl text-white tracking-wide font-medium">
                      {content.barberia.titleCompleto || 'Ritual Completo'}
                    </h3>
                    
                    {activePanel !== 3 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-xs text-text-secondary font-light"
                      >
                        {content.barberia.priceCompleto || 'Desde $20.000'} • 60-80 min
                      </motion.div>
                    )}
                  </div>

                  {/* Panel 3 Drawer (Completo Options) */}
                  <AnimatePresence>
                    {activePanel === 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-25 mt-6 bg-[#070707]/95 backdrop-blur-md border border-gold/15 rounded-2xl p-5 space-y-4 text-left shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">
                            Selecciona tu Combo:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {comboServices.map((service) => {
                              const isSelected = selectedCombo === service.id || (!comboServices.some(s => s.id === selectedCombo) && service.id === currentComboService?.id);
                              return (
                                <button
                                  key={service.id}
                                  onClick={() => setSelectedCombo(service.id)}
                                  className={`p-3 rounded-xl border text-xs text-left transition-all duration-300 ${
                                    isSelected
                                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.15)]'
                                      : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20'
                                  }`}
                                >
                                  <div className="font-bold text-[11px] uppercase tracking-wider">{service.name}</div>
                                  <div className="text-[10px] text-text-secondary font-medium mt-0.5">{service.price}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Cejas Add-on */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                          <div className="text-left space-y-0.5">
                            <div className="text-[11px] font-semibold text-white">Perfilado de Cejas</div>
                            <div className="text-[9px] text-text-secondary leading-tight">Agrega perfilado de cejas y/o líneas por solo +$3.500 (+15 min)</div>
                          </div>
                          <button
                            onClick={() => setAddCejas(!addCejas)}
                            className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center space-x-1 ${
                              addCejas
                                ? 'bg-gold text-black shadow-md'
                                : 'border border-white/10 text-white hover:border-gold/30 hover:text-gold'
                            }`}
                          >
                            {addCejas ? 'Añadido' : 'Añadir'}
                          </button>
                        </div>

                        {/* Booking Trigger */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="text-left">
                            <span className="text-[8px] uppercase tracking-widest text-text-secondary block leading-none">Precio Total</span>
                            <div className="flex items-baseline space-x-1.5 mt-0.5">
                              <span className="text-lg font-serif font-bold text-gold">
                                {currentComboService ? getCombinedPrice(currentComboService.price) : ''}
                              </span>
                              <span className="text-[9px] text-text-secondary uppercase">
                                {currentComboService ? getCombinedDuration(currentComboService.duration) : ''}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const s = currentComboService;
                                if (!s) return;
                                openBooking({
                                  id: s.id,
                                  name: s.label + (addCejas ? ' + Cejas' : ''),
                                  price: getCombinedPrice(s.price)
                                });
                              }}
                              className="px-5 py-2.5 rounded-full bg-gold hover:bg-gold/90 text-black text-[9px] uppercase tracking-widest font-bold transition-all hover:scale-105 active:scale-95 shimmer-button"
                            >
                              Reservar
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            {/* 3. SPECIALISTS GRID (EEAT) */}
            <section className="max-w-7xl mx-auto px-6 py-24 md:py-36 border-t border-white/5 bg-[#000000] space-y-12">
              <div className="text-center lg:text-left space-y-3 max-w-2xl">
                <span className="text-xs uppercase tracking-widest font-semibold text-gold">
                  Maestros del Bienestar
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-white tracking-wide">Nuestros Especialistas</h2>
                <p className="text-sm text-text-secondary leading-relaxed font-light">
                  Profesionales altamente experimentados y dedicados a la excelencia. Cada sesión combina su maestría técnica con un profundo respeto por tu bienestar individual.
                </p>
              </div>

              <div className="flex flex-wrap md:flex-nowrap justify-center gap-x-6 gap-y-12 md:gap-x-4 lg:gap-x-6 xl:gap-x-8 py-12 md:pb-24">
                {data.specialists.map((specialist, index) => {
                  return (
                    <div 
                      key={specialist.id}
                      className={`relative w-[280px] h-[340px] md:w-[220px] md:h-[265px] lg:w-[250px] lg:h-[305px] xl:w-[280px] xl:h-[340px] group transition-all duration-500 ease-out select-none
                        ${index > 0 ? '-mt-8 md:mt-0' : ''}
                      `}
                      style={{
                        filter: 'drop-shadow(0 0 10px rgba(198, 155, 60, 0.05))',
                      }}
                    >
                      {/* Outer Hexagon (Clipping mask) */}
                      <div 
                        className="absolute inset-0 bg-[#0c0c0c] hover:bg-[#0f0f0f] transition-colors duration-500 overflow-hidden"
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                        }}
                      >
                        {/* Photo Container */}
                        <div className="absolute top-0 left-0 right-0 h-[52%] overflow-hidden">
                          {specialist.imageUrl || barberPhotos[specialist.id] ? (
                            <Image
                              src={specialist.imageUrl || barberPhotos[specialist.id]}
                              alt={specialist.name}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 280px, 290px"
                              className={`object-cover ${
                                specialist.id === 'ba_sp_1783360528525' || specialist.id === 'ba_sp_1783116885397_827'
                                  ? 'object-top'
                                  : 'object-center'
                              } grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-700 ease-out`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 font-serif text-4xl font-bold text-gold/80">
                              {specialist.avatar}
                            </div>
                          )}
                          {/* Subtle gradient to mask photo into the black card bg */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0c0c]/40 to-[#0c0c0c] z-10" />
                          
                          {/* Star Badge */}
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-15 w-6 h-6 rounded-full bg-black/60 border border-gold/30 text-gold flex items-center justify-center backdrop-blur-xs scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Star size={10} className="fill-gold" />
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="absolute inset-x-0 bottom-0 top-[48%] flex flex-col justify-start items-center text-center px-7 pb-8 pt-2 z-10">
                          <h3 className="font-serif text-base md:text-xs lg:text-sm xl:text-base text-white tracking-wide font-semibold mb-0.5 group-hover:text-gold transition-colors duration-300">
                            {specialist.name}
                          </h3>
                          <span className="text-[9px] md:text-[8px] lg:text-[9px] uppercase tracking-[0.2em] font-bold text-gold mb-1">
                            {specialist.role}
                          </span>
                          <div className="text-[10px] md:text-[8px] lg:text-[9px] text-white/50 italic mb-2 px-1 leading-tight border-b border-white/5 pb-1 max-w-[90%] truncate">
                            {specialist.specialty}
                          </div>
                          <p className="text-[11px] md:text-[9px] lg:text-[10px] xl:text-[11px] text-text-secondary leading-relaxed font-light max-w-[90%] line-clamp-3 group-hover:text-white/80 transition-colors duration-300">
                            {specialist.bio}
                          </p>
                        </div>
                      </div>

                      {/* SVG Glowing Border Overlay */}
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none z-25"
                      >
                        <defs>
                          <filter id={`gold-glow-${specialist.id}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        {/* Base golden line */}
                        <polygon
                          points="50,0.5 99.5,25 99.5,75 50,99.5 0.5,75 0.5,25"
                          fill="none"
                          stroke="#D4AF37"
                          strokeWidth="0.8"
                          strokeOpacity="0.25"
                          className="group-hover:stroke-opacity-60 transition-all duration-500"
                        />
                        {/* Active circulating light segment */}
                        <polygon
                          points="50,0.5 99.5,25 99.5,75 50,99.5 0.5,75 0.5,25"
                          fill="none"
                          stroke="#F3D078"
                          strokeWidth="1.5"
                          strokeDasharray="80 241"
                          className="animate-circulate-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            filter: `url(#gold-glow-${specialist.id})`,
                          }}
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. CROSS-SELLING MODULE */}
            {crossSell && (
              <section className="max-w-7xl mx-auto px-6 pb-32 pt-12 relative z-20 bg-[#000000]">
                <div className="relative rounded-3xl overflow-hidden apple-gold-glass p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 border border-gold/15 bg-white/[0.01]">
                  <div className="absolute -top-12 -left-12 w-80 h-80 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="space-y-5 relative z-10 max-w-3xl text-left">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/10 text-[9px] text-gold uppercase tracking-[0.2em] font-semibold">
                      <Sparkles size={11} className="text-gold" />
                      <span>{crossSell.title}</span>
                    </div>
                    <h3 className="font-serif text-3xl md:text-4xl text-white tracking-wide leading-snug">
                      {crossSell.subtitle}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed font-light">
                      {crossSell.recommendation}
                    </p>
                  </div>

                  <div className="flex-shrink-0 relative z-10 w-full lg:w-auto">
                    <Link
                      href={crossSell.path}
                      className="w-full lg:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full border border-gold text-gold text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-black transition-all duration-300 cursor-pointer shadow-lg shadow-gold/5 font-semibold shimmer-button"
                    >
                      <span>Descubrir Más</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
