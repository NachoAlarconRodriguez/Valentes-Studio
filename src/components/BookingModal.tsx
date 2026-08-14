'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Copy, Check, Search, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useServicesStore } from '@/store/useServicesStore';
import { useBookingStore } from '@/store/useBookingStore';
import { useGiftCardStore } from '@/store/useGiftCardStore';
import { useScheduleStore, parseDurationToMinutes } from '@/store/useScheduleStore';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useBrandDomain } from '@/hooks/useBrandDomain';

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
  const { isBookingOpen, closeBooking, selectedServiceForBooking, bookingCategory } = useUIStore();
  const pathname = usePathname();
  
  // Form states
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+56');
  const [phoneNumOnly, setPhoneNumOnly] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePhoneNumChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 9);
    setPhoneNumOnly(cleaned);
    validatePhone(cleaned);
  };

  const validatePhone = (num: string) => {
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
  const [category, setCategory] = useState<'barberia' | 'peluqueria' | 'terapias' | 'santuario'>('peluqueria');
  const [serviceId, setServiceId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const handleToggleService = (sId: string) => {
    setSelectedServiceIds(prev => {
      let next: string[];
      if (prev.includes(sId)) {
        next = prev.filter(id => id !== sId);
      } else {
        next = [...prev, sId];
      }
      setServiceId(next[0] || '');
      return next;
    });
  };
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [dateType, setDateType] = useState<'hoy' | 'manana' | 'semana' | 'mes' | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(() => new Date());
  const [time, setTime] = useState('');
  
  // Gift Card states
  const [giftCardCode, setGiftCardCode] = useState('');
  interface AppliedGiftCard {
    code: string;
    remainingBalance: number;
  }
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [giftCardSuccess, setGiftCardSuccess] = useState('');

  // Helper to parse price string to number
  const parsePrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };
  
  // Submission flow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [assignedSpecialistName, setAssignedSpecialistName] = useState('');
  const [isDepositNotified, setIsDepositNotified] = useState(false);
  const [isNotifyingDeposit, setIsNotifyingDeposit] = useState(false);

  const [copiedTransfer, setCopiedTransfer] = useState(false);

  const fetchSchedules = useScheduleStore(state => state.fetchSchedules);
  const fetchPublicBookings = useBookingStore(state => state.fetchPublicBookings);
  const fetchServicesAndSpecialists = useServicesStore(state => state.fetchServicesAndSpecialists);

  const { isValentes, isAlmaBela, isJefferson } = useBrandDomain();

  const isPageBarberia = pathname.startsWith('/barberia');
  const isPagePeluqueria = pathname.startsWith('/peluqueria');
  const isPageTerapias = pathname.startsWith('/terapias');

  const categoryOptions = React.useMemo(() => {
    if (isValentes || isPageBarberia) return [{ id: 'barberia', name: 'Barbería' }];
    if (isAlmaBela || isJefferson || isPagePeluqueria) {
      return [
        { id: 'peluqueria', name: 'Peluquería' },
        { id: 'terapias', name: 'Terapias' }
      ];
    }
    if (isPageTerapias) {
      return [
        { id: 'terapias', name: 'Terapias' },
        { id: 'peluqueria', name: 'Peluquería' }
      ];
    }
    return [
      { id: 'peluqueria', name: 'Peluquería' },
      { id: 'terapias', name: 'Terapias' }
    ];
  }, [isValentes, isAlmaBela, isJefferson, isPageBarberia, isPagePeluqueria, isPageTerapias]);

  // Fetch real-time schedule, booking and specialist data from Supabase when the modal is opened
  useEffect(() => {
    if (isBookingOpen) {
      fetchSchedules();
      fetchPublicBookings();
      fetchServicesAndSpecialists();
    }
  }, [isBookingOpen, fetchSchedules, fetchPublicBookings, fetchServicesAndSpecialists]);

  // Prefill service/category if passed from CTA or based on the host/pathname/bookingCategory
  useEffect(() => {
    if (!isBookingOpen) return;

    if (selectedServiceForBooking) {
      // Find category
      let foundCategory: 'barberia' | 'peluqueria' | 'terapias' = 'barberia';
      if (selectedServiceForBooking.id.startsWith('b')) foundCategory = 'barberia';
      else if (selectedServiceForBooking.id.startsWith('p')) foundCategory = 'peluqueria';
      else if (selectedServiceForBooking.id.startsWith('t')) foundCategory = 'terapias';
      
      setCategory(foundCategory);
      setServiceId(selectedServiceForBooking.id);
      setSelectedServiceIds([selectedServiceForBooking.id]);
      setStep(2);
    } else if (bookingCategory) {
      setCategory(bookingCategory);
      setServiceId('');
      setSelectedServiceIds([]);
      setStep(1);
    } else {
      setServiceId('');
      setSelectedServiceIds([]);
      if (isValentes || isPageBarberia) {
        setCategory('barberia');
      } else if (isAlmaBela || isJefferson || isPagePeluqueria) {
        setCategory('peluqueria');
      } else if (isPageTerapias) {
        setCategory('terapias');
      } else {
        setCategory('peluqueria');
      }
      setStep(1);
    }
  }, [isBookingOpen, selectedServiceForBooking, bookingCategory, isValentes, isAlmaBela, isJefferson, isPageBarberia, isPagePeluqueria, isPageTerapias]);

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
    setSelectedServiceIds([]);
    setSpecialistId('');
    setDate('');
    setTime('');
    setDateType(null);
    setServiceSearch('');
  };

  const { servicesData, loading } = useServicesStore();
  // Get current options based on category
  const allServicesList = (servicesData[category]?.services || []).filter(s => s.isActive !== false);
  const servicesList = allServicesList.filter(s => {
    if (!serviceSearch.trim()) return true;
    const query = serviceSearch.toLowerCase();
    return s.name.toLowerCase().includes(query) || (s.description && s.description.toLowerCase().includes(query));
  });
  const selectedServiceObj = servicesList.find(s => s.id === serviceId);
  const specialistsList = servicesData[category]?.specialists || [];

  const selectedServicesList = React.useMemo(() => {
    return allServicesList.filter(s => selectedServiceIds.includes(s.id));
  }, [allServicesList, selectedServiceIds]);

  // Check if the current selection matches the preselected service from useUIStore
  const isPreselected = selectedServiceForBooking && selectedServiceForBooking.id === serviceId;

  const displayServiceName = isPreselected 
    ? selectedServiceForBooking.name 
    : (selectedServiceObj?.name || '');

  const displayServiceNameCombined = React.useMemo(() => {
    if (selectedServicesList.length > 0) {
      return selectedServicesList.map(s => s.name).join(' + ');
    }
    return displayServiceName || 'Servicio Personalizado';
  }, [selectedServicesList, displayServiceName]);

  const baseDuration = selectedServiceObj
    ? (typeof selectedServiceObj.duration === 'number' ? selectedServiceObj.duration : parseDurationToMinutes(selectedServiceObj.duration))
    : 60;

  const displayDurationMins = isPreselected && selectedServiceForBooking.name.toLowerCase().includes('cejas')
    ? baseDuration + 15
    : baseDuration;

  const displayDurationStr = isPreselected && selectedServiceForBooking.name.toLowerCase().includes('cejas')
    ? `${displayDurationMins} min`
    : (selectedServiceObj?.duration || '');

  const totalDurationMins = React.useMemo(() => {
    if (selectedServicesList.length > 0) {
      let total = 0;
      for (const s of selectedServicesList) {
        const isCejas = isPreselected && s.name.toLowerCase().includes('cejas');
        const dur = typeof s.duration === 'number' ? s.duration : parseDurationToMinutes(s.duration);
        total += isCejas ? dur + 15 : dur;
      }
      return total > 0 ? total : 60;
    }
    return displayDurationMins;
  }, [selectedServicesList, displayDurationMins, isPreselected]);

  const originalPriceNumber = isPreselected
    ? parsePrice(selectedServiceForBooking.price)
    : (selectedServiceObj 
        ? (typeof selectedServiceObj.price === 'number' ? selectedServiceObj.price : parsePrice(selectedServiceObj.price)) 
        : 0);

  const totalOriginalPriceNumber = React.useMemo(() => {
    if (selectedServicesList.length > 0) {
      return selectedServicesList.reduce((sum, s) => {
        const p = typeof s.price === 'number' ? s.price : parsePrice(s.price);
        return sum + p;
      }, 0);
    }
    return originalPriceNumber;
  }, [selectedServicesList, originalPriceNumber]);

  const totalOriginalPriceStr = React.useMemo(() => {
    return `$${totalOriginalPriceNumber.toLocaleString('es-CL')}`;
  }, [totalOriginalPriceNumber]);

  // Filter specialists based on business type and eligible services
  const filteredSpecialistsList = (() => {
    let list = specialistsList.filter(spec => spec.isActive !== false);

    // 1. Filter by business type (profileType)
    list = list.filter(spec => {
      const profileMap: Record<string, string[]> = {
        barberia: ['barber', 'mixto', 'admin'],
        peluqueria: ['estilista', 'mixto', 'admin'],
        terapias: ['terapeuta', 'mixto', 'admin']
      };
      const allowed = profileMap[category] || [];
      return allowed.includes(spec.profileType) && spec.assignedAgendas.includes(category as 'barberia' | 'peluqueria' | 'terapias');
    });

    // 2. Filter by service capability (specialistIds) if services are selected
    if (selectedServicesList.length > 0) {
      for (const s of selectedServicesList) {
        if (s.specialistIds && s.specialistIds.length > 0) {
          list = list.filter(spec => s.specialistIds?.includes(spec.id));
        }
      }
    } else if (serviceId && selectedServiceObj) {
      if (selectedServiceObj.specialistIds && selectedServiceObj.specialistIds.length > 0) {
        list = list.filter(spec => selectedServiceObj.specialistIds?.includes(spec.id));
      }
    }

    return list;
  })();

  // Reset selected specialist if they are not in the filtered list for the selected service
  useEffect(() => {
    if (specialistId && filteredSpecialistsList.length > 0) {
      const isStillAvailable = filteredSpecialistsList.some(sp => sp.id === specialistId);
      if (!isStillAvailable) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSpecialistId('');
      }
    }
  }, [serviceId, selectedServiceIds, filteredSpecialistsList, specialistId]);

  const isSpecialistAvailable = useScheduleStore(state => state.isSpecialistAvailable);

  const checkTimeSlotAvailabilityForDate = (checkDate: string, slotTime: string): { available: boolean; reason?: string } => {
    if (!checkDate) return { available: true };
    
    // Check if slot is in the past based on system date and time
    const isPast = (() => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      
      if (checkDate < todayStr) return true;
      if (checkDate > todayStr) return false;
      
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

    const dur = totalDurationMins;
    if (specialistId) {
      return isSpecialistAvailable(specialistId, checkDate, slotTime, dur, category);
    }
    if (filteredSpecialistsList.length === 0) return { available: true };
    const availableSpecs = filteredSpecialistsList.filter(s => isSpecialistAvailable(s.id, checkDate, slotTime, dur, category).available);
    if (availableSpecs.length > 0) {
      return { available: true };
    }
    return { available: false, reason: 'No hay profesionales disponibles' };
  };

  const checkTimeSlotAvailability = (slotTime: string): { available: boolean; reason?: string } => {
    return checkTimeSlotAvailabilityForDate(date, slotTime);
  };

  const countAvailableSlots = (checkDate: string) => {
    const slots = category === 'barberia'
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
        ];
    return slots.filter(slot => checkTimeSlotAvailabilityForDate(checkDate, slot).available).length;
  };

  // Clear date and time when service or specialist changes so we recalculate the nearest available slot, fetching fresh DB data
  useEffect(() => {
    if (isBookingOpen) {
      fetchSchedules();
      fetchPublicBookings();
    }
    setDate('');
    setTime('');
    setDateType(null);
  }, [serviceId, selectedServiceIds, specialistId, isBookingOpen, fetchSchedules, fetchPublicBookings]);

  // Fetch fresh bookings and schedules whenever stepping into date/time selection or changing date
  useEffect(() => {
    if (isBookingOpen && step === 3) {
      fetchSchedules();
      fetchPublicBookings();
    }
  }, [step, date, isBookingOpen, fetchSchedules, fetchPublicBookings]);

  // Find and pre-select the nearest available date and time slot
  useEffect(() => {
    if (isBookingOpen && step === 3 && (!date || !time)) {
      // If the user has explicitly selected 'semana' or 'mes' and cleared the date to pick a new one,
      // do not auto-override it!
      if (dateType === 'semana' || dateType === 'mes') {
        return;
      }

      const timeSlots = category === 'barberia'
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
          ];
      
      // Search the next 30 days
      for (let offset = 0; offset < 30; offset++) {
        const checkDate = getFormattedDate(offset);
        const firstAvailableSlot = timeSlots.find(slot => 
          checkTimeSlotAvailabilityForDate(checkDate, slot).available
        );
        
        if (firstAvailableSlot) {
          setDate(checkDate);
          setTime(firstAvailableSlot);
          
          if (offset === 0) {
            setDateType('hoy');
          } else if (offset === 1) {
            setDateType('manana');
          } else {
            setDateType('semana');
          }
          break;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBookingOpen, step, serviceId, selectedServiceIds, specialistId]);

  const handleKeyDownStep4 = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (name.trim() !== '' && phoneNumOnly.length === 9 && !phoneError) {
        setStep(5);
      }
    }
  };

  const handleCopyTransferDetails = () => {
    const textToCopy = `Banco: Mercado Pago\nNombre: Jefferson Lopes Barros\nRUT: 28.434.859-1\nCuenta Vista: 1029896108\nEmail: jefitolopess@gmail.com\nMonto Abono: $20.000 CLP`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedTransfer(true);
      setTimeout(() => setCopiedTransfer(false), 2000);
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !phoneNumOnly || !serviceId || !date || !time) return;

    if (phoneNumOnly.length !== 9) {
      setPhoneError('El número de WhatsApp debe tener exactamente 9 dígitos.');
      return;
    }
    setPhoneError(null);
    setSubmitError(null);

    setIsSubmitting(true);
    
    try {
      const fullPhone = `${countryCode} ${phoneNumOnly}`;
      
      const assignedName = (() => {
        if (specialistId) {
          // Si hay un especialista seleccionado explícitamente, usarlo siempre
          return selectedSpecialistObj?.name || filteredSpecialistsList.find(s => s.id === specialistId)?.name || filteredSpecialistsList[0]?.name || 'Sin Asignar';
        }
        const dur = totalDurationMins;
        const availableSpecs = filteredSpecialistsList.filter(s => isSpecialistAvailable(s.id, date, time, dur, category).available);
        if (availableSpecs.length > 0) {
          // Balancear carga: asignar al que tenga menos reservas en el día
          const bookingsOnDate = useBookingStore.getState().bookings.filter(b => b.date === date);
          const getBookingCount = (specName: string) => {
            return bookingsOnDate.filter(b => b.specialistName.trim().toLowerCase() === specName.trim().toLowerCase()).length;
          };
          availableSpecs.sort((a, b) => getBookingCount(a.name) - getBookingCount(b.name));
          return availableSpecs[0].name;
        }
        // Si no hay profesionales disponibles a esa hora, lanzar error para que la clienta escoja otro bloque
        throw new Error('No hay profesionales disponibles para la fecha y hora seleccionadas. Por favor, selecciona otro horario.');
      })();
      setAssignedSpecialistName(assignedName);

      // Detect booking channel
      let bookingChannel: 'Web' | 'WhatsApp' | 'Presencial' | 'Instagram' = 'Web';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const source = params.get('source') || params.get('utm_source');
        const isInstagramUA = navigator.userAgent.includes('Instagram') || 
                              navigator.userAgent.includes('FBAN/Instagram') ||
                              navigator.userAgent.includes('FBAV');
        if (source === 'instagram' || source === 'ig' || isInstagramUA) {
          bookingChannel = 'Instagram';
        }
      }

      const newBookingId = await useBookingStore.getState().addBooking({
        clientName: name,
        clientPhone: fullPhone,
        clientEmail: email,
        category: category as 'barberia' | 'peluqueria' | 'terapias',
        serviceName: displayServiceNameCombined || 'Servicio Personalizado',
        price: finalPriceStr,
        specialistName: assignedName,
        date: date,
        time: time,
        channel: bookingChannel,
        status: (category === 'peluqueria' || category === 'terapias') ? 'pendiente' : 'confirmado',
        giftCardUsed: appliedGiftCard ? appliedGiftCard.code : undefined
      });

      // Deduct balance from Gift Card if applied
      if (appliedGiftCard && discountAmount > 0) {
        await useGiftCardStore.getState().redeemGiftCard(appliedGiftCard.code, discountAmount);
      }
      
      setBookingCode(newBookingId);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setSubmitError(err.message || 'Error al agendar la cita. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCountryCode('+56');
    setPhoneNumOnly('');
    setPhoneError(null);
    setSubmitError(null);
    setEmail('');
    setCategory(isValentes || isPageBarberia ? 'barberia' : isPageTerapias ? 'terapias' : 'peluqueria');
    setServiceId('');
    setSelectedServiceIds([]);
    setServiceSearch('');
    setStep(1);
    setSpecialistId('');
    setDate('');
    setTime('');
    setIsDepositNotified(false);
    setIsNotifyingDeposit(false);
    setDateType(null);
    setIsSuccess(false);
    setBookingCode('');
    setAssignedSpecialistName('');
    setGiftCardCode('');
    setAppliedGiftCard(null);
    setGiftCardError('');
    setGiftCardSuccess('');
    setCopiedTransfer(false);
  };

  const handleClose = () => {
    closeBooking();
    setTimeout(resetForm, 300); // Wait for exit animation to clear states
  };

  const selectedSpecialistObj = specialistsList.find(sp => sp.id === specialistId);

  // Calculate discount & remaining balance
  const discountAmount = appliedGiftCard 
    ? Math.min(totalOriginalPriceNumber, appliedGiftCard.remainingBalance)
    : 0;
  
  const finalPriceNumber = totalOriginalPriceNumber - discountAmount;
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

  // Dynamic Theme definitions based on category
  const isTerapias = category === 'terapias';
  const themeText = 'text-gold';
  const themeText80 = 'text-gold/80';
  const themeBg = 'bg-gold';
  const themeBorder25 = 'border-gold/25';
  const themeBorder15 = 'border-gold/15';
  const themeBorderFocus = 'focus:border-gold/60';
  const themeShadow = 'hover:shadow-gold/20 shadow-gold/5';
  
  // Success styles
  const themeSuccessText = 'text-gold';
  
  const modalContainerClass = `relative w-full max-w-4xl bg-black/95 text-white rounded-none md:rounded-[32px] overflow-hidden z-10 border border-white/5 md:${themeBorder25} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] grid grid-cols-1 md:grid-cols-12 h-[100dvh] md:h-[680px] transition-all duration-500`;
  
  const labelClass = `block text-[9px] uppercase tracking-[0.2em] ${themeText80} font-semibold mb-1`;
  const inputClass = `w-full bg-transparent border-b border-white/10 text-white py-2.5 px-1 text-sm ${themeBorderFocus} focus:outline-none transition-colors`;
  
  const isFormValid = name.trim() !== '' && 
                      phoneNumOnly.length === 9 && 
                      !phoneError && 
                      (selectedServiceIds.length > 0 || serviceId !== '') && 
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
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
                        src="/peluqueria-logo-v6.png"
                        alt="Alma Bela Studio Logo"
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className={`text-[9px] uppercase tracking-[0.4em] ${themeText80} font-semibold block mb-1`}>
                        Alma Bela
                      </span>
                      <h2 className="font-serif text-2xl font-bold tracking-[0.2em] text-gold animate-text-gold-flow leading-none">ALMA BELA</h2>
                      <h2 className="font-serif text-[10px] tracking-[0.3em] text-gold/80 uppercase font-bold mt-1">PELUQUERÍA</h2>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="relative w-16 h-16 transition-transform duration-500 hover:scale-105 hover:rotate-2">
                      <Image
                        src="/terapias-logo-v11.png"
                        alt="Jefïto Lopês Studio Logo"
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className={`text-[9px] uppercase tracking-[0.4em] ${themeText80} font-semibold block mb-1`}>
                        Jefferson Leonardo
                      </span>
                      <h2 className="font-serif text-[15px] sm:text-lg font-bold tracking-[0.1em] text-gold animate-text-gold-flow leading-none">JEFFERSON LEONARDO</h2>
                      <h2 className="font-serif text-[10px] tracking-[0.3em] text-gold/80 uppercase font-bold mt-1">TERAPIAS HOLÍSTICAS</h2>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalles del Servicio actual */}
              <div className={`relative z-10 space-y-4 bg-black/60 backdrop-blur-sm border p-5 rounded-2xl ${themeBorder15}`}>
                <span className={`text-[9px] uppercase tracking-widest font-bold block ${themeText80}`}>Estás Reservando:</span>
                {selectedServicesList.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-serif text-lg text-white font-medium leading-snug">{displayServiceNameCombined}</h4>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                      <span className={`font-serif text-base font-semibold ${themeText}`}>{totalOriginalPriceStr}</span>
                      <span className="text-[9px] text-text-secondary uppercase tracking-wider">{totalDurationMins} min</span>
                    </div>
                  </div>
                ) : selectedServiceObj ? (
                  <div className="space-y-2">
                    <h4 className="font-serif text-lg text-white font-medium leading-snug">{displayServiceName}</h4>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                      <span className={`font-serif text-base font-semibold ${themeText}`}>{isPreselected ? selectedServiceForBooking.price : selectedServiceObj.price}</span>
                      <span className="text-[9px] text-text-secondary uppercase tracking-wider">{displayDurationStr}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary italic">Por favor, selecciona al menos un servicio en el formulario.</p>
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

            {/* Panel Derecho: Formulario Paso a Paso */}
            <div className="col-span-1 md:col-span-7 flex flex-col justify-between p-6 md:p-8 bg-[#020202] relative overflow-hidden h-full">
              {/* Botón de cerrar flotante */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer z-20"
              >
                <X size={16} />
              </button>

              <div className="flex-grow flex flex-col max-w-md w-full mx-auto py-4 md:py-0 overflow-hidden h-full">
                <div className="mb-6">
                  <h3 className={`font-serif text-2xl ${themeText} tracking-wide`}>Completar Ritual</h3>
                  <p className="text-xs text-text-secondary tracking-widest uppercase mt-1">
                    {category === 'barberia'
                      ? 'Barbería'
                      : category === 'peluqueria'
                      ? 'Peluquería'
                      : 'Jefferson Leonardo • Terapias Holísticas'
                    }
                  </p>
                </div>

                {/* Stepper Progress Bar */}
                {!isSuccess && (
                  <div className="flex items-center justify-between mb-8 px-4 max-w-[280px] w-full mx-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <React.Fragment key={s}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                          step === s 
                            ? `${themeBg} text-black font-extrabold shadow-[0_0_12px_rgba(198,155,60,0.3)] scale-110` 
                            : step > s 
                              ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                              : 'bg-white/10 text-white/40 border border-white/5'
                        }`}>
                          {step > s ? '✓' : s}
                        </div>
                        {s < 5 && (
                          <div className={`flex-1 h-[2px] mx-2 min-w-[8px] transition-all duration-500 ${
                            step > s ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.1)]' : 'bg-white/10'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {!isSuccess ? (
                  <form onSubmit={(e) => e.preventDefault()} className="flex-grow flex flex-col justify-between overflow-hidden">
                    <div className="flex-grow overflow-y-auto pr-1 py-1 space-y-6 scrollbar-thin">
                      {step === 1 && (
                        <div className="space-y-5">
                          {/* Segment Selector for category/welfare area */}
                          {categoryOptions.length > 1 && (
                            <div>
                              <label className={labelClass}>Área de Bienestar</label>
                              <div className={`grid grid-cols-${categoryOptions.length} gap-2 mt-1.5`}>
                                {categoryOptions.map((opt) => {
                                  const isSelected = category === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => handleCategoryChange(opt.id as 'barberia' | 'peluqueria' | 'terapias')}
                                      className={`py-2.5 px-1 text-center rounded-xl border text-[10px] uppercase tracking-wider font-bold transition-all duration-300 focus:outline-none ${
                                        isSelected
                                          ? 'border-gold bg-gold/10 text-gold shadow-[0_0_8px_rgba(198,155,60,0.15)]'
                                          : 'border-white/5 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/10'
                                      }`}
                                    >
                                      {opt.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Services Cards list */}
                          <div className="space-y-3">
                            <label className={labelClass}>Selecciona tu Ritual (puedes elegir varios) *</label>
                            
                            {/* Buscador de servicios por palabra clave */}
                            <div className="relative flex items-center">
                              <Search size={14} className="absolute left-3.5 text-text-secondary" />
                              <input
                                type="text"
                                placeholder="Buscar ritual por palabra clave..."
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-0 rounded-xl py-2.5 pl-9 pr-8 text-xs text-white focus:outline-none transition-all duration-300"
                              />
                              {serviceSearch && (
                                <button
                                  type="button"
                                  onClick={() => setServiceSearch('')}
                                  className="absolute right-3 p-1 rounded-full text-text-secondary hover:text-white transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>

                            <div className="space-y-2.5 pr-1 mt-1.5 max-h-[45vh] md:max-h-[300px] overflow-y-auto scrollbar-thin">
                              {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                  <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-gold`} />
                                  <p className="text-xs text-white/40 tracking-wider uppercase">Cargando rituales...</p>
                                </div>
                              ) : servicesList.length === 0 ? (
                                <p className="text-xs text-white/40 italic">
                                  {serviceSearch ? "No se encontraron rituales que coincidan con tu búsqueda." : "No hay servicios disponibles en esta área."}
                                </p>
                              ) : (
                                servicesList.map((service) => {
                                  const isSelected = selectedServiceIds.includes(service.id);
                                  return (
                                    <button
                                      key={service.id}
                                      type="button"
                                      onClick={() => handleToggleService(service.id)}
                                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-4 cursor-pointer ${
                                        isSelected
                                          ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.15)]'
                                          : 'border-white/5 bg-white/[0.02] text-white/80 hover:border-white/20 hover:bg-white/[0.04]'
                                      }`}
                                    >
                                      <div className="space-y-1 pr-2 flex-grow">
                                        <div className="font-bold text-sm text-white transition-colors flex items-center space-x-2">
                                          <span>{service.name}</span>
                                        </div>
                                        {service.description && (
                                          <p className="text-[11px] text-text-secondary leading-relaxed font-light">
                                            {service.description}
                                          </p>
                                        )}
                                        <div className="text-[10px] text-text-secondary font-medium uppercase tracking-wider pt-0.5">
                                          Duración: {service.duration}
                                        </div>
                                      </div>
                                      <div className="text-right flex flex-col items-end justify-between min-w-[70px] self-stretch">
                                        <span className={`font-serif text-sm font-bold ${isSelected ? themeText : 'text-white'}`}>
                                          {service.price}
                                        </span>
                                        <div className={`mt-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                          isSelected ? 'border-gold bg-gold text-black shadow-sm' : 'border-white/20 bg-white/5'
                                        }`}>
                                          {isSelected && <Check size={12} className="stroke-[3]" />}
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>

                            {selectedServicesList.length > 0 && (
                              <div className="mt-3 p-3 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-between text-xs text-gold animate-fadeIn">
                                <span className="font-semibold">
                                  {selectedServicesList.length} {selectedServicesList.length === 1 ? 'ritual seleccionado' : 'rituales seleccionados'} ({totalDurationMins} min)
                                </span>
                                <span className="font-serif font-bold text-sm">
                                  {totalOriginalPriceStr}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-5 animate-fadeIn">
                          <div>
                            <h4 className="text-xs uppercase tracking-widest font-semibold text-text-secondary">Paso 2</h4>
                            <h3 className="font-serif text-lg text-white font-bold mt-0.5">¿Quién te atenderá?</h3>
                            <p className="text-xs text-text-secondary font-light mt-0.5">Selecciona tu especialista preferido.</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1 pb-2">

                            {/* Real specialists */}
                            {filteredSpecialistsList.map((specialist) => {
                              const photo = specialist.imageUrl || specialistPhotos[specialist.id];
                              const isSelected = specialistId === specialist.id;
                              return (
                                <button
                                  key={specialist.id}
                                  type="button"
                                  onClick={() => setSpecialistId(specialist.id)}
                                  className={`p-4 rounded-2xl border text-left flex items-center space-x-4 transition-all duration-300 relative ${
                                    isSelected
                                      ? 'border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(198,155,60,0.2)] scale-[1.02]'
                                      : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04]'
                                  }`}
                                >
                                  <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform duration-300 ${
                                    isSelected
                                      ? 'border-gold scale-105 shadow-[0_0_10px_rgba(198,155,60,0.2)]'
                                      : 'border-white/10'
                                  }`}>
                                    {photo ? (
                                      <Image
                                        src={photo}
                                        alt={specialist.name}
                                        fill
                                        unoptimized
                                        sizes="56px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-platinum text-xs font-semibold">
                                        {specialist.avatar}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-left flex-grow pr-3">
                                    <div className={`font-serif text-sm font-bold tracking-wide transition-colors ${isSelected ? themeText : 'text-white'}`}>
                                      {specialist.name}
                                    </div>
                                    <div className={`text-[8px] uppercase tracking-widest font-bold ${isSelected ? themeText : 'text-text-secondary'} mt-0.5`}>
                                      {specialist.role}
                                    </div>
                                    {specialist.specialty && (
                                      <div className="text-[10px] text-text-secondary/80 font-light mt-1.5 leading-snug line-clamp-2">
                                        {specialist.specialty}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className={`absolute top-3 right-3 w-4 h-4 rounded-full ${themeBg} text-black flex items-center justify-center shadow-md animate-scaleIn`}>
                                      <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-5 animate-fadeIn">
                          <div>
                            <h4 className="text-xs uppercase tracking-widest font-semibold text-text-secondary">Paso 3</h4>
                            <h3 className="font-serif text-lg text-white font-bold mt-0.5">Fecha y Hora</h3>
                          </div>

                          <div className="space-y-4">
                            {/* Date selectors buttons */}
                            <div>
                              <label className={labelClass}>Selecciona el día</label>
                              <div className="grid grid-cols-4 gap-2 mt-1.5">
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
                                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border aspect-square transition-all duration-300 focus:outline-none cursor-pointer ${
                                        isSelected 
                                          ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.25)]' 
                                          : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20'
                                      }`}
                                    >
                                      <Calendar size={18} className={isSelected ? themeText : 'text-white/50'} />
                                      <span className="text-[10px] font-semibold tracking-wider uppercase mt-1.5">{item.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Custom week slider */}
                            {dateType === 'semana' && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
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
                                            setTime('');
                                          }}
                                          className={`flex-shrink-0 w-[72px] h-[78px] rounded-2xl border flex flex-col justify-center items-center transition-all duration-300 snap-start ${
                                            isFullyBooked
                                              ? 'border-white/5 bg-black/20 text-white/20 opacity-30 cursor-not-allowed'
                                              : isSelected
                                                ? 'border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(198,155,60,0.25)]'
                                                : 'border-white/10 bg-white/[0.02] hover:border-white/20 text-white/70 hover:text-white cursor-pointer'
                                          }`}
                                        >
                                          <span className="text-[9px] font-semibold uppercase tracking-wider">{d.dayName}</span>
                                          <span className="text-[11px] font-bold mt-1 font-mono">{d.displayDate}</span>
                                          <span className={`text-[8px] mt-1 font-medium ${
                                            isFullyBooked
                                              ? 'text-red-400/70 font-semibold'
                                              : isSelected
                                                ? 'text-gold/80'
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

                            {/* Custom calendar grid for mes */}
                            {dateType === 'mes' && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3 mt-2"
                              >
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

                                <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                                  {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((day) => (
                                    <div key={day} className="py-1">{day}</div>
                                  ))}
                                </div>

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
                                                ? 'border border-gold bg-gold/10 text-gold shadow-[0_0_8px_rgba(198,155,60,0.25)] font-bold'
                                                : 'border border-transparent bg-white/[0.02] hover:border-white/20 text-white/80 hover:text-white cursor-pointer'
                                          }`}
                                        >
                                          <span>{d.getDate()}</span>
                                          {!isDisabled && !isFullyBooked && (
                                            <span className={`w-1 h-1 rounded-full absolute bottom-1 ${
                                              isSelected
                                                ? 'bg-gold'
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

                            {/* Hours selectors */}
                            {date && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                              >
                                <label className={labelClass}>Hora disponible *</label>
                                <div className="grid grid-cols-4 gap-2 pr-1">
                                  {(category === 'barberia'
                                    ? [
                                        { value: '07:00', label: '07:00 AM' },
                                        { value: '08:00', label: '08:00 AM' },
                                        { value: '09:00', label: '09:00 AM' },
                                        { value: '10:00', label: '10:00 AM' },
                                        { value: '11:00', label: '11:00 AM' },
                                        { value: '12:00', label: '12:00 PM' },
                                        { value: '13:00', label: '01:00 PM' },
                                        { value: '14:00', label: '02:00 PM' },
                                        { value: '15:00', label: '03:00 PM' },
                                        { value: '16:00', label: '04:00 PM' },
                                        { value: '17:00', label: '05:00 PM' },
                                        { value: '18:00', label: '06:00 PM' },
                                        { value: '19:00', label: '07:00 PM' },
                                        { value: '20:00', label: '08:00 PM' }
                                      ]
                                    : [
                                        { value: '07:00', label: '07:00 AM' },
                                        { value: '07:30', label: '07:30 AM' },
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
                                        { value: '20:00', label: '08:00 PM' }
                                      ]
                                  ).map((slot) => {
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
                                              ? 'border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(198,155,60,0.2)]'
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
                          </div>
                        </div>
                      )}

                      {step === 4 && (
                        <div className="space-y-5 animate-fadeIn">
                          <div>
                            <h4 className="text-xs uppercase tracking-widest font-semibold text-text-secondary">Paso 4</h4>
                            <h3 className="font-serif text-lg text-white font-bold mt-0.5">Datos de Contacto</h3>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className={labelClass}>Nombre Completo *</label>
                              <input
                                type="text"
                                placeholder="Escribe tu nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={handleKeyDownStep4}
                                required
                                className={inputClass}
                              />
                            </div>

                            <div>
                              <label className={labelClass}>WhatsApp *</label>
                              <div className="flex space-x-2 relative">
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
                                                validatePhone(phoneNumOnly);
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

                                <input
                                  type="tel"
                                  placeholder="912345678"
                                  value={phoneNumOnly}
                                  onChange={(e) => handlePhoneNumChange(e.target.value)}
                                  onKeyDown={handleKeyDownStep4}
                                  required
                                  className={`${inputClass} flex-1 ${phoneError ? 'border-red-500/50 focus:border-red-500' : ''}`}
                                />
                              </div>
                              {phoneError && (
                                <p className="text-[10px] text-red-400 mt-1 font-light text-left">{phoneError}</p>
                              )}
                            </div>

                            <div>
                              <label className={labelClass}>Correo Electrónico (Opcional)</label>
                              <input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDownStep4}
                                className={inputClass}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                       {step === 5 && (
                        <div className="space-y-5 animate-fadeIn pr-1 w-full">
                          <div>
                            <h4 className="text-xs uppercase tracking-widest font-semibold text-text-secondary">Paso 5</h4>
                            <h3 className="font-serif text-lg text-white font-bold mt-0.5">
                              {(category === 'peluqueria' || category === 'terapias') ? 'Abono de Reserva' : 'Confirmar Reserva'}
                            </h3>
                            <p className="text-xs text-text-secondary font-light mt-0.5">
                              {(category === 'peluqueria' || category === 'terapias') 
                                ? 'Por favor realiza la transferencia para asegurar tu horario y finalizar la reserva.' 
                                : 'Por favor revisa los detalles de tu ritual antes de finalizar.'}
                            </p>
                          </div>
                                {/* Deposit (Abono) Details Section for Peluquería / Terapias */}
                          {(category === 'peluqueria' || category === 'terapias') && (
                            <div className="w-full text-left space-y-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-bold text-gold uppercase tracking-wider">Datos para Abono</span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleCopyTransferDetails}
                                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-semibold transition-all cursor-pointer ${copiedTransfer ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' : 'text-text-secondary hover:text-white'}`}
                                >
                                  {copiedTransfer ? (
                                    <>
                                      <Check size={10} />
                                      <span>¡Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={10} />
                                      <span>Copiar Datos</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              <p className="text-[11px] text-text-secondary leading-relaxed font-light">
                                El abono de <strong>$20.000 pesos</strong> se solicita para asegurar tu horario y será descontado del valor final del servicio.
                              </p>

                              <div className="p-3 bg-black/40 rounded-xl space-y-1.5 border border-white/5 font-mono text-[10px] text-white/90">
                                <div className="flex justify-between"><span className="text-text-secondary">Banco:</span><strong>Mercado Pago</strong></div>
                                <div className="flex justify-between"><span className="text-text-secondary">Nombre:</span><strong>Jefferson Lopes Barros</strong></div>
                                <div className="flex justify-between"><span className="text-text-secondary">RUT:</span><strong>28.434.859-1</strong></div>
                                <div className="flex justify-between"><span className="text-text-secondary">Cuenta Vista:</span><strong>1029896108</strong></div>
                                <div className="flex justify-between"><span className="text-text-secondary">Email:</span><strong>jefitolopess@gmail.com</strong></div>
                                <div className="flex justify-between pt-1.5 mt-1.5 border-t border-white/5 text-[11px]"><span className="text-gold font-bold">Monto Abono:</span><strong className="text-gold">$20.000 CLP</strong></div>
                              </div>

                              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-100 text-left space-y-3">
                                <div className="flex items-center space-x-2 font-bold text-amber-400 text-xs uppercase tracking-wide">
                                  <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                                  <span>Confirmación Obligatoria</span>
                                </div>
                                <p className="leading-relaxed font-normal text-xs text-amber-100/90">
                                  Para asegurar tu cupo, realiza la transferencia y <strong>envía el comprobante por WhatsApp</strong> dentro del plazo correspondiente:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                  <div className="p-2.5 bg-black/35 rounded-xl border border-white/5 text-center">
                                    <div className="text-[8px] text-text-secondary uppercase font-bold tracking-wider">Reservas Futuras</div>
                                    <div className="text-amber-300 font-serif font-bold text-[13px] mt-0.5">Plazo: 24 hrs</div>
                                  </div>
                                  <div className="p-2.5 bg-black/35 rounded-xl border border-white/5 text-center">
                                    <div className="text-[8px] text-text-secondary uppercase font-bold tracking-wider">Reservas para Hoy</div>
                                    <div className="text-amber-300 font-serif font-bold text-[13px] mt-0.5">Plazo: 1 hr</div>
                                  </div>
                                </div>
                              </div>

                              <p className="text-[11px] text-white/50 leading-relaxed text-left mt-2">
                                * <strong>Cancelación o cambio de hora:</strong> Avisar con al menos 24 horas de anticipación.
                              </p>
                            </div>
                          )}

                          {/* Final Summary Box */}
                          {selectedServiceObj && (
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 text-left mt-4 text-xs font-light text-text-secondary">
                              <div className="flex justify-between">
                                <span>Ritual</span>
                                <span className="text-white font-medium">{selectedServiceObj.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Especialista</span>
                                <span className="text-white font-medium">{selectedSpecialistObj?.name || assignedSpecialistName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cita</span>
                                <span className="text-white font-medium">{formatDateToDMY(date)} a las {time} hrs</span>
                              </div>
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
                                <span className="text-white font-bold">Total a Pagar</span>
                                <span className={`${themeText} font-serif text-base font-bold`}>{finalPriceStr} CLP</span>
                              </div>
                            </div>
                          )}

                          {/* Gift Card Selector */}
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
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyGiftCard();
                                      }
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
                                    <span className="font-mono font-semibold">{appliedGiftCard.code}</span>
                                    <span className="text-[10px] opacity-80">Saldo disponible: ${appliedGiftCard.remainingBalance.toLocaleString('es-CL')} CLP</span>
                                  </div>
                                  <span className="font-bold">Aplicada</span>
                                </div>
                              )}
                              {giftCardError && <p className="text-[10px] text-rose-500 text-left">{giftCardError}</p>}
                              {giftCardSuccess && <p className="text-[10px] text-emerald-400 text-left">{giftCardSuccess}</p>}
                            </div>
                          )}

                          {submitError && (
                            <div className="p-3.5 bg-red-950/40 border border-red-500/20 rounded-2xl text-[11px] text-red-300 text-left mt-4 font-light leading-relaxed">
                              {submitError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Bar */}
                    <div className="flex items-center space-x-4 pt-6 border-t border-white/5 flex-shrink-0 mt-4">
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5)}
                          className="flex-1 py-3.5 rounded-full border border-white/10 text-white text-xs uppercase tracking-wider font-semibold hover:bg-white/5 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                          <span>Atrás</span>
                        </button>
                      )}
                      
                      {step < 5 ? (
                        <button
                          key="next-btn"
                          type="button"
                          disabled={
                            (step === 1 && selectedServiceIds.length === 0) ||
                            (step === 2 && !specialistId) ||
                            (step === 3 && (!date || !time)) ||
                            (step === 4 && (name.trim() === '' || phoneNumOnly.length !== 9 || !!phoneError))
                          }
                          onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5)}
                          className={`flex-1 py-3.5 rounded-full ${themeBg} text-black font-semibold uppercase tracking-wider text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          <span>Siguiente</span>
                          <ChevronRight size={14} />
                        </button>
                      ) : (
                        <button
                          key="submit-btn"
                          type="button"
                          onClick={() => handleSubmit()}
                          disabled={isSubmitting || !isFormValid}
                          className={submitButtonClass}
                        >
                          {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            (category === 'peluqueria' || category === 'terapias') ? (
                              <>
                                <CheckCircle2 size={14} />
                                <span>Realice Abono</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={14} />
                                <span>Confirmar Experiencia</span>
                              </>
                            )
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  /* Success Screen inside Split layout */
                  <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin max-h-[60vh] md:max-h-[460px] w-full min-h-0">
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
                          <span className={summaryValClass} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayServiceNameCombined}</span>
                        </div>
                        {(selectedSpecialistObj || assignedSpecialistName) && (
                          <div className={summaryBorderClass}>
                            <span className={summaryLabelClass}>Especialista</span>
                            <span className={summaryValClass}>{selectedSpecialistObj?.name || assignedSpecialistName}</span>
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
                          <span className={summaryLabelClass}>Total de Servicio</span>
                          <span className="text-white font-bold">{finalPriceStr} CLP</span>
                        </div>
                      </div>

                      {/* Deposit (Abono) confirmation notice on success */}
                      {(category === 'peluqueria' || category === 'terapias') && (
                        <div className="w-full mt-4 text-center space-y-2 bg-amber-500/10 border border-amber-500/20 text-amber-100 rounded-2xl p-4 animate-fadeIn">
                          <div className="flex items-center justify-center space-x-1.5 text-amber-400">
                            <AlertTriangle size={14} className="stroke-[2.5]" />
                            <span className="text-xs font-bold uppercase tracking-wider">Enviar Comprobante</span>
                          </div>
                          <p className="text-xs text-amber-100/90 leading-relaxed font-normal">
                            Para confirmar tu reserva, recuerda transferir el abono de <strong>$20.000</strong> y enviar el comprobante por WhatsApp presionando el botón verde de abajo.
                          </p>
                        </div>
                      )}

                      {(category === 'peluqueria' || category === 'terapias') && (
                        <a
                          href={`https://wa.me/56971465202?text=${encodeURIComponent(
                            `Hola, adjunto el comprobante de transferencia de $20.000 para mi reserva.\n\n` +
                            `• Código: ${bookingCode}\n` +
                            `• Servicio: ${displayServiceNameCombined}\n` +
                            `• Fecha: ${formatDateToDMY(date)} a las ${time} hrs\n` +
                            `• Cliente: ${name}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.852-4.411 9.856-9.85.002-2.635-1.022-5.11-2.884-6.974S14.307 2.115 11.994 2.113c-5.447 0-9.866 4.416-9.87 9.86-.001 1.833.493 3.626 1.429 5.187l-.993 3.628 3.734-.979zm11.236-4.577c-.3-.15-1.782-.88-2.056-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-1.025-.515-1.745-.775-2.425-1.37-.52-.45-.875-1.01-1.025-1.26-.15-.25-.015-.385.12-.52.12-.12.275-.325.4-.485.12-.175.162-.3.243-.5.08-.199.04-.375-.02-.525-.06-.15-.475-1.145-.65-1.57-.172-.413-.343-.356-.475-.363-.12-.007-.26-.008-.4-.008-.14 0-.368.05-.56.26-.192.21-.734.717-.734 1.748 0 1.03.75 2.025.855 2.162.105.137 1.474 2.25 3.572 3.15.5.215.89.34 1.196.438.502.16 1.028.138 1.412.08.43-.064 1.78-.727 2.03-1.43.25-.702.25-1.3.175-1.43-.075-.13-.275-.21-.575-.36z"/>
                          </svg>
                          <span>Enviar Comprobante por WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={handleClose}
                        className={successCloseClass + " w-full mt-6"}
                      >
                        Cerrar
                      </button>
                    </motion.div>
                  </div>
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
