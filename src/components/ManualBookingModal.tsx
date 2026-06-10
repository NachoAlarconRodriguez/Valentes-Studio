'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  Check, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  Smartphone, 
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useGiftCardStore } from '@/store/useGiftCardStore';
import { useServicesStore } from '@/store/useServicesStore';
import { useScheduleStore } from '@/store/useScheduleStore';
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

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'barberia' | 'peluqueria' | 'terapias';
  defaultSpecialistId?: string;
  defaultDate?: string;
  defaultTime?: string;
  onBookingCreated?: (code: string) => void;
}

export function ManualBookingModal({ 
  isOpen, 
  onClose, 
  defaultCategory = 'barberia', 
  defaultSpecialistId, 
  defaultDate, 
  defaultTime, 
  onBookingCreated 
}: ManualBookingModalProps) {
  const { clients, addBooking } = useBookingStore();
  const { servicesData } = useServicesStore();

  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+56 9 ');
  const [clientEmail, setClientEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [category, setCategory] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  const [serviceId, setServiceId] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [channel, setChannel] = useState<'Web' | 'WhatsApp' | 'Walk-in'>('Walk-in');
  const [status, setStatus] = useState<'confirmado' | 'pendiente'>('confirmado');

  // Availability Bypass states
  const [forceBooking, setForceBooking] = useState(false);

  // Client suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState<typeof clients>([]);
  const nameInputRef = useRef<HTMLDivElement>(null);

  // Dropdowns visual states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  
  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newBookingId, setNewBookingId] = useState('');

  // Gift Card states
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<any | null>(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [giftCardSuccess, setGiftCardSuccess] = useState('');

  // Set default form values when modal opens or defaults change
  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      if (defaultSpecialistId) {
        setSpecialistId(defaultSpecialistId);
      } else {
        setSpecialistId('');
      }
      if (defaultDate) {
        setDate(defaultDate);
      } else {
        setDate('');
      }
      if (defaultTime) {
        const standardSlots = [
          '09:00', '10:00', '11:00', '12:00', 
          '13:00', '14:00', '15:00', '16:00', 
          '17:00', '18:00', '19:00', '20:00'
        ];
        if (standardSlots.includes(defaultTime)) {
          setTime(defaultTime);
          setCustomTime('');
        } else {
          setTime('');
          setCustomTime(defaultTime);
        }
      } else {
        setTime('');
        setCustomTime('');
      }
    }
  }, [isOpen, defaultCategory, defaultSpecialistId, defaultDate, defaultTime]);

  // Handle client name typeahead suggestions
  useEffect(() => {
    if (clientName.trim().length >= 2) {
      const query = clientName.toLowerCase();
      const matches = clients.filter(
        c => c.name.toLowerCase().includes(query) || c.phone.includes(query)
      );
      setFilteredClients(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [clientName, clients]);

  // Dismiss client suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (cat: 'barberia' | 'peluqueria' | 'terapias') => {
    setCategory(cat);
    setServiceId('');
    setSpecialistId('');
    setTime('');
    setCustomTime('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    if (!val.startsWith('+56 9')) {
      const cleanDigits = val.replace(/\D/g, '');
      let suffix = '';
      if (cleanDigits.length > 3) {
        if (cleanDigits.startsWith('569')) {
          suffix = cleanDigits.substring(3);
        } else if (cleanDigits.startsWith('9') && cleanDigits.length === 9) {
          suffix = cleanDigits.substring(1);
        } else {
          suffix = cleanDigits;
        }
      }
      val = '+56 9 ' + suffix;
    }

    const suffix = val.substring(5).replace(/\D/g, '').substring(0, 8);
    
    let formatted = '+56 9 ';
    if (suffix.length > 0) {
      if (suffix.length <= 4) {
        formatted += suffix;
      } else {
        formatted += `${suffix.substring(0, 4)} ${suffix.substring(4)}`;
      }
    }
    
    setClientPhone(formatted);

    if (suffix.length > 0 && suffix.length < 8) {
      setPhoneError('Faltan dígitos (deben ser 8 números)');
    } else if (suffix.length === 8) {
      setPhoneError(null);
    } else {
      setPhoneError(null);
    }
  };

  const handleClientSelect = (client: typeof clients[0]) => {
    setClientName(client.name);
    
    // Enforce phone validation formatting on select
    let phoneVal = client.phone;
    if (!phoneVal.startsWith('+56 9')) {
      const clean = phoneVal.replace(/\D/g, '');
      let suffix = clean;
      if (clean.startsWith('569')) suffix = clean.substring(3);
      else if (clean.startsWith('9') && clean.length === 9) suffix = clean.substring(1);
      phoneVal = '+56 9 ' + suffix;
    }
    
    const suffix = phoneVal.substring(5).replace(/\D/g, '').substring(0, 8);
    let formatted = '+56 9 ';
    if (suffix.length > 0) {
      if (suffix.length <= 4) {
        formatted += suffix;
      } else {
        formatted += `${suffix.substring(0, 4)} ${suffix.substring(4)}`;
      }
    }
    setClientPhone(formatted);
    setPhoneError(null);
    setClientEmail(client.email);
    setShowSuggestions(false);
  };

  // Helper to parse price string to number
  const parsePrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  // Lists based on category
  const servicesList = (servicesData[category]?.services || []).filter(s => s.isActive !== false);
  const specialistsList = servicesData[category]?.specialists || [];
  
  const selectedServiceObj = servicesList.find(s => s.id === serviceId);
  const selectedSpecialistObj = specialistsList.find(sp => sp.id === specialistId);

  const getFormattedDate = (daysOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  // Availability checking
  const isSpecialistAvailable = useScheduleStore(state => state.isSpecialistAvailable);

  const checkTimeSlotAvailability = (slotTime: string): { available: boolean; reason?: string } => {
    if (!date) return { available: true };
    
    let duration = 60;
    if (selectedServiceObj?.duration) {
      const match = selectedServiceObj.duration.match(/(\d+)\s*min/);
      if (match) {
        duration = parseInt(match[1], 10);
      }
    }

    if (specialistId) {
      return isSpecialistAvailable(specialistId, date, slotTime, duration);
    }
    if (specialistsList.length === 0) return { available: true };
    
    // Check if at least one specialist is available
    const availableSpecs = specialistsList.filter(s => isSpecialistAvailable(s.id, date, slotTime, duration).available);
    if (availableSpecs.length > 0) {
      return { available: true };
    }
    return { available: false, reason: 'No hay profesionales disponibles' };
  };

  // Reset forceBooking when booking parameters change
  useEffect(() => {
    setForceBooking(false);
  }, [specialistId, date, time, customTime]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !serviceId || !date) return;
    
    const finalTime = customTime || time;
    if (!finalTime) return;

    // Validate 8 digits
    const digitsOnly = clientPhone.substring(5).replace(/\D/g, '');
    if (digitsOnly.length !== 8) {
      setPhoneError('El número de teléfono debe tener exactamente 8 dígitos.');
      return;
    }
    setPhoneError(null);

    // Validate availability
    const availability = checkTimeSlotAvailability(finalTime);
    if (!availability.available && !forceBooking) {
      setGiftCardError(`No se puede guardar: ${availability.reason}. Marca "Forzar agendamiento" para ignorar.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const code = addBooking({
        clientName,
        clientPhone,
        clientEmail,
        category,
        serviceName: selectedServiceObj?.name || 'Servicio Personalizado',
        price: finalPriceStr,
        specialistName: selectedSpecialistObj?.name || 'Cualquiera',
        date,
        time: finalTime,
        channel,
        status,
        giftCardUsed: appliedGiftCard ? appliedGiftCard.code : undefined
      });

      // Deduct balance from Gift Card if applied
      if (appliedGiftCard && discountAmount > 0) {
        useGiftCardStore.getState().redeemGiftCard(appliedGiftCard.code, discountAmount);
      }

      setNewBookingId(code);
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onBookingCreated) {
        onBookingCreated(code);
      }
    }, 800);
  };

  const handleReset = () => {
    setClientName('');
    setClientPhone('+56 9 ');
    setClientEmail('');
    setPhoneError(null);
    setServiceId('');
    setSpecialistId('');
    setDate('');
    setTime('');
    setCustomTime('');
    setChannel('Walk-in');
    setStatus('confirmado');
    setIsSuccess(false);
    setNewBookingId('');
    setIsCategoryOpen(false);
    setIsServiceOpen(false);
    setGiftCardCode('');
    setAppliedGiftCard(null);
    setGiftCardError('');
    setGiftCardSuccess('');
    setForceBooking(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 300);
  };

  // Color styling helpers matching business themes
  const isTerapias = category === 'terapias';
  const themeGold = isTerapias ? '#E2E0D8' : '#C69B3C';
  const textGoldClass = isTerapias ? 'text-platinum' : 'text-gold';
  const borderFocusClass = isTerapias ? 'focus:border-platinum/50' : 'focus:border-gold/50';
  const bgThemeClass = isTerapias ? 'bg-platinum' : 'bg-gold';
  const shadowThemeClass = isTerapias ? 'shadow-platinum/10' : 'shadow-gold/10';

  const selectedTime = customTime || time;
  const currentAvailability = selectedTime ? checkTimeSlotAvailability(selectedTime) : { available: true };

  return (
    <AnimatePresence>
      {isOpen && (
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
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`relative w-full max-w-5xl bg-black/95 text-white rounded-[32px] overflow-hidden border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] grid grid-cols-1 md:grid-cols-12 min-h-[600px] max-h-[90vh] md:max-h-[85vh] transition-all`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer z-30"
              type="button"
            >
              <X size={16} />
            </button>

            {/* LEFT SIDEBAR: Live Summary Preview */}
            <div className={`hidden md:flex md:col-span-4 flex-col justify-between p-8 bg-gradient-to-b from-[#090909] to-[#040404] border-r border-white/5 relative`}>
              <div className="space-y-6">
                <div>
                  <span className={`text-[9px] uppercase tracking-[0.3em] text-text-secondary font-bold block mb-1`}>
                    Valentes Control
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-white tracking-wide">
                    Detalle de Reserva
                  </h3>
                </div>

                {/* Selected Service Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                  <span className={`text-[8px] uppercase tracking-widest font-bold block ${textGoldClass}`}>
                    Servicio Seleccionado
                  </span>
                  {selectedServiceObj ? (
                    <div className="space-y-3">
                      <h4 className="font-serif text-base text-white font-medium leading-snug">
                        {selectedServiceObj.name}
                      </h4>
                      <p className="text-[10px] text-text-secondary line-clamp-2 leading-relaxed">
                        {selectedServiceObj.description}
                      </p>
                      <div className="flex justify-between items-baseline pt-3 border-t border-white/5 text-[11px]">
                        <span className="text-text-secondary">Duración:</span>
                        <span className="font-medium text-white">{selectedServiceObj.duration}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 text-[11px]">
                        <span className="text-text-secondary">Precio Servicio:</span>
                        <span className="font-medium text-white">
                          {selectedServiceObj.price}
                        </span>
                      </div>
                      {appliedGiftCard && (
                        <div className="flex justify-between items-baseline pt-1 text-[11px] text-emerald-400">
                          <span>Descuento Gift Card:</span>
                          <span>-${discountAmount.toLocaleString('es-CL')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-1 text-[11px]">
                        <span className="text-text-secondary">Precio Final:</span>
                        <span className={`font-serif text-sm font-semibold ${textGoldClass}`}>
                          {finalPriceStr}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary italic">Selecciona un servicio para ver los detalles de precio y duración.</p>
                  )}
                </div>

                {/* Selected Specialist */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                  <span className={`text-[8px] uppercase tracking-widest font-bold block ${textGoldClass}`}>
                    Especialista Asignado
                  </span>
                  {selectedSpecialistObj ? (
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                        {selectedSpecialistObj.imageUrl || specialistPhotos[selectedSpecialistObj.id] ? (
                          <Image
                            src={selectedSpecialistObj.imageUrl || specialistPhotos[selectedSpecialistObj.id]}
                            alt={selectedSpecialistObj.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-platinum">
                            {selectedSpecialistObj.avatar}
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-white">{selectedSpecialistObj.name}</h5>
                        <p className="text-[9px] text-text-secondary uppercase tracking-wider">{selectedSpecialistObj.role}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary italic">Por definir (Cualquiera)</p>
                  )}
                </div>

                {/* Scheduling Details */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                  <span className={`text-[8px] uppercase tracking-widest font-bold block ${textGoldClass}`}>
                    Horario & Canal
                  </span>
                  <div className="space-y-1.5 text-[11px] text-text-secondary">
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span className="text-white font-medium">{formatDateToDMY(date) || '-- / -- / ----'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hora:</span>
                      <span className="text-white font-medium">{customTime || time || '--:--'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canal:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        {channel === 'Walk-in' && <Smartphone size={10} className="text-amber-400" />}
                        {channel === 'WhatsApp' && <MessageSquare size={10} className="text-emerald-400" />}
                        {channel === 'Web' && <Globe size={10} className="text-blue-400" />}
                        <span>{channel}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Footer */}
              <div className="text-[9px] text-text-secondary select-none tracking-widest uppercase opacity-40">
                Valentes Santuario de Bienestar
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="col-span-1 md:col-span-8 flex flex-col justify-between p-8 bg-[#070707] overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
              {!isSuccess ? (
                <div className="flex-grow flex flex-col justify-center max-w-xl w-full mx-auto space-y-6">
                  <div>
                    <h3 className={`font-serif text-2xl ${textGoldClass} tracking-wide`}>Nueva Reserva Manual</h3>
                    <p className="text-[10px] text-text-secondary tracking-widest uppercase mt-1">
                      Registrar reserva en el sistema de manera interna
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    
                    {/* SECTION 1: Client Information */}
                    <div className="space-y-4">
                      <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                        Datos del Cliente
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name (With autocomplete suggestions) */}
                        <div className="relative" ref={nameInputRef}>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            Nombre Completo *
                          </label>
                          <div className="relative flex items-center">
                            <User size={13} className="absolute left-3.5 text-text-secondary" />
                            <input
                              type="text"
                              required
                              placeholder="Nombre del cliente"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className={`w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors ${borderFocusClass}`}
                            />
                          </div>

                          {/* Client search typeahead popup */}
                          <AnimatePresence>
                            {showSuggestions && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30 max-h-40 overflow-y-auto"
                              >
                                {filteredClients.map((client, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleClientSelect(client)}
                                    className="w-full text-left px-4 py-2 text-[11px] hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 flex justify-between items-center"
                                  >
                                    <div>
                                      <span className="font-semibold text-white">{client.name}</span>
                                      <span className="text-text-secondary ml-2 font-mono">{client.phone}</span>
                                    </div>
                                    <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/10`}>
                                      Autocompletar
                                    </span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            Teléfono / WhatsApp *
                          </label>
                          <div className="relative flex items-center">
                            <Phone size={13} className="absolute left-3.5 text-text-secondary" />
                            <input
                              type="tel"
                              required
                              placeholder="+56 9 1111 2222"
                              value={clientPhone}
                              onChange={handlePhoneChange}
                              className={`w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors ${borderFocusClass} ${phoneError ? 'border-red-500/50 focus:border-red-500' : ''}`}
                            />
                          </div>
                          {phoneError && (
                            <p className="text-[10px] text-red-400 mt-1 font-light text-left">{phoneError}</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Correo Electrónico
                        </label>
                        <div className="relative flex items-center">
                          <Mail size={13} className="absolute left-3.5 text-text-secondary" />
                          <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            className={`w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors ${borderFocusClass}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Service Selection */}
                    <div className="space-y-4">
                      <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                        Detalle del Ritual
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Business Unit Selector (Custom Dropdown) */}
                        <div className="relative">
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            Unidad de Negocio
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCategoryOpen(!isCategoryOpen);
                              setIsServiceOpen(false);
                            }}
                            className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-xs text-left flex justify-between items-center transition-colors focus:outline-none focus:border-white/30"
                          >
                            <span className="text-white font-medium">
                              {category === 'barberia' && 'Barbería Tradicional'}
                              {category === 'peluqueria' && 'Peluquería de Autor'}
                              {category === 'terapias' && 'Terapias Holísticas'}
                            </span>
                            <ChevronDown size={14} className="text-text-secondary transition-transform duration-300" style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'none' }} />
                          </button>
                          
                          <AnimatePresence>
                            {isCategoryOpen && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="absolute left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                                >
                                  {[
                                    { id: 'barberia', name: 'Barbería Tradicional' },
                                    { id: 'peluqueria', name: 'Peluquería de Autor' },
                                    { id: 'terapias', name: 'Terapias Holísticas' }
                                  ].map((unit) => {
                                    const isSel = category === unit.id;
                                    return (
                                      <button
                                        key={unit.id}
                                        type="button"
                                        onClick={() => {
                                          handleCategoryChange(unit.id as any);
                                          setIsCategoryOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between hover:bg-white/5 ${
                                          isSel ? 'text-gold bg-white/[0.02] font-semibold' : 'text-white/70'
                                        }`}
                                      >
                                        <span>{unit.name}</span>
                                        {isSel && <span className={`w-1.5 h-1.5 rounded-full ${bgThemeClass}`} />}
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Service Selection (Custom Dropdown) */}
                        <div className="relative">
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            Ritual o Servicio *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsServiceOpen(!isServiceOpen);
                              setIsCategoryOpen(false);
                            }}
                            className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-xs text-left flex justify-between items-center transition-colors focus:outline-none focus:border-white/30"
                          >
                            <span className={selectedServiceObj ? 'text-white font-medium' : 'text-white/40'}>
                              {selectedServiceObj ? `${selectedServiceObj.name} (${selectedServiceObj.price})` : '-- Elige un servicio --'}
                            </span>
                            <ChevronDown size={14} className="text-text-secondary transition-transform duration-300" style={{ transform: isServiceOpen ? 'rotate(180deg)' : 'none' }} />
                          </button>

                          <AnimatePresence>
                            {isServiceOpen && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsServiceOpen(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="absolute left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 max-h-60 overflow-y-auto"
                                >
                                  {servicesList.map((srv) => {
                                    const isSel = serviceId === srv.id;
                                    return (
                                      <button
                                        key={srv.id}
                                        type="button"
                                        onClick={() => {
                                          setServiceId(srv.id);
                                          setIsServiceOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/5 border-b border-white/5 last:border-b-0 flex justify-between items-center ${
                                          isSel ? 'text-gold bg-white/[0.02] font-semibold' : 'text-white/80'
                                        }`}
                                      >
                                        <div className="flex flex-col">
                                          <span>{srv.name}</span>
                                          <span className="text-[10px] text-text-secondary">{srv.duration}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className={isSel ? textGoldClass : 'text-white font-medium'}>{srv.price}</span>
                                          {isSel && <span className={`w-1.5 h-1.5 rounded-full ${bgThemeClass}`} />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Specialist */}
                    <div className="space-y-3">
                      <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold">
                        Especialista Profesional
                      </label>
                      <div className="flex flex-wrap gap-3 py-1">
                        {/* Option: Cualquiera */}
                        <button
                          type="button"
                          onClick={() => setSpecialistId('')}
                          className={`flex flex-col items-center space-y-1 focus:outline-none transition-all duration-300 ${
                            specialistId === '' ? 'scale-105' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#0a0a0a]`} style={{ borderColor: specialistId === '' ? themeGold : 'rgba(255,255,255,0.1)' }}>
                            <Sparkles size={16} className={textGoldClass} />
                          </div>
                          <span className="text-[9px] tracking-wider text-text-secondary uppercase">Cualquiera</span>
                        </button>

                        {/* Specialists matching category */}
                        {specialistsList.map((sp) => {
                          const isSel = specialistId === sp.id;
                          return (
                            <button
                              key={sp.id}
                              type="button"
                              onClick={() => setSpecialistId(sp.id)}
                              className={`flex flex-col items-center space-y-1 focus:outline-none transition-all duration-300 ${
                                isSel ? 'scale-105' : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 relative`} style={{ borderColor: isSel ? themeGold : 'rgba(255,255,255,0.1)' }}>
                                {sp.imageUrl || specialistPhotos[sp.id] ? (
                                  <Image
                                    src={sp.imageUrl || specialistPhotos[sp.id]}
                                    alt={sp.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
                                    {sp.avatar}
                                  </div>
                                )}
                              </div>
                              <div className="text-center">
                                <span className={`block text-[9px] tracking-wider font-semibold ${isSel ? textGoldClass : 'text-white/80'}`}>
                                  {sp.name.split(' ')[0]}
                                </span>
                                <span className="block text-[7px] text-text-secondary tracking-tight uppercase">
                                  {sp.role.split(' ')[0]}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 4: Schedule Picker */}
                    <div className="space-y-4">
                      <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                        Fecha & Hora
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Input */}
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            Fecha de Cita *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              required
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              min={getFormattedDate(0)}
                              className={`w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl px-4 py-2 text-xs text-white focus:outline-none transition-colors ${borderFocusClass}`}
                            />
                            {/* Fast buttons */}
                            <button
                              type="button"
                              onClick={() => setDate(getFormattedDate(0))}
                              className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Hoy
                            </button>
                            <button
                              type="button"
                              onClick={() => setDate(getFormattedDate(1))}
                              className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Mañ.
                            </button>
                          </div>
                        </div>

                        {/* Time Slots Grid + Custom time option */}
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            Hora (Elegir o Customizar) *
                          </label>
                          
                          <div className="grid grid-cols-4 gap-1.5 mb-2">
                            {[
                              '09:00', '10:00', '11:00', '12:00', 
                              '13:00', '14:00', '15:00', '16:00', 
                              '17:00', '18:00', '19:00', '20:00'
                            ].map((slot) => {
                              const isSel = time === slot && !customTime;
                              const availability = checkTimeSlotAvailability(slot);
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={!availability.available && !forceBooking}
                                  title={availability.reason}
                                  onClick={() => {
                                    setTime(slot);
                                    setCustomTime('');
                                  }}
                                  className={`py-1.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer ${
                                    !availability.available && !forceBooking
                                      ? 'border-white/5 bg-black/25 text-white/20 cursor-not-allowed opacity-30'
                                      : isSel
                                        ? `border-gold bg-gold/15 text-gold shadow-sm ${shadowThemeClass}`
                                        : 'border-white/5 bg-white/[0.02] text-white/70 hover:text-white hover:border-white/20'
                                  }`}
                                  style={{
                                    borderColor: isSel ? themeGold : 'rgba(255,255,255,0.05)',
                                    color: isSel ? themeGold : 'rgba(255,255,255,0.7)'
                                  }}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Time text input override */}
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] text-text-secondary uppercase tracking-widest whitespace-nowrap">Otro horario:</span>
                            <input
                              type="text"
                              placeholder="Ej: 11:15, 14:45"
                              value={customTime}
                              onChange={(e) => {
                                setCustomTime(e.target.value);
                                setTime('');
                              }}
                              className={`bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none w-28 transition-colors ${borderFocusClass}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: Reservation Admin Settings */}
                    <div className="space-y-4">
                      <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                        Ajustes de Administración
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Channel selector (Pill row button list) */}
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-2">
                            Canal de Ingreso
                          </label>
                          <div className="flex space-x-2">
                            {[
                              { id: 'Walk-in', label: 'Presencial', icon: Smartphone, color: 'text-amber-400', activeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
                              { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400', activeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                              { id: 'Web', label: 'Web / App', icon: Globe, color: 'text-blue-400', activeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' }
                            ].map((item) => {
                              const isSel = channel === item.id;
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setChannel(item.id as any)}
                                  className={`flex-1 py-2 rounded-xl border text-[10px] font-bold tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                                    isSel
                                      ? item.activeBg
                                      : 'border-white/5 bg-white/[0.02] text-white/50 hover:text-white/90 hover:border-white/10'
                                  }`}
                                >
                                  <Icon size={12} className={isSel ? '' : item.color} />
                                  <span>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Status selector (pendiente vs confirmado) */}
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-2">
                            Estado de la Reserva
                          </label>
                          <div className="flex space-x-2">
                            {[
                              { id: 'confirmado', label: 'Confirmado', color: 'text-emerald-400', activeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                              { id: 'pendiente', label: 'Pendiente', color: 'text-zinc-400', activeBg: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400' }
                            ].map((item) => {
                              const isSel = status === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setStatus(item.id as any)}
                                  className={`flex-1 py-2 rounded-xl border text-[10px] font-bold tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                                    isSel
                                      ? item.activeBg
                                      : 'border-white/5 bg-white/[0.02] text-white/50 hover:text-white/90 hover:border-white/10'
                                  }`}
                                >
                                  {isSel && <Check size={11} className={item.color} />}
                                  <span>{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6: Availability Alert & Override Checkbox */}
                    {selectedTime && !currentAvailability.available && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex flex-col space-y-2 text-left">
                        <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>Conflicto de Horario: {currentAvailability.reason}</span>
                        </p>
                        <label className="flex items-center space-x-2.5 text-[11px] text-white cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={forceBooking}
                            onChange={(e) => setForceBooking(e.target.checked)}
                            className="rounded border-white/20 bg-black/40 text-gold focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                          />
                          <span>Forzar agendamiento (Bypass de disponibilidad del especialista)</span>
                        </label>
                      </div>
                    )}

                    {/* SECTION 7: Gift Card Validation */}
                    {selectedServiceObj && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold pb-1">
                          Aplicar Tarjeta de Regalo
                        </span>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-white">¿El cliente tiene una Gift Card?</span>
                            {appliedGiftCard && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAppliedGiftCard(null);
                                  setGiftCardCode('');
                                  setGiftCardSuccess('');
                                }}
                                className={`text-[10px] ${textGoldClass} hover:underline`}
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
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/20 uppercase font-mono"
                              />
                              <button
                                type="button"
                                onClick={handleApplyGiftCard}
                                className={`px-4 py-2 rounded-lg ${bgThemeClass} text-black text-xs font-semibold hover:opacity-90 transition-all cursor-pointer`}
                              >
                                Aplicar
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400">
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
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || (!!selectedTime && !currentAvailability.available && !forceBooking)}
                        className={`w-full py-4 rounded-xl text-black font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${bgThemeClass} ${shadowThemeClass}`}
                      >
                        {isSubmitting ? (
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>Crear Reserva ({selectedServiceObj ? finalPriceStr : '$0'})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Success Screen inside Split layout */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4 text-center flex flex-col items-center"
                >
                  <div className={`${textGoldClass} mb-4`}>
                    <CheckCircle2 size={54} className="stroke-[1.5]" />
                  </div>

                  <h4 className="font-serif text-2xl font-bold mb-2 tracking-wide text-white">¡Reserva Creada!</h4>
                  <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
                    La reserva se ha registrado de forma manual con éxito en el sistema.
                  </p>

                  <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 mb-6 text-left space-y-3">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Código</span>
                      <span className={`text-sm font-mono font-bold ${textGoldClass}`}>{newBookingId}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Cliente</span>
                      <span className="text-sm font-semibold text-white">{clientName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Ritual</span>
                      <span className="text-sm font-semibold text-white">{selectedServiceObj?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Profesional</span>
                      <span className="text-sm font-semibold text-white">{selectedSpecialistObj?.name || 'Cualquiera'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Fecha y Hora</span>
                      <span className="text-sm font-semibold text-white">{formatDateToDMY(date)} a las {customTime || time}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Canal / Estado</span>
                      <span className="font-semibold text-white">{channel} ({status})</span>
                    </div>
                    {appliedGiftCard && (
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Gift Card Usada</span>
                        <span className="font-mono text-emerald-400 font-semibold">{appliedGiftCard.code}</span>
                      </div>
                    )}
                    {appliedGiftCard && (
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Descuento</span>
                        <span className="text-emerald-400 font-semibold">-${discountAmount.toLocaleString('es-CL')} CLP</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1">
                      <span className="text-text-secondary uppercase tracking-widest text-[9px] font-semibold">Monto Pagado</span>
                      <span className="text-white font-bold">{finalPriceStr} CLP</span>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className={`px-10 py-3 rounded-full border border-white/10 text-white text-xs uppercase tracking-widest hover:${bgThemeClass} hover:text-black transition-all duration-300 font-semibold cursor-pointer shadow-lg`}
                  >
                    Cerrar
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ManualBookingModal;