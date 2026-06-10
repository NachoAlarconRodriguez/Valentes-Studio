'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { crossSellingMap } from '@/data/mockData';
import { useServicesStore } from '@/store/useServicesStore';
import { useUIStore } from '@/store/useUIStore';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useContentStore from '@/store/useContentStore';
import ScissorsDivider from './ScissorsDivider';
import LotusDivider from './LotusDivider';

const HandsCanvas = dynamic(() => import('./HandsCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

const HairCanvas = dynamic(() => import('./HairCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-bronze border-t-transparent rounded-full animate-spin" />
    </div>
  )
});

// TibetanBowlCanvas dynamic import removed as it was replaced by video background

interface ServicePageLayoutProps {
  category: 'barberia' | 'peluqueria' | 'terapias';
}

export function ServicePageLayout({ category }: ServicePageLayoutProps) {
  const { content } = useContentStore();
  const { servicesData } = useServicesStore();
  const data = React.useMemo(() => {
    const original = servicesData[category];
    if (!original) return null;
    return {
      ...original,
      title: content[category].pageTitle,
      description: content[category].pageDescription,
      services: original.services.filter(s => s.isActive !== false)
    };
  }, [category, content, servicesData]);
  const crossSell = crossSellingMap[category];
  const { openBooking } = useUIStore();
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  if (!data) return null;

  const toggleAccordion = (id: string) => {
    if (expandedServiceId === id) {
      setExpandedServiceId(null);
    } else {
      setExpandedServiceId(id);
    }
  };

  const getStyles = () => {
    switch (category) {
      case 'peluqueria':
        return {
          text: 'text-bronze',
          bg: 'bg-bronze',
          border: 'border-bronze',
          borderActive: 'border-bronze/40',
          shadow: 'shadow-[0_0_22px_rgba(205,127,50,0.08)]',
          bgHover: 'hover:bg-bronze/90',
          shadowBtn: 'shadow-bronze/5',
          hoverBorderLight: 'hover:border-bronze/20',
          borderLight: 'border-bronze/20',
          borderCardFrame: 'border-bronze/15',
          glass: 'apple-bronze-glass',
          glowBg: 'bg-bronze/8',
          badgeBg: 'bg-bronze/10',
          borderBtn: 'border-bronze/40',
          titleShimmer: 'animate-text-copper-flow',
          starFill: 'fill-bronze',
          starText: 'border-bronze/20 text-bronze',
          borderCardInner: 'border-t border-bronze/20'
        };
      case 'terapias':
        return {
          text: 'text-platinum',
          bg: 'bg-platinum',
          border: 'border-platinum',
          borderActive: 'border-platinum/40',
          shadow: 'shadow-[0_0_22px_rgba(226,224,216,0.08)]',
          bgHover: 'hover:bg-platinum/90',
          shadowBtn: 'shadow-platinum/5',
          hoverBorderLight: 'hover:border-platinum/20',
          borderLight: 'border-platinum/20',
          borderCardFrame: 'border-platinum/15',
          glass: 'apple-platinum-glass',
          glowBg: 'bg-platinum/8',
          badgeBg: 'bg-platinum/10',
          borderBtn: 'border-platinum/40',
          titleShimmer: 'animate-text-platinum-flow',
          starFill: 'fill-platinum',
          starText: 'border-platinum/20 text-platinum',
          borderCardInner: 'border-t border-platinum/20'
        };
      case 'barberia':
      default:
        return {
          text: 'text-gold',
          bg: 'bg-gold',
          border: 'border-gold',
          borderActive: 'border-gold/40',
          shadow: 'shadow-[0_0_22px_rgba(198,155,60,0.08)]',
          bgHover: 'hover:bg-gold/90',
          shadowBtn: 'shadow-gold/5',
          hoverBorderLight: 'hover:border-gold/20',
          borderLight: 'border-gold/20',
          borderCardFrame: 'border-gold/15',
          glass: 'apple-gold-glass',
          glowBg: 'bg-gold/8',
          badgeBg: 'bg-gold/10',
          borderBtn: 'border-gold/40',
          titleShimmer: 'animate-text-gold-flow',
          starFill: 'fill-gold',
          starText: 'border-gold/20 text-gold',
          borderCardInner: 'border-t border-gold/20'
        };
    }
  };

  const s = getStyles();

  return (
    <div className={`w-full pb-8 ${
      category === 'terapias' ? 'space-y-24 md:space-y-36' : 'max-w-7xl mx-auto px-6 pt-0 space-y-24 md:space-y-36'
    }`}>
      
      {/* 1. HEADER SECTION */}
      <section className={`relative w-full flex items-center overflow-hidden ${
        category === 'terapias'
          ? 'min-h-[550px] md:min-h-[75vh] pt-32 pb-16 md:pt-40 md:pb-24'
          : 'min-h-[500px] pt-4 pb-16 md:pt-6 md:pb-24'
      }`}>
        {category === 'barberia' && (
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <HandsCanvas />
          </div>
        )}
        {category === 'peluqueria' && (
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <HairCanvas />
          </div>
        )}
        {category === 'terapias' && (
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <video
              src={content.terapias.videoUrl}
              loop
              muted
              playsInline
              autoPlay
              className="object-cover w-full h-full opacity-45 grayscale contrast-[1.05] brightness-[0.85] mix-blend-lighten"
            />
            {/* Desktop horizontal fade (fades to bg-base on the left to cover the text area cleanly) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-bg-base via-bg-base/70 via-bg-base/30 to-transparent z-10" />
            
            {/* Mobile vertical fade */}
            <div className="md:hidden absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent z-10" />
            
            {/* Top and bottom edge fades for seamless blending */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg-base to-transparent z-10" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg-base/80 to-transparent z-10" />
          </div>
        )}

        <div className={`relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full w-full ${
          category === 'terapias' ? 'max-w-7xl mx-auto px-6' : ''
        }`}>
          <div className="md:col-span-7 space-y-6 text-left">
            <span 
              className="text-xs uppercase tracking-[0.35em] font-bold"
              style={{ color: data.color }}
            >
              Bienvenido al Templo
            </span>
            <h1 className={`font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none pb-2 ${s.titleShimmer}`}>
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed">
              {data.description}
            </p>
          </div>

          <div className="md:col-span-5 h-[500px] w-full pointer-events-none" />
        </div>
      </section>

      {/* 2. SERVICE ACCORDION MENU */}
      <section className={`grid grid-cols-1 lg:grid-cols-12 gap-12 ${
        category === 'terapias' ? 'max-w-7xl mx-auto px-6' : ''
      }`}>
        <div className="lg:col-span-4 space-y-4">
          <span 
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: data.color }}
          >
            Carta de Rituales
          </span>
          <h2 className="font-serif text-3xl text-white">Menú & Precios</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Cada ritual ha sido diseñado como una experiencia holística. Nuestros tiempos y productos botánicos se adaptan para brindarte el máximo beneficio físico y mental.
          </p>
          {category === 'barberia' ? (
            <div className="w-full barber-pole-line mt-6" style={{ height: '12px' }} />
          ) : category === 'peluqueria' ? (
            <ScissorsDivider />
          ) : (
            <LotusDivider />
          )}
        </div>

        {/* Accordion Container */}
        <div className="lg:col-span-8 space-y-4">
          {data.services.map((service) => {
            const isExpanded = expandedServiceId === service.id;
            return (
              <div 
                key={service.id}
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isExpanded 
                    ? `glass-panel bg-white/[0.02] ${s.borderActive} ${s.shadow}`
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                }`}
              >
                {/* Left theme indicator line */}
                {isExpanded && (
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    className={`absolute left-0 top-0 bottom-0 w-[2.5px] origin-top z-10 ${s.bg}`}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                )}

                {/* Header row */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleAccordion(service.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleAccordion(service.id);
                    }
                  }}
                  className="w-full flex items-center justify-between p-6 focus:outline-none cursor-pointer group focus-visible:ring-1 focus-visible:ring-gold/30 rounded-2xl"
                >
                  <div className="text-left space-y-1">
                    <h3 className={`font-serif text-lg md:text-xl tracking-wide transition-colors duration-300 ${isExpanded ? s.text : 'text-white'} group-hover:${s.text}`}>{service.name}</h3>
                    <div className="flex items-center space-x-3 text-xs text-text-secondary tracking-widest uppercase">
                      <span className="flex items-center">
                        <Clock size={12} className={`mr-1 ${s.text}`} /> 
                        {service.duration}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                    <span className={`font-serif text-base md:text-lg font-semibold mr-2 ${s.text}`}>{service.price}</span>
                    
                    {/* Direct Booking Button (no expand needed) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBooking({
                          id: service.id,
                          name: service.name,
                          price: service.price
                        });
                      }}
                      className={`px-4 py-2 rounded-full text-bg-base text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center space-x-1 hover:scale-105 active:scale-95 shadow-md cursor-pointer shimmer-button ${s.bg} ${s.bgHover} ${s.shadowBtn}`}
                    >
                      <Calendar size={12} />
                      <span>Reservar</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAccordion(service.id);
                      }}
                      className="text-text-secondary hover:text-text-primary p-1 focus:outline-none cursor-pointer"
                      aria-label={isExpanded ? "Contraer" : "Desplegar"}
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className={`px-6 pb-6 pt-2 ${s.borderCardInner} space-y-4`}>
                        <div className="space-y-1.5">
                          <span className={`block text-[10px] uppercase tracking-widest font-bold ${s.text}`}>Detalle del Ritual</span>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                        
                        {/* Specialists Recommendations inside the expanded area */}
                        <div className={`pt-3 ${s.borderCardInner} space-y-2.5`}>
                          <span className={`block text-[10px] uppercase tracking-widest font-bold ${s.text}`}>
                            {category === 'barberia' 
                              ? 'Barberos Recomendados:' 
                              : category === 'peluqueria' 
                              ? 'Estilistas Recomendados:' 
                              : 'Terapeutas Recomendados:'}
                          </span>
                          <div className="flex flex-wrap gap-3">
                            {data.specialists
                              .filter((spec) => !service.specialistIds || service.specialistIds.includes(spec.id))
                              .map((specialist) => (
                                <div 
                                  key={specialist.id} 
                                  className={`flex items-center space-x-2 bg-white/[0.03] px-3.5 py-2 rounded-full border border-white/5 text-xs text-text-primary transition-all duration-300 ${s.hoverBorderLight}`}
                                >
                                  <div 
                                    className={`w-5 h-5 rounded-full flex items-center justify-center font-serif text-[9px] font-bold border ${s.borderLight}`}
                                    style={{ 
                                      background: `linear-gradient(135deg, ${data.color}20 0%, ${data.accentColor}30 100%)`,
                                      color: data.color
                                    }}
                                  >
                                    {specialist.avatar}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-[11px] leading-tight text-white">{specialist.name}</span>
                                    <span className="text-[9px] text-text-secondary leading-none mt-0.5">{specialist.role}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SPECIALISTS GRID (EEAT) */}
      <section className={`space-y-10 ${
        category === 'terapias' ? 'max-w-7xl mx-auto px-6' : ''
      }`}>
        <div className="text-center md:text-left space-y-3 max-w-2xl">
          <span 
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: data.color }}
          >
            Maestros del Bienestar
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-white">Nuestros Especialistas</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Profesionales altamente experimentados y dedicados a la excelencia. Cada sesión combina su maestría técnica con un profundo respeto por tu bienestar individual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-6">
          {data.specialists.map((specialist) => {
            const oracleMap: Record<string, { arquetipo: string; numero: string; elemento: string }> = {
              st1: { arquetipo: "EL CANALIZADOR DEL CALOR", numero: "I", elemento: "Fuego & Obsidiana" },
              st2: { arquetipo: "LA MAESTRA DE LA VIBRACIÓN", numero: "II", elemento: "Sonido & Energía" },
              st3: { arquetipo: "LA GUARDIANA DE LA TIERRA", numero: "III", elemento: "Ayurveda & Esencia" },
              st4: { arquetipo: "EL ALINEADOR DEL TEMPLO", numero: "IV", elemento: "Cuerpo & Respiración" }
            };
            const oracle = oracleMap[specialist.id] || { arquetipo: "EL SANADOR", numero: "V", elemento: "Espíritu" };
            return (
              <div 
                key={specialist.id}
                className="group relative w-full h-[430px] [perspective:1000px] cursor-pointer"
              >
                {/* Card Inner container which rotates on hover */}
                <div className="relative w-full h-full duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl rounded-2xl">
                  
                  {/* BACK SIDE (Face down - Sacred Geometry) */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-[#0e0e0e] border border-platinum/15 flex flex-col items-center justify-center p-6 [backface-visibility:hidden] z-20">
                    {/* Inner elegant frame */}
                    <div className="absolute inset-2 border border-platinum/5 rounded-xl pointer-events-none" />
                    
                    {/* Card corners symbols */}
                    <span className="absolute top-4 left-4 text-[10px] font-serif text-platinum/30 tracking-widest">{oracle.numero}</span>
                    <span className="absolute top-4 right-4 text-[10px] font-serif text-platinum/30 tracking-widest">{oracle.numero}</span>
                    <span className="absolute bottom-4 left-4 text-[10px] font-serif text-platinum/30 tracking-widest">{oracle.numero}</span>
                    <span className="absolute bottom-4 right-4 text-[10px] font-serif text-platinum/30 tracking-widest">{oracle.numero}</span>

                    {/* Glowing Sacred Geometry Mandala SVG */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-28 h-28 bg-platinum/3 rounded-full blur-xl group-hover:bg-platinum/6 transition-colors duration-500" />
                      <svg viewBox="0 0 100 100" className="w-24 h-24 text-platinum/25 group-hover:text-platinum/50 group-hover:scale-105 transition-all duration-700 animate-[spin_90s_linear_infinite] relative z-10">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.6" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.6" />
                        {/* 12 point star geometry */}
                        <polygon points="50,5 63,35 95,35 69,55 78,85 50,68 22,85 31,55 5,35 37,35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <polygon points="50,15 59,38 82,38 64,52 70,75 50,61 30,75 36,52 18,38 41,38" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="2.5" fill="currentColor" />
                      </svg>
                    </div>

                    {/* Card indicator */}
                    <div className="mt-8 text-center space-y-1 relative z-10">
                      <span className="block text-[8px] uppercase tracking-[0.4em] text-platinum/40 group-hover:text-platinum/70 transition-colors duration-500 font-semibold">[ ORÁCULO DE SANACIÓN ]</span>
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-text-secondary font-light">{oracle.elemento}</span>
                    </div>
                  </div>

                  {/* FRONT SIDE (Face up - Specialist Info) */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-[#080808] border border-platinum/25 flex flex-col justify-between p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] z-10">
                    {/* Inner elegant frame */}
                    <div className="absolute inset-2 border border-platinum/10 rounded-xl pointer-events-none" />
                    
                    {/* Top category label */}
                    <div className="text-center relative z-10 pt-2">
                      <span className="text-[8px] uppercase tracking-[0.25em] text-platinum/40 font-bold block mb-0.5">{oracle.arquetipo}</span>
                      <div className="h-[1px] w-12 bg-platinum/20 mx-auto" />
                    </div>

                    {/* Specialist info */}
                    <div className="flex flex-col items-center text-center relative z-10 pt-2 flex-grow justify-center space-y-3">
                      {/* Stylized Avatar initials in glowing circle */}
                      <div className="w-16 h-16 rounded-full border border-platinum/20 bg-white/[0.02] flex items-center justify-center font-serif text-2xl font-bold text-platinum shadow-[inset_0_2px_12px_rgba(226,224,216,0.1)] group-hover:border-platinum/45 transition-colors duration-500 select-none">
                        {specialist.avatar}
                      </div>

                      <div className="space-y-0.5">
                        <h3 className="font-serif text-lg text-white tracking-wide font-medium leading-none">{specialist.name}</h3>
                        <span className="text-[9px] uppercase tracking-widest font-semibold text-platinum block pt-1">
                          {specialist.role}
                        </span>
                        <span className="text-[9px] text-text-secondary italic block max-w-[90%] mx-auto truncate mt-0.5">
                          {specialist.specialty}
                        </span>
                      </div>

                      <p className="text-[11px] text-text-secondary leading-relaxed font-light px-2 line-clamp-4">
                        {specialist.bio}
                      </p>
                    </div>

                    {/* Bottom Action CTA */}
                    <div className="text-center relative z-10 pb-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          let sId = 't1';
                          if (specialist.id === 'st2') sId = 't2';
                          else if (specialist.id === 'st3') sId = 't2'; // reiki
                          else if (specialist.id === 'st4') sId = 't3'; // sonoterapia
                          
                          const serviceObj = data.services.find(s => s.id === sId) || data.services[0];
                          openBooking({
                            id: serviceObj.id,
                            name: serviceObj.name,
                            price: serviceObj.price
                          });
                        }}
                        className="px-6 py-2 rounded-full border border-platinum/30 text-platinum text-[9px] uppercase tracking-widest font-bold hover:bg-platinum hover:text-black transition-all duration-300 hover:scale-[1.03] active:scale-95 shimmer-button animate-pulse-slow"
                      >
                        Agendar Ritual
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CROSS-SELLING MODULE */}
      {crossSell && (
        <section className={`pt-6 ${
          category === 'terapias' ? 'max-w-7xl mx-auto px-6' : ''
        }`}>
          <div className={`relative rounded-3xl overflow-hidden ${s.glass} p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8`}>
            <div className={`absolute -top-12 -left-12 w-80 h-80 ${s.glowBg} rounded-full blur-[80px] pointer-events-none`} />
            
            <div className="space-y-4 relative z-10 max-w-3xl">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${s.badgeBg} text-[10px] ${s.text} uppercase tracking-[0.2em] font-semibold`}>
                <Sparkles size={10} />
                <span>{crossSell.title}</span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-white tracking-wide">
                {crossSell.subtitle}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {crossSell.recommendation}
              </p>
            </div>

            <div className="flex-shrink-0 relative z-10 w-full md:w-auto">
              <Link 
                href={crossSell.path}
                className={`w-full md:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full border ${s.borderBtn} ${s.text} text-xs uppercase tracking-widest font-bold hover:${s.bg} hover:text-bg-base transition-all duration-300 shimmer-button`}
              >
                <span>Descubrir Más</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default ServicePageLayout;
