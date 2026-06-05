'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, Sparkles, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { servicesData } from '@/data/mockData';
import Image from 'next/image';

const specialistPhotos: Record<string, string> = {
  sp1: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', // Sofia Valente
  sp2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', // Lucía Rivas
  sp3: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', // Andrés Silva
  sp4: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // Valentina Paz
  sb1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', // Carlos Mendoza
  sb2: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80', // Enrique Soto
  sb3: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', // Marcos Delgado
  sb4: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80', // Javier Ortega
  st1: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', // Mateo Silva
  st2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', // Elena Rostova
  st3: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // Camila Fuentes
  st4: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', // Nicolás Prat
};

export function BookingModal() {
  const { isBookingOpen, closeBooking, selectedServiceForBooking } = useUIStore();
  
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  const [serviceId, setServiceId] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [dateType, setDateType] = useState<'hoy' | 'manana' | 'semana' | 'mes' | null>(null);
  const [time, setTime] = useState('');
  
  // Dropdown UI states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  
  // Submission flow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  // Prefill service if passed from CTA
  useEffect(() => {
    if (selectedServiceForBooking) {
      // Find category
      let foundCategory: 'barberia' | 'peluqueria' | 'terapias' = 'barberia';
      if (selectedServiceForBooking.id.startsWith('b')) foundCategory = 'barberia';
      else if (selectedServiceForBooking.id.startsWith('p')) foundCategory = 'peluqueria';
      else if (selectedServiceForBooking.id.startsWith('t')) foundCategory = 'terapias';
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(foundCategory);
      setServiceId(selectedServiceForBooking.id);
    } else {
      setServiceId('');
    }
  }, [selectedServiceForBooking, isBookingOpen]);

  // Helper to format date with offset in YYYY-MM-DD
  const getFormattedDate = (daysOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateTypeSelect = (type: 'hoy' | 'manana' | 'semana' | 'mes') => {
    setDateType(type);
    if (type === 'hoy') {
      setDate(getFormattedDate(0));
    } else if (type === 'manana') {
      setDate(getFormattedDate(1));
    } else {
      setDate('');
    }
  };

  // Handle category changes to clear/reset service and specialist dropdowns
  const handleCategoryChange = (cat: 'barberia' | 'peluqueria' | 'terapias') => {
    setCategory(cat);
    setServiceId('');
    setSpecialistId('');
    setDate('');
    setTime('');
    setDateType(null);
  };

  // Get current options based on category
  const servicesList = servicesData[category]?.services || [];
  const specialistsList = servicesData[category]?.specialists || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !serviceId || !date || !time) return;

    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Generate a luxury booking code
      const randomCode = 'RIT-' + Math.floor(100000 + Math.random() * 900000);
      setBookingCode(randomCode);
    }, 1500);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setCategory('barberia');
    setServiceId('');
    setSpecialistId('');
    setDate('');
    setTime('');
    setDateType(null);
    setIsSuccess(false);
    setBookingCode('');
    setIsCategoryDropdownOpen(false);
    setIsServiceDropdownOpen(false);
  };

  const handleClose = () => {
    closeBooking();
    setTimeout(resetForm, 300); // Wait for exit animation to clear states
  };

  const selectedServiceObj = servicesList.find(s => s.id === serviceId);
  const selectedSpecialistObj = specialistsList.find(sp => sp.id === specialistId);

  // Dynamic Theme definitions based on category
  const isTerapias = category === 'terapias';
  const themeText = isTerapias ? 'text-platinum' : 'text-gold';
  const themeText80 = isTerapias ? 'text-platinum/80' : 'text-gold/80';
  const themeText90 = isTerapias ? 'text-platinum/90' : 'text-gold/90';
  const themeBg = isTerapias ? 'bg-platinum' : 'bg-gold';
  const themeBorder25 = isTerapias ? 'border-platinum/25' : 'border-gold/25';
  const themeBorder15 = isTerapias ? 'border-platinum/15' : 'border-gold/15';
  const themeBorderFocus = isTerapias ? 'focus:border-platinum/60' : 'focus:border-gold/60';
  const themeShadow = isTerapias ? 'hover:shadow-platinum/20 shadow-platinum/5' : 'hover:shadow-gold/20 shadow-gold/5';
  
  // Success styles
  const themeSuccessText = isTerapias ? 'text-platinum' : 'text-gold';
  
  const modalContainerClass = `relative w-full max-w-4xl bg-black/95 text-white rounded-[32px] overflow-hidden z-10 border ${themeBorder25} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] grid grid-cols-1 md:grid-cols-12 min-h-[580px] max-h-[90vh] md:max-h-[85vh] transition-all duration-500`;
  
  const labelClass = `block text-[9px] uppercase tracking-[0.2em] ${themeText80} font-semibold mb-1`;
  const inputClass = `w-full bg-transparent border-b border-white/10 text-white py-2.5 px-1 text-sm ${themeBorderFocus} focus:outline-none transition-colors`;
  const subSectionTitleClass = `block text-[10px] uppercase tracking-[0.25em] ${themeText90} font-bold mb-2 border-b border-white/5 pb-1`;
  
  const submitButtonClass = `w-full mt-6 py-4 rounded-full ${themeBg} text-black font-semibold uppercase tracking-wider text-xs hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${themeShadow}`;
  
  const summaryBoxClass = "w-full bg-white/5 border border-white/5 rounded-2xl p-5 mb-6 text-left space-y-3";
  const summaryBorderClass = "flex justify-between border-b border-white/5 pb-2";
  const summaryLabelClass = "text-xs uppercase tracking-wider text-text-secondary";
  const summaryValClass = "text-sm font-semibold text-text-primary";
  const summaryCodeClass = `text-sm font-mono font-bold ${themeSuccessText}`;
  const summaryIconClass = `mr-1 ${themeSuccessText}`;

  const successCloseClass = `px-10 py-3 rounded-full border border-white/10 text-white text-xs uppercase tracking-widest hover:${themeBg} hover:text-black transition-all duration-300 font-semibold cursor-pointer shadow-lg`;
  const successTitleClass = `font-serif text-2xl font-bold ${themeSuccessText} mb-2 tracking-wide`;
  const successTextClass = "text-sm text-text-secondary max-w-sm mb-6 leading-relaxed";

  return (
    <AnimatePresence>
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={modalContainerClass}
          >
            {/* Panel Izquierdo: Cinematográfico / Inspiracional */}
            <div className={`hidden md:flex md:col-span-5 flex-col justify-between p-8 relative overflow-hidden border-r ${themeBorder15} bg-black`}>
              {/* Imagen de fondo estética con máscara */}
              <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
                <Image 
                  src={category === 'barberia'
                    ? "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80"
                    : category === 'peluqueria'
                    ? "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
                    : "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80" // Therapies massage image
                  }
                  alt="Aesthetic Background" 
                  fill
                  sizes="25vw"
                  className="object-cover scale-105 select-none pointer-events-none"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-5" />

              {/* Logo de la marca */}
              <div className="relative z-10 select-none">
                <span className={`text-[10px] uppercase tracking-[0.4em] ${themeText80} font-semibold block mb-1`}>
                  {isTerapias ? 'Essencia Pura Studio' : 'Valentes Studio'}
                </span>
                {category === 'barberia' ? (
                  <>
                    <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-gold animate-text-gold-flow leading-none">VALENTE</h2>
                    <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-gold animate-text-gold-flow leading-none mt-1">BARBERÍA</h2>
                  </>
                ) : category === 'peluqueria' ? (
                  <>
                    <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-gold animate-text-gold-flow leading-none">ALMA</h2>
                    <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-gold animate-text-gold-flow leading-none mt-1">BELA</h2>
                    <span className="text-[9px] uppercase tracking-[0.6em] text-gold/80 font-bold block mt-3">STUDIO</span>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-platinum animate-text-platinum-flow leading-none">ESSENCIA</h2>
                    <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-platinum animate-text-platinum-flow leading-none mt-1">PURA</h2>
                    <span className="text-[9px] uppercase tracking-[0.6em] text-platinum/80 font-bold block mt-3">STUDIO</span>
                  </>
                )}
              </div>

              {/* Detalles del Servicio actual */}
              <div className={`relative z-10 space-y-4 bg-black/60 backdrop-blur-sm border p-5 rounded-2xl ${themeBorder15}`}>
                <span className={`text-[9px] uppercase tracking-widest font-bold block ${themeText80}`}>Estás Reservando:</span>
                {selectedServiceObj ? (
                  <div className="space-y-2">
                    <h4 className="font-serif text-lg text-white font-medium leading-snug">{selectedServiceObj.name}</h4>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                      <span className={`font-serif text-base font-semibold ${themeText}`}>{selectedServiceObj.price}</span>
                      <span className="text-[9px] text-text-secondary uppercase tracking-wider">{selectedServiceObj.duration}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary italic">Por favor, selecciona un servicio en el formulario.</p>
                )}
              </div>

              {/* Cita/Frase inspiradora al pie */}
              <div className="relative z-10">
                <p className={`text-[10px] italic font-light leading-relaxed max-w-[200px] ${themeText80}`}>
                  {category === 'barberia'
                    ? '“El corte y afeitado tradicional como un ritual de calma y distinción.”'
                    : category === 'peluqueria'
                    ? '“La belleza florece cuando conectas tu bienestar con tu propia identidad.”'
                    : '“El equilibrio es la armonía de cuerpo, mente y alma guiados por tu esencia pura.”'
                  }
                </p>
              </div>
            </div>

            {/* Panel Derecho: Formulario Minimalista */}
            <div className="col-span-1 md:col-span-7 flex flex-col justify-between p-8 bg-[#070707] relative overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
              {/* Botón de cerrar flotante */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex-grow flex flex-col justify-center max-w-md w-full mx-auto">
                <div className="mb-6">
                  <h3 className={`font-serif text-2xl ${themeText} tracking-wide`}>Completar Ritual</h3>
                  <p className="text-xs text-text-secondary tracking-widest uppercase mt-1">
                    {category === 'barberia'
                      ? 'Santuario de Barbería Tradicional'
                      : category === 'peluqueria'
                      ? 'Santuario de Peluquería de Autor'
                      : 'Essência Pura • Terapias Holísticas'
                    }
                  </p>
                </div>

                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Selector de Ritual */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Área de Bienestar (Custom Selector) */}
                      <div className="relative">
                        <label className={labelClass}>Área de Bienestar</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                            setIsServiceDropdownOpen(false);
                          }}
                          className={`w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center transition-colors focus:outline-none ${themeBorderFocus}`}
                        >
                          <span className="text-white">
                            {category === 'barberia'
                              ? 'Barbería Tradicional'
                              : category === 'peluqueria'
                              ? 'Peluquería de Autor'
                              : 'Terapias Holísticas'}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-white/60 transition-transform duration-300 ${
                              isCategoryDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {isCategoryDropdownOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setIsCategoryDropdownOpen(false)} 
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-2 bg-[#0d0d0d]/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 backdrop-blur-md"
                              >
                                {[
                                  { value: 'barberia', label: 'Barbería Tradicional' },
                                  { value: 'peluqueria', label: 'Peluquería de Autor' },
                                  { value: 'terapias', label: 'Terapias Holísticas' },
                                ].map((opt) => {
                                  const isSelected = category === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => {
                                        handleCategoryChange(opt.value as 'barberia' | 'peluqueria' | 'terapias');
                                        setIsCategoryDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 flex items-center justify-between ${
                                        isSelected ? `${themeText} font-semibold bg-white/5` : 'text-white/70'
                                      }`}
                                    >
                                      <span>{opt.label}</span>
                                      {isSelected && (
                                        <span className={`w-1.5 h-1.5 rounded-full ${themeBg}`} />
                                      )}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Seleccionar Ritual (Custom Selector) */}
                      <div className="relative">
                        <label className={labelClass}>Seleccionar Ritual *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsServiceDropdownOpen(!isServiceDropdownOpen);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center transition-colors focus:outline-none ${themeBorderFocus}`}
                        >
                          <span className={selectedServiceObj ? 'text-white' : 'text-white/40'}>
                            {selectedServiceObj
                              ? `${selectedServiceObj.name} (${selectedServiceObj.price})`
                              : '-- Elige un servicio --'}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-white/60 transition-transform duration-300 ${
                              isServiceDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isServiceDropdownOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setIsServiceDropdownOpen(false)} 
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-2 bg-[#0d0d0d]/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 backdrop-blur-md max-h-60 overflow-y-auto"
                              >
                                {servicesList.length === 0 ? (
                                  <div className="px-4 py-3 text-sm text-white/40 italic">
                                    No hay servicios disponibles
                                  </div>
                                ) : (
                                  servicesList.map((service) => {
                                    const isSelected = serviceId === service.id;
                                    return (
                                      <button
                                        key={service.id}
                                        type="button"
                                        onClick={() => {
                                          setServiceId(service.id);
                                          setIsServiceDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 flex items-center justify-between ${
                                          isSelected ? `${themeText} font-semibold bg-white/5` : 'text-white/70'
                                        }`}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{service.name}</span>
                                          <span className="text-[10px] text-white/40">{service.duration}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className={isSelected ? themeText : 'text-white/90'}>
                                            {service.price}
                                          </span>
                                          {isSelected && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${themeBg}`} />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Specialist (Opcional) */}
                    <div>
                      <label className={labelClass}>Especialista (Opcional)</label>
                      <div className="flex flex-wrap items-start gap-3 py-2 justify-start">
                        {/* Option: Cualquiera */}
                        <button
                          type="button"
                          onClick={() => setSpecialistId('')}
                          className={`flex flex-col items-center space-y-1.5 focus:outline-none transition-all duration-300 ${
                            specialistId === '' ? 'scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-gradient-to-br from-black to-zinc-900 ${
                            specialistId === ''
                              ? isTerapias
                                ? 'border-platinum shadow-[0_0_12px_rgba(226,224,216,0.4)]'
                                : 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                              : 'border-white/10'
                          }`}>
                            <Sparkles className={`w-5 h-5 animate-pulse ${themeText}`} />
                          </div>
                          <span className="text-[10px] tracking-wider text-text-secondary uppercase">Cualq.</span>
                        </button>

                        {/* Real specialists */}
                        {specialistsList.map((specialist) => {
                          const photo = specialistPhotos[specialist.id];
                          const isSelected = specialistId === specialist.id;
                          return (
                            <button
                              key={specialist.id}
                              type="button"
                              onClick={() => setSpecialistId(specialist.id)}
                              className={`flex flex-col items-center space-y-1.5 focus:outline-none transition-all duration-300 ${
                                isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                                isSelected
                                  ? isTerapias
                                    ? 'border-platinum shadow-[0_0_12px_rgba(226,224,216,0.4)]'
                                    : 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                                  : 'border-white/10'
                              }`}>
                                {photo ? (
                                  <Image
                                    src={photo}
                                    alt={specialist.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-platinum text-xs font-semibold">
                                    {specialist.avatar}
                                  </div>
                                )}
                              </div>
                              <div className="text-center">
                                <span className={`block text-[10px] tracking-wider font-medium ${isSelected ? themeText : 'text-white/90'}`}>
                                  {specialist.name.split(' ')[0]}
                                </span>
                                <span className="block text-[8px] text-text-secondary tracking-tight">
                                  {specialist.role.split(' ')[0]}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fecha */}
                    <div>
                      <label className={labelClass}>Fecha *</label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { type: 'hoy' as const, label: 'Hoy' },
                            { type: 'manana' as const, label: 'Mañana' },
                            { type: 'semana' as const, label: 'Semana' },
                            { type: 'mes' as const, label: 'Mes' }
                          ].map((item) => {
                            const isSelected = dateType === item.type;
                            return (
                              <button
                                key={item.type}
                                type="button"
                                onClick={() => handleDateTypeSelect(item.type)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border aspect-square transition-all duration-300 focus:outline-none ${
                                  isSelected 
                                    ? isTerapias
                                      ? 'border-platinum bg-platinum/10 text-platinum shadow-[0_0_12px_rgba(226,224,216,0.25)]'
                                      : 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                                    : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20'
                                }`}
                              >
                                <Calendar size={18} className={isSelected ? themeText : 'text-white/50'} />
                                <span className="text-[10px] font-semibold tracking-wider uppercase mt-1.5">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Conditional Date Picker for Semana and Mes */}
                        {(dateType === 'semana' || dateType === 'mes') && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative mt-2"
                          >
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              required
                              min={getFormattedDate(0)}
                              max={dateType === 'semana' ? getFormattedDate(7) : getFormattedDate(30)}
                              className={inputClass}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Hora */}
                    {date && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <label className={labelClass}>Hora *</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { value: '09:00', label: '09:00 AM' },
                            { value: '10:30', label: '10:30 AM' },
                            { value: '12:00', label: '12:00 PM' },
                            { value: '13:30', label: '01:30 PM' },
                            { value: '15:00', label: '03:00 PM' },
                            { value: '16:30', label: '04:30 PM' },
                            { value: '18:00', label: '06:00 PM' },
                            { value: '19:30', label: '07:30 PM' }
                          ].map((slot) => {
                            const isSelected = time === slot.value;
                            return (
                              <button
                                key={slot.value}
                                type="button"
                                onClick={() => setTime(slot.value)}
                                className={`py-2.5 px-1 text-center rounded-xl border text-[10px] font-semibold tracking-wider transition-all duration-300 focus:outline-none ${
                                  isSelected
                                    ? isTerapias
                                      ? 'border-platinum bg-platinum/10 text-platinum shadow-[0_0_10px_rgba(226,224,216,0.2)]'
                                      : 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                                    : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20'
                                }`}
                              >
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Contact details */}
                    <div className="space-y-4 pt-2">
                      <span className={subSectionTitleClass}>Tus Datos de Contacto</span>
                      
                      <div>
                        <label className={labelClass}>Nombre Completo *</label>
                        <input
                          type="text"
                          placeholder="Escribe tu nombre"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Teléfono/WhatsApp *</label>
                          <input
                            type="tel"
                            placeholder="+56 9..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Correo Electrónico</label>
                          <input
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={submitButtonClass}
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Confirmar Experiencia</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Success Screen inside Split layout */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-4 text-center flex flex-col items-center"
                  >
                    <div className={`${themeText} mb-4`}>
                      <CheckCircle2 size={54} className="stroke-[1.5]" />
                    </div>

                    <h4 className={successTitleClass}>¡Ritual Agendado!</h4>
                    <p className={successTextClass}>
                      Tu espacio ha sido reservado. Recibirás una confirmación por WhatsApp en unos minutos.
                    </p>

                    <div className={summaryBoxClass}>
                      <div className={summaryBorderClass}>
                        <span className={summaryLabelClass}>Código</span>
                        <span className={summaryCodeClass}>{bookingCode}</span>
                      </div>
                      <div className={summaryBorderClass}>
                        <span className={summaryLabelClass}>Ritual</span>
                        <span className={summaryValClass} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedServiceObj?.name}</span>
                      </div>
                      {selectedSpecialistObj && (
                        <div className={summaryBorderClass}>
                          <span className={summaryLabelClass}>Especialista</span>
                          <span className={summaryValClass}>{selectedSpecialistObj.name}</span>
                        </div>
                      )}
                      <div className={summaryBorderClass}>
                        <span className={summaryLabelClass}>Fecha</span>
                        <span className={summaryValClass + " flex items-center"}>
                          <Calendar size={14} className={summaryIconClass} />
                          {date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={summaryLabelClass}>Hora</span>
                        <span className={summaryValClass + " flex items-center"}>
                          <Clock size={14} className={summaryIconClass} />
                          {time}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      className={successCloseClass}
                    >
                      Cerrar
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default BookingModal;
