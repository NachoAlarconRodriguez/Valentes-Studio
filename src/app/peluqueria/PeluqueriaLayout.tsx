'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, ChevronRight, ChevronLeft, X, Star, Scissors } from 'lucide-react';
import { crossSellingMap } from '@/data/mockData';
import { useServicesStore } from '@/store/useServicesStore';
import { useUIStore } from '@/store/useUIStore';
import Link from 'next/link';
import Image from 'next/image';
import useContentStore from '@/store/useContentStore';
import JsonLd from '@/components/SEO/JsonLd';
import { useBrandDomain } from '@/hooks/useBrandDomain';

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

interface CardItem {
  id: string;
  type: 'service' | 'deco' | 'deco-vertical-text' | 'gallery-trigger' | 'specialists-trigger' | 'services-trigger';
  text?: string;
  service?: {
    id: string;
    name: string;
    price: string;
    duration: string;
  };
  imageUrl: string;
  gridClass: string;
}

const specialistPhotos: Record<string, string> = {
  sp1: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', // Sofia Valente
  sp2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80', // Lucía Rivas
  sp3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', // Andrés Silva
  sp4: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', // Valentina Paz
};

export default function PeluqueriaLayout() {
  const { isAlmaBela } = useBrandDomain();
  const [isEntered, setIsEntered] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSpecialistsOpen, setIsSpecialistsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState(0);
  const { content } = useContentStore();
  const { servicesData } = useServicesStore();

  const galleryItems = content.peluqueria.galleryItems || [];
  const currentItem = galleryItems[selectedGalleryIdx] || galleryItems[0] || {
    id: '',
    title: '',
    technique: '',
    stylist: '',
    duration: '',
    price: '',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
  };

  // Auto-play gallery items when modal is open
  React.useEffect(() => {
    if (!isGalleryOpen || galleryItems.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedGalleryIdx((prev) => (prev + 1) % galleryItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isGalleryOpen, galleryItems.length, selectedGalleryIdx]);

  const data = React.useMemo(() => {
    const original = servicesData.peluqueria;
    if (!original) return null;
    return {
      ...original,
      title: content.peluqueria.pageTitle,
      description: content.peluqueria.pageDescription
    };
  }, [content, servicesData]);
  const crossSell = crossSellingMap.peluqueria;
  const { openBooking } = useUIStore();

  if (!data) return null;

  // All active peluquería services (for the services modal)
  const allActiveServices = (data.services || []).filter(s => s.isActive !== false);

  // Group services into named categories by keyword detection
  const SERVICE_GROUPS: { label: string; keywords: string[] }[] = [
    { label: 'Cortes', keywords: ['corte', 'corte masculino', 'corte femenino', 'corte infantil', 'diseño'] },
    { label: 'Color & Técnicas', keywords: ['color', 'coloración', 'balayage', 'reflejo', 'iluminación', 'tinte', 'mechas', 'babylight'] },
    { label: 'Tratamientos', keywords: ['tratamiento', 'hidratación', 'seda', 'keratina', 'nutritiva', 'brillo', 'salud', 'profunda'] },
    { label: 'Peinados & Styling', keywords: ['peinado', 'brushing', 'ondas', 'plancha', 'styling', 'secado', 'editorial'] },
  ];

  function getServiceGroup(name: string): string {
    const lower = name.toLowerCase();
    for (const group of SERVICE_GROUPS) {
      if (group.keywords.some(kw => lower.includes(kw))) return group.label;
    }
    return 'Otros Servicios';
  }

  // Build ordered group map preserving the SERVICE_GROUPS order
  const groupedServices: Record<string, typeof allActiveServices> = {};
  const groupOrder: string[] = [];
  SERVICE_GROUPS.forEach(g => { groupedServices[g.label] = []; });
  groupedServices['Otros Servicios'] = [];
  allActiveServices.forEach(s => {
    const gLabel = getServiceGroup(s.name);
    if (!groupOrder.includes(gLabel)) groupOrder.push(gLabel);
    groupedServices[gLabel].push(s);
  });
  // Final order: keep SERVICE_GROUPS order, append Otros at the end
  const finalGroupOrder = [
    ...SERVICE_GROUPS.map(g => g.label).filter(l => groupedServices[l]?.length > 0),
    ...(groupedServices['Otros Servicios']?.length > 0 ? ['Otros Servicios'] : [])
  ];

  // Fixed bento grid — 12 static cards, NO extra service cards appended
  const cards: CardItem[] = [
    {
      id: 'c1',
      type: 'service',
      service: allActiveServices[0] ? { 
        id: allActiveServices[0].id, 
        name: allActiveServices[0].name, 
        price: typeof allActiveServices[0].price === 'number' ? `$${allActiveServices[0].price.toLocaleString('es-CL')}` : allActiveServices[0].price, 
        duration: typeof allActiveServices[0].duration === 'number' ? `${allActiveServices[0].duration} min` : allActiveServices[0].duration 
      } : undefined,
      imageUrl: content.peluqueria.bentoImageC1 || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-2'
    },
    {
      id: 'c2',
      type: 'gallery-trigger',
      imageUrl: content.peluqueria.bentoImageC2 || 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'c3',
      type: 'service',
      service: allActiveServices[1] ? { 
        id: allActiveServices[1].id, 
        name: allActiveServices[1].name, 
        price: typeof allActiveServices[1].price === 'number' ? `$${allActiveServices[1].price.toLocaleString('es-CL')}` : allActiveServices[1].price, 
        duration: typeof allActiveServices[1].duration === 'number' ? `${allActiveServices[1].duration} min` : allActiveServices[1].duration 
      } : undefined,
      imageUrl: content.peluqueria.bentoImageC3 || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-2'
    },
    {
      id: 'c4',
      type: 'deco-vertical-text',
      text: 'ALMA BELA',
      imageUrl: content.peluqueria.bentoImageC4 || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-3'
    },
    {
      id: 'c5',
      type: 'service',
      service: allActiveServices[2] ? { 
        id: allActiveServices[2].id, 
        name: allActiveServices[2].name, 
        price: typeof allActiveServices[2].price === 'number' ? `$${allActiveServices[2].price.toLocaleString('es-CL')}` : allActiveServices[2].price, 
        duration: typeof allActiveServices[2].duration === 'number' ? `${allActiveServices[2].duration} min` : allActiveServices[2].duration 
      } : undefined,
      imageUrl: content.peluqueria.bentoImageC5 || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-2'
    },
    {
      id: 'c6',
      type: 'specialists-trigger',
      imageUrl: content.peluqueria.bentoImageC6 || 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      // This was the plain 'deco' card — now it's the services-trigger
      id: 'c7',
      type: 'services-trigger',
      imageUrl: content.peluqueria.bentoImageC7 || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'c8',
      type: 'service',
      service: allActiveServices[3] ? { 
        id: allActiveServices[3].id, 
        name: allActiveServices[3].name, 
        price: typeof allActiveServices[3].price === 'number' ? `$${allActiveServices[3].price.toLocaleString('es-CL')}` : allActiveServices[3].price, 
        duration: typeof allActiveServices[3].duration === 'number' ? `${allActiveServices[3].duration} min` : allActiveServices[3].duration 
      } : undefined,
      imageUrl: content.peluqueria.bentoImageC8 || 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'c9',
      type: 'deco',
      imageUrl: content.peluqueria.bentoImageC9 || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-2'
    },
    {
      id: 'c10',
      type: 'deco',
      imageUrl: content.peluqueria.bentoImageC10 || 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-2'
    },
    {
      id: 'c11',
      type: 'deco',
      imageUrl: content.peluqueria.bentoImageC11 || 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'c12',
      type: 'deco',
      imageUrl: content.peluqueria.bentoImageC12 || 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
      gridClass: 'md:col-span-1 md:row-span-1'
    }
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "name": "Alma Bela Studio - Peluquería de Autor",
    "image": "https://almabela.cl/peluqueria-logo-v4.png",
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
    <div className="bg-[#030303] text-[#fdfbf7] min-h-screen relative font-sans transition-colors duration-700 overflow-x-hidden">
      <JsonLd data={schemaData} />
      
      {/* 1. ENTRANCE OVERLAY (COVER SCREEN) */}
      <AnimatePresence>
        {!isEntered && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white"
            style={{
              background: 'radial-gradient(circle, rgba(10, 10, 10, 0.75) 0%, rgba(10, 10, 10, 0.45) 100%)',
            }}
          >
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

            <div className="relative z-10 max-w-sm w-full px-6 flex flex-col items-center">
              {/* Elegant floating branding without card container */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col items-center justify-center space-y-8"
              >
                {/* Premium Logo */}
                <div className="relative w-28 h-28 hover:scale-105 transition-transform duration-500 select-none pointer-events-none">
                  <Image
                    src="/peluqueria-logo-v4.png"
                    alt="Alma Bela Studio Logo"
                    fill
                    sizes="112px"
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Normal Stacked Text (Horizontal) */}
                <div className="flex flex-col items-center justify-center space-y-2 select-none text-center">
                  <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-[0.25em] text-gold animate-text-gold-flow leading-none select-none">
                    {content.peluqueria.overlayLine1}
                  </h2>
                  <h2 className="font-serif text-5xl md:text-7xl font-bold tracking-[0.25em] text-gold animate-text-gold-flow leading-none select-none mt-2">
                    {content.peluqueria.overlayLine2}
                  </h2>
                </div>

                {/* Subtitle Separator */}
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="w-20 h-[1px] bg-[#D7AF68]/50" />
                  <span className="text-xs uppercase tracking-[0.7em] text-[#D7AF68]/90 font-semibold filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    {content.peluqueria.overlaySubtitle}
                  </span>
                </div>

                {/* Enter Button */}
                <button
                  onClick={() => setIsEntered(true)}
                  className="w-full max-w-[260px] py-4 border border-[#D7AF68]/45 text-[#D7AF68] text-xs uppercase tracking-[0.3em] rounded-full hover:bg-[#D7AF68] hover:text-black hover:border-[#D7AF68] transition-all duration-500 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-lg shadow-black/30 bg-black/20 backdrop-blur-xs font-semibold"
                >
                  INGRESAR AL RITUAL
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN PAGE WRAPPER */}
      <div 
        className={`transition-all duration-1000 ${
          !isEntered ? 'pointer-events-none opacity-95' : 'blur-0 opacity-100'
        }`}
      >
        {/* Asymmetric FLOEMA-Style Grid Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 auto-rows-[250px] md:auto-rows-[270px]">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                onClick={() => {
                  if (card.type === 'service' && card.service) {
                    openBooking({
                      id: card.service.id,
                      name: card.service.name,
                      price: card.service.price
                    });
                  } else if (card.type === 'gallery-trigger') {
                    setIsGalleryOpen(true);
                  } else if (card.type === 'specialists-trigger') {
                    setIsSpecialistsOpen(true);
                  } else if (card.type === 'services-trigger') {
                    setIsServicesOpen(true);
                  }
                }}
                className={`relative overflow-hidden rounded-3xl bg-[#090909] border border-white/5 cursor-pointer group transition-all duration-500 shadow-md hover:shadow-xl ${card.gridClass}`}
              >
                {/* Asymmetrical grid image or video with gold-tinted overlay */}
                {isVideoUrl(card.imageUrl) ? (
                  <video
                    src={card.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full opacity-55 contrast-105 brightness-90 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-103"
                  />
                ) : (
                  <Image
                    src={card.imageUrl}
                    alt={card.type === 'service' ? (card.service?.name || 'Servicio') : 'Alma Bela'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    className="object-cover opacity-55 contrast-105 brightness-90 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-103"
                  />
                )}
                {/* Warm brand tint overlay (mix-blend-color) */}
                <div 
                  className="absolute inset-0 bg-bronze/5 group-hover:bg-bronze/15 transition-colors duration-700 pointer-events-none z-1"
                  style={{ mixBlendMode: 'color' }}
                />

                {/* Gallery trigger hover layout */}
                {card.type === 'gallery-trigger' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white transition-all duration-500">
                    <div className="space-y-1 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[9px] uppercase tracking-widest text-gold/80 block flex items-center gap-1 font-semibold">
                        <Sparkles size={10} />
                        Portafolio de Arte
                      </span>
                      <h3 className="font-serif text-lg tracking-wide font-medium leading-snug">
                        {content.peluqueria.galeriaTriggerTitle || 'Galería de Trabajos'}
                      </h3>
                      <div className="flex justify-between items-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[9px] uppercase tracking-widest border border-gold/40 text-gold px-3 py-1 rounded-full hover:bg-gold hover:text-black hover:border-gold transition-colors font-medium">
                          Explorar Galería
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vertical text overlay matching FLOEMA style in Gold */}
                {card.type === 'deco-vertical-text' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span 
                      className="font-serif text-gold/20 text-5xl md:text-7xl tracking-[0.4em] uppercase whitespace-nowrap" 
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      {card.text}
                    </span>
                  </div>
                )}

                {/* Specialists trigger hover layout */}
                {card.type === 'specialists-trigger' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white transition-all duration-500">
                    <div className="space-y-1 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[9px] uppercase tracking-widest text-gold/80 block flex items-center gap-1 font-semibold">
                        <Star size={10} className="fill-gold/85" />
                        Estilo &amp; Experiencia
                      </span>
                      <h3 className="font-serif text-lg tracking-wide font-medium leading-snug">
                        {content.peluqueria.specialistsTriggerTitle || 'Nuestras Especialistas'}
                      </h3>
                      <div className="flex justify-between items-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[9px] uppercase tracking-widest border border-gold/40 text-gold px-3 py-1 rounded-full hover:bg-gold hover:text-black hover:border-gold transition-colors font-medium">
                          Ver Equipo
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services trigger hover layout */}
                {card.type === 'services-trigger' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white transition-all duration-500">
                    <div className="space-y-1 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[9px] uppercase tracking-widest text-gold/80 block flex items-center gap-1 font-semibold">
                        <Scissors size={10} />
                        Carta de Servicios
                      </span>
                      <h3 className="font-serif text-lg tracking-wide font-medium leading-snug">
                        {content.peluqueria.servicesTriggerTitle || 'Ver Todos los Servicios'}
                      </h3>
                      <div className="flex justify-between items-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="text-[9px] uppercase tracking-widest border border-gold/40 text-gold px-3 py-1 rounded-full hover:bg-gold hover:text-black hover:border-gold transition-colors font-medium">
                          Explorar &amp; Reservar
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service information hover overlay */}
                {card.type === 'service' && card.service && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="space-y-1 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[9px] uppercase tracking-widest text-gold/80 block flex items-center gap-1 font-semibold">
                        <Clock size={10} />
                        {card.service.duration}
                      </span>
                      <h3 className="font-serif text-lg md:text-xl tracking-wide font-medium leading-snug">
                        {card.service.name}
                      </h3>
                      <div className="flex justify-between items-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <span className="font-serif text-sm font-bold text-gold">{card.service.price}</span>
                        <span className="text-[9px] uppercase tracking-widest border border-gold/40 text-gold px-3 py-1 rounded-full hover:bg-gold hover:text-black hover:border-gold transition-colors font-medium">
                          Reservar
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>


        {/* 4. CROSS-SELLING MODULE */}
        {crossSell && !isAlmaBela && (
          <section className="max-w-7xl mx-auto px-6 pb-32 relative z-20">
            <div className="relative rounded-3xl overflow-hidden apple-gold-glass p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 border border-gold/15">
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
                  className="w-full lg:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full border border-gold text-gold text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-black transition-all duration-300 cursor-pointer shadow-lg shadow-gold/5"
                >
                  <span>Descubrir Más</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 5. PORTAFOLIO DE TRABAJOS MODAL */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGalleryOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-4xl bg-[#020202] text-[#fdfbf7] rounded-[32px] overflow-hidden z-10 border border-gold/25 shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[500px] max-h-[90vh] md:max-h-[80vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-30 focus:outline-none"
              >
                <X size={16} />
              </button>

              {/* Left Panel: Featured Image & Technique Details */}
              <div className="col-span-1 md:col-span-7 relative h-[250px] md:h-auto overflow-hidden border-b md:border-b-0 md:border-r border-white/5 group/gallery-nav">
                {isVideoUrl(currentItem.imageUrl) ? (
                  <video
                    src={currentItem.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 object-cover w-full h-full transition-all duration-700"
                  />
                ) : (
                  <Image
                    src={currentItem.imageUrl}
                    alt={currentItem.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-all duration-700"
                  />
                )}
                {/* Dark shading mask */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

                {/* Left/Right Navigation Arrows */}
                {galleryItems.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGalleryIdx((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-white/80 hover:text-black hover:bg-gold hover:border-gold hover:scale-110 transition-all cursor-pointer z-20 focus:outline-none"
                      aria-label="Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGalleryIdx((prev) => (prev + 1) % galleryItems.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10 text-white/80 hover:text-black hover:bg-gold hover:border-gold hover:scale-110 transition-all cursor-pointer z-20 focus:outline-none"
                      aria-label="Siguiente"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Details overlay at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 space-y-3">
                  <span className="text-[9px] uppercase tracking-widest text-gold bg-gold/10 border border-gold/25 px-2.5 py-1 rounded-full font-semibold inline-block">
                    {currentItem.stylist}
                  </span>
                  <h4 className="font-serif text-2xl text-white font-medium tracking-wide">
                    {currentItem.title}
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed font-light max-w-xl">
                    {currentItem.technique}
                  </p>
                  <div className="flex items-center space-x-4 pt-1.5 text-xs text-gold font-light">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {currentItem.duration}
                    </span>
                    <span>•</span>
                    <span>Valor Estimado: {currentItem.price}</span>
                  </div>
                </div>
              </div>

              {/* Right Panel: Thumbnails Grid & Booking Prompt */}
              <div className="col-span-1 md:col-span-5 p-8 flex flex-col justify-between bg-[#020202] overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-xl text-gold tracking-wide">Galería de Trabajos</h3>
                    <p className="text-[10px] text-text-secondary tracking-widest uppercase mt-0.5">Explora nuestras coloraciones y diseños</p>
                  </div>

                  {/* Grid of thumbnails */}
                  <div className="grid grid-cols-3 gap-3">
                    {galleryItems.map((item, index) => {
                      const isSelected = selectedGalleryIdx === index;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedGalleryIdx(index)}
                          className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 focus:outline-none ${
                            isSelected ? 'border-gold scale-105 shadow-[0_0_12px_rgba(198,155,60,0.3)]' : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          {isVideoUrl(item.imageUrl) ? (
                            <video
                              src={item.imageUrl}
                              className="object-cover w-full h-full pointer-events-none"
                              muted
                              playsInline
                            />
                          ) : (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Prompt */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <p className="text-xs text-text-secondary leading-relaxed font-light">
                    ¿Te inspira este estilo? Reserva ahora tu sesión personalizada con nuestro equipo y rediseña tu imagen.
                  </p>
                  <button
                    onClick={() => {
                      setIsGalleryOpen(false);
                      const selectedItem = currentItem;
                      let serviceObj = null;

                      // 1. Try to find the service by linked serviceId across all categories
                      if (selectedItem.serviceId) {
                        const allServices = Object.values(servicesData).flatMap(section => section.services || []);
                        serviceObj = allServices.find(s => s.id === selectedItem.serviceId);
                      }

                      // 2. Fallback to keyword matching if not found or not linked
                      if (!serviceObj) {
                        let sId = 'p1'; // default
                        if (selectedItem.title.includes('Coloración')) sId = 'p2';
                        else if (selectedItem.title.includes('Tratamiento')) sId = 'p3';
                        else if (selectedItem.title.includes('Peinado')) sId = 'p4';
                        serviceObj = servicesData.peluqueria.services.find(s => s.id === sId) || servicesData.peluqueria.services[0];
                      }

                      if (serviceObj) {
                        openBooking({
                          id: serviceObj.id,
                          name: serviceObj.name,
                          price: typeof serviceObj.price === 'number' ? `$${serviceObj.price.toLocaleString('es-CL')}` : serviceObj.price
                        });
                      }
                    }}
                    className="w-full py-3.5 rounded-full bg-gold hover:bg-gold/90 text-black text-xs uppercase tracking-widest font-bold transition-all hover:scale-[1.02] active:scale-95 shimmer-button"
                  >
                    Reservar este Estilo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. CONOCE A NUESTRAS ESPECIALISTAS MODAL */}
      <AnimatePresence>
        {isSpecialistsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSpecialistsOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-4xl bg-[#020202] text-[#fdfbf7] rounded-[32px] overflow-hidden z-10 border border-gold/25 shadow-2xl p-8 flex flex-col justify-between max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSpecialistsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-30 focus:outline-none"
              >
                <X size={16} />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-2xl text-gold tracking-wide">
                    {content.peluqueria.specialistsTriggerTitle || 'Nuestras Especialistas'}
                  </h3>
                  <p className="text-xs text-text-secondary tracking-widest uppercase mt-0.5">Alma Bela Studio • Peluquería de Autor</p>
                </div>

                {/* Grid of Specialists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.specialists.map((specialist) => {
                    const photo = specialist.imageUrl || specialistPhotos[specialist.id];
                    return (
                      <div
                        key={specialist.id}
                        className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 flex gap-4 items-start hover:border-gold/15 transition-all duration-300"
                      >
                        {/* Portrait Frame */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-gold/15 flex-shrink-0 bg-zinc-900 shadow-md">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={specialist.name}
                              fill
                              unoptimized
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-gold/80">
                              {specialist.avatar}
                            </div>
                          )}
                        </div>

                        {/* Bio Details */}
                        <div className="space-y-2 text-left flex-grow">
                          <div>
                            <h4 className="font-serif text-base text-white tracking-wide font-medium leading-none">{specialist.name}</h4>
                            <span className="text-[10px] uppercase tracking-wider text-gold font-semibold mt-1 inline-block">
                              {specialist.role}
                            </span>
                            <div className="text-[10px] text-white/45 italic mt-0.5 leading-tight">
                              Especialidad: {specialist.specialty}
                            </div>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed font-light line-clamp-3">
                            {specialist.bio}
                          </p>
                          <button
                            onClick={() => {
                              setIsSpecialistsOpen(false);
                              // Prefill booking modal with default Peluquería category and this specialist
                              openBooking({
                                id: 'p1',
                                name: 'Corte de Diseño & Movimiento',
                                price: '$38.000'
                              });
                            }}
                            className="inline-flex items-center space-x-1 text-[10px] uppercase tracking-wider text-gold hover:text-white transition-colors pt-1 font-semibold group cursor-pointer"
                          >
                            <span>Reservar con ella</span>
                            <ChevronRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. CARTA DE SERVICIOS MODAL */}
      <AnimatePresence>
        {isServicesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServicesOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-3xl bg-[#020202] text-[#fdfbf7] rounded-[32px] overflow-hidden z-10 border border-gold/25 shadow-2xl p-8 max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsServicesOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-30 focus:outline-none"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="mb-8 space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[9px] text-gold uppercase tracking-widest font-bold mb-3">
                  <Scissors size={10} />
                  <span>Carta de Servicios</span>
                </div>
                <h3 className="font-serif text-2xl text-white tracking-wide">Nuestros Servicios</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-light">
                  Selecciona un servicio para conocer los detalles y agendar tu cita.
                </p>
              </div>

              {/* Services grouped by category */}
              {allActiveServices.length === 0 ? (
                <div className="text-center py-12 text-text-secondary text-sm">
                  No hay servicios disponibles en este momento.
                </div>
              ) : (
                <div className="space-y-8">
                  {finalGroupOrder.map((groupLabel, gIdx) => (
                    <div key={groupLabel}>
                      {/* Category header */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-bold">{groupLabel}</span>
                        <div className="flex-1 h-[1px] bg-gold/15" />
                        <span className="text-[9px] text-white/25 font-light">{groupedServices[groupLabel].length} {groupedServices[groupLabel].length === 1 ? 'servicio' : 'servicios'}</span>
                      </div>

                      {/* Service cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {groupedServices[groupLabel].map((service, idx) => (
                          <motion.button
                            key={service.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (gIdx * 0.05) + (idx * 0.03) }}
                            onClick={() => {
                              setIsServicesOpen(false);
                              openBooking({
                                id: service.id,
                                name: service.name,
                                price: typeof service.price === 'number' ? `$${service.price.toLocaleString('es-CL')}` : service.price
                              });
                            }}
                            className="group text-left bg-[#0c0c0c] border border-white/5 hover:border-gold/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 cursor-pointer focus:outline-none"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-grow min-w-0">
                                <h4 className="font-serif text-sm text-white group-hover:text-gold transition-colors duration-300 leading-snug">
                                  {service.name}
                                </h4>
                                {service.description && (
                                  <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2 font-light">
                                    {service.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 pt-1">
                                  <span className="flex items-center gap-1 text-[9px] text-white/40 uppercase tracking-wider font-semibold">
                                    <Clock size={9} />
                                    {typeof service.duration === 'number' ? `${service.duration} min` : service.duration}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <span className="font-serif text-sm font-bold text-gold whitespace-nowrap">
                                  {typeof service.price === 'number' ? `$${service.price.toLocaleString('es-CL')}` : service.price}
                                </span>
                                <span className="text-[8px] uppercase tracking-widest border border-gold/30 text-gold px-2.5 py-1 rounded-full group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all duration-300 font-semibold whitespace-nowrap">
                                  Reservar
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
