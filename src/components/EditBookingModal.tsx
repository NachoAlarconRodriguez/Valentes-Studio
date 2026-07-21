'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Check, 
  Search, 
  Smartphone, 
  Plus, 
  Trash2, 
  User, 
  Mail, 
  DollarSign, 
  Sparkles, 
  ChevronDown 
} from 'lucide-react';
import { useBookingStore, Booking } from '@/store/useBookingStore';
import { useServicesStore } from '@/store/useServicesStore';
import { useScheduleStore, parseDurationToMinutes } from '@/store/useScheduleStore';
import Image from 'next/image';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onBookingUpdated?: () => void;
}

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

export function EditBookingModal({ isOpen, onClose, booking, onBookingUpdated }: EditBookingModalProps) {
  const { updateBookingDetails } = useBookingStore();
  const { servicesData } = useServicesStore();
  const { isSpecialistAvailable, workShifts } = useScheduleStore();

  // Form states
  const [clientName, setClientName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('+56');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  
  const [category, setCategory] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [customPrice, setCustomPrice] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<Booking['status']>('confirmado');

  const [serviceSearch, setServiceSearch] = useState('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [forceBooking, setForceBooking] = useState(false);
  
  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [specialistError, setSpecialistError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const [isSpecialistDropdownOpen, setIsSpecialistDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const specialistDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Parse phone from format "+56 998887777" or "+56998887777"
  const parsePhone = (phoneStr: string) => {
    const clean = phoneStr.replace(/\s+/g, '');
    const match = clean.match(/^(\+56|\+54|\+51|\+1)(.*)$/);
    if (match) {
      return { prefix: match[1], digits: match[2].replace(/\D/g, '').substring(0, 9) };
    }
    return { prefix: '+56', digits: phoneStr.replace(/\D/g, '').substring(0, 9) };
  };

  // Helper to parse price string to number
  const parsePrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  // Lists based on category
  const rawServicesList = (servicesData[category]?.services || []).filter(s => s.isActive !== false);
  const rawSpecialistsList = servicesData[category]?.specialists || [];

  const selectedSpecialistObj = rawSpecialistsList.find(sp => sp.id === specialistId);

  // Filtered services in dropdown to avoid showing already selected ones
  const availableServices = rawServicesList.filter(s => 
    !selectedServices.some(sel => sel.id === s.id)
  );

  const filteredServicesDropdown = availableServices.filter(s => {
    if (!serviceSearch.trim()) return true;
    return s.name.toLowerCase().includes(serviceSearch.toLowerCase());
  });

  // Load booking details on open
  useEffect(() => {
    if (isOpen && booking) {
      setClientName(booking.clientName);
      const { prefix, digits } = parsePhone(booking.clientPhone);
      setSelectedCountry(prefix);
      setPhoneDigits(digits);
      setClientEmail(booking.clientEmail || '');
      setCategory(booking.category);
      setSpecialistId('');
      setDate(booking.date);
      setTime(booking.time);
      setStatus(booking.status);
      setForceBooking(false);
      setIsSpecialistDropdownOpen(false);
      setIsStatusDropdownOpen(false);

      // Parse services from concatenated string
      const catalogServices = servicesData[booking.category]?.services || [];
      const parsedServices: any[] = [];
      
      // Try to find exact match first (e.g. "Corte de cabello + Retoque de barba" as a single service)
      const exactMatch = catalogServices.find(s => s.name.trim().toLowerCase() === booking.serviceName.trim().toLowerCase());
      
      if (exactMatch) {
        parsedServices.push(exactMatch);
      } else {
        // If not exact match, split by '+' to parse combined services
        const serviceParts = booking.serviceName.split('+').map(s => s.trim().toLowerCase());
        serviceParts.forEach(part => {
          const found = catalogServices.find(s => s.name.trim().toLowerCase() === part);
          if (found) {
            parsedServices.push(found);
          } else {
            // Create a dummy service object if it was customized or deleted
            parsedServices.push({
              id: `custom_${Math.random()}`,
              name: part,
              price: parsedServices.length === 0 ? booking.price : '$0',
              duration: '30 min'
            });
          }
        });
      }

      setSelectedServices(parsedServices);
      setCustomPrice(booking.price);

      // Try to find specialist ID by name match
      const catalogSpecialists = servicesData[booking.category]?.specialists || [];
      const foundSpec = catalogSpecialists.find(s => s.name.trim().toLowerCase() === booking.specialistName.trim().toLowerCase());
      if (foundSpec) {
        setSpecialistId(foundSpec.id);
      }

      // Reset errors
      setNameError(null);
      setPhoneError(null);
      setEmailError(null);
      setSpecialistError(null);
      setDateError(null);
      setTimeError(null);
      setErrorMsg(null);
    }
  }, [isOpen, booking, servicesData]);

  // Click outside service/specialist/status dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
      if (specialistDropdownRef.current && !specialistDropdownRef.current.contains(event.target as Node)) {
        setIsSpecialistDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (cat: 'barberia' | 'peluqueria' | 'terapias') => {
    setCategory(cat);
    setSelectedServices([]);
    setCustomPrice('$0');
    setSpecialistId('');
    setTime('');
    setServiceSearch('');
  };

  const handleAddService = (srv: any) => {
    const newServices = [...selectedServices, srv];
    setSelectedServices(newServices);
    
    // Sum prices
    const sum = newServices.reduce((acc, curr) => {
      const priceNum = typeof curr.price === 'number' ? curr.price : parsePrice(curr.price);
      return acc + priceNum;
    }, 0);

    setCustomPrice(`$${sum.toLocaleString('es-CL')}`);
    setIsServiceDropdownOpen(false);
    setServiceSearch('');
  };

  const handleRemoveService = (id: string) => {
    const newServices = selectedServices.filter(s => s.id !== id);
    setSelectedServices(newServices);

    const sum = newServices.reduce((acc, curr) => {
      const priceNum = typeof curr.price === 'number' ? curr.price : parsePrice(curr.price);
      return acc + priceNum;
    }, 0);

    setCustomPrice(`$${sum.toLocaleString('es-CL')}`);
  };

  // Check availability
  const checkTimeSlotAvailability = (slotTime: string): { available: boolean; reason?: string } => {
    if (!date || !specialistId) return { available: true };

    const totalDuration = selectedServices.reduce((acc, curr) => {
      const durationMins = typeof curr.duration === 'number' 
        ? curr.duration 
        : parseDurationToMinutes(curr.duration);
      return acc + durationMins;
    }, 0) || 30;

    return isSpecialistAvailable(specialistId, date, slotTime, totalDuration, category);
  };

  const getFormattedDate = (daysOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    let hasError = false;

    if (!clientName.trim()) {
      setNameError('El nombre completo es requerido.');
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!phoneDigits.trim()) {
      setPhoneError('El número de WhatsApp es requerido.');
      hasError = true;
    } else if (phoneDigits.length !== 9) {
      setPhoneError('El número de WhatsApp debe tener exactamente 9 dígitos.');
      hasError = true;
    } else {
      setPhoneError(null);
    }

    if (clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      setEmailError('El correo electrónico no es válido.');
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (selectedServices.length === 0) {
      setErrorMsg('Debes seleccionar al menos un servicio.');
      return;
    }

    if (!specialistId) {
      setSpecialistError('Debes seleccionar un especialista.');
      hasError = true;
    } else {
      setSpecialistError(null);
    }

    if (!date) {
      setDateError('La fecha de la reserva es requerida.');
      hasError = true;
    } else {
      setDateError(null);
    }

    if (!time) {
      setTimeError('La hora de la reserva es requerida.');
      hasError = true;
    } else {
      setTimeError(null);
    }

    if (hasError) return;

    // Check availability unless forceBooking is checked or details didn't change
    const isSameSlot = booking.date === date && booking.time === time && booking.specialistName.trim().toLowerCase() === selectedSpecialistObj?.name.trim().toLowerCase();
    
    if (!isSameSlot && !forceBooking) {
      const availability = checkTimeSlotAvailability(time);
      if (!availability.available) {
        setErrorMsg(`Conflicto de disponibilidad: ${availability.reason}. Marca "Forzar" para omitir la advertencia.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const clientPhone = `${selectedCountry} ${phoneDigits}`;
    const concatenatedServiceName = selectedServices.map(s => s.name).join(' + ');

    try {
      await updateBookingDetails(booking.id, booking.clientPhone, {
        clientName,
        clientPhone,
        clientEmail,
        category,
        serviceName: concatenatedServiceName,
        price: customPrice,
        specialistName: selectedSpecialistObj?.name || booking.specialistName,
        date,
        time,
        status
      });

      if (onBookingUpdated) onBookingUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al guardar los cambios de la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTerapias = category === 'terapias';
  const themeGold = '#C5A059';
  const textGoldClass = 'text-gold';
  const borderFocusClass = 'focus:border-gold/50';
  const bgThemeClass = 'bg-gold';

  const currentAvailability = time ? checkTimeSlotAvailability(time) : { available: true };
  const isSameSlot = booking && booking.date === date && booking.time === time && booking.specialistName.trim().toLowerCase() === selectedSpecialistObj?.name.trim().toLowerCase();

  return (
    <AnimatePresence>
      {isOpen && booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-4xl bg-black/95 text-white rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:grid md:grid-cols-12 max-h-[90vh] md:max-h-[85vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer z-30"
              type="button"
            >
              <X size={16} />
            </button>

            {/* LEFT COLUMN: Overview */}
            <div className="hidden md:flex md:col-span-4 flex-col justify-between p-8 bg-gradient-to-b from-[#090909] to-[#040404] border-r border-white/5">
              <div className="space-y-6">
                <div>
                  <span className="text-[8px] uppercase tracking-[0.3em] text-text-secondary font-bold block mb-1">
                    Administración
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-white tracking-wide">
                    Editar Reserva
                  </h3>
                  <span className="text-[10px] font-mono text-gold mt-1 block">
                    ID: {booking.id}
                  </span>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest font-bold block text-text-secondary mb-1">
                      Servicio Actual
                    </span>
                    <p className="text-xs font-semibold text-white leading-snug">{booking.serviceName}</p>
                    <p className="text-[11px] text-gold mt-1">{booking.price} CLP</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest font-bold block text-text-secondary mb-1">
                      Especialista
                    </span>
                    <p className="text-xs font-semibold text-white">{booking.specialistName}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest font-bold block text-text-secondary mb-1">
                      Horario
                    </span>
                    <p className="text-xs font-semibold text-white">
                      {booking.date.split('-').reverse().join('/')} a las {booking.time} hrs
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-[10px] text-text-secondary leading-relaxed">
                  <p>💡 <strong>Edición Crítica:</strong> Modificar los datos del cliente aquí también cambiará su perfil global en el CRM.</p>
                </div>
              </div>

              <div className="text-[8px] text-text-secondary select-none tracking-widest uppercase opacity-40">
                Valentes Santuario
              </div>
            </div>

            {/* RIGHT COLUMN: Edit Form */}
            <div className="col-span-1 md:col-span-8 flex flex-col justify-between p-8 bg-[#070707] overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
              <div className="max-w-xl w-full mx-auto space-y-6">
                <div>
                  <h3 className={`font-serif text-xl ${textGoldClass} tracking-wide text-left`}>Editar Detalles</h3>
                  <p className="text-[9px] text-text-secondary tracking-widest uppercase mt-0.5 text-left">
                    Modificar la información guardada de la reserva
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6 text-left">
                  
                  {/* SECTION 1: Client Information */}
                  <div className="space-y-4">
                    <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                      Datos de Cliente
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
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
                            onChange={(e) => {
                              setClientName(e.target.value);
                              if (nameError) setNameError(null);
                            }}
                            className={`w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors ${borderFocusClass}`}
                          />
                        </div>
                        {nameError && (
                          <p className="text-[10px] text-red-400 mt-1 font-light">{nameError}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          WhatsApp *
                        </label>
                        <div className="relative flex items-center gap-2">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                              className="flex items-center space-x-1 bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none transition-colors cursor-pointer select-none"
                            >
                              <span>{selectedCountry === '+56' ? '🇨🇱' : selectedCountry === '+54' ? '🇦🇷' : selectedCountry === '+51' ? '🇵🇪' : '🇺🇸'}</span>
                              <span className="font-mono">{selectedCountry}</span>
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
                                    className="absolute left-0 mt-1 w-32 bg-black border border-white/10 rounded-xl shadow-2xl py-1 z-50"
                                  >
                                    {[
                                      { code: '+56', label: 'Chile', flag: '🇨🇱' },
                                      { code: '+54', label: 'Argentina', flag: '🇦🇷' },
                                      { code: '+51', label: 'Perú', flag: '🇵🇪' },
                                      { code: '+1', label: 'USA', flag: '🇺🇸' }
                                    ].map((item) => (
                                      <button
                                        key={item.code}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCountry(item.code);
                                          setIsCountryDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-left text-xs hover:bg-white/5 transition-colors"
                                      >
                                        <span>{item.flag}</span>
                                        <span className="font-mono">{item.code}</span>
                                      </button>
                                    ))}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="9 números"
                            value={phoneDigits}
                            onChange={(e) => {
                              const cleanVal = e.target.value.replace(/\D/g, '').substring(0, 9);
                              setPhoneDigits(cleanVal);
                              if (phoneError) setPhoneError(null);
                            }}
                            className="flex-grow bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold/40"
                          />
                        </div>
                        {phoneError && (
                          <p className="text-[10px] text-red-400 mt-1 font-light">{phoneError}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Correo Electrónico
                        </label>
                        <div className="relative flex items-center">
                          <Mail size={13} className="absolute left-3.5 text-text-secondary" />
                          <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={clientEmail}
                            onChange={(e) => {
                              setClientEmail(e.target.value);
                              if (emailError) setEmailError(null);
                            }}
                            className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-gold/40"
                          />
                        </div>
                        {emailError && (
                          <p className="text-[10px] text-red-400 mt-1 font-light">{emailError}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Rituals / Services Selection */}
                  <div className="space-y-4">
                    <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                      Rituales y Valor Cobrado
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Business Unit Category */}
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Unidad de Negocio
                        </label>
                        <div className="flex gap-2">
                          {[
                            { id: 'barberia', name: 'Barbería' },
                            { id: 'peluqueria', name: 'Peluquería' },
                            { id: 'terapias', name: 'Terapias' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleCategoryChange(opt.id as any)}
                              className={`flex-1 py-2 text-center rounded-xl border text-[10px] uppercase font-bold tracking-wider transition-colors ${
                                category === opt.id
                                  ? 'border-gold bg-gold/15 text-gold'
                                  : 'border-white/5 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/10'
                              }`}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add new services */}
                      <div className="relative" ref={serviceDropdownRef}>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Agregar Ritual al Agendamiento
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 text-xs text-left flex justify-between items-center transition-colors focus:outline-none"
                        >
                          <span className="text-white/50">-- Buscar en Catálogo --</span>
                          <Plus size={14} className="text-text-secondary" />
                        </button>
                        
                        <AnimatePresence>
                          {isServiceDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute left-0 right-0 mt-1 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 flex flex-col max-h-56"
                            >
                              <div className="p-2 border-b border-white/5 bg-black/40 flex items-center gap-2 sticky top-0 z-10">
                                <Search size={12} className="text-text-secondary ml-1" />
                                <input
                                  type="text"
                                  placeholder="Buscar ritual..."
                                  value={serviceSearch}
                                  onChange={(e) => setServiceSearch(e.target.value)}
                                  className="w-full bg-transparent border-0 p-1 text-xs text-white focus:outline-none focus:ring-0 placeholder:text-white/35"
                                />
                              </div>
                              <div className="overflow-y-auto max-h-40 divide-y divide-white/5">
                                {filteredServicesDropdown.length === 0 ? (
                                  <div className="p-3 text-[10px] text-white/40 text-center italic">
                                    No hay servicios disponibles
                                  </div>
                                ) : (
                                  filteredServicesDropdown.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => handleAddService(s)}
                                      className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors flex justify-between items-center text-white/80"
                                    >
                                      <span>{s.name}</span>
                                      <span className="text-gold font-mono">{typeof s.price === 'number' ? `$${s.price.toLocaleString('es-CL')}` : s.price}</span>
                                    </button>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Display Selected Services (Allow removal) */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold">
                          Rituales Seleccionados *
                        </label>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 divide-y divide-white/5 space-y-2">
                          {selectedServices.map((srv, idx) => (
                            <div key={srv.id} className="flex justify-between items-center text-xs py-1.5 first:pt-0 last:pb-0">
                              <div className="flex flex-col text-left">
                                <span className="font-semibold text-white">{srv.name}</span>
                                <span className="text-[9px] text-text-secondary">Duración: {srv.duration}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-white/80">{typeof srv.price === 'number' ? `$${srv.price.toLocaleString('es-CL')}` : srv.price}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveService(srv.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/5 rounded-lg"
                                  title="Quitar"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customizable Final Price */}
                      <div className="md:col-span-2">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Valor Cobrado Final ($CLP) *
                        </label>
                        <div className="relative flex items-center">
                          <DollarSign size={13} className="absolute left-3.5 text-text-secondary" />
                          <input
                            type="text"
                            placeholder="$13.000"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-gold/40 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Assignment & Time */}
                  <div className="space-y-4">
                    <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                      Asignación, Horario & Estado
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Specialist */}
                      <div className="relative" ref={specialistDropdownRef}>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Profesional Asignado *
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsSpecialistDropdownOpen(!isSpecialistDropdownOpen)}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.2 text-xs text-white focus:outline-none focus:border-gold/40 flex justify-between items-center transition-colors cursor-pointer select-none h-[38px]"
                        >
                          {selectedSpecialistObj ? (
                            <div className="flex items-center space-x-2.5">
                              {specialistPhotos[selectedSpecialistObj.id] ? (
                                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/10">
                                  <Image
                                    src={specialistPhotos[selectedSpecialistObj.id]}
                                    alt={selectedSpecialistObj.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold">
                                  {selectedSpecialistObj.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span>{selectedSpecialistObj.name} <span className="text-[10px] text-text-secondary">({selectedSpecialistObj.role})</span></span>
                            </div>
                          ) : (
                            <span className="text-white/50">-- Seleccionar Profesional --</span>
                          )}
                          <ChevronDown size={12} className="text-text-secondary" />
                        </button>

                        <AnimatePresence>
                          {isSpecialistDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30 divide-y divide-white/5"
                            >
                              {rawSpecialistsList.map((sp) => {
                                const photo = specialistPhotos[sp.id];
                                return (
                                  <button
                                    key={sp.id}
                                    type="button"
                                    onClick={() => {
                                      setSpecialistId(sp.id);
                                      setIsSpecialistDropdownOpen(false);
                                      if (specialistError) setSpecialistError(null);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left text-xs transition-colors hover:bg-white/5 ${
                                      specialistId === sp.id ? 'bg-white/[0.02] text-gold' : 'text-white/80'
                                    }`}
                                  >
                                    {photo ? (
                                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                        <Image
                                          src={photo}
                                          alt={sp.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {sp.name.substring(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="flex-grow">
                                      <div className="font-medium">{sp.name}</div>
                                      <div className="text-[9px] text-text-secondary">{sp.role}</div>
                                    </div>
                                    {specialistId === sp.id && <Check size={12} className="text-gold" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {specialistError && (
                          <p className="text-[10px] text-red-400 mt-1 font-light">{specialistError}</p>
                        )}
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Fecha Cita *
                        </label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => {
                            setDate(e.target.value);
                            if (dateError) setDateError(null);
                          }}
                          min={getFormattedDate(-15)}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/40"
                        />
                        {dateError && (
                          <p className="text-[10px] text-red-400 mt-1 font-light">{dateError}</p>
                        )}
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Hora Cita *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: 13:00"
                          value={time}
                          onChange={(e) => {
                            setTime(e.target.value);
                            if (timeError) setTimeError(null);
                          }}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/40 font-mono"
                        />
                        {timeError && (
                          <p className="text-[10px] text-red-400 mt-1 font-light">{timeError}</p>
                        )}
                      </div>

                      {/* Booking Status */}
                      <div className="relative" ref={statusDropdownRef}>
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                          Estado de Reserva
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-3.5 py-2.2 text-xs text-white focus:outline-none focus:border-gold/40 flex justify-between items-center transition-colors cursor-pointer select-none h-[38px]"
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              status === 'completado' || status === 'en_proceso'
                                ? 'bg-emerald-400'
                                : status === 'confirmado'
                                ? 'bg-blue-400'
                                : status === 'cancelado'
                                ? 'bg-red-400'
                                : 'bg-amber-400' // pendiente, no_llego
                            }`} />
                            <span>
                              {status === 'pendiente' && 'Pendiente'}
                              {status === 'confirmado' && 'Confirmado'}
                              {status === 'en_proceso' && 'En Proceso'}
                              {status === 'completado' && 'Pagado / Completado'}
                              {status === 'no_llego' && 'No Asistió'}
                              {status === 'cancelado' && 'Cancelado'}
                            </span>
                          </div>
                          <ChevronDown size={12} className="text-text-secondary" />
                        </button>

                        <AnimatePresence>
                          {isStatusDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30 divide-y divide-white/5"
                            >
                              {[
                                { val: 'pendiente', label: 'Pendiente', color: 'bg-amber-400' },
                                { val: 'confirmado', label: 'Confirmado', color: 'bg-blue-400' },
                                { val: 'en_proceso', label: 'En Proceso', color: 'bg-emerald-400' },
                                { val: 'completado', label: 'Pagado / Completado', color: 'bg-emerald-400' },
                                { val: 'no_llego', label: 'No Asistió', color: 'bg-amber-400' },
                                { val: 'cancelado', label: 'Cancelado', color: 'bg-red-400' }
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  type="button"
                                  onClick={() => {
                                    setStatus(opt.val as any);
                                    setIsStatusDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center space-x-2.5 px-4 py-2.5 text-left text-xs transition-colors hover:bg-white/5 ${
                                    status === opt.val ? 'bg-white/[0.02] text-gold' : 'text-white/80'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${opt.color}`} />
                                  <span className="flex-grow">{opt.label}</span>
                                  {status === opt.val && <Check size={12} className="text-gold" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: Time Slot Conflict Warning */}
                  {time && !isSameSlot && !currentAvailability.available && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex flex-col space-y-2 text-left">
                      <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1.5">
                        <span>⚠️ Conflictos detectados:</span>
                        <span>{currentAvailability.reason}</span>
                      </p>
                      <label className="flex items-center space-x-2.5 text-[11px] text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={forceBooking}
                          onChange={(e) => setForceBooking(e.target.checked)}
                          className="rounded border-white/20 bg-black/40 text-gold focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Forzar cambios (Bypass de disponibilidad del especialista)</span>
                      </label>
                    </div>
                  )}

                  {/* Actions & Submit */}
                  <div className="pt-4 space-y-3">
                    {errorMsg && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs leading-relaxed text-left">
                        ⚠️ {errorMsg}
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl border border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || (!!time && !isSameSlot && !currentAvailability.available && !forceBooking)}
                        className={`flex-grow py-3.5 rounded-xl text-black font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${bgThemeClass}`}
                      >
                        {isSubmitting ? (
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>Guardar Cambios</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
