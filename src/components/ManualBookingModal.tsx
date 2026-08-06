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
  MessageCircle,
  DollarSign,
  Search
} from 'lucide-react';

const Instagram = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { useBookingStore } from '@/store/useBookingStore';
import { useGiftCardStore } from '@/store/useGiftCardStore';
import { useServicesStore } from '@/store/useServicesStore';
import { useScheduleStore, parseDurationToMinutes } from '@/store/useScheduleStore';
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
  currentUser?: any | null;
}

export function ManualBookingModal({ 
  isOpen, 
  onClose, 
  defaultCategory = 'barberia', 
  defaultSpecialistId, 
  defaultDate, 
  defaultTime, 
  onBookingCreated,
  currentUser
}: ManualBookingModalProps) {
  const { clients, bookings, addBooking } = useBookingStore();
  const { servicesData } = useServicesStore();
  const { workShifts } = useScheduleStore();

  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  // Form states
  const [clientName, setClientName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('+56');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const clientPhone = `${selectedCountry} ${phoneDigits}`;
  const [clientEmail, setClientEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [category, setCategory] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  const [serviceId, setServiceId] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [channel, setChannel] = useState<'Web' | 'WhatsApp' | 'Presencial' | 'Instagram'>('Presencial');
  const [status, setStatus] = useState<'confirmado' | 'pendiente'>('confirmado');

  // Availability Bypass states
  const [forceBooking, setForceBooking] = useState(false);

  // Client suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState<typeof clients>([]);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [phoneSuggestions, setPhoneSuggestions] = useState<Array<{ name: string; email: string; phone: string }>>([]);
  const nameInputRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Dropdowns visual states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  
  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newBookingId, setNewBookingId] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Gift Card states
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<any | null>(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [giftCardSuccess, setGiftCardSuccess] = useState('');

  const [timeSkew, setTimeSkew] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const syncTime = async () => {
        try {
          const start = Date.now();
          const res = await fetch('/api/time');
          const data = await res.json();
          const latency = (Date.now() - start) / 2;
          const skew = (data.serverTime + latency) - Date.now();
          setTimeSkew(skew);
        } catch (err) {
          console.error('Error syncing time in modal:', err);
        }
      };
      syncTime();
    }
  }, [isOpen]);

  // Set default form values when modal opens or defaults change
  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      setClientName('');
      setPhoneDigits('');
      setClientEmail('');
      setNameError(null);
      setPhoneError(null);
      setEmailError(null);
      setServiceError(null);
      setDateError(null);
      setTimeError(null);
      setGiftCardCode('');
      setAppliedGiftCard(null);
      setGiftCardError('');
      setGiftCardSuccess('');
      setForceBooking(false);
      if (currentUser && currentUser.profileType !== 'admin') {
        setSpecialistId(currentUser.id);
      } else if (defaultSpecialistId) {
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
        setTime(defaultTime);

        // Auto forceBooking if slot is outside shift
        if (defaultSpecialistId && defaultDate) {
          const specialistShifts = workShifts[defaultSpecialistId] || [];
          let dayOfWeek = 1;
          try {
            const [y, m, d] = defaultDate.split('-').map(Number);
            dayOfWeek = new Date(y, m - 1, d).getDay();
          } catch (e) {
            console.error(e);
          }
          const dayShift = specialistShifts.find((s) => s.dayOfWeek === dayOfWeek);
          if (!dayShift || !dayShift.isActive) {
            setForceBooking(true);
          } else {
            const localTimeToMinutes = (tStr: string) => {
              const [h, min] = tStr.split(':').map(Number);
              return h * 60 + (min || 0);
            };
            const slotStart = localTimeToMinutes(defaultTime);
            const slotEnd = slotStart + 30;
            const shiftStart = localTimeToMinutes(dayShift.startTime);
            const shiftEnd = localTimeToMinutes(dayShift.endTime);
            let hasBreakConflict = false;
            if (dayShift.hasBreak) {
              const breakStart = localTimeToMinutes(dayShift.breakStartTime);
              const breakEnd = localTimeToMinutes(dayShift.breakEndTime);
              if (slotStart < breakEnd && slotEnd > breakStart) {
                hasBreakConflict = true;
              }
            }
            if (slotStart < shiftStart || slotEnd > shiftEnd || hasBreakConflict) {
              setForceBooking(true);
            }
          }
        }
      } else {
        setTime('');
      }
    }
  }, [isOpen, defaultCategory, defaultSpecialistId, defaultDate, defaultTime, workShifts, currentUser]);

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
      if (phoneInputRef.current && !phoneInputRef.current.contains(event.target as Node)) {
        setShowPhoneSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Phone number autocomplete suggestions list generator
  useEffect(() => {
    if (phoneDigits.length >= 3) {
      const cleanPhoneQuery = phoneDigits.replace(/\D/g, '');

      // 1. Search in clients store
      const matchedFromClients = clients
        .filter(c => {
          const cleanDb = c.phone.replace(/\D/g, '');
          return cleanDb.includes(cleanPhoneQuery);
        })
        .map(c => ({ name: c.name, email: c.email || '', phone: c.phone }));

      // 2. Search in historical bookings
      const matchedFromBookings: Array<{ name: string; email: string; phone: string }> = [];
      (bookings || []).forEach(b => {
        if (b.clientPhone) {
          const cleanBPhone = b.clientPhone.replace(/\D/g, '');
          if (cleanBPhone.includes(cleanPhoneQuery)) {
            const alreadyInClients = matchedFromClients.some(c => c.name.toLowerCase() === b.clientName.toLowerCase());
            const alreadyInBookings = matchedFromBookings.some(mb => mb.name.toLowerCase() === b.clientName.toLowerCase());
            if (!alreadyInClients && !alreadyInBookings) {
              matchedFromBookings.push({
                name: b.clientName,
                email: b.clientEmail || '',
                phone: b.clientPhone
              });
            }
          }
        }
      });

      const combined = [...matchedFromClients, ...matchedFromBookings];
      setPhoneSuggestions(combined);
      setShowPhoneSuggestions(combined.length > 0);

      // Auto-fill single match if exactly 9 digits entered and 1 exact match
      if (phoneDigits.length === 9 && combined.length === 1) {
        setClientName(combined[0].name);
        if (combined[0].email) setClientEmail(combined[0].email);
        setPhoneError(null);
      }
    } else {
      setShowPhoneSuggestions(false);
      setPhoneSuggestions([]);
    }
  }, [phoneDigits, clients, bookings]);

  const handleCategoryChange = (cat: 'barberia' | 'peluqueria' | 'terapias') => {
    setCategory(cat);
    setServiceId('');
    setSpecialistId('');
    setTime('');
    setServiceSearch('');
  };

  const parsePhoneToPrefixAndDigits = (phoneStr: string) => {
    if (!phoneStr) return { prefix: '+56', digits: '' };
    
    // Clean all whitespace
    const clean = phoneStr.replace(/\s+/g, '');
    const digitsOnly = clean.replace(/\D/g, '');

    // Known country codes supported in dropdown (without plus sign)
    const knownPrefixes = ['56', '54', '51', '57', '52', '598', '34', '1'];

    // 1. Check for explicit +<prefix> format
    for (const pref of knownPrefixes) {
      if (clean.startsWith(`+${pref}`)) {
        const remaining = clean.slice(pref.length + 1).replace(/\D/g, '').slice(-9);
        return { prefix: `+${pref}`, digits: remaining };
      }
    }

    // 2. Check for <prefix> at start of digits (e.g., 56953332492)
    for (const pref of knownPrefixes) {
      if (digitsOnly.startsWith(pref) && digitsOnly.length > 9) {
        const remaining = digitsOnly.slice(pref.length).slice(-9);
        return { prefix: `+${pref}`, digits: remaining };
      }
    }

    // 3. Fallback: return +56 with the last 9 digits
    const remaining = digitsOnly.slice(-9);
    return { prefix: '+56', digits: remaining };
  };

  const handlePhoneDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.substring(0, 9);
    setPhoneDigits(limited);
    
    if (limited.length > 0 && limited.length < 9) {
      setPhoneError('El número de WhatsApp debe tener exactamente 9 números.');
    } else if (limited.length === 9) {
      setPhoneError(null);
    } else {
      setPhoneError(null);
    }
  };

  const handleSelectPhoneClient = (client: { name: string; email: string; phone?: string }) => {
    setClientName(client.name);
    setClientEmail(client.email || '');
    if (client.phone) {
      const { prefix, digits } = parsePhoneToPrefixAndDigits(client.phone);
      setSelectedCountry(prefix);
      setPhoneDigits(digits);
    }
    setPhoneError(null);
    setShowPhoneSuggestions(false);
  };

  const handleClientSelect = (client: typeof clients[0]) => {
    setClientName(client.name);
    const { prefix, digits } = parsePhoneToPrefixAndDigits(client.phone);
    setSelectedCountry(prefix);
    setPhoneDigits(digits);
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
  const rawServicesList = (servicesData[category]?.services || []).filter(s => s.isActive !== false);
  const rawSpecialistsList = (() => {
    const list = servicesData[category]?.specialists || [];
    if (currentUser && currentUser.profileType !== 'admin') {
      return list.filter(sp => sp.id === currentUser.id || sp.email.toLowerCase() === currentUser.email.toLowerCase());
    }
    return list;
  })();

  const selectedServiceObj = rawServicesList.find(s => s.id === serviceId);
  const selectedSpecialistObj = rawSpecialistsList.find(sp => sp.id === specialistId);

  // Filtered lists to prevent mismatch errors
  const servicesList = specialistId 
    ? rawServicesList.filter(s => s.specialistIds?.includes(specialistId))
    : rawServicesList;

  const filteredServicesList = servicesList.filter(srv => {
    if (!serviceSearch.trim()) return true;
    const query = serviceSearch.toLowerCase();
    return srv.name.toLowerCase().includes(query) || (srv.description && srv.description.toLowerCase().includes(query));
  });

  const specialistsList = serviceId
    ? rawSpecialistsList.filter(sp => selectedServiceObj?.specialistIds?.includes(sp.id))
    : rawSpecialistsList;

  const getFormattedDate = (daysOffset = 0) => {
    const d = new Date(Date.now() + timeSkew);
    d.setDate(d.getDate() + daysOffset);
    // Use local date components to avoid UTC offset shifting the day (e.g. in Chile UTC-3/-4)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Availability checking
  const isSpecialistAvailable = useScheduleStore(state => state.isSpecialistAvailable);

  const checkTimeSlotAvailability = (slotTime: string): { available: boolean; reason?: string } => {
    if (!date) return { available: true };
    
    // Check if slot is in the past
    const isPast = (() => {
      const today = new Date(Date.now() + timeSkew);
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
      return (slotMins + 30) < currentMins;
    })();

    if (isPast) {
      return { available: false, reason: 'El horario ya pasó' };
    }
    
    const duration = selectedServiceObj 
      ? (typeof selectedServiceObj.duration === 'number' ? selectedServiceObj.duration : parseDurationToMinutes(selectedServiceObj.duration)) 
      : 60;

    const checkAvailabilityForSpec = (spId: string) => {
      return isSpecialistAvailable(spId, date, slotTime, duration, category);
    };

    if (specialistId) {
      return checkAvailabilityForSpec(specialistId);
    }
    if (specialistsList.length === 0) return { available: true };
    
    // Check if at least one specialist is available
    const availableSpecs = specialistsList.filter(s => checkAvailabilityForSpec(s.id).available);
    if (availableSpecs.length > 0) {
      return { available: true };
    }
    return { available: false, reason: 'No hay profesionales disponibles' };
  };

  // Reset forceBooking when booking parameters change
  useEffect(() => {
    setForceBooking(false);
  }, [specialistId, date, time]);

  const originalPriceNumber = selectedServiceObj 
    ? (typeof selectedServiceObj.price === 'number' ? selectedServiceObj.price : parsePrice(selectedServiceObj.price)) 
    : 0;
  
  // Calculate discount & remaining balance
  const discountAmount = appliedGiftCard 
    ? Math.min(originalPriceNumber, appliedGiftCard.remainingBalance)
    : 0;
  
  const finalPriceNumber = originalPriceNumber - discountAmount;
  const finalPriceStr = `$${finalPriceNumber.toLocaleString('es-CL')}`;

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) {
      setGiftCardError('Por favor ingresa un código.');
      return;
    }
    const result = await useGiftCardStore.getState().validateGiftCard(giftCardCode);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } else if (phoneDigits.trim().length !== 9) {
      setPhoneError('El número de WhatsApp debe tener exactamente 9 números.');
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

    if (!serviceId) {
      setServiceError('Debes seleccionar un ritual o servicio.');
      hasError = true;
    } else {
      setServiceError(null);
    }

    if (!date) {
      setDateError('La fecha de cita es requerida.');
      hasError = true;
    } else {
      setDateError(null);
    }

    const finalTime = time;
    if (!finalTime) {
      setTimeError('La hora de cita es requerida.');
      hasError = true;
    } else {
      setTimeError(null);
    }

    if (hasError) {
      if (formContainerRef.current) {
        formContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Validate availability
    const availability = checkTimeSlotAvailability(finalTime);
    if (!availability.available && !forceBooking) {
      setGiftCardError(`No se puede guardar: ${availability.reason}. Marca "Forzar agendamiento" para ignorar.`);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Auto-asignar especialista real si no fue seleccionado manualmente
      const resolvedSpecialistName = (() => {
        if (selectedSpecialistObj?.name) return selectedSpecialistObj.name;
        // Buscar especialistas disponibles para este bloque horario
        const duration = selectedServiceObj
          ? (typeof selectedServiceObj.duration === 'number' ? selectedServiceObj.duration : parseDurationToMinutes(selectedServiceObj.duration))
          : 60;
        const availableSpecs = specialistsList.filter(s =>
          isSpecialistAvailable(s.id, date, finalTime, duration, category).available
        );
        if (availableSpecs.length > 0) {
          // Balancear carga: asignar al que tenga menos reservas en el día
          const bookingsOnDate = useBookingStore.getState().bookings.filter(b => b.date === date);
          const getBookingCount = (specName: string) =>
            bookingsOnDate.filter(b => b.specialistName.trim().toLowerCase() === specName.trim().toLowerCase()).length;
          availableSpecs.sort((a, b) => getBookingCount(a.name) - getBookingCount(b.name));
          return availableSpecs[0].name;
        }
        // Último recurso: primer especialista de la lista (no dejar "Cualquiera")
        return specialistsList[0]?.name || 'Sin Asignar';
      })();

      const code = await addBooking({
        clientName,
        clientPhone,
        clientEmail,
        category,
        serviceName: selectedServiceObj?.name || 'Servicio Personalizado',
        price: finalPriceStr,
        specialistName: resolvedSpecialistName,
        date,
        time: finalTime,
        channel,
        status,
        giftCardUsed: appliedGiftCard ? appliedGiftCard.code : undefined
      });

      // Deduct balance from Gift Card if applied
      if (appliedGiftCard && discountAmount > 0) {
        await useGiftCardStore.getState().redeemGiftCard(appliedGiftCard.code, discountAmount);
      }

      setNewBookingId(code);
      setIsSuccess(true);
      if (onBookingCreated) {
        onBookingCreated(code);
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setSubmissionError(err.message || 'Error al crear la reserva. Por favor intenta de nuevo.');
      if (formContainerRef.current) {
        formContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setClientName('');
    setSelectedCountry('+56');
    setPhoneDigits('');
    setClientEmail('');
    setPhoneError(null);
    setServiceId('');
    setSpecialistId('');
    setDate('');
    setTime('');
    setChannel('Presencial');
    setStatus('confirmado');
    setSubmissionError(null);
    setIsSuccess(false);
    setNewBookingId('');
    setIsCategoryOpen(false);
    setIsServiceOpen(false);
    setGiftCardCode('');
    setAppliedGiftCard(null);
    setGiftCardError('');
    setGiftCardSuccess('');
    setForceBooking(false);
    setServiceSearch('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 300);
  };

  // Color styling helpers matching business themes
  const isTerapias = category === 'terapias';
  const themeGold = '#C5A059';
  const textGoldClass = 'text-gold';
  const borderFocusClass = 'focus:border-gold/50';
  const bgThemeClass = 'bg-gold';
  const shadowThemeClass = 'shadow-gold/10';

  const selectedTime = time;
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
                            unoptimized
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
                      <span className="text-white font-medium">{time || '--:--'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canal:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        {channel === 'Presencial' && <Smartphone size={10} className="text-amber-400" />}
                        {channel === 'WhatsApp' && <MessageSquare size={10} className="text-emerald-400" />}
                        {channel === 'Web' && <Globe size={10} className="text-blue-400" />}
                        {channel === 'Instagram' && <Instagram size={10} className="text-pink-400" />}
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
            <div ref={formContainerRef} className="col-span-1 md:col-span-8 flex flex-col justify-between p-8 bg-[#020202] overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
              {!isSuccess ? (
                <div className="flex-grow flex flex-col justify-center max-w-xl w-full mx-auto space-y-6">
                  <div>
                    <h3 className={`font-serif text-2xl ${textGoldClass} tracking-wide`}>Nueva Reserva Manual</h3>
                    <p className="text-[10px] text-text-secondary tracking-widest uppercase mt-1">
                      Registrar reserva en el sistema de manera interna
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-6 text-left">
                    
                    {/* SECTION 1: Client Information */}
                    <div className="space-y-4">
                      <span className="block text-[9px] uppercase tracking-[0.25em] text-text-secondary font-bold border-b border-white/5 pb-1">
                        Datos del Cliente
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* WhatsApp (WhatsApp-only) */}
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            WhatsApp *
                          </label>
                          <div className="relative flex items-center gap-2">
                            {/* Custom Select Dropdown */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                className="flex items-center space-x-1.5 bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer select-none h-full"
                              >
                                <span className="text-base">
                                  {
                                    selectedCountry === '+56' ? '🇨🇱' :
                                    selectedCountry === '+54' ? '🇦🇷' :
                                    selectedCountry === '+51' ? '🇵🇪' :
                                    selectedCountry === '+57' ? '🇨🇴' :
                                    selectedCountry === '+598' ? '🇺🇾' :
                                    selectedCountry === '+52' ? '🇲🇽' :
                                    selectedCountry === '+34' ? '🇪🇸' : '🇺🇸'
                                  }
                                </span>
                                <span className="font-mono text-white/90">{selectedCountry}</span>
                                <ChevronDown size={10} className="text-text-secondary ml-1" />
                              </button>
                              
                              <AnimatePresence>
                                {isCountryDropdownOpen && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)} />
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="absolute left-0 mt-1.5 w-40 bg-black border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 max-h-56 overflow-y-auto"
                                    >
                                      {[
                                        { code: '+56', label: 'Chile', flag: '🇨🇱' },
                                        { code: '+54', label: 'Argentina', flag: '🇦🇷' },
                                        { code: '+51', label: 'Perú', flag: '🇵🇪' },
                                        { code: '+57', label: 'Colombia', flag: '🇨🇴' },
                                        { code: '+52', label: 'México', flag: '🇲🇽' },
                                        { code: '+598', label: 'Uruguay', flag: '🇺🇾' },
                                        { code: '+1', label: 'USA', flag: '🇺🇸' },
                                        { code: '+34', label: 'España', flag: '🇪🇸' }
                                      ].map((item) => (
                                        <button
                                          key={item.code}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCountry(item.code);
                                            setIsCountryDropdownOpen(false);
                                          }}
                                          className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors cursor-pointer ${
                                            selectedCountry === item.code ? 'text-gold bg-white/[0.02]' : 'text-white/80'
                                          }`}
                                        >
                                          <span className="text-base">{item.flag}</span>
                                          <span className="font-mono font-medium">{item.code}</span>
                                          <span className="text-[10px] text-text-secondary truncate">{item.label}</span>
                                        </button>
                                      ))}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Phone digits input with suggestions */}
                            <div className="relative flex-grow flex items-center" ref={phoneInputRef}>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                                placeholder="Ingrese número"
                                value={phoneDigits}
                                onChange={handlePhoneDigitsChange}
                                onFocus={() => {
                                  if (phoneSuggestions.length > 0) setShowPhoneSuggestions(true);
                                }}
                                className={`w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-white/30 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none transition-colors ${borderFocusClass} ${phoneError ? 'border-red-500/50 focus:border-red-500' : ''}`}
                              />

                              {/* Client suggestions dropdown for Phone input */}
                              <AnimatePresence>
                                {showPhoneSuggestions && phoneSuggestions.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-[#D7AF68]/40 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-white/5"
                                  >
                                    <div className="px-3.5 py-1.5 bg-[#D7AF68]/10 text-[9px] uppercase tracking-wider font-bold text-[#D7AF68] flex items-center justify-between sticky top-0 backdrop-blur-md">
                                      <span>Clientes asociados ({phoneSuggestions.length})</span>
                                      <User size={11} />
                                    </div>
                                    {phoneSuggestions.map((client, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectPhoneClient(client)}
                                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#D7AF68]/15 transition-colors flex items-center justify-between group cursor-pointer"
                                      >
                                        <div className="min-w-0 pr-2">
                                          <span className="block text-xs font-semibold text-white group-hover:text-[#D7AF68] transition-colors truncate">
                                            {client.name}
                                          </span>
                                          {client.email && (
                                            <span className="block text-[10px] text-text-secondary truncate">
                                              {client.email}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[9px] text-[#D7AF68] bg-[#D7AF68]/10 border border-[#D7AF68]/30 px-2 py-1 rounded-md font-mono shrink-0 font-semibold group-hover:bg-[#D7AF68] group-hover:text-black transition-all">
                                          Seleccionar
                                        </span>
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          {phoneError && (
                            <p className="text-[10px] text-red-400 mt-1 font-light text-left">{phoneError}</p>
                          )}
                        </div>

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
                          {nameError && (
                            <p className="text-[10px] text-red-400 mt-1 font-light text-left">{nameError}</p>
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
                            onChange={(e) => {
                              setClientEmail(e.target.value);
                              if (emailError) setEmailError(null);
                            }}
                            className={`w-full bg-[#0a0a0a] border hover:border-white/20 focus:border-white/30 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors ${borderFocusClass} ${
                              emailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                            }`}
                          />
                        </div>
                        {emailError && (
                          <p className="text-[10px] text-red-400 mt-1 font-light text-left">{emailError}</p>
                        )}
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
                                  className="absolute left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 flex flex-col max-h-64"
                                >
                                  {/* Sticky Search bar inside dropdown */}
                                  <div className="p-2 border-b border-white/5 bg-black/40 flex items-center gap-2 sticky top-0 z-10">
                                    <Search size={12} className="text-text-secondary ml-1" />
                                    <input
                                      type="text"
                                      placeholder="Buscar ritual o servicio..."
                                      value={serviceSearch}
                                      onChange={(e) => setServiceSearch(e.target.value)}
                                      className="w-full bg-transparent border-0 p-1 text-xs text-white focus:outline-none focus:ring-0 placeholder:text-white/35"
                                    />
                                    {serviceSearch && (
                                      <button
                                        type="button"
                                        onClick={() => setServiceSearch('')}
                                        className="p-1 rounded-full text-text-secondary hover:text-white transition-colors"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                  </div>

                                  <div className="overflow-y-auto max-h-48 divide-y divide-white/5">
                                    {filteredServicesList.length === 0 ? (
                                      <div className="p-3 text-[11px] text-white/40 text-center italic">
                                        No se encontraron servicios
                                      </div>
                                    ) : (
                                      filteredServicesList.map((srv) => {
                                        const isSel = serviceId === srv.id;
                                        return (
                                          <button
                                            key={srv.id}
                                            type="button"
                                            onClick={() => {
                                              setServiceId(srv.id);
                                              setIsServiceOpen(false);
                                              setServiceSearch('');
                                              if (specialistId && !srv.specialistIds?.includes(specialistId)) {
                                                setSpecialistId('');
                                              }
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/5 flex justify-between items-center ${
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
                                      })
                                    )}
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                          {serviceError && (
                            <p className="text-[10px] text-red-400 mt-1 font-light text-left">{serviceError}</p>
                          )}
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
                        {(!currentUser || currentUser.profileType === 'admin') && (
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
                        )}

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
                                    unoptimized
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
                              className={`px-3 border text-[10px] uppercase tracking-wider transition-colors cursor-pointer rounded-xl font-bold ${
                                date === getFormattedDate(0)
                                  ? category === 'barberia'
                                    ? 'border-gold bg-gold/15 text-gold'
                                    : category === 'peluqueria'
                                    ? 'border-[#CD7F32] bg-[#CD7F32]/15 text-[#CD7F32]'
                                    : 'border-[#E2E0D8] bg-[#E2E0D8]/15 text-[#E2E0D8]'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                              }`}
                            >
                              Hoy
                            </button>
                            <button
                              type="button"
                              onClick={() => setDate(getFormattedDate(1))}
                              className={`px-3 border text-[10px] uppercase tracking-wider transition-colors cursor-pointer rounded-xl font-bold ${
                                date === getFormattedDate(1)
                                  ? category === 'barberia'
                                    ? 'border-gold bg-gold/15 text-gold'
                                    : category === 'peluqueria'
                                    ? 'border-[#CD7F32] bg-[#CD7F32]/15 text-[#CD7F32]'
                                    : 'border-[#E2E0D8] bg-[#E2E0D8]/15 text-[#E2E0D8]'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                              }`}
                            >
                              Mañ.
                            </button>
                          </div>
                          {dateError && (
                            <p className="text-[10px] text-red-400 mt-1 font-light text-left">{dateError}</p>
                          )}
                        </div>

                        {/* Time Slots Grid + Custom time option */}
                        <div>
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">
                            Hora (Elegir o Customizar) *
                          </label>
                          
                          <div className="grid grid-cols-4 gap-1.5 mb-2">
                            {(category === 'barberia'
                              ? [
                                  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
                                  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
                                  '19:00', '20:00'
                                ]
                              : [
                                  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
                                  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
                                  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
                                  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
                                  '19:00', '19:30', '20:00'
                                ]
                            ).map((slot) => {
                              const isSel = time === slot;
                              const availability = checkTimeSlotAvailability(slot);
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  title={availability.reason}
                                  onClick={() => {
                                    setTime(slot);
                                  }}
                                  className={`py-1.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer ${
                                    !availability.available
                                      ? isSel
                                        ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                        : 'border-red-500/10 bg-red-500/5 text-white/30 hover:border-red-500/20'
                                      : isSel
                                        ? `border-gold bg-gold/15 text-gold shadow-sm ${shadowThemeClass}`
                                        : 'border-white/5 bg-white/[0.02] text-white/70 hover:text-white hover:border-white/20'
                                  }`}
                                  style={{
                                    borderColor: !availability.available ? undefined : (isSel ? themeGold : 'rgba(255,255,255,0.05)'),
                                    color: !availability.available ? undefined : (isSel ? themeGold : 'rgba(255,255,255,0.7)')
                                  }}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                          {timeError && (
                            <p className="text-[10px] text-red-400 mt-1 font-light text-left">{timeError}</p>
                          )}


                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: Reservation Admin Settings - Removed to be placed elsewhere */}

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
                      {submissionError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-left leading-relaxed">
                          ⚠️ {submissionError}
                        </div>
                      )}
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
                      <span className="text-sm font-semibold text-white">{formatDateToDMY(date)} a las {time}</span>
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