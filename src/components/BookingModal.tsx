'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, Sparkles, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useServicesStore } from '@/store/useServicesStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useGiftCardStore } from '@/store/useGiftCardStore';
import { useScheduleStore, parseDurationToMinutes } from '@/store/useScheduleStore';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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

const formatDateToDMY = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

export function BookingModal() {
  const { isBookingOpen, closeBooking, selectedServiceForBooking } = useUIStore();
  const pathname = usePathname();
  
  // Form states
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+56');
  const [phoneNumOnly, setPhoneNumOnly] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handlePhoneNumChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 9);
    setPhoneNumOnly(cleaned);
    validatePhone(cleaned, countryCode);
  };

  const validatePhone = (num: string, prefix: string) => {
    if (num.length === 0) {
      setPhoneError('Por favor ingresa tu número de WhatsApp');
    } else if (num.length < 9) {
      setPhoneError('El número de WhatsApp debe tener exactamente 9 dígitos.');
    } else if (num.length > 9) {
      setPhoneError('El número de WhatsApp no puede tener más de 9 dígitos.');
    } else {
      setPhoneError(null);
    }
  };
  const [category, setCategory] = useState<'barberia' | 'peluqueria' | 'terapias' | 'santuario'>('barberia');
  const [serviceId, setServiceId] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [dateType, setDateType] = useState<'hoy' | 'manana' | 'semana' | 'mes' | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(() => new Date());
  const [time, setTime] = useState('');
  
  // Gift Card states
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<any | null>(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [giftCardSuccess, setGiftCardSuccess] = useState('');

  // Helper to parse price string to number
  const parsePrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };
  
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
      if (pathname.includes('/peluqueria')) {
        setCategory('peluqueria');
      } else if (pathname.includes('/terapias')) {
        setCategory('terapias');
      } else {
        setCategory('barberia');
      }
    }
  }, [selectedServiceForBooking, isBookingOpen, pathname]);

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

  const { servicesData } = useServicesStore();
  // Get current options based on category
  const servicesList = (servicesData[category]?.services || []).filter(s => s.isActive !== false);
  const selectedServiceObj = servicesList.find(s => s.id === serviceId);
  const specialistsList = servicesData[category]?.specialists || [];

  // Filter specialists based on business type and eligible services
  const filteredSpecialistsList = React.useMemo(() => {
    let list = specialistsList.filter(spec => spec.isActive !== false);

    // 1. Filter by business type (profileType)
    list = list.filter(spec => {
      const profileMap: Record<string, string[]> = {
        barberia: ['barber', 'mixto', 'admin'],
        peluqueria: ['estilista', 'mixto', 'admin'],
        terapias: ['terapeuta', 'mixto', 'admin']
      };
      const allowed = profileMap[category] || [];
      return allowed.includes(spec.profileType) && spec.assignedAgendas.includes(category as any);
    });

    // 2. Filter by service capability (specialistIds) if a service is selected
    if (serviceId && selectedServiceObj) {
      if (selectedServiceObj.specialistIds && selectedServiceObj.specialistIds.length > 0) {
        list = list.filter(spec => selectedServiceObj.specialistIds?.includes(spec.id));
      }
    }

    return list;
  }, [category, serviceId, selectedServiceObj, specialistsList]);

  // Reset selected specialist if they are not in the filtered list for the selected service
  useEffect(() => {
    if (specialistId && filteredSpecialistsList.length > 0) {
      const isStillAvailable = filteredSpecialistsList.some(sp => sp.id === specialistId);
      if (!isStillAvailable) {
        setSpecialistId('');
      }
    }
  }, [serviceId, filteredSpecialistsList, specialistId]);

  const isSpecialistAvailable = useScheduleStore(state => state.isSpecialistAvailable);

  const checkTimeSlotAvailability = (slotTime: string): { available: boolean; reason?: string } => {
    if (!date) return { available: true };
    
    // Check if slot is in the past based on system date and time
    const isPast = (() => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      
      if (date < todayStr) return true;
      if (date > todayStr) return false;
      
      const timeToMinutes = (tStr: string) => {
        const [h, min] = tStr.split(':').map(Number);
        return h * 60 + min;
      };
      
      const slotMins = timeToMinutes(slotTime);
      const currentMins = today.getHours() * 60 + today.getMinutes();
      return slotMins < currentMins;
    })();

    if (isPast) {
      return { available: false, reason: 'El horario ya pasó' };
    }

    const dur = selectedServiceObj ? parseDurationToMinutes(selectedServiceObj.duration) : 60;
    if (specialistId) {
      return isSpecialistAvailable(specialistId, date, slotTime, dur);
    }
    if (filteredSpecialistsList.length === 0) return { available: true };
    const availableSpecs = filteredSpecialistsList.filter(s => isSpecialistAvailable(s.id, date, slotTime, dur).available);
    if (availableSpecs.length > 0) {
      return { available: true };
    }
    return { available: false, reason: 'No hay profesionales disponibles' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phoneNumOnly || !serviceId || !date || !time) return;

    if (phoneNumOnly.length !== 9) {
      setPhoneError('El número de WhatsApp debe tener exactamente 9 dígitos.');
      return;
    }
    setPhoneError(null);

    setIsSubmitting(true);
    
    try {
      const fullPhone = `${countryCode} ${phoneNumOnly}`;
      const newBookingId = await useBookingStore.getState().addBooking({
        clientName: name,
        clientPhone: fullPhone,
        clientEmail: email,
        category: category as 'barberia' | 'peluqueria' | 'terapias',
        serviceName: selectedServiceObj?.name || 'Servicio Personalizado',
        price: finalPriceStr,
        specialistName: selectedSpecialistObj?.name || 'Cualquiera',
        date: date,
        time: time,
        giftCardUsed: appliedGiftCard ? appliedGiftCard.code : undefined
      });

      // Deduct balance from Gift Card if applied
      if (appliedGiftCard && discountAmount > 0) {
        await useGiftCardStore.getState().redeemGiftCard(appliedGiftCard.code, discountAmount);
      }
      
      setBookingCode(newBookingId);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCountryCode('+56');
    setPhoneNumOnly('');
    setPhoneError(null);
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
    setGiftCardCode('');
    setAppliedGiftCard(null);
    setGiftCardError('');
    setGiftCardSuccess('');
  };

  const handleClose = () => {
    closeBooking();
    setTimeout(resetForm, 300); // Wait for exit animation to clear states
  };

  const selectedSpecialistObj = specialistsList.find(sp => sp.id === specialistId);

  const originalPriceNumber = parsePrice(selectedServiceObj?.price);
  
  // Calculate discount & remaining balance
  const discountAmount = appliedGiftCard 
    ? Math.min(originalPriceNumber, appliedGiftCard.remainingBalance)
    : 0;
  
  const finalPriceNumber = originalPriceNumber - discountAmount;
  const finalPriceStr = `$${finalPriceNumber.toLocaleString('es-CL')}`;

  const handleApplyGiftCard = () => {
    if (!giftCardCode.trim()) {
      setGiftCardError('Por favor ingresa un código.');
      return;
    }
    const result = useGiftCardStore.getState().validateGiftCard(giftCardCode);
    if (result.status === 'inexistente') {
      setGiftCardError('El código no existe.');
      setGiftCardSuccess('');
      setAppliedGiftCard(null);
    } else if (result.status === 'expirada') {
      setGiftCardError('Esta Gift Card ha expirado.');
      setGiftCardSuccess('');
      setAppliedGiftCard(null);
    } else if (result.status === 'sin_saldo') {
      setGiftCardError('Esta Gift Card no tiene saldo restante.');
      setGiftCardSuccess('');
      setAppliedGiftCard(null);
    } else if (result.status === 'valida' && result.card) {
      setAppliedGiftCard(result.card);
      setGiftCardError('');
      setGiftCardSuccess('¡Gift Card aplicada con éxito!');
    }
  };

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
  
  const isFormValid = name.trim() !== '' && 
                      phoneNumOnly.length === 9 && 
                      !phoneError && 
                      serviceId !== '' && 
                      date !== '' && 
                      time !== '';

  const submitButtonClass = `w-full mt-6 py-4 rounded-full ${themeBg} text-black font-semibold uppercase tracking-wider text-xs hover:opacity-90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${themeShadow}`;
  
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
                {category === 'barberia' ? (
                  <div className="flex flex-col space-y-3">
                    <div className="relative w-16 h-16 transition-transform duration-500 hover:scale-105 hover:rotate-2">
                      <Image
                        src="/hands-logo-v4.png"
                        alt="Valentes Studio Logo"
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className={`text-[9px] uppercase tracking-[0.4em] ${themeText80} font-semibold block mb-1`}>
                        Valentes Studio
                      </span>
                      <h2 className="font-serif text-2xl font-bold tracking-[0.2em] text-gold animate-text-gold-flow leading-none">VALENTES</h2>
                      <h2 className="font-serif text-[10px] tracking-[0.3em] text-gold/80 uppercase font-bold mt-1">BARBER STUDIO</h2>
                    </div>
                  </div>
                ) : category === 'peluqueria' ? (
                  <div className="flex flex-col space-y-3">
                    <div className="relative w-16 h-16 transition-transform duration-500 hover:scale-105 hover:rotate-2">
                      <Image
                        src="/peluqueria-logo-v4.png"
                        alt="Alma Bela Studio Logo"
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className={`text-[9px] uppercase tracking-[0.4em] ${themeText80} font-semibold block mb-1`}>
                        Alma Bela Studio
                      </span>
                      <h2 className="font-serif text-2xl font-bold tracking-[0.2em] text-gold animate-text-gold-flow leading-none">ALMA BELA</h2>
                      <h2 className="font-serif text-[10px] tracking-[0.3em] text-gold/80 uppercase font-bold mt-1">STUDIO</h2>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="relative w-16 h-16 transition-transform duration-500 hover:scale-105 hover:rotate-2">
                      <Image
                        src="/terapias-logo-v7.png"
                        alt="Jefito Lopes Studio Logo"
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className={`text-[9px] uppercase tracking-[0.4em] ${themeText80} font-semibold block mb-1`}>
                        Jefito Lopes Studio
                      </span>
                      <h2 className="font-serif text-2xl font-bold tracking-[0.2em] text-platinum animate-text-platinum-flow leading-none">JEFITO LOPES</h2>
                      <h2 className="font-serif text-[10px] tracking-[0.3em] text-platinum/80 uppercase font-bold mt-1">STUDIO</h2>
                    </div>
                  </div>
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
                      : 'Jefito Lopes • Terapias Holísticas'
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
                                : 'border-gold shadow-[0_0_12px_rgba(198,155,60,0.4)]'
                              : 'border-white/10'
                          }`}>
                            <Sparkles className={`w-5 h-5 animate-pulse ${themeText}`} />
                          </div>
                          <span className="text-[10px] tracking-wider text-text-secondary uppercase">Cualq.</span>
                        </button>

                        {/* Real specialists */}
                        {filteredSpecialistsList.map((specialist) => {
                          const photo = specialist.imageUrl || specialistPhotos[specialist.id];
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
                                    : 'border-gold shadow-[0_0_12px_rgba(198,155,60,0.4)]'
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
                                      : 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.25)]' 
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
                        {dateType === 'semana' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-1.5 pt-1"
                          >
                            <span className="block text-[8px] uppercase tracking-wider text-text-secondary font-bold">Selecciona el día:</span>
                            <div className="flex space-x-2 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1">
                              {(() => {
                                const days = [];
                                const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                
                                for (let i = 0; i < 7; i++) {
                                  const d = new Date();
                                  d.setDate(d.getDate() + i);
                                  const dayOfWeek = daysOfWeek[d.getDay()];
                                  const dayOfMonth = d.getDate();
                                  const month = monthNames[d.getMonth()];
                                  
                                  const yyyy = d.getFullYear();
                                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                                  const dd = String(d.getDate()).padStart(2, '0');
                                  const dateStr = `${yyyy}-${mm}-${dd}`;
                                  
                                  days.push({
                                    date: dateStr,
                                    dayName: i === 0 ? 'Hoy' : i === 1 ? 'Mañ' : dayOfWeek,
                                    displayDate: `${dayOfMonth} ${month}`,
                                  });
                                }

                                const checkTimeSlotAvailabilityForDate = (checkDate: string, slotTime: string): { available: boolean; reason?: string } => {
                                  if (!checkDate) return { available: true };
                                  const dur = selectedServiceObj ? parseDurationToMinutes(selectedServiceObj.duration) : 60;
                                  if (specialistId) {
                                    return isSpecialistAvailable(specialistId, checkDate, slotTime, dur);
                                  }
                                  if (filteredSpecialistsList.length === 0) return { available: true };
                                  const availableSpecs = filteredSpecialistsList.filter(s => isSpecialistAvailable(s.id, checkDate, slotTime, dur).available);
                                  if (availableSpecs.length > 0) {
                                    return { available: true };
                                  }
                                  return { available: false, reason: 'No hay profesionales disponibles' };
                                };

                                const countAvailableSlots = (checkDate: string) => {
                                  const slots = [
                                    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                                    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                                    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
                                  ];
                                  return slots.filter(slot => checkTimeSlotAvailabilityForDate(checkDate, slot).available).length;
                                };
                                
                                return days.map((d) => {
                                  const isSelected = date === d.date;
                                  const availableCount = countAvailableSlots(d.date);
                                  const isFullyBooked = availableCount === 0;

                                  return (
                                    <button
                                      key={d.date}
                                      type="button"
                                      disabled={isFullyBooked}
                                      onClick={() => {
                                        setDate(d.date);
                                        setTime(''); // Clear selected slot when date changes
                                      }}
                                      className={`flex-shrink-0 w-[72px] h-[78px] rounded-2xl border flex flex-col justify-center items-center transition-all duration-300 snap-start ${
                                        isFullyBooked
                                          ? 'border-white/5 bg-black/20 text-white/20 opacity-30 cursor-not-allowed'
                                          : isSelected
                                            ? isTerapias
                                              ? 'border-platinum bg-platinum/10 text-platinum shadow-[0_0_12px_rgba(226,224,216,0.25)]'
                                              : 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.25)]'
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 text-white/70 hover:text-white cursor-pointer'
                                      }`}
                                    >
                                      <span className="text-[9px] font-semibold uppercase tracking-wider">{d.dayName}</span>
                                      <span className="text-[11px] font-bold mt-1 font-mono">{d.displayDate}</span>
                                      <span className={`text-[8px] mt-1 font-medium ${
                                        isFullyBooked
                                          ? 'text-red-400/70 font-semibold'
                                          : isSelected
                                            ? isTerapias ? 'text-platinum/80' : 'text-gold/80'
                                            : 'text-text-secondary/60'
                                      }`}>
                                        {isFullyBooked ? 'Agotado' : `${availableCount} disp.`}
                                      </span>
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </motion.div>
                        )}

                        {dateType === 'mes' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3 mt-2"
                          >
                            {/* Month Navigator Header */}
                            <div className="flex justify-between items-center pb-2 border-b border-white/5">
                              <button
                                type="button"
                                onClick={() => {
                                  const prev = new Date(currentCalendarDate);
                                  prev.setMonth(prev.getMonth() - 1);
                                  setCurrentCalendarDate(prev);
                                }}
                                className="p-1 text-text-secondary hover:text-white transition-colors cursor-pointer"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <span className="text-[11px] font-serif font-bold text-white uppercase tracking-wider">
                                {currentCalendarDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = new Date(currentCalendarDate);
                                  next.setMonth(next.getMonth() + 1);
                                  setCurrentCalendarDate(next);
                                }}
                                className="p-1 text-text-secondary hover:text-white transition-colors cursor-pointer"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>

                            {/* Weekday Labels */}
                            <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((day) => (
                                <div key={day} className="py-1">{day}</div>
                              ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                              {(() => {
                                const year = currentCalendarDate.getFullYear();
                                const month = currentCalendarDate.getMonth();
                                
                                const firstDay = new Date(year, month, 1);
                                const lastDay = new Date(year, month + 1, 0);
                                
                                let firstDayOfWeek = firstDay.getDay();
                                firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                                
                                const grid = [];
                                for (let i = 0; i < firstDayOfWeek; i++) {
                                  grid.push(null);
                                }
                                for (let d = 1; d <= lastDay.getDate(); d++) {
                                  grid.push(new Date(year, month, d));
                                }

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const maxDate = new Date();
                                maxDate.setDate(maxDate.getDate() + 30);
                                maxDate.setHours(23, 59, 59, 999);

                                const isDateDisabled = (d: Date | null) => {
                                  if (!d) return true;
                                  const checkD = new Date(d);
                                  checkD.setHours(0, 0, 0, 0);
                                  return checkD < today || checkD > maxDate;
                                };

                                const checkTimeSlotAvailabilityForDate = (checkDate: string, slotTime: string): { available: boolean; reason?: string } => {
                                  if (!checkDate) return { available: true };
                                  const dur = selectedServiceObj ? parseDurationToMinutes(selectedServiceObj.duration) : 60;
                                  if (specialistId) {
                                    return isSpecialistAvailable(specialistId, checkDate, slotTime, dur);
                                  }
                                  if (filteredSpecialistsList.length === 0) return { available: true };
                                  const availableSpecs = filteredSpecialistsList.filter(s => isSpecialistAvailable(s.id, checkDate, slotTime, dur).available);
                                  if (availableSpecs.length > 0) {
                                    return { available: true };
                                  }
                                  return { available: false, reason: 'No hay profesionales disponibles' };
                                };

                                const countAvailableSlots = (checkDate: string) => {
                                  const slots = [
                                    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                                    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                                    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
                                  ];
                                  return slots.filter(slot => checkTimeSlotAvailabilityForDate(checkDate, slot).available).length;
                                };

                                return grid.map((d, index) => {
                                  if (!d) {
                                    return <div key={`empty-${index}`} />;
                                  }

                                  const yyyy = d.getFullYear();
                                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                                  const dd = String(d.getDate()).padStart(2, '0');
                                  const dateStr = `${yyyy}-${mm}-${dd}`;
                                  
                                  const isSelected = date === dateStr;
                                  const isDisabled = isDateDisabled(d);
                                  const availableCount = isDisabled ? 0 : countAvailableSlots(dateStr);
                                  const isFullyBooked = !isDisabled && availableCount === 0;

                                  return (
                                    <button
                                      key={dateStr}
                                      type="button"
                                      disabled={isDisabled || isFullyBooked}
                                      onClick={() => {
                                        setDate(dateStr);
                                        setTime('');
                                      }}
                                      className={`h-9 rounded-xl flex flex-col justify-center items-center text-[11px] font-mono transition-all duration-300 relative ${
                                        isDisabled || isFullyBooked
                                          ? 'text-white/20 bg-black/20 opacity-30 cursor-not-allowed'
                                          : isSelected
                                            ? isTerapias
                                              ? 'border border-platinum bg-platinum/10 text-platinum shadow-[0_0_8px_rgba(226,224,216,0.25)] font-bold'
                                              : 'border border-gold bg-gold/10 text-gold shadow-[0_0_8px_rgba(198,155,60,0.25)] font-bold'
                                            : 'border border-transparent bg-white/[0.02] hover:border-white/20 text-white/80 hover:text-white cursor-pointer'
                                      }`}
                                    >
                                      <span>{d.getDate()}</span>
                                      {!isDisabled && !isFullyBooked && (
                                        <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                                          isSelected
                                            ? isTerapias ? 'bg-platinum' : 'bg-gold'
                                            : 'bg-emerald-400/50'
                                        }`} />
                                      )}
                                    </button>
                                  );
                                });
                              })()}
                            </div>
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
                            { value: '08:00', label: '08:00 AM' },
                            { value: '08:30', label: '08:30 AM' },
                            { value: '09:00', label: '09:00 AM' },
                            { value: '09:30', label: '09:30 AM' },
                            { value: '10:00', label: '10:00 AM' },
                            { value: '10:30', label: '10:30 AM' },
                            { value: '11:00', label: '11:00 AM' },
                            { value: '11:30', label: '11:30 AM' },
                            { value: '12:00', label: '12:00 PM' },
                            { value: '12:30', label: '12:30 PM' },
                            { value: '13:00', label: '01:00 PM' },
                            { value: '13:30', label: '01:30 PM' },
                            { value: '14:00', label: '02:00 PM' },
                            { value: '14:30', label: '02:30 PM' },
                            { value: '15:00', label: '03:00 PM' },
                            { value: '15:30', label: '03:30 PM' },
                            { value: '16:00', label: '04:00 PM' },
                            { value: '16:30', label: '04:30 PM' },
                            { value: '17:00', label: '05:00 PM' },
                            { value: '17:30', label: '05:30 PM' },
                            { value: '18:00', label: '06:00 PM' },
                            { value: '18:30', label: '06:30 PM' },
                            { value: '19:00', label: '07:00 PM' },
                            { value: '19:30', label: '07:30 PM' },
                            { value: '20:00', label: '08:00 PM' },
                            { value: '20:30', label: '08:30 PM' }
                          ].map((slot) => {
                            const isSelected = time === slot.value;
                            const availability = checkTimeSlotAvailability(slot.value);
                            return (
                              <button
                                key={slot.value}
                                type="button"
                                disabled={!availability.available}
                                title={availability.reason}
                                onClick={() => setTime(slot.value)}
                                className={`py-2.5 px-1 text-center rounded-xl border text-[10px] font-semibold tracking-wider transition-all duration-300 focus:outline-none cursor-pointer ${
                                  !availability.available
                                    ? 'border-white/5 bg-black/25 text-white/20 cursor-not-allowed opacity-30'
                                    : isSelected
                                      ? isTerapias
                                        ? 'border-platinum bg-platinum/10 text-platinum shadow-[0_0_10px_rgba(226,224,216,0.2)]'
                                        : 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(198,155,60,0.2)]'
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>WhatsApp *</label>
                          <div className="flex space-x-2 relative">
                            {/* Country Prefix Dropdown */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                className="h-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-3 text-[11px] text-white flex items-center space-x-1.5 focus:outline-none min-w-[70px] justify-between cursor-pointer"
                              >
                                <span className="font-mono">{countryCode}</span>
                                <ChevronDown size={10} className="text-text-secondary" />
                              </button>
                              
                              <AnimatePresence>
                                {isCountryDropdownOpen && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)} />
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="absolute left-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 w-28 max-h-40 overflow-y-auto"
                                    >
                                      {[
                                        { code: '+56', label: 'Chile' },
                                        { code: '+54', label: 'Argentina' },
                                        { code: '+51', label: 'Perú' },
                                        { code: '+57', label: 'Colombia' },
                                        { code: '+52', label: 'México' },
                                        { code: '+598', label: 'Uruguay' },
                                        { code: '+1', label: 'USA' },
                                        { code: '+34', label: 'España' }
                                      ].map((item) => (
                                        <button
                                          key={item.code}
                                          type="button"
                                          onClick={() => {
                                            setCountryCode(item.code);
                                            setIsCountryDropdownOpen(false);
                                            validatePhone(phoneNumOnly, item.code);
                                          }}
                                          className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5 flex justify-between items-center ${
                                            countryCode === item.code ? 'text-gold font-bold' : 'text-white/80'
                                          }`}
                                        >
                                          <span className="font-mono">{item.code}</span>
                                          <span className="text-[9px] text-text-secondary">{item.label}</span>
                                        </button>
                                      ))}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Phone number input */}
                            <input
                              type="tel"
                              placeholder="912345678"
                              value={phoneNumOnly}
                              onChange={(e) => handlePhoneNumChange(e.target.value)}
                              required
                              className={`${inputClass} flex-1 ${phoneError ? 'border-red-500/50 focus:border-red-500' : ''}`}
                            />
                          </div>
                          {phoneError && (
                            <p className="text-[10px] text-red-400 mt-1 font-light text-left">{phoneError}</p>
                          )}
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
                                  {/* Gift Card validation section */}
                    {selectedServiceObj && (
                      <div className={`p-4 rounded-2xl bg-white/[0.02] border ${themeBorder15} space-y-3 mt-4`}>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-white">¿Tienes una Gift Card?</span>
                          {appliedGiftCard && (
                            <button
                              type="button"
                              onClick={() => {
                                setAppliedGiftCard(null);
                                setGiftCardCode('');
                                setGiftCardSuccess('');
                              }}
                              className={`text-[10px] ${themeText} hover:underline`}
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        
                        {!appliedGiftCard ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Ej: SAN-GIFT-30K"
                              value={giftCardCode}
                              onChange={(e) => {
                                setGiftCardCode(e.target.value);
                                setGiftCardError('');
                              }}
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/20 uppercase font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleApplyGiftCard}
                              className={`px-4 py-2 rounded-xl ${themeBg} text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer`}
                            >
                              Aplicar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-400">
                            <div className="flex flex-col text-left">
                              <span className="font-semibold font-mono">{appliedGiftCard.code}</span>
                              <span className="text-[10px] opacity-80">Saldo disponible: ${appliedGiftCard.remainingBalance.toLocaleString('es-CL')} CLP</span>
                            </div>
                            <span className="font-bold">Aplicada</span>
                          </div>
                        )}
                        
                        {giftCardError && (
                          <p className="text-[10px] text-rose-500 text-left">{giftCardError}</p>
                        )}
                        {giftCardSuccess && (
                          <p className="text-[10px] text-emerald-400 text-left">{giftCardSuccess}</p>
                        )}
                      </div>
                    )}

                    {/* Price Breakdown */}
                    {selectedServiceObj && (
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 text-left mt-4 text-xs font-light text-text-secondary">
                        <div className="flex justify-between">
                          <span>Valor de Servicio</span>
                          <span className="text-white font-medium">{selectedServiceObj.price}</span>
                        </div>
                        {appliedGiftCard && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Descuento Gift Card</span>
                            <span className="font-medium">-${discountAmount.toLocaleString('es-CL')} CLP</span>
                          </div>
                        )}
                        <div className="flex justify-between items-baseline pt-2 border-t border-white/5 text-sm font-semibold">
                          <span className="text-white">Total a Pagar</span>
                          <span className={`${themeText} font-serif text-base`}>{finalPriceStr} CLP</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      className={submitButtonClass}
                    >
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Confirmar Experiencia ({selectedServiceObj ? finalPriceStr : '$0'})</span>
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
                          {formatDateToDMY(date)}
                        </span>
                      </div>
                      <div className={summaryBorderClass}>
                        <span className={summaryLabelClass}>Hora</span>
                        <span className={summaryValClass + " flex items-center"}>
                          <Clock size={14} className={summaryIconClass} />
                          {time}
                        </span>
                      </div>
                      {appliedGiftCard && (
                        <div className={summaryBorderClass}>
                          <span className={summaryLabelClass}>Gift Card Usada</span>
                          <span className="font-mono text-emerald-400 font-semibold">{appliedGiftCard.code}</span>
                        </div>
                      )}
                      {appliedGiftCard && (
                        <div className={summaryBorderClass}>
                          <span className={summaryLabelClass}>Descuento</span>
                          <span className="text-emerald-400 font-semibold">-${discountAmount.toLocaleString('es-CL')} CLP</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-white/5">
                        <span className={summaryLabelClass}>Total Pagado</span>
                        <span className="text-white font-bold">{finalPriceStr} CLP</span>
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
