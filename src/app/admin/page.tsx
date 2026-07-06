'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { uploadImageAction } from './actions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Edit3, 
  User, 
  LogOut, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Smartphone, 
  Globe, 
  UserCheck, 
  UserX,
  MessageSquare,
  Mail,
  Eye,
  EyeOff,
  Sparkles, 
  Save, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Monitor,
  Undo2,
  Redo2,
  Camera,
  X,
  AlertCircle,
  Gift,
  UploadCloud,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useContentStore } from '@/store/useContentStore';

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

const renderMediaPreview = (src: string, className: string) => {
  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        className={className}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }
  return <img src={src} alt="" className={className} />;
};

import { useGiftCardStore } from '@/store/useGiftCardStore';
import { useServicesStore } from '@/store/useServicesStore';
import { useScheduleStore, DailyShift, TimeBlock, parseDurationToMinutes } from '@/store/useScheduleStore';
import { ManualBookingModal } from '@/components/ManualBookingModal';
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

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Seleccionar...', 
  className = '',
  buttonClassName = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || "w-full bg-black/60 border border-white/5 text-white text-xs px-4 py-2.5 rounded-xl flex items-center justify-between cursor-pointer focus:outline-none focus:border-gold/30 hover:border-white/10 transition-colors text-left"}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-gold ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 max-h-60 overflow-y-auto text-left">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? 'bg-gold/15 text-gold font-bold' 
                      : 'text-white/80 hover:text-gold hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={12} className="text-gold" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return 'Seleccionar';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

interface CalendarPickerProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  minDate?: string;
  maxDate?: string;
}

function CalendarPicker({ value, onChange, onClose, minDate, maxDate }: CalendarPickerProps) {
  const currentDate = value ? new Date(value + 'T12:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysOfWeek = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const selectedDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(selectedDateStr);
    onClose();
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const dStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return value === dStr;
  };

  return (
    <div className="absolute top-full mt-2 left-0 z-50 w-64 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="font-serif text-xs font-semibold text-white tracking-wide">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {daysOfWeek.map((day) => (
          <span key={day} className="text-[9px] uppercase tracking-wider text-text-secondary font-bold">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dayDateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          
          let isDisabled = false;
          if (minDate && dayDateStr < minDate) isDisabled = true;
          if (maxDate && dayDateStr > maxDate) isDisabled = true;

          const selected = isSelected(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDaySelect(day)}
              className={`h-7 w-7 text-[10px] rounded-lg flex items-center justify-center transition-all focus:outline-none ${
                selected
                  ? 'bg-gold text-black font-bold shadow-[0_0_8px_rgba(229,184,66,0.4)]'
                  : isDisabled
                  ? 'text-white/10 cursor-not-allowed'
                  : 'text-white/80 hover:bg-white/5 cursor-pointer'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { 
    servicesData, 
    addService, 
    updateService, 
    deleteService, 
    toggleServiceActive,
    addSpecialist,
    updateSpecialist,
    deleteSpecialist,
    specialistsList
  } = useServicesStore();

  const holidaysRowRef = useRef<HTMLDivElement>(null);

  // Session User State
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [nowState, setNowState] = useState<Date | null>(null);
  const [hoveredBookingId, setHoveredBookingId] = useState<string | null>(null);

  useEffect(() => {
    setNowState(new Date());
    const timer = setInterval(() => setNowState(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const {
    workShifts,
    timeBlocks,
    updateWorkShift,
    addTimeBlock,
    deleteTimeBlock
  } = useScheduleStore();

  // Services Configuration State
  const [activeServiceCategory, setActiveServiceCategory] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  const [isServiceDrawerOpen, setIsServiceDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  
  // Services Form state
  const [serviceFormName, setServiceFormName] = useState('');
  const [serviceFormPrice, setServiceFormPrice] = useState('');
  const [serviceFormDuration, setServiceFormDuration] = useState('30 min');
  const [serviceFormDescription, setServiceFormDescription] = useState('');
  const [serviceFormSpecialists, setServiceFormSpecialists] = useState<string[]>([]);
  const [serviceFormGroup, setServiceFormGroup] = useState<'cabello' | 'barba' | 'completo'>('cabello');

  // Staff Configuration State
  const [activeStaffCategoryFilter, setActiveStaffCategoryFilter] = useState<'todos' | 'barberia' | 'peluqueria' | 'terapias'>('todos');
  const [isStaffDrawerOpen, setIsStaffDrawerOpen] = useState(false);
  const [isUploadingStaffImage, setIsUploadingStaffImage] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Staff Form state
  const [staffFormName, setStaffFormName] = useState('');
  const [staffFormEmail, setStaffFormEmail] = useState('');
  const [staffFormRole, setStaffFormRole] = useState('');
  const [staffFormSpecialty, setStaffFormSpecialty] = useState('');
  const [staffFormBio, setStaffFormBio] = useState('');
  const [staffFormProfileType, setStaffFormProfileType] = useState<'barber' | 'estilista' | 'terapeuta' | 'mixto' | 'admin'>('barber');
  const [staffFormAgendas, setStaffFormAgendas] = useState<('barberia' | 'peluqueria' | 'terapias')[]>(['barberia']);
  const [staffFormAvatar, setStaffFormAvatar] = useState('');
  const [staffFormImageUrl, setStaffFormImageUrl] = useState('');
  const [staffFormPhone, setStaffFormPhone] = useState('');
  const [staffFormCountryCode, setStaffFormCountryCode] = useState('+56');
  const [isStaffCountryDropdownOpen, setIsStaffCountryDropdownOpen] = useState(false);
  const [staffPhoneError, setStaffPhoneError] = useState('');
  const [staffFormIsActive, setStaffFormIsActive] = useState(true);
  const [staffFormSubmitted, setStaffFormSubmitted] = useState(false);
  const [serviceFormSubmitted, setServiceFormSubmitted] = useState(false);
  const [profileFormSubmitted, setProfileFormSubmitted] = useState(false);
  const [flippedStaff, setFlippedStaff] = useState<Record<string, boolean>>({});
  const [staffToDelete, setStaffToDelete] = useState<{ category: string; id: string; name: string } | null>(null);
  const [clientToDelete, setClientToDelete] = useState<{ phone: string; name: string } | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<{ category: string; id: string; name: string } | null>(null);

  // Client Edit States
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<any | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+56');
  const [isEditCountryDropdownOpen, setIsEditCountryDropdownOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Access Requests and Approval State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [requestToApprove, setRequestToApprove] = useState<any | null>(null);
  const [approvedCredentials, setApprovedCredentials] = useState<{ email: string; tempPass: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [forceNewPassword, setForceNewPassword] = useState('');
  const [forceConfirmPassword, setForceConfirmPassword] = useState('');
  const [forcePasswordLoading, setForcePasswordLoading] = useState(false);

  // Form states inside approval modal
  const [approveProfileType, setApproveProfileType] = useState<'barber' | 'estilista' | 'terapeuta' | 'mixto' | 'admin'>('barber');
  const [approveRole, setApproveRole] = useState('');
  const [approveSpecialty, setApproveSpecialty] = useState('');
  const [approveAgendas, setApproveAgendas] = useState<('barberia' | 'peluqueria' | 'terapias')[]>(['barberia']);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Request access phone helpers
  const [reqCountryCode, setReqCountryCode] = useState('+56');
  const [reqPhoneNumber, setReqPhoneNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showRequestSuccessModal, setShowRequestSuccessModal] = useState(false);

  const countries = [
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+55', flag: '🇧🇷', name: 'Brasil' },
    { code: '+51', flag: '🇵🇪', name: 'Perú' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+52', flag: '🇲🇽', name: 'México' },
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+1', flag: '🇺🇸', name: 'EE.UU.' }
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 9);
    setReqPhoneNumber(cleanVal);
  };

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPendingRequests(data);
      }
    } catch (err) {
      console.error('Error fetching pending access requests:', err);
    }
  };

  const handleApproveRequest = async () => {
    if (!requestToApprove) return;
    try {
      setApprovalLoading(true);
      
      const { id, first_name, last_name, email } = requestToApprove;
      const tempPassword = `TempValentes_${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: tempPassword,
        options: {
          data: {
            require_password_change: true,
            firstName: first_name,
            lastName: last_name
          }
        }
      });

      if (authError) {
        triggerNotification(`Error al crear usuario de acceso: ${authError.message}`);
        setApprovalLoading(false);
        return;
      }

      // 2. Add the specialist profile using the store action
      const primaryCategory = approveAgendas[0] || 'barberia';
      
      let inferredRole = 'Colaborador';
      let inferredSpecialty = 'Especialista';

      if (approveProfileType === 'barber') {
        inferredRole = 'Barbero';
        inferredSpecialty = 'Barbería';
      } else if (approveProfileType === 'estilista') {
        inferredRole = 'Estilista';
        inferredSpecialty = 'Estilismo';
      } else if (approveProfileType === 'terapeuta') {
        inferredRole = 'Terapeuta';
        inferredSpecialty = 'Terapias Holísticas';
      } else if (approveProfileType === 'mixto') {
        inferredRole = 'Especialista';
        inferredSpecialty = 'Multidisciplinario';
      } else if (approveProfileType === 'admin') {
        inferredRole = 'Administrador';
        inferredSpecialty = 'Gestión';
      }

      const specialistData = {
        name: `${first_name} ${last_name}`,
        role: inferredRole,
        specialty: inferredSpecialty,
        bio: '',
        avatar: `${first_name[0]}${last_name[0]}`.toUpperCase(),
        email: email.trim(),
        profileType: approveProfileType,
        assignedAgendas: approveAgendas,
        imageUrl: ''
      };

      await addSpecialist(primaryCategory, specialistData);

      // 3. Update the request status to 'approved'
      const { error: updateError } = await supabase
        .from('access_requests')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateError) throw updateError;

      setRequestToApprove(null);
      setApprovedCredentials({
        email: email,
        tempPass: tempPassword
      });

      fetchPendingRequests();
      triggerNotification(`Solicitud de ${first_name} aprobada con éxito.`);
    } catch (err) {
      console.error('Error in approving access request:', err);
      triggerNotification('Ocurrió un error al procesar la aprobación.');
    } finally {
      setApprovalLoading(false);
    }
  };

  const getServiceGroup = (service: any) => {
    if (!service || !service.id) return 'cabello';
    const id = service.id.toLowerCase();
    const name = (service.name || '').toLowerCase();
    
    if (id.includes('combo') || name.includes('+') || name.includes('y barba') || name.includes('& barba')) {
      return 'completo';
    }
    if (id.includes('barba') || id.includes('rasurado') || id.includes('perfilado') || name.includes('barba') || name.includes('afeitado') || name.includes('perfilado')) {
      return 'barba';
    }
    return 'cabello';
  };

  const resetServiceForm = () => {
    setServiceFormName('');
    setServiceFormPrice('');
    setServiceFormDuration('30 min');
    setServiceFormDescription('');
    setServiceFormSpecialists([]);
    setServiceFormGroup('cabello');
    setEditingService(null);
    setServiceFormSubmitted(false);
  };

  const populateServiceForm = (service: any) => {
    setEditingService(service);
    setServiceFormName(service.name);
    setServiceFormPrice(service.price);
    setServiceFormDuration(service.duration);
    setServiceFormDescription(service.description);
    setServiceFormSpecialists(service.specialistIds || []);
    setServiceFormGroup(getServiceGroup(service));
    setIsServiceDrawerOpen(true);
    setServiceFormSubmitted(false);
  };

  const handleServiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServiceFormSubmitted(true);
    if (!serviceFormName || !serviceFormPrice || !serviceFormDuration) {
      triggerNotification('Por favor, completa los campos obligatorios.');
      return;
    }

    // Ensure price has $ prefix if not present
    let formattedPrice = serviceFormPrice.trim();
    if (!formattedPrice.startsWith('$')) {
      formattedPrice = '$' + formattedPrice;
    }

    // Compute prefix for barberia group
    let customId: string | undefined = undefined;
    if (activeServiceCategory === 'barberia') {
      const prefix = serviceFormGroup === 'barba' 
        ? 'b_barba_' 
        : serviceFormGroup === 'completo' 
        ? 'b_combo_' 
        : 'b_corte_';
      
      if (editingService) {
        const currentGroup = getServiceGroup(editingService);
        if (currentGroup !== serviceFormGroup) {
          // Group changed, generate new primary key ID
          customId = `${prefix}${Date.now()}`;
        }
      } else {
        // New service, generate new primary key ID
        customId = `${prefix}${Date.now()}`;
      }
    }

    const serviceDataPayload = {
      name: serviceFormName.trim(),
      price: formattedPrice,
      duration: serviceFormDuration,
      description: serviceFormDescription.trim(),
      specialistIds: serviceFormSpecialists,
      ...(customId ? { id: customId } : {})
    };

    if (editingService) {
      updateService(activeServiceCategory, editingService.id, serviceDataPayload);
      triggerNotification(`Servicio "${serviceFormName}" actualizado con éxito.`);
    } else {
      addService(activeServiceCategory, serviceDataPayload);
      triggerNotification(`Servicio "${serviceFormName}" creado con éxito.`);
    }

    setIsServiceDrawerOpen(false);
    resetServiceForm();
  };

  const resetStaffForm = () => {
    setStaffFormName('');
    setStaffFormEmail('');
    setStaffFormRole('');
    setStaffFormSpecialty('');
    setStaffFormBio('');
    setStaffFormProfileType('barber');
    setStaffFormAgendas(['barberia']);
    setStaffFormAvatar('');
    setStaffFormImageUrl('');
    setStaffFormPhone('');
    setStaffFormCountryCode('+56');
    setIsStaffCountryDropdownOpen(false);
    setStaffPhoneError('');
    setStaffFormIsActive(true);
    setEditingStaff(null);
    setStaffFormSubmitted(false);
  };

  const populateStaffForm = (staff: any) => {
    setEditingStaff(staff);
    setStaffFormName(staff.name);
    setStaffFormEmail(staff.email);
    setStaffFormRole(staff.role);
    setStaffFormSpecialty(staff.specialty);
    setStaffFormBio(staff.bio);
    setStaffFormProfileType(staff.profileType || 'barber');
    setStaffFormAgendas(staff.assignedAgendas || ['barberia']);
    setStaffFormAvatar(staff.avatar || '');
    setStaffFormImageUrl(staff.imageUrl || '');
    setStaffFormIsActive(staff.isActive !== false);

    // Parse phone number
    let code = '+56';
    let rawNum = '';
    const phoneVal = staff.phone || '';
    if (phoneVal.startsWith('+')) {
      const match = ['+56', '+54', '+51', '+57', '+34', '+52', '+598'].find(c => phoneVal.startsWith(c));
      if (match) {
        code = match;
        rawNum = phoneVal.substring(match.length);
      } else {
        rawNum = phoneVal;
      }
    } else {
      rawNum = phoneVal;
    }
    setStaffFormCountryCode(code);
    setStaffFormPhone(rawNum);
    setStaffPhoneError('');
    setIsStaffCountryDropdownOpen(false);
    setIsStaffDrawerOpen(true);
    setStaffFormSubmitted(false);
  };

  const handleStaffFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffFormSubmitted(true);
    if (!staffFormName || !staffFormEmail || !staffFormProfileType || !staffFormPhone) {
      triggerNotification('Por favor, completa los campos obligatorios.');
      return;
    }

    if (staffFormPhone.trim() && staffFormPhone.trim().length !== 9) {
      setStaffPhoneError('El teléfono debe tener exactamente 9 dígitos.');
      triggerNotification('Corrige los errores antes de guardar.');
      return;
    }

    const finalPhone = staffFormPhone.trim() ? (staffFormCountryCode + staffFormPhone.trim()) : '';

    // Determine target category based on profileType
    let primaryCategory = 'barberia';
    if (staffFormProfileType === 'estilista') primaryCategory = 'peluqueria';
    else if (staffFormProfileType === 'terapeuta') primaryCategory = 'terapias';
    else if (staffFormProfileType === 'mixto' && staffFormAgendas.length > 0) primaryCategory = staffFormAgendas[0];
    else if (staffFormProfileType === 'admin') primaryCategory = 'peluqueria'; // default

    const initials = staffFormName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    let inferredRole = staffFormRole.trim() || 'Colaborador';
    let inferredSpecialty = staffFormSpecialty.trim() || 'Especialista';

    // If creating a new staff, or if editing and the profile type changed, infer it
    if (!editingStaff || (editingStaff && editingStaff.profileType !== staffFormProfileType)) {
      if (staffFormProfileType === 'barber') {
        inferredRole = 'Barbero';
        inferredSpecialty = 'Barbería';
      } else if (staffFormProfileType === 'estilista') {
        inferredRole = 'Estilista';
        inferredSpecialty = 'Estilismo';
      } else if (staffFormProfileType === 'terapeuta') {
        inferredRole = 'Terapeuta';
        inferredSpecialty = 'Terapias Holísticas';
      } else if (staffFormProfileType === 'mixto') {
        inferredRole = 'Especialista';
        inferredSpecialty = 'Multidisciplinario';
      } else if (staffFormProfileType === 'admin') {
        inferredRole = 'Administrador';
        inferredSpecialty = 'Gestión';
      }
    }

    const staffPayload = {
      name: staffFormName.trim(),
      email: staffFormEmail.trim(),
      role: inferredRole,
      specialty: inferredSpecialty,
      bio: staffFormBio.trim(),
      profileType: staffFormProfileType,
      assignedAgendas: staffFormAgendas,
      avatar: staffFormAvatar.trim() || initials,
      imageUrl: staffFormImageUrl.trim(),
      phone: finalPhone,
      isActive: staffFormIsActive
    };

    if (editingStaff) {
      let found = false;
      Object.keys(servicesData).forEach(cat => {
        const hasSp = servicesData[cat].specialists.some(sp => sp.id === editingStaff.id);
        if (hasSp) {
          updateSpecialist(cat, editingStaff.id, staffPayload as any);
          found = true;
        }
      });
      if (found) {
        triggerNotification(`Profesional "${staffFormName}" actualizado con éxito.`);
      }
    } else {
      addSpecialist(primaryCategory, staffPayload as any);
      triggerNotification(`Profesional "${staffFormName}" creado con éxito.`);
    }

    setIsStaffDrawerOpen(false);
    resetStaffForm();
  };

  // Login State
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authView, setAuthView] = useState<'login' | 'reset_password' | 'request_access'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Request access state
  const [reqFirstName, setReqFirstName] = useState('');
  const [reqLastName, setReqLastName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqBusiness, setReqBusiness] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'crm' | 'giftcards' | 'vsm' | 'servicios' | 'profesionales' | 'perfil' | 'horarios'>('dashboard');

  // Prevent visual CMS on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && activeTab === 'vsm') {
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Schedule and Time Block States
  const [selectedScheduleStaffId, setSelectedScheduleStaffId] = useState<string>('');
  const [activeScheduleBusinessFilter, setActiveScheduleBusinessFilter] = useState<'todos' | 'barberia' | 'peluqueria' | 'terapias'>('todos');
  const [isScheduleStaffDropdownOpen, setIsScheduleStaffDropdownOpen] = useState(false);

  const selectedStaffObj = specialistsList.find(spec => spec.id === selectedScheduleStaffId);
  const filteredScheduleStaffList = specialistsList.filter(spec => {
    if (activeScheduleBusinessFilter === 'todos') return true;
    return spec.assignedAgendas?.includes(activeScheduleBusinessFilter as any);
  });
  const handleScheduleFilterChange = (filter: 'todos' | 'barberia' | 'peluqueria' | 'terapias') => {
    setActiveScheduleBusinessFilter(filter);
    const filtered = specialistsList.filter(spec => {
      if (filter === 'todos') return true;
      return spec.assignedAgendas?.includes(filter as any);
    });
    if (filtered.length > 0 && !filtered.some(spec => spec.id === selectedScheduleStaffId)) {
      setSelectedScheduleStaffId(filtered[0].id);
    }
  };

  // Auto-select first specialist when specialistsList is loaded
  useEffect(() => {
    if (specialistsList.length > 0 && (!selectedScheduleStaffId || !specialistsList.some(spec => spec.id === selectedScheduleStaffId))) {
      const filtered = specialistsList.filter(spec => {
        if (activeScheduleBusinessFilter === 'todos') return true;
        return spec.assignedAgendas?.includes(activeScheduleBusinessFilter as any);
      });
      if (filtered.length > 0) {
        setSelectedScheduleStaffId(filtered[0].id);
      } else {
        setSelectedScheduleStaffId(specialistsList[0].id);
      }
    }
  }, [specialistsList, selectedScheduleStaffId, activeScheduleBusinessFilter]);

  const [blockFormDate, setBlockFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [blockFormStart, setBlockFormStart] = useState('10:00');
  const [blockFormEnd, setBlockFormEnd] = useState('11:00');
  const [blockFormReason, setBlockFormReason] = useState<string>('Asunto Personal');
  const [activeScheduleSubTab, setActiveScheduleSubTab] = useState<'jornadas' | 'bloqueos'>('jornadas');
  const [blockToDelete, setBlockToDelete] = useState<{ id: string; date: string; reason: string; startTime: string; endTime: string } | null>(null);
  
  // Booking Sub-tabs State
  const [activeBusinessTab, setActiveBusinessTab] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  
  // Dashboard Filtering States
  const [dbDateFilter, setDbDateFilter] = useState<'hoy' | 'semana' | 'mes' | 'personalizado'>('hoy');
  const [dbStartDate, setDbStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [dbEndDate, setDbEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [dbBusinessFilter, setDbBusinessFilter] = useState<'todos' | 'barberia' | 'peluqueria' | 'terapias'>('todos');
  const [dbServiceFilter, setDbServiceFilter] = useState<string>('todos');
  
  // CRM Search & Filter State
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilter, setCrmFilter] = useState<'todos' | 'barberia' | 'peluqueria' | 'terapias' | 'crossover'>('todos');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  // VSM Selected Page State
  const [vsmPage, setVsmPage] = useState<'home' | 'barberia' | 'peluqueria' | 'terapias' | 'peluqueria-gallery'>('home');
  const [notification, setNotification] = useState<string | null>(null);

  // Mobile Navigation Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Manual Booking Modal State
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [prefillSpecialistId, setPrefillSpecialistId] = useState<string | undefined>(undefined);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [prefillTime, setPrefillTime] = useState<string | undefined>(undefined);

  // Agenda Filter States
  const [agendaViewMode, setAgendaViewMode] = useState<'hoy' | 'manana' | 'semana' | 'prox_semana' | 'fecha'>('hoy');
  const [agendaCustomDate, setAgendaCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeSpecialistFilter, setActiveSpecialistFilter] = useState<string>('all');

  const [profileName, setProfileName] = useState('Sofia Valente');
  const [profileRole, setProfileRole] = useState('Directora de Operaciones');
  const [profileEmail, setProfileEmail] = useState('sofia.valente@valentes.cl');
  const [newPassword, setNewPassword] = useState('');
  const [profilePhoneCode, setProfilePhoneCode] = useState('+56');
  const [profilePhoneNum, setProfilePhoneNum] = useState('');
  const [profilePhoneError, setProfilePhoneError] = useState<string | null>(null);
  const [isProfilePhoneDropdownOpen, setIsProfilePhoneDropdownOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmBtnClass?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 shadow-red-900/20',
    onConfirm: () => {}
  });

  // Synchronize profile form states when currentUser changes (e.g. upon login or edit)
  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileRole(currentUser.role || '');
      setProfileEmail(currentUser.email || '');
      
      const phoneStr = currentUser.phone || '';
      if (phoneStr.startsWith('+')) {
        const parts = phoneStr.split(' ');
        if (parts.length >= 2) {
          setProfilePhoneCode(parts[0]);
          setProfilePhoneNum(parts.slice(1).join('').replace(/\D/g, '').substring(0, 9));
        } else {
          setProfilePhoneCode('+56');
          setProfilePhoneNum(phoneStr.replace(/\D/g, '').substring(0, 9));
        }
      } else {
        setProfilePhoneCode('+56');
        setProfilePhoneNum(phoneStr.replace(/\D/g, '').substring(0, 9));
      }
    }
  }, [currentUser]);

  // Gift Cards tab states
  const { giftCards, buyGiftCard } = useGiftCardStore();
  const [giftCardTabFilter, setGiftCardTabFilter] = useState<'todas' | 'activas' | 'vencidas' | 'sin_saldo'>('todas');
  const [isEmitModalOpen, setIsEmitModalOpen] = useState(false);

  // Manual emission form states
  const [emitAmount, setEmitAmount] = useState<number>(30000);
  const [emitTheme, setEmitTheme] = useState<'barberia' | 'peluqueria' | 'terapias' | 'santuario'>('santuario');
  const [emitRecipientName, setEmitRecipientName] = useState('');
  const [emitRecipientEmail, setEmitRecipientEmail] = useState('');
  const [emitSenderName, setEmitSenderName] = useState('');
  const [emitSenderEmail, setEmitSenderEmail] = useState('');
  const [emitMessage, setEmitMessage] = useState('');
  const [isEmitting, setIsEmitting] = useState(false);

  // Stores
  const { bookings, clients, addBooking, updateBookingStatus, deleteBooking, updateClientNotes, markAsNotGoodClient, deleteClient, updateClient } = useBookingStore();
  const { content, updateContent } = useContentStore();

  // Filter Bookings by active business tab
  const filteredBookings = bookings.filter(b => b.category === activeBusinessTab);

  // Temporary local VSM form state (initialized to content values)
  const [vsmForm, setVsmForm] = useState(content);
  
  // Keep local VSM form state in sync with store changes
  useEffect(() => {
    setVsmForm(content);
  }, [content]);

  const [vsmPeluEntered, setVsmPeluEntered] = useState(false);
  const [vsmPeluGalleryOpen, setVsmPeluGalleryOpen] = useState(false);
  const [vsmPeluSpecialistsOpen, setVsmPeluSpecialistsOpen] = useState(false);
  const [vsmPeluServicesOpen, setVsmPeluServicesOpen] = useState(false);
  const [vsmViewMode, setVsmViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [editingAsset, setEditingAsset] = useState<{ page: string; key: string; label: string; currentValue: string; itemId?: string } | null>(null);
  const [mediaEditorType, setMediaEditorType] = useState<'image' | 'video'>('image');
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [vsmFullscreen, setVsmFullscreen] = useState(false);
  const [vsmGalleryIdx, setVsmGalleryIdx] = useState(0);

  useEffect(() => {
    if (editingAsset) {
      const isVideo = isVideoUrl(editingAsset.currentValue) || editingAsset.key.toLowerCase().includes('video');
      setMediaEditorType(isVideo ? 'video' : 'image');
    }
  }, [editingAsset?.page, editingAsset?.key, editingAsset?.itemId]);

  // Check active session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const email = session.user.email;
          
          if (session.user.user_metadata?.require_password_change === true) {
            setRequirePasswordChange(true);
          }

          // Resolve specialist profile
          const allSpecialists = Object.keys(servicesData).flatMap(cat => servicesData[cat].specialists);
          const matchedSp = allSpecialists.find(sp => sp.email.toLowerCase() === email?.toLowerCase());

          if (matchedSp) {
            const userWithPhone = {
              ...matchedSp,
              phone: matchedSp.phone || undefined
            };
            setCurrentUser(userWithPhone);
            if (matchedSp.assignedAgendas && matchedSp.assignedAgendas.length > 0) {
              setActiveBusinessTab(matchedSp.assignedAgendas[0]);
            }
            setIsLoggedIn((prevLoggedIn) => {
              if (!prevLoggedIn) {
                if (matchedSp.profileType !== 'admin') {
                  setActiveTab('agenda');
                } else {
                  setActiveTab('dashboard');
                }
              }
              return true;
            });
            if (matchedSp.profileType === 'admin') {
              fetchPendingRequests();
            }
          } else {
            // Fallback to Administrator for custom emails like the user's
            const isAdminEmail = email?.toLowerCase() === 'ialarconr.684@gmail.com';
            setCurrentUser({
              id: 'admin',
              name: isAdminEmail ? 'Ignacio Alarcón' : 'Administrador',
              email: email || '',
              phone: isAdminEmail ? '+56953332492' : undefined,
              profileType: 'admin',
              assignedAgendas: ['barberia', 'peluqueria', 'terapias'],
              role: 'Administrador Principal',
              avatar: isAdminEmail ? 'IA' : 'AD'
            });
            setIsLoggedIn((prevLoggedIn) => {
              if (!prevLoggedIn) {
                setActiveTab('dashboard');
              }
              return true;
            });
            fetchPendingRequests();
          }
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, [servicesData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password: password.trim()
      });

      if (error) {
        triggerNotification(`Error de acceso: ${error.message}`);
        setAuthLoading(false);
        return;
      }

      if (data?.user) {
        const email = data.user.email;
        
        if (data.user.user_metadata?.require_password_change === true) {
          setRequirePasswordChange(true);
        }

        // Resolve profile
        const allSpecialists = Object.keys(servicesData).flatMap(cat => servicesData[cat].specialists);
        const matchedSp = allSpecialists.find(sp => sp.email.toLowerCase() === email?.toLowerCase());

        if (matchedSp) {
          const userWithPhone = {
            ...matchedSp,
            phone: matchedSp.email.toLowerCase() === 'ialarconr.684@gmail.com' ? '+56953332492' : undefined
          };
          setCurrentUser(userWithPhone);
          setIsLoggedIn(true);
          if (matchedSp.assignedAgendas && matchedSp.assignedAgendas.length > 0) {
            setActiveBusinessTab(matchedSp.assignedAgendas[0]);
          }
          if (matchedSp.profileType !== 'admin') {
            setActiveTab('agenda');
          } else {
            setActiveTab('dashboard');
          }
          if (matchedSp.profileType === 'admin') {
            fetchPendingRequests();
          }
          triggerNotification(`Sesión iniciada como ${matchedSp.name} (${matchedSp.profileType.toUpperCase()}).`);
        } else {
          const isAdminEmail = username.trim().toLowerCase() === 'ialarconr.684@gmail.com';
          setCurrentUser({
            id: 'admin',
            name: isAdminEmail ? 'Ignacio Alarcón' : 'Administrador',
            email: username.trim(),
            phone: isAdminEmail ? '+56953332492' : undefined,
            profileType: 'admin',
            assignedAgendas: ['barberia', 'peluqueria', 'terapias'],
            role: 'Administrador Principal',
            avatar: isAdminEmail ? 'IA' : 'AD'
          });
          setIsLoggedIn(true);
          setActiveTab('dashboard');
          fetchPendingRequests();
          triggerNotification('Sesión iniciada como Administrador Principal.');
        }
      }
    } catch (err: any) {
      triggerNotification(`Error al conectar con el servidor.`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setAuthLoading(true);
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUsername('');
      setPassword('');
      triggerNotification('Sesión cerrada con éxito.');
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      triggerNotification('Por favor, ingresa tu correo electrónico.');
      return;
    }
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/admin`
      });
      if (error) {
        triggerNotification(`Error: ${error.message}`);
      } else {
        triggerNotification('Enlace de recuperación enviado a tu correo.');
        setAuthView('login');
      }
    } catch (err) {
      triggerNotification('Error al conectar con el servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFirstName || !reqLastName || !reqPhoneNumber || !reqEmail || !reqBusiness) {
      triggerNotification('Por favor, completa todos los campos.');
      return;
    }
    if (reqPhoneNumber.length !== 9) {
      triggerNotification('El número de teléfono debe tener exactamente 9 dígitos.');
      return;
    }

    try {
      setAuthLoading(true);
      const fullPhone = `${reqCountryCode} ${reqPhoneNumber}`;
      const { error } = await supabase.from('access_requests').insert({
        first_name: reqFirstName.trim(),
        last_name: reqLastName.trim(),
        phone: fullPhone,
        email: reqEmail.trim(),
        business: reqBusiness
      });

      if (error) {
        console.warn('access_requests table might not exist:', error.message);
      }
      setShowRequestSuccessModal(true);
      
      setReqFirstName('');
      setReqLastName('');
      setReqPhoneNumber('');
      setReqCountryCode('+56');
      setReqEmail('');
      setReqBusiness('barberia');
    } catch (err) {
      triggerNotification('Error al conectar con el servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFormSubmitted(true);
    if (!profileName || !profileEmail || !profileRole) {
      triggerNotification('Por favor, completa los campos obligatorios.');
      return;
    }

    if (profilePhoneNum.length !== 9) {
      setProfilePhoneError('El número de teléfono debe tener exactamente 9 dígitos.');
      triggerNotification('Por favor, ingresa un número de teléfono válido.');
      return;
    }
    setProfilePhoneError(null);

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden.');
        triggerNotification('Las contraseñas no coinciden.');
        return;
      }
      setPasswordError(null);
    }

    if (currentUser) {
      const fullPhone = `${profilePhoneCode} ${profilePhoneNum}`;
      const updatedUser = {
        ...currentUser,
        name: profileName,
        role: profileRole,
        email: profileEmail,
        phone: fullPhone,
        avatar: profileName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
      };
      setCurrentUser(updatedUser);

      // If not admin, update in the specialists store as well!
      if (currentUser.id !== 'admin') {
        Object.keys(servicesData).forEach(cat => {
          const hasSp = servicesData[cat].specialists.some(sp => sp.id === currentUser.id);
          if (hasSp) {
            updateSpecialist(cat, currentUser.id, {
              name: profileName,
              role: profileRole,
              email: profileEmail,
              phone: fullPhone,
              avatar: updatedUser.avatar
            });
          }
        });
      }
      setNewPassword('');
      setConfirmPassword('');
      triggerNotification('Perfil actualizado con éxito.');
    }
  };

  const handleProfileResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      triggerNotification('Por favor, escribe y confirma la nueva contraseña.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      triggerNotification('Las contraseñas no coinciden.');
      return;
    }
    setPasswordError(null);

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        password: newPassword
      };
      setCurrentUser(updatedUser);
      setNewPassword('');
      setConfirmPassword('');
      triggerNotification('Contraseña restablecida con éxito.');
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const optimizeAndUploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Fallo al comprimir la imagen'));
                return;
              }

              try {
                const formData = new FormData();
                formData.append('file', blob, 'image.jpg');
                const publicUrl = await uploadImageAction(formData);
                resolve(publicUrl);
              } catch (uploadError) {
                reject(uploadError);
              }
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  };

  const handleVsmSave = async () => {
    try {
      const sections: ('home' | 'barberia' | 'peluqueria' | 'terapias')[] = ['home', 'barberia', 'peluqueria', 'terapias'];
      let updatedCount = 0;
      
      for (const section of sections) {
        const localSectionData = vsmForm[section];
        const storeSectionData = content[section];
        
        if (JSON.stringify(localSectionData) !== JSON.stringify(storeSectionData)) {
          await updateContent(section, localSectionData);
          updatedCount++;
        }
      }
      
      if (updatedCount > 0) {
        triggerNotification(`¡Sitio web publicado con éxito! (${updatedCount} pág. actualizadas)`);
      } else {
        triggerNotification('No hay cambios pendientes para publicar.');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Error al publicar los cambios en el sitio web.');
    }
  };

  const handleGalleryItemChange = (id: string, field: string, value: string) => {
    setVsmForm(prev => {
      const items = prev.peluqueria.galleryItems || [];
      const updatedItems = items.map(item => item.id === id ? { ...item, [field]: value } : item);
      return {
        ...prev,
        peluqueria: {
          ...prev.peluqueria,
          galleryItems: updatedItems
        }
      };
    });
  };

  const handleGalleryItemDelete = (id: string) => {
    setVsmForm(prev => {
      const items = prev.peluqueria.galleryItems || [];
      const updatedItems = items.filter(item => item.id !== id);
      return {
        ...prev,
        peluqueria: {
          ...prev.peluqueria,
          galleryItems: updatedItems
        }
      };
    });
  };

  const handleGalleryItemAdd = () => {
    const newId = `g_new_${Date.now()}`;
    const newWork = {
      id: newId,
      title: 'Nuevo Trabajo',
      technique: 'Descripción del servicio realizado.',
      stylist: 'Sofia Valente',
      duration: '60 min',
      price: '$30.000',
      imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80'
    };
    setVsmForm(prev => {
      const items = prev.peluqueria.galleryItems || [];
      return {
        ...prev,
        peluqueria: {
          ...prev.peluqueria,
          galleryItems: [...items, newWork]
        }
      };
    });
  };

  const handleVsmInputChange = (field: string, value: string) => {
    if (vsmPage === 'peluqueria-gallery') return;
    setVsmForm(prev => ({
      ...prev,
      [vsmPage]: {
        ...prev[vsmPage],
        [field]: value
      }
    }));
  };

  const renderEditableText = (page: 'home' | 'barberia' | 'peluqueria' | 'terapias', key: string, value: string, className: string) => {
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const val = e.currentTarget.innerText;
          setVsmForm(prev => ({
            ...prev,
            [page]: {
              ...prev[page],
              [key]: val
            }
          }));
        }}
        className={`${className} outline-none hover:bg-white/10 hover:ring-1 hover:ring-gold/30 focus:bg-white/5 focus:ring-1 focus:ring-gold px-1 rounded transition-all cursor-text`}
      >
        {value}
      </span>
    );
  };

  const renderEditableGalleryText = (itemId: string, field: string, value: string, className: string) => {
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const val = e.currentTarget.innerText;
          handleGalleryItemChange(itemId, field, val);
        }}
        className={`${className} outline-none hover:bg-white/10 hover:ring-1 hover:ring-gold/30 focus:bg-white/5 focus:ring-1 focus:ring-gold px-1 rounded transition-all cursor-text inline-block`}
      >
        {value}
      </span>
    );
  };

  const renderEditableImage = (page: 'home' | 'barberia' | 'peluqueria' | 'terapias', key: string, label: string, currentValue: string) => {
    return (
      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditingAsset({ page, key, label, currentValue });
          }}
          className="bg-black/80 hover:bg-gold hover:text-black border border-white/10 text-white rounded-full px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-lg"
        >
          <Camera size={10} />
          <span>Cambiar Imagen</span>
        </button>
      </div>
    );
  };

  // Helpers to format card labels dynamically based on current date
  const getFormattedDate = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  };

  const formatDateToDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const renderClientDetailContent = (client: any) => {
    const clientBookings = bookings.filter(
      b => b.clientPhone === client.phone && (b.status as string) !== 'bloqueado'
    ).sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.time.localeCompare(a.time);
    });

    return (
      <div className="space-y-6 text-left pt-2">
        {/* Avatar & Basic Info */}
        <div className="text-center space-y-3 pb-6 border-b border-white/5 relative group/detail">
          <div className="absolute right-0 top-0 flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setClientToEdit(client);
                setEditClientName(client.name || '');
                const rawPhone = client.phone || '';
                let parsedCountryCode = '+56';
                let parsedPhone = rawPhone.replace(/\s+/g, '');
                const countries = [
                  { code: '+56', label: 'Chile (+56)' },
                  { code: '+54', label: 'Argentina (+54)' },
                  { code: '+51', label: 'Perú (+51)' },
                  { code: '+57', label: 'Colombia (+57)' },
                  { code: '+34', label: 'España (+34)' },
                  { code: '+52', label: 'México (+52)' },
                  { code: '+598', label: 'Uruguay (+598)' },
                ];
                const matchedCountry = countries.find(c => parsedPhone.startsWith(c.code));
                if (matchedCountry) {
                  parsedCountryCode = matchedCountry.code;
                  parsedPhone = parsedPhone.substring(matchedCountry.code.length);
                } else if (parsedPhone.startsWith('+')) {
                  if (parsedPhone.length > 9) {
                    parsedCountryCode = parsedPhone.substring(0, parsedPhone.length - 9);
                    parsedPhone = parsedPhone.substring(parsedPhone.length - 9);
                  }
                }
                setCountryCode(parsedCountryCode);
                setEditClientPhone(parsedPhone.replace(/\D/g, ''));
                setPhoneError('');
                setEditClientEmail(client.email || '');
                setIsEditingClient(true);
              }}
              className="p-2 text-white/30 hover:text-gold hover:bg-gold/10 rounded-xl transition-all cursor-pointer"
              title="Editar Cliente"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setClientToDelete({ phone: client.phone, name: client.name });
              }}
              className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
              title="Eliminar Cliente"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-2xl font-bold text-gold mx-auto shadow-[inset_0_2px_12px_rgba(198,155,60,0.15)]">
            {client.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-serif text-lg text-white font-medium">{client.name}</h3>
              {client.notSoGoodClient && (
                <span className="text-[8px] uppercase font-bold tracking-widest bg-red-500/10 border border-red-500/35 text-red-400 px-2 py-0.5 rounded-full select-none animate-pulse">
                  No tan buen cliente
                </span>
              )}
            </div>
            <div className="flex items-center justify-center space-x-3 pt-1">
              <a 
                href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-emerald-400 hover:bg-emerald-500/5 hover:border-emerald-500/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
                title={`WhatsApp: ${client.phone}`}
              >
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.16 5.348 5.507 0 12.008 0c3.148.002 6.11 1.228 8.332 3.454a11.758 11.758 0 0 1 3.451 8.35c-.006 6.525-5.352 11.87-11.85 11.87-.193-.001-.387-.006-.579-.017l-5.61 1.472A1.03 1.03 0 0 1 .057 24zm6.59-4.846c1.6.95 3.6 1.455 5.362 1.456 5.4 0 9.8-4.4 9.8-9.8 0-2.613-1.018-5.07-2.868-6.92C17.09 2.038 14.63 1.02 12.01 1.02c-5.4 0-9.8 4.4-9.8 9.8.001 1.95.586 3.86 1.694 5.485l.1.15-.99 3.62 3.7-.97.14.09zm10.158-6.685c-.247-.123-1.463-.722-1.69-.804-.226-.082-.39-.123-.555.124-.165.247-.638.804-.783.969-.144.165-.29.185-.536.062-.247-.124-1.042-.384-1.986-1.226-.733-.653-1.228-1.46-1.372-1.707-.144-.247-.015-.38.109-.503.111-.11.247-.288.37-.433.124-.144.165-.247.248-.412.082-.165.04-.309-.02-.433-.062-.124-.555-1.339-.76-1.833-.2-.482-.401-.416-.554-.424-.144-.007-.31-.008-.474-.008-.165 0-.433.062-.66.309-.226.247-.865.845-.865 2.06 0 1.215.886 2.39 1.009 2.555.124.165 1.744 2.662 4.225 3.731.59.254 1.05.405 1.41.519.593.189 1.132.162 1.558.098.475-.072 1.463-.598 1.669-1.175.206-.577.206-1.071.144-1.175-.062-.103-.226-.165-.473-.288z" />
                </svg>
              </a>
              {client.email ? (
                <a 
                  href={`mailto:${client.email}`}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-gold hover:bg-gold/5 hover:border-gold/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title={`Email: ${client.email}`}
                >
                  <Mail size={13} />
                </a>
              ) : (
                <div 
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/5 text-white/20 flex items-center justify-center select-none"
                  title="Sin correo"
                >
                  <Mail size={13} className="opacity-40" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[8px] uppercase tracking-widest text-text-secondary block">Última Visita</span>
            <span className="text-xs font-semibold text-white">{formatDateToDMY(client.lastVisit)}</span>
          </div>
          <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[8px] uppercase tracking-widest text-text-secondary block">Inversión Total</span>
            <span className="text-xs font-semibold text-gold">${client.totalSpent.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Booking History */}
        <div className="space-y-3 flex flex-col flex-1">
          <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">Historial de Reservas</span>
          <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            {clientBookings.length === 0 ? (
              <p className="text-xs text-text-secondary italic">Sin reservas registradas.</p>
            ) : (
              clientBookings.map((b) => {
                const status = getCurrentBookingStatus(b.date, b.time, b.status, b.specialistName);
                let statusStyles = '';
                if (status === 'Finalizado') {
                  statusStyles = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                } else if (status === 'En Proceso') {
                  statusStyles = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
                } else if (status === 'Espera') {
                  statusStyles = 'bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse';
                } else if (status === 'proximo') {
                  statusStyles = 'bg-blue-500/10 border-blue-500/25 text-blue-400';
                } else {
                  statusStyles = 'bg-gold/10 border-gold/25 text-gold';
                }

                return (
                  <div 
                    key={b.id} 
                    className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2 transition-all"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-white text-[11px] leading-snug">{b.serviceName}</h4>
                        <p className="text-[9px] text-text-secondary">{b.specialistName}</p>
                      </div>
                      <span className={`text-[8px] uppercase tracking-wider font-bold border px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles}`}>
                        {status === 'Finalizado' ? 'Pagado' : status === 'Espera' ? 'Espera' : status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-text-secondary border-t border-white/5 pt-1.5 font-mono">
                      <span>{formatDateToDMY(b.date)} • {b.time} hrs</span>
                      <span className="font-semibold text-white">{b.price}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Creative Cross-Selling Campaign trigger */}
        <div className="bg-gold/5 border border-gold/15 rounded-2xl p-4.5 space-y-3.5">
          <div className="flex items-center space-x-2 text-gold">
            <Sparkles size={13} className="animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Campaña de Venta Cruzada (CRM)</span>
          </div>
          
          {client.businesses.length === 3 ? (
            <p className="text-[11px] text-emerald-400 font-light leading-relaxed">
              ¡Este cliente es un embajador unificado! Ya ha completado rituales en Barbería, Peluquería y Terapias.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-text-secondary leading-relaxed font-light">
                {client.name} aún no ha experimentado{' '}
                <span className="text-white font-semibold">
                  {!client.businesses.includes('terapias') && 'nuestras Terapias Holísticas'}
                  {client.businesses.includes('terapias') && !client.businesses.includes('peluqueria') && 'nuestra Peluquería de Autor'}
                  {client.businesses.includes('terapias') && client.businesses.includes('peluqueria') && !client.businesses.includes('barberia') && 'nuestra Barbería Tradicional'}
                </span>.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  let promo = '';
                  if (!client.businesses.includes('terapias')) promo = 'Masaje con Piedras Calientes Obsidiana con 15% DCTO';
                  else if (!client.businesses.includes('peluqueria')) promo = 'Corte de diseño capilar con 15% DCTO';
                  else promo = 'Afeitado spa con toallas de eucalipto con 15% DCTO';
                  
                  triggerNotification(`Promo enviada por WhatsApp: "${promo}"`);
                }}
                className="w-full py-2.5 rounded-full bg-gold hover:bg-gold/90 text-black text-[9px] uppercase tracking-widest font-bold transition-all flex items-center justify-center space-x-1.5 shadow"
              >
                <Plus size={11} />
                <span>Enviar Promo Cruzada (WhatsApp)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getThisWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const getNextWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const mondayNext = new Date(today);
    mondayNext.setDate(today.getDate() + diffToMonday + 7);
    const sundayNext = new Date(mondayNext);
    sundayNext.setDate(mondayNext.getDate() + 6);
    return {
      start: mondayNext.toISOString().split('T')[0],
      end: sundayNext.toISOString().split('T')[0]
    };
  };

  const formatCardDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const formatter = new Intl.DateTimeFormat('es-CL', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      return formatter.format(d).toUpperCase().replace('.', '');
    } catch (e) {
      return dateStr.toUpperCase();
    }
  };

  const formatCardRange = (startStr: string, endStr: string) => {
    try {
      const dStart = new Date(startStr + 'T00:00:00');
      const dEnd = new Date(endStr + 'T00:00:00');
      const dayStart = dStart.getDate();
      const dayEnd = dEnd.getDate();
      const monthStart = dStart.toLocaleString('es-CL', { month: 'short' }).replace('.', '');
      const monthEnd = dEnd.toLocaleString('es-CL', { month: 'short' }).replace('.', '');
      if (monthStart === monthEnd) {
        return `${dayStart} - ${dayEnd} ${monthStart}`.toUpperCase();
      } else {
        return `${dayStart} ${monthStart} - ${dayEnd} ${monthEnd}`.toUpperCase();
      }
    } catch (e) {
      return `${startStr} - ${endStr}`.toUpperCase();
    }
  };

  const getCurrentBookingStatus = (
    dateStr: string,
    timeStr: string,
    baseStatus: string,
    specialistName?: string
  ): 'reservado' | 'proximo' | 'En Proceso' | 'Finalizado' | 'bloqueado' | 'Espera' => {
    if (baseStatus === 'bloqueado') return 'bloqueado';
    if (baseStatus === 'completado') return 'Finalizado';
    if (baseStatus === 'en_proceso') return 'En Proceso';
    
    try {
      const now = new Date();
      const [hours, minutes] = timeStr.split(':').map(Number);
      const start = new Date(dateStr + 'T00:00:00');
      start.setHours(hours, minutes, 0, 0);

      // Check if there is an active "en_proceso" booking for this specialist on the same day BEFORE this booking's time.
      if (specialistName) {
        const hasActiveBefore = bookings.some(b => {
          if (b.date !== dateStr) return false;
          if (b.specialistName.trim().toLowerCase() !== specialistName.trim().toLowerCase()) return false;
          if (b.status !== 'en_proceso') return false;
          
          const bMins = localTimeToMinutes(b.time);
          const thisMins = localTimeToMinutes(timeStr);
          return bMins < thisMins;
        });

        if (hasActiveBefore) {
          return 'Espera';
        }
      }

      const diffMs = start.getTime() - now.getTime();
      const diffMins = diffMs / (1000 * 60);

      if (diffMins <= 30) {
        return 'proximo';
      } else {
        return 'reservado';
      }
    } catch (e) {
      return 'reservado';
    }
  };

  const isSingleDayMode = agendaViewMode === 'hoy' || agendaViewMode === 'manana' || agendaViewMode === 'fecha';
  const targetDate = 
    agendaViewMode === 'hoy' ? getFormattedDate(0) :
    agendaViewMode === 'manana' ? getFormattedDate(1) :
    agendaCustomDate;

  // Daily timeline grid rows computation
  const specialistsInUnit = servicesData[activeBusinessTab]?.specialists || [];
  
  // If not admin, Carlos or other staff should only see their own agenda
  const allowedSpecialists = currentUser && currentUser.profileType !== 'admin'
    ? specialistsInUnit.filter(sp => sp.id === currentUser.id || sp.email.toLowerCase() === currentUser.email.toLowerCase())
    : specialistsInUnit;

  const specialistsForView = activeSpecialistFilter === 'all' 
    ? allowedSpecialists 
    : allowedSpecialists.filter(sp => sp.id === activeSpecialistFilter);

  const localTimeToMinutes = (tStr: string) => {
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const isSlotWithinWorkShift = (specialistId: string, dateStr: string, slotTime: string) => {
    const specialistShifts = workShifts[specialistId];
    if (!specialistShifts) return true;
    
    let dayOfWeek = 1;
    try {
      if (dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        dayOfWeek = new Date(y, m - 1, d).getDay();
      }
    } catch (e) {
      console.error(e);
    }
    
    const dayShift = specialistShifts.find((s) => s.dayOfWeek === dayOfWeek);
    if (!dayShift || !dayShift.isActive) return false;
    
    const slotStart = localTimeToMinutes(slotTime);
    const slotEnd = slotStart + 30;
    
    const shiftStart = localTimeToMinutes(dayShift.startTime);
    const shiftEnd = localTimeToMinutes(dayShift.endTime);
    
    if (slotStart < shiftStart || slotEnd > shiftEnd) return false;
    
    if (dayShift.hasBreak) {
      const breakStart = localTimeToMinutes(dayShift.breakStartTime);
      const breakEnd = localTimeToMinutes(dayShift.breakEndTime);
      if (slotStart < breakEnd && slotEnd > breakStart) return false;
    }
    
    return true;
  };

  const timeSlots = (() => {
    let dayOfWeek = 1;
    try {
      if (targetDate) {
        const [y, m, d] = targetDate.split('-').map(Number);
        dayOfWeek = new Date(y, m - 1, d).getDay();
      }
    } catch (e) {
      console.error(e);
    }

    let minMins = 9 * 60;
    let maxMins = 20 * 60;

    specialistsForView.forEach(sp => {
      const shifts = workShifts[sp.id] || [];
      const dayShift = shifts.find(s => s.dayOfWeek === dayOfWeek);
      if (dayShift && dayShift.isActive) {
        const startMins = localTimeToMinutes(dayShift.startTime);
        const endMins = localTimeToMinutes(dayShift.endTime);
        if (startMins < minMins) minMins = startMins;
        if (endMins > maxMins) maxMins = endMins;
      }
    });

    bookings.forEach(b => {
      if (b.date === targetDate) {
        const matchesSpecialist = specialistsForView.some(sp => sp.name.trim().toLowerCase() === b.specialistName.trim().toLowerCase());
        if (matchesSpecialist) {
          const bookingMins = localTimeToMinutes(b.time);
          if (bookingMins < minMins) minMins = bookingMins;
          const allServices = Object.keys(servicesData).flatMap(
            cat => servicesData[cat].services || []
          );
          const bookedService = allServices.find(s => s.name.trim().toLowerCase() === b.serviceName.trim().toLowerCase());
          const bookingDuration = bookedService ? parseDurationToMinutes(bookedService.duration) : 60;
          if (bookingMins + bookingDuration > maxMins) maxMins = bookingMins + bookingDuration;
        }
      }
    });

    minMins = Math.floor(minMins / 30) * 30;
    maxMins = Math.ceil(maxMins / 30) * 30;

    const slots: string[] = [];
    for (let m = minMins; m < maxMins; m += 30) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
    
    return slots.length > 0 ? slots : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  })();

  const gridRows: { time: string; specialist: typeof specialistsInUnit[0]; booking: any | null }[] = [];

  if (isSingleDayMode) {
    timeSlots.forEach((slot, slotIndex) => {
      const currentSlotMin = localTimeToMinutes(slot);
      const nextSlotMin = slotIndex < timeSlots.length - 1 
        ? localTimeToMinutes(timeSlots[slotIndex + 1]) 
        : currentSlotMin + 30;

      specialistsForView.forEach(sp => {
        const matchedBooking = filteredBookings.find(b => {
          if (b.date !== targetDate) return false;
          if (b.specialistName.trim().toLowerCase() !== sp.name.trim().toLowerCase()) return false;
          
          const bookingMin = localTimeToMinutes(b.time);
          const allServices = Object.keys(servicesData).flatMap(
            cat => servicesData[cat].services || []
          );
          const bookedService = allServices.find(s => s.name.trim().toLowerCase() === b.serviceName.trim().toLowerCase());
          const bookingDuration = bookedService ? parseDurationToMinutes(bookedService.duration) : 60;
          const bookingEnd = bookingMin + bookingDuration;

          return currentSlotMin < bookingEnd && nextSlotMin > bookingMin;
        });

        gridRows.push({
          time: slot,
          specialist: sp,
          booking: matchedBooking || null
        });
      });
    });
  }

  // Multi-day chronological list computation
  const listBookings = !isSingleDayMode
    ? bookings.filter(b => {
        if (b.category !== activeBusinessTab) return false;
        const range = agendaViewMode === 'semana' ? getThisWeekRange() : getNextWeekRange();
        if (b.date < range.start || b.date > range.end) return false;
        
        if (currentUser && currentUser.profileType !== 'admin') {
          if (b.specialistName.trim() !== currentUser.name.trim()) return false;
        } else if (activeSpecialistFilter !== 'all') {
          const specialistObj = specialistsInUnit.find(sp => sp.id === activeSpecialistFilter);
          if (!specialistObj || b.specialistName.trim() !== specialistObj.name.trim()) return false;
        }
        return true;
      }).sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      })
    : [];

  const bookedCount = isSingleDayMode
    ? gridRows.filter(r => r.booking && (r.booking.status as string) !== 'bloqueado').length
    : listBookings.filter(b => (b.status as string) !== 'bloqueado').length;

  const getActiveStyles = (viewMode: typeof agendaViewMode) => {
    const isActive = agendaViewMode === viewMode;
    if (!isActive) return 'border-white/5 text-text-secondary bg-black/40 hover:border-white/10 hover:text-white';
    
    if (activeBusinessTab === 'barberia') {
      return 'border-gold text-gold bg-gold/10 shadow-[0_0_15px_rgba(198,155,60,0.08)] font-bold';
    } else if (activeBusinessTab === 'peluqueria') {
      return 'border-[#CD7F32] text-[#CD7F32] bg-[#CD7F32]/10 shadow-[0_0_15px_rgba(205,127,50,0.08)] font-bold';
    } else {
      return 'border-[#E2E0D8] text-[#E2E0D8] bg-[#E2E0D8]/10 shadow-[0_0_15px_rgba(226,224,216,0.08)] font-bold';
    }
  };

  // Filter CRM Clients
  const filteredClients = clients.filter(c => {
    const cleanSearch = crmSearch.toLowerCase().trim();
    const searchDigits = cleanSearch.replace(/\D/g, '');
    const clientPhoneDigits = c.phone.replace(/\D/g, '');
    
    // Check if name matches (substring match or all search terms exist in client name)
    let matchesName = c.name.toLowerCase().includes(cleanSearch);
    if (!matchesName && cleanSearch.includes(' ')) {
      const searchTerms = cleanSearch.split(/\s+/).filter(Boolean);
      matchesName = searchTerms.every(term => c.name.toLowerCase().includes(term));
    }
    
    // Check if phone matches (digit substring search)
    const matchesPhone = searchDigits !== '' && clientPhoneDigits.includes(searchDigits);
    
    // Check if email matches
    const matchesEmail = c.email && c.email.toLowerCase().includes(cleanSearch);
    
    const matchesSearch = matchesName || matchesPhone || matchesEmail;
    
    if (!matchesSearch) return false;
    
    if (crmFilter === 'todos') return true;
    if (crmFilter === 'crossover') return c.businesses.length > 1;
    return c.businesses.includes(crmFilter as any);
  });

  // Calculate Metrics for Dashboard based on filters
  const todayStr = new Date().toISOString().split('T')[0];
  let filterStartDate = '';
  let filterEndDate = todayStr;

  if (dbDateFilter === 'hoy') {
    filterStartDate = todayStr;
    filterEndDate = todayStr;
  } else if (dbDateFilter === 'semana') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    filterStartDate = d.toISOString().split('T')[0];
  } else if (dbDateFilter === 'mes') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    filterStartDate = d.toISOString().split('T')[0];
  } else if (dbDateFilter === 'personalizado') {
    filterStartDate = dbStartDate;
    filterEndDate = dbEndDate;
  }

  const formattedDateRangeText = (() => {
    if (dbDateFilter === 'hoy') {
      return `Hoy (${formatDateLabel(todayStr)})`;
    }
    if (dbDateFilter === 'semana') {
      return `Últimos 7 días (${formatDateLabel(filterStartDate)} al ${formatDateLabel(filterEndDate)})`;
    }
    if (dbDateFilter === 'mes') {
      return `Últimos 30 días (${formatDateLabel(filterStartDate)} al ${formatDateLabel(filterEndDate)})`;
    }
    if (dbDateFilter === 'personalizado') {
      return `Rango personalizado (${formatDateLabel(filterStartDate)} al ${formatDateLabel(filterEndDate)})`;
    }
    return '';
  })();


  // Filter bookings for dashboard metrics and graphs
  const dashboardBookings = bookings.filter(b => {
    const matchesDate = b.date >= filterStartDate && b.date <= filterEndDate;
    if (!matchesDate) return false;

    const matchesBusiness = dbBusinessFilter === 'todos' || b.category === dbBusinessFilter;
    if (!matchesBusiness) return false;

    const matchesService = dbServiceFilter === 'todos' || b.serviceName === dbServiceFilter;
    if (!matchesService) return false;

    return true;
  });

  const totalBookings = dashboardBookings.length;
  const totalRevenue = dashboardBookings.reduce((sum, b) => {
    const priceVal = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0;
    return sum + priceVal;
  }, 0);
  const averageTicket = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  // Calculate previous period for growth comparison
  let prevStartDate = '';
  let prevEndDate = '';
  const todayDateObj = new Date();
  const todayStrOnly = todayDateObj.toISOString().split('T')[0];
  
  if (dbDateFilter === 'hoy') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterdayStr = d.toISOString().split('T')[0];
    prevStartDate = yesterdayStr;
    prevEndDate = yesterdayStr;
  } else if (dbDateFilter === 'semana') {
    const dStart = new Date();
    dStart.setDate(dStart.getDate() - 14);
    const dEnd = new Date();
    dEnd.setDate(dEnd.getDate() - 8);
    prevStartDate = dStart.toISOString().split('T')[0];
    prevEndDate = dEnd.toISOString().split('T')[0];
  } else if (dbDateFilter === 'mes') {
    const dStart = new Date();
    dStart.setDate(dStart.getDate() - 60);
    const dEnd = new Date();
    dEnd.setDate(dEnd.getDate() - 31);
    prevStartDate = dStart.toISOString().split('T')[0];
    prevEndDate = dEnd.toISOString().split('T')[0];
  } else if (dbDateFilter === 'personalizado' && dbStartDate && dbEndDate) {
    const startMs = new Date(dbStartDate).getTime();
    const endMs = new Date(dbEndDate).getTime();
    const diff = endMs - startMs;
    prevEndDate = new Date(startMs - 86400000).toISOString().split('T')[0];
    prevStartDate = new Date(startMs - 86400000 - diff).toISOString().split('T')[0];
  }

  const prevPeriodBookings = prevStartDate ? bookings.filter(b => {
    const matchesDate = b.date >= prevStartDate && b.date <= prevEndDate;
    if (!matchesDate) return false;

    const matchesBusiness = dbBusinessFilter === 'todos' || b.category === dbBusinessFilter;
    if (!matchesBusiness) return false;

    const matchesService = dbServiceFilter === 'todos' || b.serviceName === dbServiceFilter;
    if (!matchesService) return false;

    return true;
  }) : [];

  const prevRevenue = prevPeriodBookings.reduce((sum, b) => {
    const priceVal = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0;
    return sum + priceVal;
  }, 0);
  const prevBookingsCount = prevPeriodBookings.length;
  const prevAverageTicket = prevBookingsCount > 0 ? Math.round(prevRevenue / prevBookingsCount) : 0;

  // Formatting helper for diff percentages
  const formatDiff = (current: number, prev: number) => {
    if (prev === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const percent = ((current - prev) / prev) * 100;
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  const revenueDiff = formatDiff(totalRevenue, prevRevenue);
  const bookingsDiff = formatDiff(totalBookings, prevBookingsCount);
  const ticketDiff = formatDiff(averageTicket, prevAverageTicket);

  // Dynamic retention rate
  const uniqueClientsWithMultipleBookings = Object.values(
    bookings.reduce((acc, b) => {
      if ((b.status as string) !== 'bloqueado') {
        acc[b.clientPhone] = (acc[b.clientPhone] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).filter(count => count >= 2).length;

  const totalUniqueClients = new Set(
    bookings.filter(b => (b.status as string) !== 'bloqueado').map(b => b.clientPhone)
  ).size;

  const retentionRate = totalUniqueClients > 0 
    ? Math.round((uniqueClientsWithMultipleBookings / totalUniqueClients) * 100) 
    : 0;

  const prevUniqueClientsWithMultipleBookings = Object.values(
    prevPeriodBookings.reduce((acc, b) => {
      if ((b.status as string) !== 'bloqueado') {
        acc[b.clientPhone] = (acc[b.clientPhone] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).filter(count => count >= 2).length;

  const prevTotalUniqueClients = new Set(
    prevPeriodBookings.filter(b => (b.status as string) !== 'bloqueado').map(b => b.clientPhone)
  ).size;

  const prevRetentionRate = prevTotalUniqueClients > 0 
    ? Math.round((prevUniqueClientsWithMultipleBookings / prevTotalUniqueClients) * 100) 
    : 0;

  const retentionDiff = formatDiff(retentionRate, prevRetentionRate);

  // Channels count
  const webBookingsCount = dashboardBookings.filter(b => b.channel === 'Web').length;
  const waBookingsCount = dashboardBookings.filter(b => b.channel === 'WhatsApp').length;
  const walkinBookingsCount = dashboardBookings.filter(b => b.channel === 'Presencial').length;
  
  const totalChannels = webBookingsCount + waBookingsCount + walkinBookingsCount;
  const webPct = totalChannels > 0 ? Math.round((webBookingsCount / totalChannels) * 100) : 0;
  const waPct = totalChannels > 0 ? Math.round((waBookingsCount / totalChannels) * 100) : 0;
  const walkinPct = totalChannels > 0 ? Math.round((walkinBookingsCount / totalChannels) * 100) : 0;

  // Function to generate dynamic trend data
  const getTrendData = () => {
    if (dbDateFilter === 'hoy') {
      const hours = ['09:00', '12:00', '15:00', '18:00', '21:00'];
      const data = hours.map(h => {
        const hVal = parseInt(h.split(':')[0], 10);
        return dashboardBookings.reduce((sum, b) => {
          const bHour = parseInt(b.time.split(':')[0], 10);
          if (b.date === todayStr && bHour >= hVal - 1 && bHour < hVal + 2) {
            const priceVal = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0;
            return sum + priceVal;
          }
          return sum;
        }, 0);
      });
      return { labels: ['09:00', '12:00', '15:00', '18:00', '21:00'], data };
    }
    
    if (dbDateFilter === 'semana') {
      const days = [];
      const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          dateStr: d.toISOString().split('T')[0],
          label: weekdayNames[d.getDay()]
        });
      }
      const data = days.map(day => {
        return dashboardBookings.reduce((sum, b) => {
          if (b.date === day.dateStr) {
            const priceVal = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0;
            return sum + priceVal;
          }
          return sum;
        }, 0);
      });
      return { labels: days.map(d => d.label), data };
    }
    
    if (dbDateFilter === 'mes') {
      const intervals = [];
      for (let i = 5; i >= 0; i--) {
        const dEnd = new Date();
        dEnd.setDate(dEnd.getDate() - i * 5);
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - 4);
        
        const endStr = dEnd.toISOString().split('T')[0];
        const startStr = dStart.toISOString().split('T')[0];
        
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const label = `${dStart.getDate()} - ${dEnd.getDate()} ${months[dEnd.getMonth()]}`;
        intervals.push({ startStr, endStr, label });
      }
      const data = intervals.map(interval => {
        return dashboardBookings.reduce((sum, b) => {
          if (b.date >= interval.startStr && b.date <= interval.endStr) {
            const priceVal = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0;
            return sum + priceVal;
          }
          return sum;
        }, 0);
      });
      return { labels: intervals.map(i => i.label), data };
    }
    
    // Custom date filter
    const start = new Date(dbStartDate);
    const end = new Date(dbEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays <= 7) {
      const days = [];
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let i = 0; i < diffDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push({
          dateStr: d.toISOString().split('T')[0],
          label: `${d.getDate()} ${months[d.getMonth()]}`
        });
      }
      const data = days.map(day => {
        return dashboardBookings.reduce((sum, b) => {
          if (b.date === day.dateStr) {
            const priceVal = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0;
            return sum + priceVal;
          }
          return sum;
        }, 0);
      });
      return { labels: days.map(d => d.label), data };
    } else {
      const intervals = [];
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const step = Math.floor(diffDays / 5) || 1;
      for (let i = 0; i < 5; i++) {
        const dStart = new Date(start);
        dStart.setDate(dStart.getDate() + i * step);
        const dEnd = new Date(start);
        dEnd.setDate(dEnd.getDate() + (i + 1) * step - 1);
        const finalEnd = dEnd > end ? end : dEnd;
        
        const startStr = dStart.toISOString().split('T')[0];
        const endStr = finalEnd.toISOString().split('T')[0];
        const label = `${dStart.getDate()} ${months[dStart.getMonth()]} - ${finalEnd.getDate()} ${months[finalEnd.getMonth()]}`;
        intervals.push({ startStr, endStr, label });
      }
      const data = intervals.map(interval => {
        return dashboardBookings.reduce((sum, b) => {
          if (b.date >= interval.startStr && b.date <= interval.endStr) {
            const priceVal = parseInt(b.price.replace(/[^0-9]/g, ''), 10) || 0;
            return sum + priceVal;
          }
          return sum;
        }, 0);
      });
      return { labels: intervals.map(i => i.label), data };
    }
  };

  const trend = getTrendData();
  const maxTrendVal = trend.data.length > 0 ? Math.max(...trend.data, 10000) : 10000;
  const svgPoints = trend.data.map((val, idx) => {
    const x = trend.data.length > 1 ? (idx / (trend.data.length - 1)) * 500 : 250;
    const y = 130 - (val / maxTrendVal) * 100;
    return { x, y, val };
  });

  const pathD = svgPoints.length > 0
    ? `M ${svgPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`
    : 'M 0 130 L 500 130';
  
  const areaD = svgPoints.length > 0
    ? `${pathD} L ${svgPoints[svgPoints.length - 1].x} 135 L ${svgPoints[0].x} 135 Z`
    : 'M 0 130 L 500 130 L 500 135 L 0 135 Z';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] uppercase tracking-widest text-gold font-light">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-bronze/5 rounded-full blur-[120px] pointer-events-none" />
        
        <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2 text-xs uppercase tracking-widest text-white/50 hover:text-gold transition-colors z-20">
          <ArrowLeft size={14} />
          <span>Volver al sitio</span>
        </Link>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-[#121212]/75 backdrop-blur-xl border border-gold/15 rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 text-center space-y-8"
        >
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-[0.4em] text-gold font-semibold block">SANTUARIO DE BIENESTAR</span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-[0.15em] md:tracking-[0.2em] text-white">
              {authView === 'login' && 'ADMINISTRACIÓN'}
              {authView === 'reset_password' && 'RECUPERAR'}
              {authView === 'request_access' && 'SOLICITAR ACCESO'}
            </h1>
            <p className="text-xs text-text-secondary font-light max-w-[280px] mx-auto leading-relaxed">
              {authView === 'login' && 'Ingresa tus credenciales para acceder a la consola administrativa de los 3 negocios.'}
              {authView === 'reset_password' && 'Ingresa tu correo para recibir un enlace de recuperación de contraseña.'}
              {authView === 'request_access' && 'Completa el formulario para solicitar credenciales de acceso al panel.'}
            </p>
          </div>

          {authView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 text-left">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Usuario / Correo</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border-b border-white/10 text-white py-3 px-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                  placeholder="admin@valentes.cl"
                  required
                />
              </div>

              <div className="space-y-1 relative">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Contraseña</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border-b border-white/10 text-white py-3 pr-10 pl-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-gold transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/5 flex items-center justify-center space-x-2 shimmer-button"
              >
                <UserCheck size={14} />
                <span>Acceder al Panel</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={() => setAuthView('reset_password')}
                  className="text-[10px] text-white/50 hover:text-gold transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <button
                  type="button"
                  onClick={() => setAuthView('request_access')}
                  className="text-[10px] text-white/50 hover:text-gold transition-colors font-semibold cursor-pointer"
                >
                  Solicitar acceso
                </button>
              </div>
            </form>
          )}

          {authView === 'reset_password' && (
            <div className="space-y-4 text-left animate-fadeIn">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-black/40 border-b border-white/10 text-white py-3 px-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                className="w-full mt-4 py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/5 flex items-center justify-center space-x-2"
              >
                <Mail size={14} />
                <span>Enviar enlace de recuperación</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthView('login')}
                className="w-full text-center text-xs text-white/50 hover:text-gold transition-colors mt-2 cursor-pointer"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          {authView === 'request_access' && (
            <form onSubmit={handleRequestAccess} className="space-y-4 text-left animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Nombre</label>
                  <input 
                    type="text" 
                    value={reqFirstName}
                    onChange={(e) => setReqFirstName(e.target.value)}
                    className="w-full bg-black/40 border-b border-white/10 text-white py-3 px-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                    placeholder="Juan"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Apellido</label>
                  <input 
                    type="text" 
                    value={reqLastName}
                    onChange={(e) => setReqLastName(e.target.value)}
                    className="w-full bg-black/40 border-b border-white/10 text-white py-3 px-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Teléfono</label>
                <div className="flex gap-2 relative">
                  {/* Custom Dropdown Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-11 bg-black/40 border border-white/10 text-white px-3 text-sm focus:border-gold/60 focus:outline-none transition-colors flex items-center space-x-2 rounded-xl hover:bg-black/60 cursor-pointer"
                    >
                      <span>{countries.find(c => c.code === reqCountryCode)?.flag}</span>
                      <span className="font-mono text-xs">{reqCountryCode}</span>
                      <ChevronDown size={10} className={`text-white/60 transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Custom Dropdown Menu */}
                    <AnimatePresence>
                      {isCountryDropdownOpen && (
                        <>
                          {/* Invisible Backdrop */}
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setIsCountryDropdownOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 mt-2 w-44 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl py-2 z-40 max-h-60 overflow-y-auto custom-scrollbar"
                          >
                            {countries.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setReqCountryCode(c.code);
                                  setIsCountryDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-gold/10 hover:text-gold transition-colors cursor-pointer ${
                                  reqCountryCode === c.code ? 'text-gold bg-gold/5 font-semibold' : 'text-white/85'
                                }`}
                              >
                                <span className="flex items-center space-x-2">
                                  <span>{c.flag}</span>
                                  <span>{c.name}</span>
                                </span>
                                <span className="font-mono text-[10px] opacity-60">{c.code}</span>
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone Input */}
                  <input 
                    type="tel"
                    value={reqPhoneNumber}
                    onChange={handlePhoneChange}
                    className="flex-1 h-11 bg-black/40 border border-white/10 rounded-xl text-white px-3 text-xs focus:border-gold/60 focus:outline-none transition-colors font-sans"
                    placeholder="9 1234 5678"
                    maxLength={9}
                    required
                  />
                </div>

                {/* Error message */}
                {reqPhoneNumber.length > 0 && reqPhoneNumber.length < 9 && (
                  <p className="text-[10px] text-red-500 font-medium tracking-wide animate-fadeIn mt-1.5 flex items-center space-x-1">
                    <AlertCircle size={10} />
                    <span>El teléfono debe tener exactamente 9 dígitos.</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Correo</label>
                <input 
                  type="email" 
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  className="w-full bg-black/40 border-b border-white/10 text-white py-3 px-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Negocio a Solicitar</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['barberia', 'peluqueria', 'terapias'] as const).map((b) => {
                    const isSelected = reqBusiness === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setReqBusiness(b)}
                        className={`py-2.5 px-1 text-[9px] uppercase tracking-wider font-bold rounded-lg border transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? 'bg-gold/20 border-gold text-gold shadow-md shadow-gold/5' 
                            : 'bg-black/40 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {b === 'barberia' ? 'Barbería' : b === 'peluqueria' ? 'Peluquería' : 'Terapias'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={reqPhoneNumber.length !== 9}
                className="w-full mt-6 py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/5 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>Solicitar Acceso</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthView('login')}
                className="w-full text-center text-xs text-white/50 hover:text-gold transition-colors mt-2 cursor-pointer"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </motion.div>

        {/* REQUEST ACCESS SUCCESS MODAL */}
        <AnimatePresence>
          {showRequestSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowRequestSuccessModal(false);
                  setAuthView('login');
                }}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-sm bg-[#0c0c0c]/90 border border-gold/15 rounded-[32px] p-8 shadow-2xl z-10 text-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto shadow-[0_4px_15px_rgba(198,155,60,0.15)]">
                  <Sparkles size={20} className="animate-pulse" />
                </div>

                <div className="space-y-3">
                  <span className="text-[8px] uppercase tracking-[0.4em] text-gold font-bold block">Santuario de Bienestar</span>
                  <h3 className="font-serif text-lg text-white font-medium">Solicitud Recibida</h3>
                  <p className="text-xs text-white/80 font-normal leading-relaxed font-sans px-2">
                    Tu solicitud de acceso ha sido registrada exitosamente en nuestro sistema de administración.
                  </p>
                  <p className="text-xs text-white/80 font-normal leading-relaxed font-sans px-2">
                    Nuestro equipo revisará tu postulación para configurar tu perfil y agendas autorizadas. Nos comunicaremos contigo a la brevedad para entregarte tus credenciales.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowRequestSuccessModal(false);
                    setAuthView('login');
                  }}
                  className="w-full py-3.5 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer shadow-lg shadow-gold/5"
                >
                  Entendido
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#F0F0F0] flex flex-col md:flex-row relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-[#121212] border border-gold/40 text-gold text-xs px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 font-medium tracking-wide backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation (Hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 bg-[#0a0a0a] border-r border-white/5 flex-col justify-between p-6 md:h-screen md:sticky md:top-0 z-20">
        <div className="md:flex-1 md:overflow-y-auto pr-2 md:-mr-2 min-h-0 space-y-10">
          {/* Brand Logo */}
          <Link href="/" className="flex flex-col select-none">
            <span className="font-serif text-xl font-bold tracking-[0.25em] text-gold text-gold-gradient leading-none">
              SANTUARIO
            </span>
            <span className="text-[8px] uppercase tracking-[0.45em] text-text-secondary mt-1">
              CONSOLA DE CONTROL
            </span>
          </Link>

          {/* Nav menu links */}
          <nav className="flex flex-col space-y-6">
            {[
              {
                title: 'Operaciones',
                items: [
                  { id: 'dashboard', label: 'Panel Control', icon: LayoutDashboard, allowed: ['admin'] },
                  { id: 'agenda', label: 'Agenda', icon: Calendar, allowed: ['admin', 'barber', 'estilista', 'terapeuta', 'mixto'] },
                  { id: 'crm', label: 'Clientes (CRM)', icon: Users, allowed: ['admin'] }
                ]
              },
              {
                title: 'Gestión y Equipo',
                items: [
                  { id: 'servicios', label: 'Servicios', icon: Sparkles, allowed: ['admin'] },
                  { id: 'profesionales', label: 'Profesionales', icon: UserCheck, allowed: ['admin'] },
                  { id: 'horarios', label: 'Horarios', icon: Clock, allowed: ['admin'] }
                ]
              },
              {
                title: 'Marketing y CMS',
                items: [
                  { id: 'giftcards', label: 'Gift Cards', icon: Gift, allowed: ['admin'] },
                  { id: 'vsm', label: 'Visual CMS', icon: Edit3, allowed: ['admin'] }
                ]
              },
              {
                title: 'Ajustes',
                items: [
                  { id: 'perfil', label: 'Mi Perfil', icon: User, allowed: ['admin', 'barber', 'estilista', 'terapeuta', 'mixto'] }
                ]
              }
            ].map((section) => {
              const role = currentUser ? currentUser.profileType : 'admin';
              const visibleItems = section.items.filter(item => item.allowed.includes(role));
              
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-2 text-left">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/30 font-bold px-4 block">
                    {section.title}
                  </span>
                  <div className="flex flex-col space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setSelectedClient(null); // Clear details drawer
                          }}
                          className={`flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 text-left focus:outline-none ${
                            isActive 
                              ? 'bg-gold/10 border border-gold/25 text-gold shadow-[0_0_15px_rgba(198,155,60,0.08)]' 
                              : 'text-text-secondary hover:text-white hover:bg-white/[0.02] border border-transparent'
                          }`}
                        >
                          <Icon size={14} className={isActive ? 'text-gold' : 'text-text-secondary'} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Badge / Logout */}
        <div className="pt-6 border-t border-white/5 mt-6 md:mt-0 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-sm font-bold text-gold">
              {currentUser ? currentUser.avatar || currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'SV'}
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-semibold text-white">{currentUser ? currentUser.name : profileName}</div>
              <div className="text-[9px] text-text-secondary uppercase tracking-wider">
                {currentUser ? currentUser.profileType : profileRole.split(' ')[0]}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-text-secondary hover:text-red-400 transition-colors focus:outline-none cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 z-30 backdrop-blur-md bg-opacity-90">
        <Link href="/" className="flex flex-col select-none text-left">
          <span className="font-serif text-base font-bold tracking-[0.25em] text-gold text-gold-gradient leading-none">
            SANTUARIO
          </span>
          <span className="text-[7px] uppercase tracking-[0.45em] text-text-secondary mt-0.5">
            CONSOLA DE CONTROL
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-text-secondary hover:text-white transition-colors focus:outline-none"
          aria-label="Abrir Menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </button>
      </header>

      {/* Mobile Drawer Navigation (Hamburger Menu Overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            
            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-80 bg-[#0a0a0a] border-l border-white/5 z-50 flex flex-col justify-between p-6 shadow-2xl"
            >
              <div className="flex flex-col space-y-8 flex-1 overflow-y-auto pr-1">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex flex-col select-none text-left">
                    <span className="font-serif text-sm font-bold tracking-[0.25em] text-gold">
                      SANTUARIO
                    </span>
                    <span className="text-[7px] uppercase tracking-[0.45em] text-text-secondary mt-0.5">
                      CONSOLA DE CONTROL
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-text-secondary hover:text-white transition-colors focus:outline-none"
                    aria-label="Cerrar Menú"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs List */}
                <nav className="flex flex-col space-y-6 text-left">
                  {[
                    {
                      title: 'Operaciones',
                      items: [
                        { id: 'crm', label: 'Clientes (CRM)', icon: Users, allowed: ['admin'] }
                      ]
                    },
                    {
                      title: 'Gestión y Equipo',
                      items: [
                        { id: 'servicios', label: 'Servicios', icon: Sparkles, allowed: ['admin'] },
                        { id: 'profesionales', label: 'Profesionales', icon: UserCheck, allowed: ['admin'] },
                        { id: 'horarios', label: 'Horarios', icon: Clock, allowed: ['admin'] }
                      ]
                    },
                    {
                      title: 'Marketing y CMS',
                      items: [
                        { id: 'giftcards', label: 'Gift Cards', icon: Gift, allowed: ['admin'] }
                      ]
                    },
                    {
                      title: 'Ajustes',
                      items: [
                        { id: 'perfil', label: 'Mi Perfil', icon: User, allowed: ['admin', 'barber', 'estilista', 'terapeuta', 'mixto'] }
                      ]
                    }
                  ].map((section) => {
                    const role = currentUser ? currentUser.profileType : 'admin';
                    const visibleItems = section.items.filter(item => item.allowed.includes(role));
                    
                    if (visibleItems.length === 0) return null;

                    return (
                      <div key={section.title} className="space-y-2">
                        <span className="text-[8px] uppercase tracking-[0.25em] text-white/30 font-bold px-2 block">
                          {section.title}
                        </span>
                        <div className="flex flex-col space-y-1">
                          {visibleItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setActiveTab(item.id as any);
                                  setSelectedClient(null);
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 text-left focus:outline-none ${
                                  isActive 
                                    ? 'bg-gold/10 border border-gold/25 text-gold' 
                                    : 'text-text-secondary hover:text-white hover:bg-white/[0.02] border border-transparent'
                                }`}
                              >
                                <Icon size={12} className={isActive ? 'text-gold' : 'text-text-secondary'} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* User Badge / Logout */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-xs font-bold text-gold">
                    {currentUser ? currentUser.avatar || currentUser.name.split(' ').map((n: string) => n[0]).join('') : 'SV'}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-[10px] font-semibold text-white">{currentUser ? currentUser.name : profileName}</div>
                    <div className="text-[8px] text-text-secondary uppercase tracking-wider">
                      {currentUser ? currentUser.profileType : profileRole.split(' ')[0]}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-2 text-text-secondary hover:text-red-400 transition-colors focus:outline-none cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/5 flex justify-around items-center px-4 pb-4 pt-2 z-30 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {/* Left: Panel Control */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setSelectedClient(null);
          }}
          className={`flex flex-col items-center justify-center space-y-1.5 focus:outline-none flex-1 transition-all duration-300 ${
            activeTab === 'dashboard' ? 'text-gold' : 'text-text-secondary hover:text-white'
          }`}
        >
          <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'scale-110 drop-shadow-[0_0_8px_rgba(198,155,60,0.3)]' : 'scale-100'} />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Panel Control</span>
        </button>

        {/* Center: Big Reserva Button */}
        <div className="relative -top-5 flex justify-center items-center flex-1">
          <button
            onClick={() => setIsManualBookingOpen(true)}
            className="w-14 h-14 rounded-full bg-gold hover:bg-gold/90 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(198,155,60,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
            title="Nueva Reserva"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right: Agenda */}
        <button
          onClick={() => {
            setActiveTab('agenda');
            setSelectedClient(null);
          }}
          className={`flex flex-col items-center justify-center space-y-1.5 focus:outline-none flex-1 transition-all duration-300 ${
            activeTab === 'agenda' ? 'text-gold' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Calendar size={20} className={activeTab === 'agenda' ? 'scale-110 drop-shadow-[0_0_8px_rgba(198,155,60,0.3)]' : 'scale-100'} />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Agenda</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pt-24 pb-28 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full relative">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-white/5 mb-8 gap-4">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">
              {activeTab === 'dashboard' && 'PANEL DE ADMINISTRACIÓN'}
              {activeTab === 'agenda' && 'AGENDA'}
              {activeTab === 'crm' && 'CRM'}
              {activeTab === 'servicios' && 'CONFIGURACIÓN DE SERVICIOS'}
              {activeTab === 'profesionales' && 'GESTIÓN DE PROFESIONALES'}
              {activeTab === 'horarios' && 'HORARIOS Y BLOQUEOS'}
              {activeTab === 'giftcards' && 'TARJETAS DE REGALO'}
              {activeTab === 'vsm' && 'VISUAL CMS'}
              {activeTab === 'perfil' && 'PERFIL DE USUARIO'}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide leading-none capitalize">
              {activeTab === 'dashboard' && 'Estadísticas & Rendimiento'}
              {activeTab === 'agenda' && 'Planificador de Citas'}
              {activeTab === 'crm' && 'Base Única de Clientes'}
              {activeTab === 'servicios' && 'Catálogo de Servicios & Precios'}
              {activeTab === 'profesionales' && 'Administración del Equipo & Roles'}
              {activeTab === 'horarios' && 'Gestión de Jornadas & Bloqueos de Horas'}
              {activeTab === 'giftcards' && 'Gestión & Canje de Gift Cards'}
              {activeTab === 'vsm' && 'Gestor de Contenido en Vivo'}
              {activeTab === 'perfil' && 'Mi Cuenta Administrativa'}
            </h2>
          </div>
          
          <div className="text-[10px] uppercase tracking-widest text-text-secondary flex items-center space-x-2 bg-white/[0.02] px-4 py-2 border border-white/5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Consola Activa • Sincronización Local</span>
          </div>
        </div>

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Elegant Filter Bar */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6">
              
              {/* Date Filter selector */}
              <div className="flex flex-col space-y-1.5 flex-1 min-w-[200px]">
                <span className="text-[9px] uppercase tracking-wider text-gold font-bold">Rango de Fecha</span>
                <div className="flex bg-black rounded-xl border border-white/5 p-0.5">
                  {[
                    { id: 'hoy', label: 'Hoy' },
                    { id: 'semana', label: 'Semana' },
                    { id: 'mes', label: 'Mes' },
                    { id: 'personalizado', label: 'Rango' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDbDateFilter(d.id as any)}
                      className={`flex-1 text-center py-2 rounded-lg text-[9px] uppercase tracking-widest font-bold transition-all duration-300 focus:outline-none cursor-pointer ${
                        dbDateFilter === d.id
                          ? 'bg-gold/15 text-gold'
                          : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range Picker */}
              {dbDateFilter === 'personalizado' && (
                <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
                  {/* Desde Date Picker */}
                  <div className="flex-1 flex flex-col space-y-1.5 relative">
                    <span className="text-[9px] uppercase tracking-wider text-text-secondary">Desde</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsStartDatePickerOpen(!isStartDatePickerOpen);
                        setIsEndDatePickerOpen(false);
                      }}
                      className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none hover:border-gold/30 transition-all flex items-center justify-between font-mono cursor-pointer h-[38px]"
                    >
                      <span>{formatDateLabel(dbStartDate)}</span>
                      <Calendar size={12} className="text-gold" />
                    </button>
                    {isStartDatePickerOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsStartDatePickerOpen(false)} />
                        <CalendarPicker
                          value={dbStartDate}
                          onChange={(val) => setDbStartDate(val)}
                          onClose={() => setIsStartDatePickerOpen(false)}
                          maxDate={dbEndDate}
                        />
                      </>
                    )}
                  </div>

                  {/* Hasta Date Picker */}
                  <div className="flex-1 flex flex-col space-y-1.5 relative">
                    <span className="text-[9px] uppercase tracking-wider text-text-secondary">Hasta</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEndDatePickerOpen(!isEndDatePickerOpen);
                        setIsStartDatePickerOpen(false);
                      }}
                      className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none hover:border-gold/30 transition-all flex items-center justify-between font-mono cursor-pointer h-[38px]"
                    >
                      <span>{formatDateLabel(dbEndDate)}</span>
                      <Calendar size={12} className="text-gold" />
                    </button>
                    {isEndDatePickerOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsEndDatePickerOpen(false)} />
                        <CalendarPicker
                          value={dbEndDate}
                          onChange={(val) => setDbEndDate(val)}
                          onClose={() => setIsEndDatePickerOpen(false)}
                          minDate={dbStartDate}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Business Filter selector */}
              <div className="flex flex-col space-y-1.5 w-full md:w-56">
                <span className="text-[9px] uppercase tracking-wider text-gold font-bold">Unidad de Negocio</span>
                <CustomSelect
                  value={dbBusinessFilter}
                  onChange={(val) => {
                    setDbBusinessFilter(val as any);
                    setDbServiceFilter('todos');
                  }}
                  options={[
                    { value: 'todos', label: 'Todos los Negocios' },
                    { value: 'barberia', label: 'Barbería Tradicional' },
                    { value: 'peluqueria', label: 'Peluquería de Autor' },
                    { value: 'terapias', label: 'Terapias Holísticas' }
                  ]}
                  className="w-full"
                />
              </div>

              {/* Service Filter selector */}
              <div className="flex flex-col space-y-1.5 w-full md:w-64">
                <span className="text-[9px] uppercase tracking-wider text-gold font-bold">Servicio Especializado</span>
                <CustomSelect
                  value={dbServiceFilter}
                  onChange={(val) => setDbServiceFilter(val)}
                  options={[
                    { value: 'todos', label: 'Todos los Servicios' },
                    ...(dbBusinessFilter === 'todos'
                      ? Object.keys(servicesData).flatMap(cat => 
                          servicesData[cat].services.map(s => ({
                            value: s.name,
                            label: `${s.name} (${servicesData[cat].title})`
                          }))
                        )
                      : servicesData[dbBusinessFilter]?.services.map(s => ({
                          value: s.name,
                          label: s.name
                        })) || [])
                  ]}
                  className="w-full"
                />
              </div>

            </div>

            {/* Visual Date Range Indicator */}
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider text-text-secondary pl-1 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/70 animate-pulse" />
              <span>Datos correspondientes a: </span>
              <strong className="text-gold font-medium">{formattedDateRangeText}</strong>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Ingresos Totales (CLP)', val: `$${totalRevenue.toLocaleString('es-CL')}`, diff: revenueDiff, icon: DollarSign },
                { title: 'Rituales Agendados', val: totalBookings, diff: bookingsDiff, icon: Calendar },
                { title: 'Ticket Promedio', val: `$${averageTicket.toLocaleString('es-CL')}`, diff: ticketDiff, icon: TrendingUp },
                { title: 'Retención de Clientes', val: `${retentionRate}%`, diff: retentionDiff, icon: UserCheck }
              ].map((card, i) => {
                const Icon = card.icon;
                const isPositive = card.diff.startsWith('+') || card.diff === '0%';
                const badgeColorClass = isPositive 
                  ? 'text-emerald-500 bg-emerald-500/5' 
                  : 'text-rose-500 bg-rose-500/5';
                return (
                  <div key={i} className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6 hover:border-gold/15 transition-all duration-300 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold">{card.title}</span>
                      <div className="w-8 h-8 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-center text-gold">
                        <Icon size={14} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-serif text-2xl font-bold text-white leading-none">{card.val}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badgeColorClass}`}>{card.diff}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Grid (Hidden on mobile) */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Daily Revenue Trend Chart */}
              <div className="lg:col-span-8 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-lg h-[350px]">
                <div className="flex items-center justify-between pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-serif text-base text-white tracking-wide">Facturación Histórica (Filtrado)</h3>
                    <p className="text-[9px] text-text-secondary uppercase tracking-widest">Rituales según filtros seleccionados</p>
                  </div>
                  <div className="flex items-center space-x-3 text-[9px] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-gold"><span className="w-2 h-2 rounded-full bg-gold" /> Barbería</span>
                    <span className="flex items-center gap-1.5 text-bronze"><span className="w-2 h-2 rounded-full bg-[#CD7F32]" /> Peluquería</span>
                    <span className="flex items-center gap-1.5 text-platinum"><span className="w-2 h-2 rounded-full bg-[#E2E0D8]" /> Terapias</span>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="flex-1 w-full relative pt-6">
                  <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                    {/* Chart path */}
                    <path
                      d={areaD}
                      fill="url(#chartGrad)"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                    />

                    {/* Circles at peaks */}
                    {svgPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="4" 
                          fill="#D4AF37" 
                          stroke="#070707" 
                          strokeWidth="1.5" 
                          className="hover:scale-125 transition-transform cursor-pointer"
                        />
                        <title>{`Monto: $${p.val.toLocaleString('es-CL')}`}</title>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between text-[8px] uppercase tracking-widest text-text-secondary pt-2 border-t border-white/5">
                  {trend.labels.map((label, idx) => (
                    <span key={idx}>{label}</span>
                  ))}
                </div>
              </div>

              {/* Channels Donut Chart */}
              <div className="lg:col-span-4 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-lg h-[350px]">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-base text-white tracking-wide">Canales de Reserva</h3>
                  <p className="text-[9px] text-text-secondary uppercase tracking-widest">Procedencia de citas activas</p>
                </div>

                {/* SVG Donut */}
                <div className="flex-1 flex items-center justify-center relative my-4">
                  <svg width="120" height="120" viewBox="0 0 36 36" className="transform -rotate-90">
                    {/* Background Ring */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                    
                    {/* Web Segment (gold) */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#D4AF37" strokeWidth="3" 
                      strokeDasharray={`${webPct} ${100 - webPct}`} 
                      strokeDashoffset="0" 
                    />
                    
                    {/* WhatsApp Segment (bronze) */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#CD7F32" strokeWidth="3" 
                      strokeDasharray={`${waPct} ${100 - waPct}`} 
                      strokeDashoffset={`-${webPct}`} 
                    />

                    {/* Walk-in Segment (platinum) */}
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#E2E0D8" strokeWidth="3" 
                      strokeDasharray={`${walkinPct} ${100 - walkinPct}`} 
                      strokeDashoffset={`-${webPct + waPct}`} 
                    />
                  </svg>
                  
                  {/* Absolute Center text */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white font-serif">{totalBookings}</span>
                    <span className="text-[7px] text-text-secondary uppercase tracking-widest">Citas Totales</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center text-[10px] font-medium">
                    <span className="flex items-center gap-1.5 text-white/95"><span className="w-2 h-2 rounded-full bg-gold" /> Reserva Web</span>
                    <span className="text-text-secondary">{webBookingsCount} ({webPct}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-medium">
                    <span className="flex items-center gap-1.5 text-white/95"><span className="w-2 h-2 rounded-full bg-[#CD7F32]" /> WhatsApp</span>
                    <span className="text-text-secondary">{waBookingsCount} ({waPct}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-medium">
                    <span className="flex items-center gap-1.5 text-white/95"><span className="w-2 h-2 rounded-full bg-[#E2E0D8]" /> Presencial</span>
                    <span className="text-text-secondary">{walkinBookingsCount} ({walkinPct}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. AGENDA TAB */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            {/* Mobile-only Dropdown Filters */}
            <div className="md:hidden grid grid-cols-2 gap-3 pb-3 border-b border-white/5">
              {/* Business Select */}
              <div className="flex flex-col space-y-1 text-left">
                <span className="text-[8px] uppercase tracking-wider text-text-secondary font-bold">Negocio</span>
                <div className="relative">
                  <select
                    value={activeBusinessTab}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setActiveBusinessTab(val);
                      const specs = servicesData[val]?.specialists || [];
                      if (specs.length > 0) {
                        setActiveSpecialistFilter(specs[0].id);
                      } else {
                        setActiveSpecialistFilter('all');
                      }
                    }}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    {[
                      { id: 'barberia', label: 'Barbería Tradicional' },
                      { id: 'peluqueria', label: 'Peluquería de Autor' },
                      { id: 'terapias', label: 'Terapias Holísticas' }
                    ].filter(subtab => {
                      const agendas = currentUser ? currentUser.assignedAgendas : ['barberia', 'peluqueria', 'terapias'];
                      return agendas.includes(subtab.id as any);
                    }).map(subtab => (
                      <option key={subtab.id} value={subtab.id} className="bg-[#0c0c0c] text-white">
                        {subtab.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>

              {/* Specialist Select */}
              <div className="flex flex-col space-y-1 text-left">
                <span className="text-[8px] uppercase tracking-wider text-text-secondary font-bold">Profesional</span>
                <div className="relative">
                  <select
                    value={activeSpecialistFilter}
                    onChange={(e) => setActiveSpecialistFilter(e.target.value)}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    {servicesData[activeBusinessTab]?.specialists.map(sp => (
                      <option key={sp.id} value={sp.id} className="bg-[#0c0c0c] text-white">
                        {sp.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop-only 3 Business Sub-tabs */}
            <div className="hidden md:flex justify-center md:justify-start border-b border-white/5 pb-2">
              <div className="flex space-x-2 bg-[#0c0c0c] border border-white/5 p-1 rounded-full">
                {[
                  { id: 'barberia', label: 'Barbería Tradicional', badge: '01' },
                  { id: 'peluqueria', label: 'Peluquería de Autor', badge: '02' },
                  { id: 'terapias', label: 'Terapias Holísticas', badge: '03' }
                ].filter(subtab => {
                  const agendas = currentUser ? currentUser.assignedAgendas : ['barberia', 'peluqueria', 'terapias'];
                  return agendas.includes(subtab.id as any);
                }).map((subtab) => {
                  const isSubtabActive = activeBusinessTab === subtab.id;
                  return (
                    <button
                      key={subtab.id}
                      onClick={() => {
                        setActiveBusinessTab(subtab.id as any);
                        setActiveSpecialistFilter('all');
                      }}
                      className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center space-x-2 focus:outline-none cursor-pointer ${
                        isSubtabActive
                          ? subtab.id === 'barberia'
                            ? 'bg-gold text-black shadow-lg shadow-gold/5 scale-105'
                            : subtab.id === 'peluqueria'
                            ? 'bg-[#CD7F32] text-black shadow-lg shadow-bronze/5 scale-105'
                            : 'bg-[#E2E0D8] text-black shadow-lg shadow-platinum/5 scale-105'
                          : 'text-text-secondary hover:text-white'
                      }`}
                    >
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${isSubtabActive ? 'bg-black/20 text-black' : 'bg-white/5 text-text-secondary'}`}>
                        {subtab.badge}
                      </span>
                      <span>{subtab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop-only Specialist Round Filters */}
            {(!currentUser || currentUser.profileType === 'admin') && (
              <div className="hidden md:flex flex-col space-y-3">
                <span className="text-[9px] uppercase tracking-[0.2em] text-text-secondary font-bold text-center md:text-left">
                  Filtrar por Profesional
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pb-2">
                  <button
                    onClick={() => setActiveSpecialistFilter('all')}
                    className="flex flex-col items-center space-y-1.5 focus:outline-none transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      activeSpecialistFilter === 'all'
                        ? activeBusinessTab === 'barberia'
                          ? 'border-gold bg-gold/15 text-gold shadow-lg shadow-gold/5'
                        : activeBusinessTab === 'peluqueria'
                          ? 'border-[#CD7F32] bg-[#CD7F32]/15 text-[#CD7F32] shadow-lg shadow-bronze/5'
                          : 'border-[#E2E0D8] bg-[#E2E0D8]/15 text-[#E2E0D8] shadow-lg shadow-platinum/5'
                        : 'border-white/10 hover:border-white/20 text-white/50 bg-white/5'
                    }`}>
                      <Sparkles size={16} />
                    </div>
                    <span className={`text-[10px] tracking-wider font-semibold uppercase ${activeSpecialistFilter === 'all' ? 'text-white' : 'text-text-secondary'}`}>
                      Todos
                    </span>
                  </button>

                  {servicesData[activeBusinessTab]?.specialists.map((sp) => {
                    const isSelected = activeSpecialistFilter === sp.id;
                    const photo = sp.imageUrl || specialistPhotos[sp.id];
                    return (
                      <button
                        key={sp.id}
                        onClick={() => setActiveSpecialistFilter(sp.id)}
                        className="flex flex-col items-center space-y-1.5 focus:outline-none transition-all duration-300 cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 relative ${
                          isSelected
                            ? activeBusinessTab === 'barberia'
                              ? 'border-gold shadow-lg shadow-gold/5 scale-105'
                              : activeBusinessTab === 'peluqueria'
                              ? 'border-[#CD7F32] shadow-lg shadow-bronze/5 scale-105'
                              : 'border-[#E2E0D8] shadow-lg shadow-platinum/5 scale-105'
                            : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/25'
                        }`}>
                          {photo ? (
                            <Image
                              src={photo}
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
                          <span className={`block text-[10px] tracking-wider font-semibold ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
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
            )}
            
            {/* Rango/Fecha Selector Cards */}
            <div className="flex flex-col space-y-3 mt-4 mb-6">
              <span className="text-[9px] uppercase tracking-[0.2em] text-text-secondary font-bold text-center md:text-left">
                Filtrar por Rango o Fecha
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {/* Hoy Card */}
                <button
                  onClick={() => setAgendaViewMode('hoy')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden cursor-pointer group ${getActiveStyles('hoy')}`}
                >
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold block mb-1">Hoy</span>
                  <span className="text-xs font-semibold tracking-wider font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                    {formatCardDate(getFormattedDate(0))}
                  </span>
                </button>

                {/* Mañana Card */}
                <button
                  onClick={() => setAgendaViewMode('manana')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden cursor-pointer group ${getActiveStyles('manana')}`}
                >
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold block mb-1">Mañana</span>
                  <span className="text-xs font-semibold tracking-wider font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                    {formatCardDate(getFormattedDate(1))}
                  </span>
                </button>

                {/* Esta Semana Card */}
                <button
                  onClick={() => setAgendaViewMode('semana')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden cursor-pointer group ${getActiveStyles('semana')}`}
                >
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold block mb-1">Esta Semana</span>
                  <span className="text-[10px] font-semibold tracking-wide font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                    {(() => {
                      const range = getThisWeekRange();
                      return formatCardRange(range.start, range.end);
                    })()}
                  </span>
                </button>

                {/* Próx. Semana Card */}
                <button
                  onClick={() => setAgendaViewMode('prox_semana')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden cursor-pointer group ${getActiveStyles('prox_semana')}`}
                >
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold block mb-1">Próx. Semana</span>
                  <span className="text-[10px] font-semibold tracking-wide font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                    {(() => {
                      const range = getNextWeekRange();
                      return formatCardRange(range.start, range.end);
                    })()}
                  </span>
                </button>

                {/* Custom Card */}
                <div className="relative">
                  <input
                    type="date"
                    value={agendaCustomDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        setAgendaCustomDate(e.target.value);
                        setAgendaViewMode('fecha');
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div
                    className={`h-full flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden group ${getActiveStyles('fecha')}`}
                  >
                    <span className="text-[9px] uppercase tracking-[0.15em] font-bold block mb-1">Elegir Fecha</span>
                    <span className="text-xs font-semibold tracking-wider font-mono opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {formatCardDate(agendaCustomDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Table / List */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Listado de Horas Reservadas</span>
                  
                  <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border ${
                    activeBusinessTab === 'barberia'
                      ? 'text-gold bg-gold/5 border-gold/15'
                      : activeBusinessTab === 'peluqueria'
                      ? 'text-[#CD7F32] bg-[#CD7F32]/5 border-[#CD7F32]/15'
                      : 'text-[#E2E0D8] bg-[#E2E0D8]/5 border-[#E2E0D8]/15'
                  }`}>
                    {bookedCount} citas agendadas
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setPrefillSpecialistId(undefined);
                    setPrefillDate(targetDate);
                    setPrefillTime(undefined);
                    setIsManualBookingOpen(true);
                  }}
                  className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-1.5 cursor-pointer shadow-lg hover:scale-105 ${
                    activeBusinessTab === 'barberia'
                      ? 'bg-gold hover:bg-[#b08732] text-black shadow-gold/5'
                      : activeBusinessTab === 'peluqueria'
                      ? 'bg-[#CD7F32] hover:bg-[#b56b24] text-black shadow-bronze/5'
                      : 'bg-[#E2E0D8] hover:bg-[#c4c2ba] text-black shadow-platinum/5'
                  }`}
                >
                  <Plus size={11} strokeWidth={3} />
                  <span>Nueva Reserva</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                {isSingleDayMode ? (
                  <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-text-secondary">
                        <th className="py-4 px-6 w-[100px] text-center font-bold">Hora</th>
                        {specialistsForView.map(sp => (
                          <th key={sp.id} className="py-4 px-6 min-w-[220px]">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] bg-white/5 border border-white/10 px-2 py-1 rounded-full font-bold ${
                                activeBusinessTab === 'barberia' ? 'text-gold' : activeBusinessTab === 'peluqueria' ? 'text-[#CD7F32]' : 'text-[#E2E0D8]'
                              }`}>
                                {sp.avatar}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-[10px] normal-case">{sp.name}</span>
                                <span className="text-[8px] text-text-secondary lowercase font-normal">{sp.role || sp.specialty}</span>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-light">
                      {timeSlots.map((time, slotIndex) => {
                        const isToday = targetDate === (() => {
                          const today = new Date();
                          const y = today.getFullYear();
                          const m = String(today.getMonth() + 1).padStart(2, '0');
                          const d = String(today.getDate()).padStart(2, '0');
                          return `${y}-${m}-${d}`;
                        })();

                        const currentMins = nowState ? (nowState.getHours() * 60 + nowState.getMinutes()) : 0;
                        const showLineAfterThisSlot = isToday && nowState && slotIndex !== -1 &&
                          currentMins >= localTimeToMinutes(time) &&
                          (slotIndex === timeSlots.length - 1 || currentMins < localTimeToMinutes(timeSlots[slotIndex + 1]));

                        const showLineBeforeFirstSlot = isToday && nowState && slotIndex === 0 && currentMins < localTimeToMinutes(timeSlots[0]);

                        const timeIndicatorRow = (
                          <tr key={`indicator-${time}`} className="relative h-0">
                            <td colSpan={1 + specialistsForView.length} className="py-0 px-0 relative">
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center z-10 pointer-events-none w-full">
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  activeBusinessTab === 'barberia' ? 'bg-gold' : activeBusinessTab === 'peluqueria' ? 'bg-[#CD7F32]' : 'bg-[#E2E0D8]'
                                } animate-ping absolute ml-6`} style={{ animationDuration: '2s' }} />
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  activeBusinessTab === 'barberia' ? 'bg-gold' : activeBusinessTab === 'peluqueria' ? 'bg-[#CD7F32]' : 'bg-[#E2E0D8]'
                                } ml-6`} />
                                <div className={`h-[1px] flex-grow ${
                                  activeBusinessTab === 'barberia' 
                                    ? 'bg-gradient-to-r from-gold via-gold/40 to-transparent' 
                                    : activeBusinessTab === 'peluqueria' 
                                    ? 'bg-gradient-to-r from-[#CD7F32] via-[#CD7F32]/40 to-transparent' 
                                    : 'bg-gradient-to-r from-[#E2E0D8] via-[#E2E0D8]/40 to-transparent'
                                } ml-2`} />
                                <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded bg-black/95 border ${
                                  activeBusinessTab === 'barberia' ? 'border-gold/30 text-gold' : activeBusinessTab === 'peluqueria' ? 'border-[#CD7F32]/30 text-[#CD7F32]' : 'border-[#E2E0D8]/30 text-[#E2E0D8]'
                                } mr-8 uppercase tracking-widest shadow-2xl`}>
                                  Hora Actual: {nowState ? nowState.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );

                        return (
                          <React.Fragment key={`row-${time}`}>
                            {showLineBeforeFirstSlot && timeIndicatorRow}
                            <tr className="hover:bg-white/[0.005] border-b border-white/5 transition-all">
                              <td className="py-4.5 px-6 font-bold text-white/60 text-center w-[100px] border-r border-white/5 bg-black/20">
                                <div className="flex flex-col items-center justify-center space-y-1">
                                  <Clock size={11} className={
                                    activeBusinessTab === 'barberia' ? 'text-gold' : activeBusinessTab === 'peluqueria' ? 'text-[#CD7F32]' : 'text-[#E2E0D8]'
                                  } />
                                  <span className="font-mono">{time}</span>
                                </div>
                              </td>
                              
                              {specialistsForView.map(specialist => {
                                const currentSlotMin = localTimeToMinutes(time);
                                const nextSlotMin = slotIndex < timeSlots.length - 1 
                                  ? localTimeToMinutes(timeSlots[slotIndex + 1]) 
                                  : currentSlotMin + 30;

                                const booking = filteredBookings.find(b => {
                                  if (b.date !== targetDate) return false;
                                  if (b.specialistName.trim().toLowerCase() !== specialist.name.trim().toLowerCase()) return false;
                                  
                                  const bookingMin = localTimeToMinutes(b.time);
                                  const allServices = Object.keys(servicesData).flatMap(
                                    cat => servicesData[cat].services || []
                                  );
                                  const bookedService = allServices.find(s => s.name.trim().toLowerCase() === b.serviceName.trim().toLowerCase());
                                  const bookingDuration = bookedService ? parseDurationToMinutes(bookedService.duration) : 60;
                                  const bookingEnd = bookingMin + bookingDuration;

                                  return currentSlotMin < bookingEnd && nextSlotMin > bookingMin;
                                });

                                const isPast = (() => {
                                  if (!nowState) return false;
                                  const today = new Date();
                                  const y = today.getFullYear();
                                  const m = String(today.getMonth() + 1).padStart(2, '0');
                                  const d = String(today.getDate()).padStart(2, '0');
                                  const todayStr = `${y}-${m}-${d}`;
                                  
                                  if (targetDate < todayStr) return true;
                                  if (targetDate > todayStr) return false;
                                  
                                  const slotMins = localTimeToMinutes(time);
                                  const currentMins = nowState.getHours() * 60 + nowState.getMinutes();
                                  return slotMins < currentMins;
                                })();

                                if (booking) {
                                  if (booking.status === 'bloqueado') {
                                    return (
                                      <td key={`${specialist.id}-${time}`} className={`py-4 px-4 w-[250px] align-top ${isPast ? 'opacity-40 select-none grayscale-[40%]' : ''}`}>
                                        <div className="bg-red-950/15 border border-red-500/20 rounded-2xl p-3 space-y-2 group transition-all hover:bg-red-950/20">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-mono font-bold text-red-400 tracking-wider">BLOQUEADO</span>
                                            <span className="text-[8px] font-mono text-red-500/50">{booking.id}</span>
                                          </div>
                                          <div className="font-semibold text-red-300 text-[11px]">Horario Bloqueado</div>
                                          <div className="text-[9px] text-red-400/70 italic">Bloqueo Administrativo</div>
                                          <div className="flex justify-end pt-1">
                                            <button
                                              disabled={isPast}
                                              onClick={() => {
                                                deleteBooking(booking.id);
                                                triggerNotification(`Horario ${time} desbloqueado.`);
                                              }}
                                              className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                                isPast 
                                                  ? 'bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50' 
                                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 cursor-pointer shadow-sm'
                                              }`}
                                            >
                                              Desbloquear
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    );
                                  }

                                  const isContinuation = booking.time !== time;
                                  if (isContinuation) {
                                    return null;
                                  }

                                  const computedStatus = getCurrentBookingStatus(targetDate, booking.time, booking.status, specialist.name);
                                  const allServices = Object.keys(servicesData).flatMap(
                                    cat => servicesData[cat].services || []
                                  );
                                  const bookedService = allServices.find(s => s.name.trim().toLowerCase() === booking.serviceName.trim().toLowerCase());
                                  const bookingDuration = bookedService ? parseDurationToMinutes(bookedService.duration) : 60;
                                  const bookingEnd = localTimeToMinutes(booking.time) + bookingDuration;
                                  const slotMins = localTimeToMinutes(time);
                                  const isEndSlot = slotMins + 30 >= bookingEnd;

                                  const bookingMin = localTimeToMinutes(booking.time);
                                  let rowSpan = 1;
                                  let checkIdx = slotIndex + 1;
                                  while (checkIdx < timeSlots.length) {
                                    const nextSlotMinVal = localTimeToMinutes(timeSlots[checkIdx]);
                                    if (nextSlotMinVal < bookingMin + bookingDuration) {
                                      rowSpan++;
                                      checkIdx++;
                                    } else {
                                      break;
                                    }
                                  }

                                  return (
                                    <td
                                      key={`${specialist.id}-${time}`}
                                      rowSpan={rowSpan}
                                      style={{ height: '1px' }}
                                      onMouseEnter={() => setHoveredBookingId(booking.id)}
                                      onMouseLeave={() => setHoveredBookingId(null)}
                                      className={`py-4 px-4 w-[250px] align-top transition-all duration-200 h-full ${
                                        isPast ? 'opacity-70 select-none' : ''
                                      }`}
                                    >
                                      <div className={`h-full flex flex-col justify-between bg-white/[0.02] border rounded-2xl p-4 transition-all duration-300 ${
                                        hoveredBookingId === booking.id
                                          ? 'border-gold/40 bg-gold/[0.03] shadow-lg shadow-gold/5 scale-[1.02]'
                                          : 'border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                      }`}>
                                        <div className="space-y-3.5 flex-grow">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-mono text-text-secondary tracking-wider font-semibold uppercase">{booking.id}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] uppercase tracking-widest font-bold border ${
                                              computedStatus === 'En Proceso'
                                                ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                                                : computedStatus === 'Espera'
                                                ? 'bg-amber-500/5 border-amber-500/30 text-amber-400 animate-pulse'
                                                : computedStatus === 'proximo'
                                                ? 'bg-amber-500/5 border-amber-500/30 text-amber-400'
                                                : computedStatus === 'reservado'
                                                ? 'bg-blue-500/5 border-blue-500/30 text-blue-400'
                                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            }`}>
                                              <span className={`w-1 h-1 rounded-full ${
                                                computedStatus === 'En Proceso'
                                                  ? 'bg-emerald-400'
                                                  : computedStatus === 'Espera'
                                                  ? 'bg-amber-400'
                                                  : computedStatus === 'proximo'
                                                  ? 'bg-amber-400'
                                                  : computedStatus === 'reservado'
                                                  ? 'bg-blue-400'
                                                  : 'bg-emerald-400'
                                              }`} />
                                              <span>
                                                {computedStatus === 'Finalizado' ? 'Pagado' : 
                                                 computedStatus === 'Espera' ? 'En Espera' : 
                                                 computedStatus}
                                              </span>
                                            </span>
                                          </div>

                                          <div className="space-y-1">
                                            <div className="font-bold text-white text-[11px] leading-tight">{booking.clientName}</div>
                                            {(() => {
                                              const cleanPhone = booking.clientPhone.replace(/\D/g, '');
                                              return (
                                                <a
                                                  href={`https://wa.me/${cleanPhone}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-[9px] text-text-secondary hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer font-mono"
                                                >
                                                  <Smartphone size={9} className="text-emerald-500/80" />
                                                  <span>{booking.clientPhone}</span>
                                                </a>
                                              );
                                            })()}
                                          </div>

                                          <div className="space-y-1.5">
                                            <div className="text-[10px] text-white/80 font-medium leading-tight">{booking.serviceName}</div>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              <span className="inline-flex items-center gap-0.5 text-[7px] text-white/50 bg-white/5 px-1 py-0.5 rounded uppercase font-mono">
                                                {booking.channel === 'Web' && <Globe size={8} className="text-blue-400" />}
                                                {booking.channel === 'WhatsApp' && <MessageSquare size={8} className="text-emerald-400" />}
                                                {booking.channel === 'Presencial' && <Smartphone size={8} className="text-amber-400" />}
                                                <span>{booking.channel}</span>
                                              </span>
                                              {booking.category !== activeBusinessTab && (
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[7px] uppercase tracking-wider font-bold ${
                                                  booking.category === 'barberia' 
                                                    ? 'bg-gold/10 text-gold border border-gold/20' 
                                                    : booking.category === 'peluqueria'
                                                    ? 'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/20'
                                                    : 'bg-[#E2E0D8]/10 text-[#E2E0D8] border border-[#E2E0D8]/20'
                                                }`}>
                                                  {booking.category === 'barberia' ? 'Barbería' : booking.category === 'peluqueria' ? 'Peluquería' : 'Terapias'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/5 mt-4">
                                          {(computedStatus === 'reservado' || computedStatus === 'proximo') && (
                                            <button
                                              disabled={isPast}
                                              onClick={() => {
                                                updateBookingStatus(booking.id, 'en_proceso');
                                                triggerNotification(`Servicio para ${booking.clientName} iniciado.`);
                                              }}
                                              className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                                isPast
                                                  ? 'bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50'
                                                  : activeBusinessTab === 'barberia'
                                                  ? 'bg-gold/10 hover:bg-gold/20 text-gold border-gold/20 cursor-pointer'
                                                  : activeBusinessTab === 'peluqueria'
                                                  ? 'bg-[#CD7F32]/10 hover:bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/20 cursor-pointer'
                                                  : 'bg-[#E2E0D8]/10 hover:bg-[#E2E0D8]/20 text-[#E2E0D8] border-[#E2E0D8]/20 cursor-pointer'
                                              }`}
                                            >
                                              Iniciar
                                            </button>
                                          )}
                                          {computedStatus === 'Espera' && (
                                            <button
                                              disabled={true}
                                              title="Debe finalizar el servicio en curso de este especialista primero"
                                              className="px-2 py-1 text-[9px] font-bold rounded-lg border bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50"
                                            >
                                              Iniciar
                                            </button>
                                          )}
                                          {computedStatus === 'En Proceso' && (
                                            <button
                                              disabled={isPast}
                                              onClick={() => {
                                                updateBookingStatus(booking.id, 'completado');
                                                triggerNotification(`Servicio para ${booking.clientName} cobrado y completado.`);
                                              }}
                                              className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                                isPast
                                                  ? 'bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50'
                                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 cursor-pointer'
                                              }`}
                                            >
                                              Cobrar
                                            </button>
                                          )}
                                          {computedStatus === 'Finalizado' && (() => {
                                            const clientObj = clients.find(c => c.phone === booking.clientPhone);
                                            const isBad = clientObj?.notSoGoodClient;
                                            if (isBad) {
                                              return (
                                                <span className="text-[8px] font-bold text-red-400/60 bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-lg select-none">
                                                  No asistió
                                                </span>
                                              );
                                            }
                                            return (
                                              <button
                                                disabled={isPast}
                                                onClick={() => {
                                                  markAsNotGoodClient(booking.clientPhone);
                                                  triggerNotification(`Cliente ${booking.clientName} marcado como 'No tan buen cliente' por inasistencia.`);
                                                }}
                                                className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                                  isPast
                                                    ? 'bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50'
                                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 cursor-pointer'
                                                }`}
                                                title={isPast ? "No se puede marcar una cita pasada" : "Marcar Inasistencia"}
                                              >
                                                <UserX size={9} className="inline mr-0.5" />
                                                <span>No asistió</span>
                                              </button>
                                            );
                                          })()}
                                          {computedStatus !== 'Finalizado' && (
                                            <button
                                              disabled={isPast}
                                              onClick={() => {
                                                deleteBooking(booking.id);
                                                triggerNotification(`Reserva ${booking.id} eliminada.`);
                                              }}
                                              className={`p-1 text-text-secondary hover:text-red-400 border border-transparent hover:border-red-500/10 hover:bg-red-500/5 rounded-lg transition-all ${
                                                isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                              }`}
                                            >
                                              <Trash2 size={10} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  );
                                }

                                const specialistShifts = workShifts[specialist.id];
                                let isShift = true;
                                let isLunchBreak = false;
                                
                                if (specialistShifts) {
                                  const dayNum = new Date(targetDate + 'T00:00:00').getDay();
                                  const dayShift = specialistShifts.find((s: any) => s.dayOfWeek === dayNum);
                                  if (!dayShift || !dayShift.isActive) {
                                    isShift = false;
                                  } else {
                                    const slotMin = localTimeToMinutes(time);
                                    const startMin = localTimeToMinutes(dayShift.startTime);
                                    const endMin = localTimeToMinutes(dayShift.endTime);
                                    isShift = slotMin >= startMin && slotMin < endMin;
                                    
                                    if (isShift && dayShift.hasBreak && dayShift.breakStartTime && dayShift.breakEndTime) {
                                      const breakStartMin = localTimeToMinutes(dayShift.breakStartTime);
                                      const breakEndMin = localTimeToMinutes(dayShift.breakEndTime);
                                      isLunchBreak = slotMin >= breakStartMin && slotMin < breakEndMin;
                                    }
                                  }
                                }

                                if (isLunchBreak) {
                                  return (
                                    <td key={`${specialist.id}-${time}`} className="py-4 px-4 w-[250px] align-top opacity-50">
                                      <div className="bg-white/[0.01] border border-white/5 border-dashed rounded-2xl p-3 flex flex-col items-center justify-center min-h-[85px] text-center">
                                        <div className="text-[8px] font-mono text-text-secondary/60">ALMUERZO</div>
                                        <div className="text-[9px] text-white/30 font-medium mt-1">Receso laboral</div>
                                      </div>
                                    </td>
                                  );
                                }

                                if (!isShift) {
                                  return (
                                    <td key={`${specialist.id}-${time}`} className="py-4 px-4 w-[250px] align-top">
                                      <div className="bg-[#0c0c0c]/40 border border-white/5 border-dashed rounded-2xl p-3 flex flex-col justify-between min-h-[85px] group hover:border-amber-500/20 hover:bg-amber-500/[0.01] transition-all">
                                        <div className="flex flex-col">
                                          <span className="text-[8px] font-mono text-amber-500/40 tracking-wider">FUERA JORNADA</span>
                                          <span className="text-[10px] text-white/20 font-medium mt-1">Disponible (Sobrecupo)</span>
                                        </div>
                                        <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            disabled={isPast}
                                            onClick={() => {
                                              setPrefillSpecialistId(specialist.id);
                                              setPrefillDate(targetDate);
                                              setPrefillTime(time);
                                              setIsManualBookingOpen(true);
                                            }}
                                            className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all flex items-center space-x-1 ${
                                              isPast
                                                ? 'bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50'
                                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20 cursor-pointer shadow-sm shadow-amber-500/5'
                                            }`}
                                          >
                                            <span>Sobrecupo</span>
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  );
                                }

                                return (
                                  <td key={`${specialist.id}-${time}`} className="py-4 px-4 w-[250px] align-top">
                                    <div className="bg-transparent border border-white/[0.03] border-dashed rounded-2xl p-3 flex flex-col justify-between min-h-[85px] group hover:border-gold/25 hover:bg-white/[0.01] transition-all">
                                      <div className="flex flex-col">
                                        <span className="text-[8px] font-mono text-text-secondary/50 tracking-wider">DISPONIBLE</span>
                                        <span className="text-[10px] text-white/40 font-medium mt-1">Sin agendar</span>
                                      </div>
                                      <div className="flex items-center justify-end gap-1.5 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          disabled={isPast}
                                          onClick={() => {
                                            setPrefillSpecialistId(specialist.id);
                                            setPrefillDate(targetDate);
                                            setPrefillTime(time);
                                            setIsManualBookingOpen(true);
                                          }}
                                          className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                            isPast
                                              ? 'bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50'
                                              : activeBusinessTab === 'barberia'
                                              ? 'bg-gold/10 hover:bg-gold/20 text-gold border-gold/20 cursor-pointer'
                                              : activeBusinessTab === 'peluqueria'
                                              ? 'bg-[#CD7F32]/10 hover:bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/20 cursor-pointer'
                                              : 'bg-[#E2E0D8]/10 hover:bg-[#E2E0D8]/20 text-[#E2E0D8] border-[#E2E0D8]/20 cursor-pointer'
                                          }`}
                                        >
                                          Agendar
                                        </button>
                                        <button
                                          disabled={isPast}
                                          onClick={() => {
                                            addBooking({
                                              clientName: 'Bloqueo Administrativo',
                                              clientPhone: '-',
                                              clientEmail: '',
                                              category: activeBusinessTab,
                                              serviceName: 'Bloqueo Administrativo',
                                              price: '-',
                                              specialistName: specialist.name,
                                              date: targetDate,
                                              time: time,
                                              channel: 'Presencial',
                                              status: 'bloqueado'
                                            });
                                            triggerNotification(`Horario ${time} bloqueado.`);
                                          }}
                                          className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                            isPast
                                              ? 'bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50'
                                              : 'bg-white/5 hover:bg-white/10 hover:text-white text-text-secondary border-white/10 cursor-pointer'
                                          }`}
                                        >
                                          Bloquear
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                            {showLineAfterThisSlot && timeIndicatorRow}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-text-secondary">
                        <th className="py-4 px-6">Hora / Código</th>
                        <th className="py-4 px-6">Cliente</th>
                        <th className="py-4 px-6">Servicio</th>
                        <th className="py-4 px-6">Especialista</th>
                        <th className="py-4 px-6">Canal</th>
                        <th className="py-4 px-6">Estado</th>
                        <th className="py-4 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-light">
                      {listBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-text-secondary/60 italic font-light">
                            No hay reservas ni bloqueos registrados en este período.
                          </td>
                        </tr>
                      ) : (
                        listBookings.map((booking) => {
                          const specialist = specialistsInUnit.find(sp => sp.name.trim() === booking.specialistName.trim()) || {
                            id: 'unknown',
                            name: booking.specialistName,
                            avatar: booking.specialistName.charAt(0),
                            role: ''
                          };
                          const rowKey = `list-${booking.id}`;

                          if (booking.status === 'bloqueado') {
                            return (
                              <tr key={rowKey} className="hover:bg-red-500/[0.01] bg-red-950/[0.01] transition-colors group">
                                <td className="py-4.5 px-6 space-y-1">
                                  <div className="flex items-center space-x-1.5 font-bold text-red-400">
                                    <Clock size={11} />
                                    <span className="font-mono text-[10px] uppercase">
                                      {formatDateToDMY(booking.date)} • {booking.time} hrs
                                    </span>
                                  </div>
                                  <div className="text-[8px] font-mono text-red-500/70">BLOQUEADO</div>
                                </td>
                                <td className="py-4.5 px-6 font-semibold text-red-400/80">
                                  Horario Bloqueado
                                </td>
                                <td className="py-4.5 px-6 font-medium text-text-secondary italic">
                                  Bloqueo Administrativo
                                </td>
                                <td className="py-4.5 px-6">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-1 rounded-full font-bold text-text-secondary">
                                      {specialist.avatar}
                                    </span>
                                    <span className="text-white/60">{specialist.name}</span>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6 text-text-secondary">-</td>
                                <td className="py-4.5 px-6">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border bg-red-500/5 border-red-500/35 text-red-400">
                                    Bloqueado
                                  </span>
                                </td>
                                <td className="py-4.5 px-6 text-right">
                                  <button
                                    onClick={() => {
                                      deleteBooking(booking.id);
                                      triggerNotification(`Horario del ${formatDateToDMY(booking.date)} ${booking.time} desbloqueado.`);
                                    }}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:text-white text-text-secondary text-[10px] font-semibold rounded-lg border border-white/10 transition-all cursor-pointer inline-flex items-center space-x-1"
                                  >
                                    <span>Desbloquear</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={rowKey} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="py-4.5 px-6 space-y-1">
                                <div className="flex items-center space-x-1.5 font-bold text-white">
                                  <Clock size={11} className="text-gold" />
                                  <span className="font-mono text-[10px] uppercase">
                                    {formatDateToDMY(booking.date)} • {booking.time} hrs
                                  </span>
                                </div>
                                <div className="text-[8px] font-mono text-text-secondary">{booking.id}</div>
                              </td>
                              <td className="py-4.5 px-6 space-y-0.5">
                                <div className="font-semibold text-white">{booking.clientName}</div>
                                {(() => {
                                  const cleanPhone = booking.clientPhone.replace(/\D/g, '');
                                  return (
                                    <a
                                      href={`https://wa.me/${cleanPhone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-text-secondary hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer w-fit font-mono"
                                    >
                                      <Smartphone size={10} className="text-emerald-500/80" />
                                      <span>{booking.clientPhone}</span>
                                    </a>
                                  );
                                })()}
                              </td>
                              <td className="py-4.5 px-6 font-medium text-white/90">{booking.serviceName}</td>
                              <td className="py-4.5 px-6">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-1 rounded-full font-bold text-gold">
                                    {specialist.avatar}
                                  </span>
                                  <span>{specialist.name}</span>
                                </div>
                              </td>
                              <td className="py-4.5 px-6">
                                <span className="inline-flex items-center gap-1 text-[10px] text-white/70">
                                  {booking.channel === 'Web' && <Globe size={11} className="text-blue-400" />}
                                  {booking.channel === 'WhatsApp' && <MessageSquare size={11} className="text-emerald-400" />}
                                  {booking.channel === 'Presencial' && <Smartphone size={11} className="text-amber-400" />}
                                  <span>{booking.channel}</span>
                                </span>
                              </td>
                              {(() => {
                                const computedStatus = getCurrentBookingStatus(booking.date, booking.time, booking.status, specialist.name);
                                return (
                                  <td className="py-4.5 px-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${
                                      computedStatus === 'En Proceso'
                                        ? 'bg-emerald-500/5 border-emerald-500/35 text-emerald-400'
                                        : computedStatus === 'Espera'
                                        ? 'bg-amber-500/5 border-amber-500/35 text-amber-400 animate-pulse'
                                        : computedStatus === 'proximo'
                                        ? 'bg-amber-500/5 border-amber-500/35 text-amber-400'
                                        : computedStatus === 'reservado'
                                        ? 'bg-blue-500/5 border-blue-500/35 text-blue-400'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        computedStatus === 'En Proceso'
                                          ? 'bg-emerald-400'
                                          : computedStatus === 'Espera'
                                          ? 'bg-amber-400'
                                          : computedStatus === 'proximo'
                                          ? 'bg-amber-400'
                                          : computedStatus === 'reservado'
                                          ? 'bg-blue-400'
                                          : 'bg-emerald-400'
                                      }`} />
                                      <span>
                                        {computedStatus === 'Finalizado' ? 'Pagado' : 
                                         computedStatus === 'Espera' ? 'En Espera' : 
                                         computedStatus}
                                      </span>
                                    </span>
                                  </td>
                                );
                              })()}
                              <td className="py-4.5 px-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {(() => {
                                    const computedStatus = getCurrentBookingStatus(booking.date, booking.time, booking.status, specialist.name);
                                    return (
                                      <>
                                        {(computedStatus === 'reservado' || computedStatus === 'proximo') && (
                                          <button
                                            onClick={() => {
                                              updateBookingStatus(booking.id, 'en_proceso');
                                              triggerNotification(`Servicio para ${booking.clientName} iniciado.`);
                                            }}
                                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/10 transition-all cursor-pointer"
                                          >
                                            <span>Iniciar</span>
                                          </button>
                                        )}
                                        {computedStatus === 'Espera' && (
                                          <button
                                            disabled={true}
                                            title="Debe finalizar el servicio en curso de este especialista primero"
                                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg border bg-white/5 border-white/5 text-text-secondary/40 cursor-not-allowed opacity-50 flex items-center space-x-1"
                                          >
                                            <span>Iniciar</span>
                                          </button>
                                        )}
                                        {computedStatus === 'En Proceso' && (
                                          <button
                                            onClick={() => {
                                              updateBookingStatus(booking.id, 'completado');
                                              triggerNotification(`Servicio para ${booking.clientName} cobrado y completado.`);
                                            }}
                                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                                          >
                                            <span>Cobrar</span>
                                          </button>
                                        )}
                                        {computedStatus === 'Finalizado' && (() => {
                                          const clientObj = clients.find(c => c.phone === booking.clientPhone);
                                          const isBad = clientObj?.notSoGoodClient;
                                          if (isBad) {
                                            return (
                                              <span className="text-[10px] font-bold text-red-400/60 bg-red-500/5 border border-red-500/10 px-2.5 py-1 rounded-lg select-none">
                                                No asistió (Registrado)
                                              </span>
                                            );
                                          }
                                          return (
                                            <button
                                              onClick={() => {
                                                markAsNotGoodClient(booking.clientPhone);
                                                triggerNotification(`Cliente ${booking.clientName} marcado como 'No tan buen cliente' por inasistencia.`);
                                              }}
                                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 transition-all cursor-pointer flex items-center space-x-1"
                                              title="Marcar Inasistencia (No-show)"
                                            >
                                              <UserX size={10} />
                                              <span>No asistió</span>
                                            </button>
                                          );
                                        })()}
                                        {computedStatus !== 'Finalizado' && (
                                          <button
                                            onClick={() => {
                                              deleteBooking(booking.id);
                                              triggerNotification(`Reserva ${booking.id} eliminada.`);
                                            }}
                                            className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded border border-transparent hover:border-red-500/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                            title="Eliminar Reserva"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. CRM TAB */}
        {activeTab === 'crm' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Clients List */}
            <div className="lg:col-span-8 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Header with Search and Filter bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre o teléfono..."
                    value={crmSearch}
                    onChange={(e) => setCrmSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-gold/50 transition-all text-white placeholder-white/35"
                  />
                  <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                </div>

                <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'barberia', label: 'Barbería' },
                    { id: 'peluqueria', label: 'Peluquería' },
                    { id: 'terapias', label: 'Terapias' },
                    { id: 'crossover', label: 'Crossover' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setCrmFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-full text-[8px] uppercase tracking-widest font-bold transition-all duration-300 focus:outline-none border cursor-pointer ${
                        crmFilter === f.id
                          ? 'bg-gold/10 border-gold/40 text-gold shadow-md'
                          : 'bg-white/5 border-transparent text-text-secondary hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table list of clients (Desktop Only) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-text-secondary">
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Negocios Activos</th>
                      <th className="py-3 px-4 text-right">Inversión</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-light">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 px-4 text-center text-text-secondary text-xs italic">
                          No hay clientes registrados en esta unidad de negocio.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => {
                        const isSelected = selectedClient?.phone === client.phone;
                        return (
                          <tr 
                            key={client.phone} 
                            onClick={() => setSelectedClient(client)}
                            className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${
                              isSelected ? 'bg-white/[0.02] border-l-2 border-gold' : ''
                            }`}
                          >
                            <td className="py-4.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{client.name}</span>
                                {client.notSoGoodClient && (
                                  <span className="text-[8px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded-full select-none">
                                    No tan buen cliente
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-text-secondary mt-0.5">
                                <a 
                                  href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer font-mono"
                                >
                                  <span>{client.phone}</span>
                                </a>
                              </div>
                            </td>
                            <td className="py-4.5 px-4 flex flex-wrap gap-1.5">
                              {client.businesses.includes('barberia') && (
                                <span className="text-[8px] font-bold uppercase tracking-wider bg-gold/5 border border-gold/15 text-gold px-2 py-0.5 rounded-full">Barbería</span>
                              )}
                              {client.businesses.includes('peluqueria') && (
                                <span className="text-[8px] font-bold uppercase tracking-wider bg-bronze/5 border border-bronze/15 text-[#CD7F32] px-2 py-0.5 rounded-full">Peluquería</span>
                              )}
                              {client.businesses.includes('terapias') && (
                                <span className="text-[8px] font-bold uppercase tracking-wider bg-platinum/5 border border-platinum/15 text-[#E2E0D8] px-2 py-0.5 rounded-full">Terapias</span>
                              )}
                            </td>
                            <td className="py-4.5 px-4 text-right font-semibold text-white/95">
                              ${client.totalSpent.toLocaleString('es-CL')}
                            </td>
                            <td className="py-4.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setClientToDelete({ phone: client.phone, name: client.name });
                                  }}
                                  className="p-1.5 hover:bg-red-500/10 text-white/30 hover:text-red-400 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                  title="Eliminar Cliente"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <ChevronRight size={14} className="text-text-secondary group-hover:text-gold transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-based Accordion List */}
              <div className="md:hidden flex flex-col space-y-4">
                {filteredClients.length === 0 ? (
                  <p className="text-xs text-text-secondary italic text-center py-8">
                    No hay clientes registrados en esta unidad de negocio.
                  </p>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedClient?.phone === client.phone;
                    return (
                      <div
                        key={client.phone}
                        className={`border rounded-2xl bg-[#070707] p-4.5 space-y-4 transition-all duration-300 ${
                          isSelected ? 'border-gold/30 bg-gold/[0.01]' : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Clickable Header */}
                        <div 
                          onClick={() => setSelectedClient(isSelected ? null : client)}
                          className="flex justify-between items-start gap-4 cursor-pointer"
                        >
                          <div className="space-y-1.5 text-left flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-semibold text-white text-sm">{client.name}</span>
                              {client.notSoGoodClient && (
                                <span className="text-[7px] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded-full select-none">
                                  No tan buen cliente
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-text-secondary font-mono">
                              {client.phone}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {client.businesses.includes('barberia') && (
                                <span className="text-[7px] font-bold uppercase tracking-wider bg-gold/5 border border-gold/15 text-gold px-2 py-0.5 rounded-full">Barbería</span>
                              )}
                              {client.businesses.includes('peluqueria') && (
                                <span className="text-[7px] font-bold uppercase tracking-wider bg-[#CD7F32]/5 border border-[#CD7F32]/15 text-[#CD7F32] px-2 py-0.5 rounded-full">Peluquería</span>
                              )}
                              {client.businesses.includes('terapias') && (
                                <span className="text-[7px] font-bold uppercase tracking-wider bg-[#E2E0D8]/5 border border-[#E2E0D8]/15 text-[#E2E0D8] px-2 py-0.5 rounded-full">Terapias</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end space-y-1">
                            <span className="text-[8px] uppercase tracking-wider text-text-secondary">Inversión</span>
                            <span className="text-xs font-semibold text-white/95">${client.totalSpent.toLocaleString('es-CL')}</span>
                            <ChevronDown 
                              size={12} 
                              className={`text-text-secondary transition-transform duration-300 mt-1 ${isSelected ? 'rotate-180 text-gold' : 'rotate-0'}`} 
                            />
                          </div>
                        </div>

                        {/* Collapsible details content */}
                        {isSelected && (
                          <div className="pt-4 border-t border-white/5">
                            {renderClientDetailContent(client)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Column: Client CRM Details & Cross-Selling Panel (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-4 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6 min-h-[400px]">
              {selectedClient ? (
                renderClientDetailContent(selectedClient)
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary font-light py-16 space-y-2">
                  <Users size={32} className="text-white/10" />
                  <p className="text-xs">Selecciona un cliente de la lista para ver su perfil completo, notas de atención y oportunidades de venta cruzada.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. GIFT CARDS TAB */}
        {activeTab === 'giftcards' && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { 
                  title: 'Total Gift Cards Emitidas', 
                  val: giftCards.length, 
                  icon: Gift,
                  color: 'text-gold'
                },
                { 
                  title: 'Saldo Total Circulante (CLP)', 
                  val: `$${giftCards.reduce((sum, c) => {
                    const isValid = new Date() <= new Date(c.expiresAt) && c.remainingBalance > 0;
                    return sum + (isValid ? c.remainingBalance : 0);
                  }, 0).toLocaleString('es-CL')}`, 
                  icon: DollarSign,
                  color: 'text-emerald-400'
                },
                { 
                  title: 'Gift Cards Activas', 
                  val: giftCards.filter(c => new Date() <= new Date(c.expiresAt) && c.remainingBalance > 0).length, 
                  icon: Check,
                  color: 'text-blue-400'
                },
                { 
                  title: 'Vencidas / Sin Saldo', 
                  val: giftCards.filter(c => new Date() > new Date(c.expiresAt) || c.remainingBalance <= 0).length, 
                  icon: X,
                  color: 'text-rose-500'
                }
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6 hover:border-gold/15 transition-all duration-300 space-y-4 shadow-lg text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold">{card.title}</span>
                      <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${card.color}`}>
                        <Icon size={14} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-serif text-2xl font-bold text-white leading-none">{card.val}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filter and Emission bar */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex bg-black rounded-xl border border-white/5 p-0.5 max-w-md w-full">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'activas', label: 'Activas' },
                  { id: 'vencidas', label: 'Expiradas' },
                  { id: 'sin_saldo', label: 'Sin Saldo' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setGiftCardTabFilter(f.id as any)}
                    className={`flex-1 text-center py-2 rounded-lg text-[9px] uppercase tracking-widest font-bold transition-all duration-300 focus:outline-none cursor-pointer ${
                      giftCardTabFilter === f.id
                        ? 'bg-gold/15 text-gold'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setEmitAmount(30000);
                  setEmitTheme('santuario');
                  setEmitRecipientName('');
                  setEmitRecipientEmail('');
                  setEmitSenderName('');
                  setEmitSenderEmail('');
                  setEmitMessage('');
                  setIsEmitModalOpen(true);
                }}
                className="text-[10px] uppercase tracking-widest font-bold px-5 py-3 rounded-full bg-gold hover:bg-[#b08732] text-black transition-all duration-300 flex items-center space-x-1.5 cursor-pointer shadow-lg hover:scale-105"
              >
                <Plus size={11} strokeWidth={3} />
                <span>Emitir Gift Card</span>
              </button>
            </div>

            {/* Gift Cards Table */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-xl text-left">
              <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Listado de Códigos Emitidos</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-text-secondary">
                      <th className="py-4 px-6">Código / Temática</th>
                      <th className="py-4 px-6">Destinatario</th>
                      <th className="py-4 px-6">Remitente</th>
                      <th className="py-4 px-6">Valor Original</th>
                      <th className="py-4 px-6">Saldo Restante</th>
                      <th className="py-4 px-6">Vencimiento</th>
                      <th className="py-4 px-6">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-light">
                    {giftCards
                      .filter((c) => {
                        const isExpired = new Date() > new Date(c.expiresAt);
                        const hasNoBalance = c.remainingBalance <= 0;
                        const isActive = !isExpired && !hasNoBalance;

                        if (giftCardTabFilter === 'todas') return true;
                        if (giftCardTabFilter === 'activas') return isActive;
                        if (giftCardTabFilter === 'vencidas') return isExpired;
                        if (giftCardTabFilter === 'sin_saldo') return hasNoBalance;
                        return true;
                      })
                      .map((c) => {
                        const isExpired = new Date() > new Date(c.expiresAt);
                        const hasNoBalance = c.remainingBalance <= 0;
                        const isActive = !isExpired && !hasNoBalance;

                        let statusLabel = 'Activa';
                        let statusStyles = 'bg-emerald-500/5 border-emerald-500/35 text-emerald-400';
                        let dotStyle = 'bg-emerald-400';

                        if (isExpired) {
                          statusLabel = 'Expirada';
                          statusStyles = 'bg-rose-500/5 border-rose-500/35 text-rose-400';
                          dotStyle = 'bg-rose-400';
                        } else if (hasNoBalance) {
                          statusLabel = 'Sin Saldo';
                          statusStyles = 'bg-zinc-700/5 border-zinc-700/35 text-zinc-400';
                          dotStyle = 'bg-zinc-400';
                        }

                        let themeLabel = 'Santuario';
                        let themeStyles = 'text-gold bg-gold/10 border-gold/10';
                        if (c.theme === 'barberia') {
                          themeLabel = 'Barbería (Valentes)';
                          themeStyles = 'text-gold bg-gold/15 border-gold/20';
                        } else if (c.theme === 'peluqueria') {
                          themeLabel = 'Peluquería (Alma Bela)';
                          themeStyles = 'text-bronze bg-[#CD7F32]/10 border-[#CD7F32]/20';
                        } else if (c.theme === 'terapias') {
                          themeLabel = 'Terapias (Essencia)';
                          themeStyles = 'text-platinum bg-[#E2E0D8]/10 border-[#E2E0D8]/20';
                        }

                        return (
                          <tr key={c.code} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4.5 px-6 space-y-1.5">
                              <div className="font-mono font-bold text-white tracking-wider">{c.code}</div>
                              <span className={`inline-block text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${themeStyles}`}>
                                {themeLabel}
                              </span>
                            </td>
                            <td className="py-4.5 px-6 space-y-0.5">
                              <div className="font-semibold text-white">{c.recipientName}</div>
                              <div className="text-[10px] text-text-secondary font-mono">{c.recipientEmail}</div>
                            </td>
                            <td className="py-4.5 px-6 space-y-0.5">
                              <div className="font-semibold text-white/90">{c.senderName}</div>
                              <div className="text-[10px] text-text-secondary font-mono">{c.senderEmail}</div>
                            </td>
                            <td className="py-4.5 px-6 font-serif font-semibold text-white">
                              ${c.originalAmount.toLocaleString('es-CL')}
                            </td>
                            <td className="py-4.5 px-6 font-serif font-semibold text-white">
                              ${c.remainingBalance.toLocaleString('es-CL')}
                            </td>
                            <td className="py-4.5 px-6 font-mono text-[10px] text-text-secondary">
                              {new Date(c.expiresAt).toLocaleDateString('es-CL', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }).toUpperCase()}
                            </td>
                            <td className="py-4.5 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${statusStyles}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
                                <span>{statusLabel}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MANUAL EMISSION MODAL */}
            <AnimatePresence>
              {isEmitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsEmitModalOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[32px] p-8 shadow-2xl z-10 text-left space-y-6 max-h-[90vh] overflow-y-auto"
                  >
                    <button
                      onClick={() => setIsEmitModalOpen(false)}
                      className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>

                    <div>
                      <h3 className="font-serif text-xl text-white font-semibold">Emitir Gift Card Manual</h3>
                      <p className="text-[9px] text-text-secondary uppercase tracking-widest mt-1">
                        Crear código de canje para un cliente administrativo
                      </p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!emitSenderName || !emitSenderEmail || !emitRecipientName || !emitRecipientEmail) return;
                        setIsEmitting(true);
                        setTimeout(() => {
                          const newCode = buyGiftCard({
                            originalAmount: emitAmount,
                            theme: emitTheme,
                            senderName: emitSenderName,
                            senderEmail: emitSenderEmail,
                            recipientName: emitRecipientName,
                            recipientEmail: emitRecipientEmail,
                            message: emitMessage || 'Cortesía de Santuario de Bienestar'
                          });
                          setIsEmitting(false);
                          setIsEmitModalOpen(false);
                          triggerNotification(`Gift Card generada con éxito: ${newCode}`);
                        }, 1000);
                      }} 
                      className="space-y-4"
                    >
                      {/* Amount */}
                      <div className="space-y-1.5">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Monto CLP *</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[30000, 45000, 60000, 80000].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setEmitAmount(v)}
                              className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                                emitAmount === v
                                  ? 'border-gold bg-gold/10 text-gold font-bold shadow-sm shadow-gold/5'
                                  : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20'
                              }`}
                            >
                              ${v.toLocaleString('es-CL')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Theme */}
                      <div className="space-y-1.5">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Temática *</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'santuario', label: 'Santuario' },
                            { id: 'barberia', label: 'Barbería' },
                            { id: 'peluqueria', label: 'Peluquería' },
                            { id: 'terapias', label: 'Terapias' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setEmitTheme(t.id as any)}
                              className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                                emitTheme === t.id
                                  ? 'border-gold bg-gold/10 text-gold font-bold shadow-sm shadow-gold/5'
                                  : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recipient */}
                      <div className="space-y-3 pt-1 border-t border-white/5">
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-gold font-bold">Para (Destinatario)</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-widest text-text-secondary">Nombre *</label>
                            <input
                              type="text"
                              required
                              placeholder="Nombre"
                              value={emitRecipientName}
                              onChange={(e) => setEmitRecipientName(e.target.value)}
                              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-widest text-text-secondary">Correo *</label>
                            <input
                              type="email"
                              required
                              placeholder="correo@destinatario.com"
                              value={emitRecipientEmail}
                              onChange={(e) => setEmitRecipientEmail(e.target.value)}
                              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sender */}
                      <div className="space-y-3 pt-1 border-t border-white/5">
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-gold font-bold">De (Remitente)</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-widest text-text-secondary">Nombre *</label>
                            <input
                              type="text"
                              required
                              placeholder="Nombre"
                              value={emitSenderName}
                              onChange={(e) => setEmitSenderName(e.target.value)}
                              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-widest text-text-secondary">Correo *</label>
                            <input
                              type="email"
                              required
                              placeholder="tu@correo.com"
                              value={emitSenderEmail}
                              onChange={(e) => setEmitSenderEmail(e.target.value)}
                              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-1">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Mensaje (Opcional)</label>
                        <textarea
                          placeholder="Mensaje o dedicatoria..."
                          value={emitMessage}
                          onChange={(e) => setEmitMessage(e.target.value)}
                          className="w-full bg-black/60 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-gold/30 h-16 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isEmitting}
                        className="w-full py-3.5 rounded-full bg-gold hover:bg-gold/90 text-black text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-1 shadow-lg disabled:opacity-50"
                      >
                        {isEmitting ? (
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={12} />
                            <span>Generar Código</span>
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 4. VISUAL CMS TAB */}
        {activeTab === 'vsm' && (
          <div className={vsmFullscreen ? "fixed inset-0 z-50 bg-[#080808] p-4 overflow-y-auto flex flex-col" : "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"}>
            
            <div className={vsmFullscreen ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full flex-grow" : "contents"}>
              {/* Left Column: Visual CMS Sidebar Navigation */}
              {!vsmFullscreen && (
                <div className="lg:col-span-3 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[500px]">
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Páginas Disponibles</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {[
                        { id: 'home', label: 'Inicio' },
                        { id: 'barberia', label: 'Barbería' },
                        { id: 'peluqueria', label: 'Peluquería' },
                        { id: 'peluqueria-gallery', label: 'Galería Peluquería' },
                        { id: 'terapias', label: 'Terapias' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setVsmPage(p.id as any);
                            setVsmPeluEntered(false);
                          }}
                          className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 text-left focus:outline-none cursor-pointer ${
                            vsmPage === p.id 
                              ? 'bg-gold/10 border border-gold/25 text-gold' 
                              : 'text-text-secondary hover:text-white hover:bg-white/[0.02] border border-transparent'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${vsmPage === p.id ? 'bg-gold' : 'bg-white/20'}`} />
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <button
                      onClick={handleVsmSave}
                      className="w-full py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Publicar Web</span>
                    </button>
                    <p className="text-[9px] text-text-secondary leading-relaxed font-light text-center">
                      Edita directamente los textos e imágenes haciendo clic sobre ellos en la ventana del navegador.
                    </p>
                  </div>
                </div>
              )}

              {/* Right Column: Browser Simulator */}
            <div className={vsmFullscreen ? "lg:col-span-12 w-full bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col flex-grow min-h-[calc(100vh-12rem)] pb-20" : "lg:col-span-9 bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col"}>
              
              {/* Browser Header Bar */}
              <div className="py-3 px-6 bg-[#121212] border-b border-white/5 flex items-center justify-between gap-4 select-none">
                {/* Dots */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>

                {/* Address Bar */}
                <div className="flex-1 max-w-md">
                  <div className="bg-black/60 border border-white/5 rounded-lg py-1.5 px-4 text-[10px] text-white/50 font-mono tracking-wide text-center flex items-center justify-center space-x-1.5">
                    <span className="text-gold">valentes.cl</span>
                    <span>/</span>
                    <span className="text-white/80">{vsmPage === 'home' ? '' : vsmPage}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setVsmFullscreen(!vsmFullscreen)}
                    className="p-1.5 bg-black rounded-lg border border-white/5 text-text-secondary hover:text-white hover:border-white/25 transition-all cursor-pointer flex items-center justify-center"
                    title={vsmFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                  >
                    {vsmFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                  </button>
                </div>
              </div>

              {/* Browser Canvas Content Area */}
              <div className="p-6 bg-black/60 min-h-[500px] flex items-center justify-center overflow-auto max-h-[550px] w-full">
                
                {vsmPage === 'peluqueria-gallery' ? (
                  /* Render the custom Visual Gallery Editor */
                  <div className="w-full max-w-4xl mx-auto bg-[#090909] text-[#fdfbf7] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[460px] text-left select-none relative">
                    
                    {/* Left Panel: Featured Image & Technique Details */}
                    {vsmForm.peluqueria.galleryItems && vsmForm.peluqueria.galleryItems.length > 0 ? (() => {
                      const currentItem = vsmForm.peluqueria.galleryItems[vsmGalleryIdx] || vsmForm.peluqueria.galleryItems[0];
                      if (!currentItem) return null;
                      return (
                        <div className="col-span-1 md:col-span-7 relative h-[250px] md:h-auto overflow-hidden border-b md:border-b-0 md:border-r border-white/5 group">
                          {isVideoUrl(currentItem.imageUrl) ? (
                            <video
                              src={currentItem.imageUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="absolute inset-0 object-cover w-full h-full opacity-60 group-hover:opacity-85 transition-all duration-700 pointer-events-none"
                            />
                          ) : (
                            <img
                              src={currentItem.imageUrl}
                              alt={currentItem.title}
                              className="absolute inset-0 object-cover w-full h-full opacity-60 group-hover:opacity-85 transition-all duration-700 pointer-events-none"
                            />
                          )}
                          {/* Dark shading mask */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />

                          {/* Image Edit Trigger */}
                          <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => setEditingAsset({ page: 'peluqueria-gallery', key: 'imageUrl', label: 'Imagen de Portafolio', currentValue: currentItem.imageUrl, itemId: currentItem.id })}
                              className="bg-black/80 hover:bg-gold hover:text-black border border-white/10 text-white rounded-full px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-lg"
                            >
                              <Camera size={10} />
                              <span>Cambiar Imagen</span>
                            </button>
                          </div>

                          {/* Service Linker Selector */}
                          <div className="absolute top-3 left-3 z-35">
                            <select
                              value={currentItem.serviceId || ''}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                if (selectedId) {
                                  // Find the linked service in servicesData
                                  const allServices = Object.values(servicesData).flatMap(section => section.services || []);
                                  const s = allServices.find(srv => srv.id === selectedId);
                                  if (s) {
                                    handleGalleryItemChange(currentItem.id, 'serviceId', selectedId);
                                    handleGalleryItemChange(currentItem.id, 'title', s.name);
                                    handleGalleryItemChange(currentItem.id, 'price', s.price);
                                    handleGalleryItemChange(currentItem.id, 'duration', s.duration);
                                  }
                                } else {
                                  // Unlink serviceId
                                  handleGalleryItemChange(currentItem.id, 'serviceId', '');
                                }
                              }}
                              className="bg-black/85 hover:bg-black border border-white/10 text-white hover:border-gold/30 rounded-full px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold focus:outline-none transition-all cursor-pointer shadow-lg max-w-[180px] font-sans"
                            >
                              <option value="">Texto Libre</option>
                              {Object.entries(servicesData).map(([catKey, section]) => (
                                <optgroup key={catKey} label={catKey.toUpperCase()} className="bg-neutral-900 text-white">
                                  {(section.services || []).map((srv) => (
                                    <option key={srv.id} value={srv.id}>
                                      {srv.name} ({srv.price})
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>

                          {/* Left/Right Navigation Arrows */}
                          {vsmForm.peluqueria.galleryItems.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVsmGalleryIdx((prev) => (prev - 1 + vsmForm.peluqueria.galleryItems.length) % vsmForm.peluqueria.galleryItems.length);
                                }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 border border-white/10 text-white hover:text-black hover:bg-gold hover:border-gold hover:scale-110 transition-all cursor-pointer z-20 focus:outline-none"
                              >
                                <ChevronLeft size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVsmGalleryIdx((prev) => (prev + 1) % vsmForm.peluqueria.galleryItems.length);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 border border-white/10 text-white hover:text-black hover:bg-gold hover:border-gold hover:scale-110 transition-all cursor-pointer z-20 focus:outline-none"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </>
                          )}

                          {/* Details overlay at the bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 space-y-2">
                            <span className="text-[8px] uppercase tracking-widest text-gold bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full font-semibold inline-block">
                              {renderEditableGalleryText(currentItem.id, 'stylist', currentItem.stylist, 'text-gold')}
                            </span>
                            <h4 className="font-serif text-lg text-white font-medium tracking-wide">
                              {renderEditableGalleryText(currentItem.id, 'title', currentItem.title, 'text-white font-serif')}
                            </h4>
                            <p className="text-[11px] text-white/70 leading-relaxed font-light max-w-xl">
                              {renderEditableGalleryText(currentItem.id, 'technique', currentItem.technique, 'text-white/70 font-light')}
                            </p>
                            <div className="flex items-center space-x-3 pt-1 text-[10px] text-gold font-light">
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {renderEditableGalleryText(currentItem.id, 'duration', currentItem.duration, 'text-gold')}
                              </span>
                              <span>•</span>
                              <span>
                                Valor: {renderEditableGalleryText(currentItem.id, 'price', currentItem.price, 'text-gold')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="col-span-7 flex items-center justify-center text-text-secondary text-xs">No hay trabajos en la galería</div>
                    )}

                    {/* Right Panel: Thumbnails Grid & Actions */}
                    <div className="col-span-1 md:col-span-5 p-6 flex flex-col justify-between bg-[#060606] overflow-y-auto max-h-[460px]">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <div>
                            <h3 className="font-serif text-xs text-gold tracking-wide">Trabajos en Galería</h3>
                            <p className="text-[8px] text-text-secondary tracking-widest uppercase mt-0.5">Gestión visual interactiva</p>
                          </div>
                          
                          {/* Add button */}
                          <button
                            onClick={handleGalleryItemAdd}
                            className="py-1.5 px-3.5 rounded-full bg-gold hover:bg-gold/90 text-black text-[9px] uppercase font-bold tracking-widest flex items-center space-x-1 cursor-pointer transition-all shadow-md shadow-gold/10"
                            title="Añadir Trabajo"
                          >
                            <Plus size={10} />
                            <span>Añadir</span>
                          </button>
                        </div>

                        {/* Grid of thumbnails */}
                        <div className="grid grid-cols-3 gap-2">
                          {(vsmForm.peluqueria.galleryItems || []).map((item, index) => {
                            const isSelected = vsmGalleryIdx === index;
                            return (
                              <div key={item.id} className="relative group/thumb aspect-square">
                                <button
                                  onClick={() => setVsmGalleryIdx(index)}
                                  className={`w-full h-full rounded-xl overflow-hidden border-2 transition-all duration-300 focus:outline-none ${
                                    isSelected ? 'border-gold scale-105 shadow-[0_0_10px_rgba(198,155,60,0.25)]' : 'border-white/10 hover:border-white/20'
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
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="object-cover w-full h-full pointer-events-none"
                                    />
                                  )}
                                </button>
                                
                                {/* Trash button overlay */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSelected) {
                                      setVsmGalleryIdx(prev => Math.max(0, prev - 1));
                                    }
                                    handleGalleryItemDelete(item.id);
                                  }}
                                  className="absolute -top-1 -right-1 p-1 bg-red-600/90 text-white rounded-full border border-red-500/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-red-600 hover:scale-110 cursor-pointer shadow-lg z-20"
                                  title="Eliminar Trabajo"
                                >
                                  <Trash2 size={9} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : vsmViewMode === 'desktop' ? (
                  /* DESKTOP PREVIEW WRAPPER */
                  <div className="w-full max-w-4xl mx-auto h-[450px] overflow-y-auto scrollbar-none relative border border-white/5 rounded-2xl bg-black">
                    
                    {/* Desktop Headers */}
                    <div className="py-4 border-b border-white/5 bg-black/95 text-center sticky top-0 z-40 select-none">
                      <span className="font-serif text-xs tracking-[0.25em] text-gold font-bold">VALENTES</span>
                      <span className="block text-[6px] text-white/40 tracking-[0.2em] uppercase">Santuario de Bienestar</span>
                    </div>

                    {/* Desktop Content Pages */}
                    <div className="p-6">
                      
                      {/* HOME PAGE DESKTOP */}
                      {vsmPage === 'home' && (
                        <div className="flex flex-row w-full h-[320px] bg-black relative rounded-xl overflow-hidden border border-white/5">
                          {[
                            { title: vsmForm.home.panel1Title, subtitle: vsmForm.home.panel1Subtitle, img: vsmForm.home.panel1Image, keyTitle: 'panel1Title', keySubtitle: 'panel1Subtitle', keyImg: 'panel1Image', label: vsmForm.home.panel1Label || 'Ritual 01', keyLabel: 'panel1Label', name: 'Barbería' },
                            { title: vsmForm.home.panel2Title, subtitle: vsmForm.home.panel2Subtitle, img: vsmForm.home.panel2Image, keyTitle: 'panel2Title', keySubtitle: 'panel2Subtitle', keyImg: 'panel2Image', label: vsmForm.home.panel2Label || 'Ritual 02', keyLabel: 'panel2Label', name: 'Peluquería' },
                            { title: vsmForm.home.panel3Title, subtitle: vsmForm.home.panel3Subtitle, img: vsmForm.home.panel3Image, keyTitle: 'panel3Title', keySubtitle: 'panel3Subtitle', keyImg: 'panel3Image', label: vsmForm.home.panel3Label || 'Ritual 03', keyLabel: 'panel3Label', name: 'Terapias' }
                          ].map((panel, idx) => (
                            <div key={idx} className="flex-1 relative overflow-hidden flex flex-col justify-end p-5 border-r border-white/5 last:border-0 group select-none">
                              {renderMediaPreview(panel.img, "absolute inset-0 object-cover w-full h-full opacity-55 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-700 pointer-events-none")}
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                              
                              {renderEditableImage('home', panel.keyImg, `Imagen ${panel.name}`, panel.img)}
                              
                              <div className="relative z-20 space-y-1">
                                <span className="text-[7px] uppercase tracking-[0.25em] text-gold font-bold block">
                                  {renderEditableText('home', panel.keyLabel, panel.label, 'text-gold font-sans')}
                                </span>
                                <h3 className="font-serif text-sm text-white tracking-wide font-medium leading-tight">
                                  {renderEditableText('home', panel.keyTitle, panel.title, 'text-white hover:text-gold focus:text-gold font-serif')}
                                </h3>
                                <p className="text-[9px] text-text-secondary font-light leading-relaxed">
                                  {renderEditableText('home', panel.keySubtitle, panel.subtitle, 'text-text-secondary')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* BARBERIA DESKTOP */}
                      {vsmPage === 'barberia' && (
                        <div className="space-y-6">
                          {/* Hero Panel */}
                          <div className="relative rounded-xl overflow-hidden bg-[#070707] border border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 group text-left">
                            <div className="space-y-2.5 max-w-md">
                              <h2 className="font-serif text-2xl font-bold tracking-[0.2em] text-white leading-none">
                                {renderEditableText('barberia', 'heroTitle', vsmForm.barberia.heroTitle, 'text-white font-serif')}
                              </h2>
                              <span className="text-[9px] tracking-[0.4em] text-gold uppercase block">
                                {renderEditableText('barberia', 'heroSubtitle', vsmForm.barberia.heroSubtitle, 'text-gold')}
                              </span>
                              <p className="text-[10px] text-text-secondary leading-relaxed font-light">
                                {renderEditableText('barberia', 'pageDescription', vsmForm.barberia.pageDescription, 'text-text-secondary')}
                              </p>
                              <button className="px-4 py-2 rounded-full border border-gold/40 text-gold text-[8px] uppercase tracking-widest font-bold bg-black/40 hover:bg-gold hover:text-black transition-all cursor-pointer">
                                {renderEditableText('barberia', 'discoverBtn', vsmForm.barberia.discoverBtn, 'text-inherit font-bold')}
                              </button>
                            </div>
                            
                            {/* Animated barber pole */}
                            <div className="w-20 h-32 relative flex items-center justify-center border border-white/10 rounded-full bg-zinc-950 overflow-hidden shadow-lg select-none">
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,#ff2a2a_25%,#ffffff_25%,#ffffff_50%,#0055ff_50%,#0055ff_75%,#ffffff_75%,#ffffff)] bg-[size:20px_20px] animate-[barberpole_2s_linear_infinite] opacity-40" />
                              <div className="w-2 h-24 bg-zinc-400/35 rounded-full z-10" />
                            </div>
                          </div>

                          {/* Menu title */}
                          <div className="text-left space-y-1">
                            <span className="text-[8px] text-gold uppercase tracking-wider block font-bold">Carta de Rituales</span>
                            <h3 className="font-serif text-sm text-white font-medium">
                              {renderEditableText('barberia', 'pageTitle', vsmForm.barberia.pageTitle, 'text-white font-serif')}
                            </h3>
                          </div>

                          {/* Tryptych Grid */}
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { 
                                title: vsmForm.barberia.titleCabello || 'Ritual de Cabello', 
                                price: vsmForm.barberia.priceCabello || 'Desde $12.000', 
                                img: vsmForm.barberia.imageCabello, 
                                keyImg: 'imageCabello',
                                keyTitle: 'titleCabello',
                                keyPrice: 'priceCabello'
                              },
                              { 
                                title: vsmForm.barberia.titleBarba || 'Ritual de Barba', 
                                price: vsmForm.barberia.priceBarba || 'Desde $12.000', 
                                img: vsmForm.barberia.imageBarba, 
                                keyImg: 'imageBarba',
                                keyTitle: 'titleBarba',
                                keyPrice: 'priceBarba'
                              },
                              { 
                                title: vsmForm.barberia.titleCompleto || 'Ritual Completo', 
                                price: vsmForm.barberia.priceCompleto || 'Desde $20.000', 
                                img: vsmForm.barberia.imageCompleto, 
                                keyImg: 'imageCompleto',
                                keyTitle: 'titleCompleto',
                                keyPrice: 'priceCompleto'
                              }
                            ].map((rit, idx) => (
                              <div key={idx} className="relative h-[130px] rounded-xl overflow-hidden flex flex-col justify-end p-3.5 border border-white/5 group select-none">
                                {renderMediaPreview(rit.img, "absolute inset-0 object-cover w-full h-full opacity-45 group-hover:opacity-75 transition-all duration-700 pointer-events-none")}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                                
                                {renderEditableImage('barberia', rit.keyImg, rit.title, rit.img)}
                                
                                <div className="relative z-10 flex justify-between items-end">
                                  <div className="text-left">
                                    <span className="text-[6px] text-gold uppercase block">Ritual 0{idx+1}</span>
                                    <span className="font-serif text-[10px] text-white font-medium block leading-none mt-0.5">
                                      {renderEditableText('barberia', rit.keyTitle, rit.title, 'text-white font-serif')}
                                    </span>
                                  </div>
                                  <span className="text-[8px] text-gold font-serif leading-none font-semibold">
                                    {renderEditableText('barberia', rit.keyPrice, rit.price, 'text-gold font-serif')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PELUQUERIA DESKTOP */}
                      {vsmPage === 'peluqueria' && (
                        <div className="min-h-[300px] flex flex-col justify-center relative">
                          <AnimatePresence mode="wait">
                            {!vsmPeluEntered ? (
                              /* ── PORTADA / COVER ── */
                              <motion.div
                                key="cover"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#080808] border border-white/5 rounded-xl p-8 text-center space-y-6 flex flex-col items-center justify-center relative min-h-[280px]"
                              >
                                {/* Logo placeholder */}
                                <div className="w-14 h-14 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mx-auto">
                                  <span className="text-gold/60 text-[8px] uppercase tracking-widest font-bold">Logo</span>
                                </div>

                                <div className="space-y-1">
                                  <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-gold leading-none">
                                    {renderEditableText('peluqueria', 'overlayLine1', vsmForm.peluqueria.overlayLine1, 'text-gold font-serif')}
                                  </h2>
                                  <h2 className="font-serif text-3xl font-bold tracking-[0.2em] text-gold leading-none mt-2">
                                    {renderEditableText('peluqueria', 'overlayLine2', vsmForm.peluqueria.overlayLine2, 'text-gold font-serif')}
                                  </h2>
                                  <div className="w-12 h-[1px] bg-gold/30 mx-auto mt-4" />
                                  <span className="text-[10px] uppercase tracking-[0.4em] text-gold/80 block mt-2 font-semibold">
                                    {renderEditableText('peluqueria', 'overlaySubtitle', vsmForm.peluqueria.overlaySubtitle, 'text-gold/80')}
                                  </span>
                                </div>

                                <button
                                  onClick={() => setVsmPeluEntered(true)}
                                  className="px-5 py-2.5 border border-gold/45 text-gold text-[8px] uppercase tracking-[0.2em] rounded-full hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 font-bold bg-black/40 cursor-pointer shadow-md"
                                >
                                  INGRESAR AL RITUAL
                                </button>
                              </motion.div>
                            ) : (
                              /* ── INTERIOR / BENTO GRID ── */
                              <motion.div
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-5 text-left"
                              >
                                {/* Back button */}
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => setVsmPeluEntered(false)}
                                    className="text-[8px] text-white/50 hover:text-gold uppercase tracking-wider border border-white/10 rounded-full px-2.5 py-1 bg-black/40 cursor-pointer"
                                  >
                                    ← Volver a Portada
                                  </button>
                                </div>

                                {/* Bento Grid — 4 columns, auto rows of 130px */}
                                <div className="grid grid-cols-4 gap-2 auto-rows-[130px]">

                                  {/* c1 — Service */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-2">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC1 || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 bg-bronze/5 pointer-events-none" style={{ mixBlendMode: 'color' }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                      <span className="text-[7px] uppercase tracking-widest text-gold/80 block font-semibold">
                                        {servicesData.peluqueria?.services?.[0]?.duration || '60 min'}
                                      </span>
                                      <h3 className="font-serif text-xs tracking-wide font-medium leading-snug text-white">
                                        {servicesData.peluqueria?.services?.[0]?.name || 'Servicio 1'}
                                      </h3>
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC1', 'Imagen Corte', vsmForm.peluqueria.bentoImageC1)}
                                  </div>

                                  {/* c2 — Gallery trigger */}
                                  <div
                                    onClick={() => setVsmPeluGalleryOpen(true)}
                                    className="relative overflow-hidden rounded-2xl bg-[#121212] border border-gold/25 group col-span-1 row-span-1 cursor-pointer hover:border-gold/50 transition-colors"
                                    title="Clic para previsualizar la Galería"
                                  >
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC2 || 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                      <span className="text-[7px] uppercase tracking-widest text-gold/80 block font-semibold">✦ Portafolio de Arte</span>
                                      <h3 className="font-serif text-xs tracking-wide font-medium text-white">
                                        {renderEditableText('peluqueria', 'galeriaTriggerTitle', vsmForm.peluqueria.galeriaTriggerTitle || 'Galería de Trabajos', 'text-white font-serif text-xs')}
                                      </h3>
                                    </div>
                                    <div className="absolute top-1.5 right-1.5 bg-gold/80 text-black text-[6px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      Ver popup
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC2', 'Imagen Galería', vsmForm.peluqueria.bentoImageC2)}
                                  </div>

                                  {/* c3 — Service */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-2">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC3 || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                      <span className="text-[7px] uppercase tracking-widest text-gold/80 block font-semibold">
                                        {servicesData.peluqueria?.services?.[1]?.duration || '90 min'}
                                      </span>
                                      <h3 className="font-serif text-xs tracking-wide font-medium leading-snug text-white">
                                        {servicesData.peluqueria?.services?.[1]?.name || 'Coloración Orgánica'}
                                      </h3>
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC3', 'Imagen Coloración', vsmForm.peluqueria.bentoImageC3)}
                                  </div>

                                  {/* c4 — Deco vertical text */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-3">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC4 || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                                      <span
                                        className="font-serif text-gold/20 text-3xl tracking-[0.4em] uppercase whitespace-nowrap"
                                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                      >
                                        {vsmForm.peluqueria.overlayLine1 || 'ALMA'}
                                      </span>
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC4', 'Imagen Deco Texto', vsmForm.peluqueria.bentoImageC4)}
                                  </div>

                                  {/* c5 — Service */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-2">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC5 || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                      <span className="text-[7px] uppercase tracking-widest text-gold/80 block font-semibold">
                                        {servicesData.peluqueria?.services?.[2]?.duration || '60 min'}
                                      </span>
                                      <h3 className="font-serif text-xs tracking-wide font-medium leading-snug text-white">
                                        {servicesData.peluqueria?.services?.[2]?.name || 'Tratamiento Seda'}
                                      </h3>
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC5', 'Imagen Tratamiento', vsmForm.peluqueria.bentoImageC5)}
                                  </div>

                                  {/* c6 — Specialists trigger */}
                                  <div
                                    onClick={() => setVsmPeluSpecialistsOpen(true)}
                                    className="relative overflow-hidden rounded-2xl bg-[#121212] border border-gold/25 group col-span-1 row-span-1 cursor-pointer hover:border-gold/50 transition-colors"
                                    title="Clic para previsualizar Especialistas"
                                  >
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC6 || 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                      <span className="text-[7px] uppercase tracking-widest text-gold/80 block font-semibold">★ Estilo &amp; Experiencia</span>
                                      <h3 className="font-serif text-xs tracking-wide font-medium text-white">
                                        {renderEditableText('peluqueria', 'specialistsTriggerTitle', vsmForm.peluqueria.specialistsTriggerTitle || 'Nuestras Especialistas', 'text-white font-serif text-xs')}
                                      </h3>
                                    </div>
                                    <div className="absolute top-1.5 right-1.5 bg-gold/80 text-black text-[6px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      Ver popup
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC6', 'Imagen Especialistas', vsmForm.peluqueria.bentoImageC6)}
                                  </div>

                                  {/* c7 — Services trigger */}
                                  <div
                                    onClick={() => setVsmPeluServicesOpen(true)}
                                    className="relative overflow-hidden rounded-2xl bg-[#121212] border border-gold/25 group col-span-1 row-span-1 cursor-pointer hover:border-gold/50 transition-colors"
                                    title="Clic para previsualizar Carta de Servicios"
                                  >
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC7 || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                      <span className="text-[7px] uppercase tracking-widest text-gold/80 block font-semibold">✂ Carta de Servicios</span>
                                      <h3 className="font-serif text-xs tracking-wide font-medium text-white">
                                        {renderEditableText('peluqueria', 'servicesTriggerTitle', vsmForm.peluqueria.servicesTriggerTitle || 'Ver Todos los Servicios', 'text-white font-serif text-xs')}
                                      </h3>
                                    </div>
                                    <div className="absolute top-1.5 right-1.5 bg-gold/80 text-black text-[6px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      Ver popup
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC7', 'Imagen Carta de Servicios', vsmForm.peluqueria.bentoImageC7)}
                                  </div>

                                  {/* c8 — Service */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-1">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC8 || 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                                      <span className="text-[7px] uppercase tracking-widest text-gold/80 block font-semibold">
                                        {servicesData.peluqueria?.services?.[3]?.duration || '45 min'}
                                      </span>
                                      <h3 className="font-serif text-xs tracking-wide font-medium leading-snug text-white">
                                        {servicesData.peluqueria?.services?.[3]?.name || 'Peinado Editorial'}
                                      </h3>
                                    </div>
                                    {renderEditableImage('peluqueria', 'bentoImageC8', 'Imagen Peinado', vsmForm.peluqueria.bentoImageC8)}
                                  </div>

                                  {/* c9 — Deco */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-2">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC9 || 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    {renderEditableImage('peluqueria', 'bentoImageC9', 'Imagen Decoración 1', vsmForm.peluqueria.bentoImageC9)}
                                  </div>

                                  {/* c10 — Deco */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-2">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC10 || 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    {renderEditableImage('peluqueria', 'bentoImageC10', 'Imagen Decoración 2', vsmForm.peluqueria.bentoImageC10)}
                                  </div>

                                  {/* c11 — Deco */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-1">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC11 || 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    {renderEditableImage('peluqueria', 'bentoImageC11', 'Imagen Decoración 3', vsmForm.peluqueria.bentoImageC11)}
                                  </div>

                                  {/* c12 — Deco */}
                                  <div className="relative overflow-hidden rounded-2xl bg-[#121212] border border-white/5 group col-span-1 row-span-1">
                                    {renderMediaPreview(vsmForm.peluqueria.bentoImageC12 || 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=70', "absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-all duration-700 pointer-events-none")}
                                    {renderEditableImage('peluqueria', 'bentoImageC12', 'Imagen Decoración 4', vsmForm.peluqueria.bentoImageC12)}
                                  </div>

                                </div>

                                {/* Legend: interactive trigger cards */}
                                <div className="flex items-center gap-1.5 text-[7px] text-white/30 font-light pt-1">
                                  <div className="w-2 h-2 rounded-full border border-gold/40 flex-shrink-0" />
                                  <span>Las tarjetas con borde dorado son interactivas — haz clic para previsualizar su popup</span>
                                </div>

                                {/* Editable title & description */}
                                <div className="space-y-1 pt-2 border-t border-white/5">
                                  <span className="text-[8px] text-gold uppercase tracking-wider font-bold block">Carta de Estilo</span>
                                  <h3 className="font-serif text-sm text-white font-medium">
                                    {renderEditableText('peluqueria', 'pageTitle', vsmForm.peluqueria.pageTitle, 'text-white font-serif')}
                                  </h3>
                                  <p className="text-[10px] text-text-secondary leading-relaxed font-light">
                                    {renderEditableText('peluqueria', 'pageDescription', vsmForm.peluqueria.pageDescription, 'text-text-secondary')}
                                  </p>
                                </div>

                                {/* ── GALLERY POPUP PREVIEW ── */}
                                <AnimatePresence>
                                  {vsmPeluGalleryOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                                    >
                                      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setVsmPeluGalleryOpen(false)} />
                                      <div className="relative w-full max-w-4xl bg-[#090909] text-[#fdfbf7] rounded-[32px] overflow-hidden z-10 border border-gold/25 shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[500px] max-h-[90vh] md:max-h-[80vh] text-left">
                                        
                                        {/* Close Button */}
                                        <button
                                          onClick={() => setVsmPeluGalleryOpen(false)}
                                          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer z-30 focus:outline-none"
                                        >
                                          <X size={16} />
                                        </button>

                                        {/* Left Panel: Featured Image & Details */}
                                        {vsmForm.peluqueria.galleryItems && vsmForm.peluqueria.galleryItems.length > 0 ? (() => {
                                          const currentItem = vsmForm.peluqueria.galleryItems[vsmGalleryIdx] || vsmForm.peluqueria.galleryItems[0];
                                          if (!currentItem) return null;
                                          return (
                                            <div className="col-span-1 md:col-span-7 relative h-[250px] md:h-auto overflow-hidden border-b md:border-b-0 md:border-r border-white/5 group">
                                              {isVideoUrl(currentItem.imageUrl) ? (
                                                <video
                                                  src={currentItem.imageUrl}
                                                  autoPlay
                                                  loop
                                                  muted
                                                  playsInline
                                                  className="absolute inset-0 object-cover w-full h-full opacity-60 transition-all duration-700 pointer-events-none"
                                                />
                                              ) : (
                                                <img
                                                  src={currentItem.imageUrl}
                                                  alt={currentItem.title}
                                                  className="absolute inset-0 object-cover w-full h-full opacity-60 transition-all duration-700 pointer-events-none"
                                                />
                                              )}
                                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />

                                              {/* Image Edit Trigger (using 'imageUrl' key so it saves properly) */}
                                              <div className="absolute top-4 right-4 z-30">
                                                <button
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setEditingAsset({
                                                      page: 'peluqueria',
                                                      key: 'imageUrl',
                                                      label: `Foto Galería: ${currentItem.title}`,
                                                      currentValue: currentItem.imageUrl,
                                                      itemId: currentItem.id
                                                    });
                                                  }}
                                                  className="bg-black/90 hover:bg-gold hover:text-black border border-gold/30 text-white rounded-lg px-2.5 py-1.5 text-[9px] uppercase tracking-widest font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-lg"
                                                >
                                                  <Camera size={10} />
                                                  <span>Cambiar Imagen</span>
                                                </button>
                                              </div>

                                              {/* Details overlay at the bottom */}
                                              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 space-y-3">
                                                <span className="text-[9px] uppercase tracking-widest text-gold bg-gold/10 border border-gold/25 px-2.5 py-1 rounded-full font-semibold inline-block">
                                                  {renderEditableGalleryText(currentItem.id, 'stylist', currentItem.stylist, 'text-gold')}
                                                </span>
                                                <h4 className="font-serif text-2xl text-white font-medium tracking-wide">
                                                  {renderEditableGalleryText(currentItem.id, 'title', currentItem.title, 'text-white font-serif')}
                                                </h4>
                                                <p className="text-xs text-white/70 leading-relaxed font-light max-w-xl">
                                                  {renderEditableGalleryText(currentItem.id, 'technique', currentItem.technique, 'text-white/70 font-light')}
                                                </p>
                                                <div className="flex items-center space-x-4 pt-1.5 text-xs text-gold font-light">
                                                  <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {renderEditableGalleryText(currentItem.id, 'duration', currentItem.duration, 'text-gold')}
                                                  </span>
                                                  <span>•</span>
                                                  <span>
                                                    Valor Estimado: {renderEditableGalleryText(currentItem.id, 'price', currentItem.price, 'text-gold')}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })() : (
                                          <div className="col-span-7 flex items-center justify-center text-text-secondary text-xs">No hay trabajos en la galería</div>
                                        )}

                                        {/* Right Panel: Thumbnails Grid & Action Buttons */}
                                        <div className="col-span-1 md:col-span-5 p-8 bg-[#070707] flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-[80vh]">
                                          <div className="space-y-6">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                              <div>
                                                <h3 className="font-serif text-lg text-gold tracking-wide">
                                                  {renderEditableText('peluqueria', 'galeriaTriggerTitle', vsmForm.peluqueria.galeriaTriggerTitle || 'Galería de Trabajos', 'text-gold font-serif text-lg')}
                                                </h3>
                                                <p className="text-[9px] text-text-secondary tracking-widest uppercase mt-0.5">Explora coloraciones y diseños</p>
                                              </div>
                                              
                                              {/* Add button */}
                                              <button
                                                onClick={handleGalleryItemAdd}
                                                className="py-1.5 px-3 rounded-full bg-gold hover:bg-gold/90 text-black text-[9px] uppercase font-bold tracking-widest flex items-center space-x-1 cursor-pointer transition-all shadow-md shadow-gold/10"
                                                title="Añadir Trabajo"
                                              >
                                                <Plus size={10} />
                                                <span>Añadir</span>
                                              </button>
                                            </div>

                                            {/* Grid of thumbnails */}
                                            <div className="grid grid-cols-3 gap-3">
                                              {(vsmForm.peluqueria.galleryItems || []).map((item, index) => {
                                                const isSelected = vsmGalleryIdx === index;
                                                return (
                                                  <div key={item.id} className="relative group/thumb aspect-square">
                                                    <button
                                                      onClick={() => setVsmGalleryIdx(index)}
                                                      className={`w-full h-full rounded-2xl overflow-hidden border-2 transition-all duration-300 focus:outline-none ${
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
                                                        <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full pointer-events-none" />
                                                      )}
                                                    </button>
                                                    
                                                    {/* Trash button overlay */}
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isSelected) {
                                                          setVsmGalleryIdx(prev => Math.max(0, prev - 1));
                                                        }
                                                        handleGalleryItemDelete(item.id);
                                                      }}
                                                      className="absolute -top-1.5 -right-1.5 p-1.5 bg-red-600 text-white rounded-full border border-red-500/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-red-700 hover:scale-110 cursor-pointer shadow-lg z-20"
                                                      title="Eliminar Trabajo"
                                                    >
                                                      <Trash2 size={9} />
                                                    </button>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          <div className="pt-6 border-t border-white/5">
                                            <p className="text-[10px] text-text-secondary leading-relaxed font-light">
                                              Modo Edición: Haz clic sobre los textos en el panel izquierdo (Estilista, Título, Técnica, Duración, Precio) para modificarlos. Los cambios se guardarán automáticamente al salir del campo.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* ── SPECIALISTS POPUP PREVIEW ── */}
                                <AnimatePresence>
                                  {vsmPeluSpecialistsOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                                    >
                                      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setVsmPeluSpecialistsOpen(false)} />
                                      <div className="relative w-full max-w-2xl bg-[#090909] border border-gold/25 rounded-2xl p-6 z-10 max-h-[85vh] overflow-y-auto shadow-2xl">
                                        <button onClick={() => setVsmPeluSpecialistsOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer">✕</button>
                                        <div className="mb-5">
                                          <span className="text-[8px] uppercase tracking-widest text-gold font-bold block mb-1">★ Estilo &amp; Experiencia</span>
                                          <h3 className="font-serif text-lg text-gold">
                                            {renderEditableText('peluqueria', 'specialistsTriggerTitle', vsmForm.peluqueria.specialistsTriggerTitle || 'Nuestras Especialistas', 'text-gold font-serif')}
                                          </h3>
                                          <p className="text-[9px] text-text-secondary mt-0.5">Alma Bela Studio • Peluquería de Autor</p>
                                        </div>
                                        <div className="space-y-3">
                                          {(servicesData.peluqueria?.specialists || []).map((sp) => (
                                            <div key={sp.id} className="flex gap-3 bg-[#0c0c0c] border border-white/5 rounded-xl p-3 items-center hover:border-gold/15 transition-colors text-left">
                                              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-gold/15 flex-shrink-0 overflow-hidden">
                                                {sp.imageUrl ? (
                                                  <img src={sp.imageUrl} alt={sp.name} className="w-full h-full object-cover" />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-gold/70 font-serif text-sm font-bold">{sp.avatar}</div>
                                                )}
                                              </div>
                                              <div className="flex-grow min-w-0">
                                                <h4 className="font-serif text-xs text-white font-medium leading-none">{sp.name}</h4>
                                                <span className="text-[8px] uppercase tracking-wider text-gold block mt-0.5">{sp.role}</span>
                                                <p className="text-[8px] text-text-secondary leading-tight mt-0.5 line-clamp-2">{sp.bio}</p>
                                              </div>
                                            </div>
                                          ))}
                                          {(servicesData.peluqueria?.specialists || []).length === 0 && (
                                            <p className="text-center text-[10px] text-text-secondary py-4">Sin especialistas asignados a Peluquería.</p>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* ── SERVICES POPUP PREVIEW ── */}
                                <AnimatePresence>
                                  {vsmPeluServicesOpen && (() => {
                                    const SERVICE_GROUPS = [
                                      { label: 'Cortes', keywords: ['corte', 'corte masculino', 'corte femenino', 'corte infantil', 'diseño'] },
                                      { label: 'Color & Técnicas', keywords: ['color', 'coloración', 'balayage', 'reflejo', 'iluminación', 'tinte', 'mechas', 'babylight'] },
                                      { label: 'Tratamientos', keywords: ['tratamiento', 'hidratación', 'seda', 'keratina', 'nutritiva', 'brillo', 'salud', 'profunda'] },
                                      { label: 'Peinados & Styling', keywords: ['peinado', 'brushing', 'ondas', 'plancha', 'styling', 'secado', 'editorial'] },
                                    ];

                                    const allActiveServices = (servicesData.peluqueria?.services || []).filter(s => s.isActive !== false);

                                    const getServiceGroup = (name: string): string => {
                                      const lower = name.toLowerCase();
                                      for (const group of SERVICE_GROUPS) {
                                        if (group.keywords.some(kw => lower.includes(kw))) return group.label;
                                      }
                                      return 'Otros Servicios';
                                    };

                                    const groupedServices: Record<string, typeof allActiveServices> = {};
                                    SERVICE_GROUPS.forEach(g => { groupedServices[g.label] = []; });
                                    groupedServices['Otros Servicios'] = [];
                                    allActiveServices.forEach(s => {
                                      const gLabel = getServiceGroup(s.name);
                                      groupedServices[gLabel].push(s);
                                    });

                                    const finalGroupOrder = [
                                      ...SERVICE_GROUPS.map(g => g.label).filter(l => groupedServices[l]?.length > 0),
                                      ...(groupedServices['Otros Servicios']?.length > 0 ? ['Otros Servicios'] : [])
                                    ];

                                    return (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                                      >
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setVsmPeluServicesOpen(false)} />
                                        <div className="relative w-full max-w-2xl bg-[#090909] border border-gold/25 rounded-2xl p-6 z-10 max-h-[85vh] overflow-y-auto shadow-2xl">
                                          <button onClick={() => setVsmPeluServicesOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white cursor-pointer">✕</button>
                                          <div className="mb-5 text-left">
                                            <span className="text-[8px] uppercase tracking-widest text-gold font-bold block mb-1">✂ Carta de Servicios</span>
                                            <h3 className="font-serif text-lg text-gold">
                                              {renderEditableText('peluqueria', 'servicesTriggerTitle', vsmForm.peluqueria.servicesTriggerTitle || 'Ver Todos los Servicios', 'text-gold font-serif')}
                                            </h3>
                                            <p className="text-[9px] text-text-secondary mt-0.5">Nuestra carta de servicios agrupada</p>
                                          </div>
                                          
                                          <div className="space-y-6 text-left">
                                            {finalGroupOrder.map((groupLabel) => (
                                              <div key={groupLabel}>
                                                <div className="flex items-center gap-3 mb-3">
                                                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-bold">{groupLabel}</span>
                                                  <div className="flex-grow h-[1px] bg-gold/15" />
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                  {groupedServices[groupLabel].map((srv) => (
                                                    <div key={srv.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0c0c0c] border border-white/5 hover:border-gold/20 transition-colors">
                                                      <div className="flex-grow min-w-0 pr-3">
                                                        <h4 className="font-serif text-xs text-white font-medium">{srv.name}</h4>
                                                        {srv.description && <p className="text-[8px] text-text-secondary leading-tight mt-0.5 line-clamp-1 font-light">{srv.description}</p>}
                                                        <span className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5 block">⏱ {srv.duration}</span>
                                                      </div>
                                                      <div className="flex-shrink-0 text-right">
                                                        <span className="font-serif text-xs text-gold font-bold block">{srv.price}</span>
                                                        <span className="text-[7px] uppercase tracking-widest border border-gold/30 text-gold px-2 py-0.5 rounded-full font-semibold block mt-1">Reservar</span>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                            {allActiveServices.length === 0 && (
                                              <p className="text-center text-[10px] text-text-secondary py-4">Sin servicios activos en Peluquería.</p>
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })()}
                                </AnimatePresence>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* TERAPIAS DESKTOP */}
                      {vsmPage === 'terapias' && (
                        <div className="space-y-6">
                          {/* Video Header representation */}
                          <div className="relative h-[160px] rounded-xl overflow-hidden flex flex-col justify-end p-5 border border-white/5 group text-left">
                            <div className="absolute inset-0 bg-zinc-900/60 pointer-events-none" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,224,216,0.06)_0%,transparent_70%)] animate-[pulse_4s_infinite] pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                            
                            {/* Cambiar Video */}
                            <div className="absolute top-2 right-2 z-35 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingAsset({ page: 'terapias', key: 'videoUrl', label: 'Video del Templo', currentValue: vsmForm.terapias.videoUrl });
                                }}
                                className="bg-black/85 hover:bg-gold hover:text-black border border-white/10 text-white rounded-full px-2.5 py-1 text-[8px] uppercase tracking-widest font-bold flex items-center space-x-1 transition-all cursor-pointer"
                              >
                                <Camera size={10} />
                                <span>Cambiar Video</span>
                              </button>
                            </div>

                            <div className="relative z-20 space-y-1 max-w-lg">
                              <span className="text-[7px] text-[#E2E0D8] uppercase tracking-[0.3em] block leading-none font-bold">BIENVENIDO AL TEMPLO</span>
                              <h2 className="font-serif text-lg font-bold text-white leading-tight">
                                {renderEditableText('terapias', 'pageTitle', vsmForm.terapias.pageTitle, 'text-white font-serif')}
                              </h2>
                              <p className="text-[9px] text-text-secondary leading-relaxed font-light">
                                {renderEditableText('terapias', 'pageDescription', vsmForm.terapias.pageDescription, 'text-text-secondary')}
                              </p>
                            </div>
                          </div>

                          {/* Therapies Grid */}
                          <div className="text-left space-y-2">
                            <span className="text-[8px] text-gold uppercase tracking-wider block font-bold">Rituales de Sanación</span>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { name: 'Ritual Piedras Calientes', price: '$55.000', duration: '60 min' },
                                { name: 'Alineación de Chakras & Reiki', price: '$45.000', duration: '50 min' },
                                { name: 'Sonoterapia Vibracional', price: '$48.000', duration: '60 min' },
                                { name: 'Masaje Cervicocraneal', price: '$35.000', duration: '45 min' }
                              ].map((srv, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                                  <div>
                                    <span className="text-[10px] font-medium text-white block leading-none">{srv.name}</span>
                                    <span className="text-[8px] text-text-secondary block mt-0.5 leading-none">{srv.duration}</span>
                                  </div>
                                  <span className="text-[10px] text-gold font-serif font-bold leading-none">{srv.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ) : (
                  /* MOBILE PREVIEW WRAPPER (CENTERED PHONE VIEWPORT) */
                  <div className="relative w-full max-w-[285px] h-[450px] bg-black rounded-[38px] border-[5px] border-zinc-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col group select-none">
                    
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-zinc-800 rounded-b-xl z-40 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-0.5 bg-zinc-900 rounded-full" />
                    </div>

                    {/* Mobile Header */}
                    <div className="pt-5 pb-2.5 border-b border-white/5 bg-black/90 text-center relative z-30 select-none">
                      <span className="font-serif text-[10px] tracking-[0.25em] text-gold font-bold">VALENTES</span>
                      <span className="block text-[5px] text-white/40 tracking-[0.2em] uppercase">Santuario de Bienestar</span>
                    </div>

                    {/* Scrollable Mobile Body */}
                    <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col bg-black text-left">
                      
                      {/* HOME MOBILE PREVIEW */}
                      {vsmPage === 'home' && (
                        <div className="flex flex-col flex-1 bg-black">
                          {[
                            { title: vsmForm.home.panel1Title, subtitle: vsmForm.home.panel1Subtitle, img: vsmForm.home.panel1Image, keyTitle: 'panel1Title', keySubtitle: 'panel1Subtitle', keyImg: 'panel1Image', label: vsmForm.home.panel1Label || 'Ritual 01', keyLabel: 'panel1Label', name: 'Barbería' },
                            { title: vsmForm.home.panel2Title, subtitle: vsmForm.home.panel2Subtitle, img: vsmForm.home.panel2Image, keyTitle: 'panel2Title', keySubtitle: 'panel2Subtitle', keyImg: 'panel2Image', label: vsmForm.home.panel2Label || 'Ritual 02', keyLabel: 'panel2Label', name: 'Peluquería' },
                            { title: vsmForm.home.panel3Title, subtitle: vsmForm.home.panel3Subtitle, img: vsmForm.home.panel3Image, keyTitle: 'panel3Title', keySubtitle: 'panel3Subtitle', keyImg: 'panel3Image', label: vsmForm.home.panel3Label || 'Ritual 03', keyLabel: 'panel3Label', name: 'Terapias' }
                          ].map((panel, idx) => (
                            <div key={idx} className="relative h-[135px] flex flex-col justify-end p-4 border-b border-white/5 last:border-0 group/panel overflow-hidden">
                              <img src={panel.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-50 grayscale group-hover/panel:opacity-80 transition-all duration-700 pointer-events-none" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
                              
                              {renderEditableImage('home', panel.keyImg, `Imagen ${panel.name}`, panel.img)}
                              
                              <div className="relative z-10 space-y-0.5">
                                <span className="text-[6px] text-gold uppercase tracking-widest font-semibold block">
                                  {renderEditableText('home', panel.keyLabel, panel.label, 'text-gold font-sans')}
                                </span>
                                <h4 className="font-serif text-[11px] text-white font-medium">
                                  {renderEditableText('home', panel.keyTitle, panel.title, 'text-white font-serif')}
                                </h4>
                                <p className="text-[7px] text-text-secondary leading-snug">
                                  {renderEditableText('home', panel.keySubtitle, panel.subtitle, 'text-text-secondary')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* BARBERIA MOBILE PREVIEW */}
                      {vsmPage === 'barberia' && (
                        <div className="p-4 space-y-4 pb-6">
                          
                          {/* Hero Section */}
                          <div className="relative h-[200px] flex flex-col justify-center items-center text-center border-b border-white/5 overflow-hidden group">
                            <div className="absolute w-24 h-24 bg-gold/[0.03] rounded-full blur-2xl pointer-events-none" />
                            
                            {/* Barber pole */}
                            <div className="w-12 h-20 mb-2 relative flex items-center justify-center border border-white/10 rounded-full bg-zinc-950 overflow-hidden select-none">
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,#ff2a2a_25%,#ffffff_25%,#ffffff_50%,#0055ff_50%,#0055ff_75%,#ffffff_75%,#ffffff)] bg-[size:15px_15px] animate-[barberpole_2s_linear_infinite] opacity-40" />
                              <div className="w-1.5 h-16 bg-zinc-400/35 rounded-full z-10" />
                            </div>

                            <h3 className="font-serif text-md font-bold tracking-[0.2em] text-white leading-none">
                              {renderEditableText('barberia', 'heroTitle', vsmForm.barberia.heroTitle, 'text-white font-serif')}
                            </h3>
                            <span className="text-[5px] tracking-[0.4em] text-gold uppercase block mt-1 leading-none">
                              {renderEditableText('barberia', 'heroSubtitle', vsmForm.barberia.heroSubtitle, 'text-gold')}
                            </span>
                            
                            <button className="mt-3 px-3 py-1.5 rounded-full border border-gold/30 text-gold text-[5px] uppercase tracking-widest font-bold bg-black/30">
                              {renderEditableText('barberia', 'discoverBtn', vsmForm.barberia.discoverBtn, 'text-inherit font-bold')}
                            </button>
                          </div>

                          {/* Description */}
                          <div className="space-y-1">
                            <span className="text-[5px] text-gold uppercase tracking-wider block font-bold">Carta de Rituales</span>
                            <h4 className="font-serif text-2xs text-white font-medium">
                              {renderEditableText('barberia', 'pageTitle', vsmForm.barberia.pageTitle, 'text-white font-serif')}
                            </h4>
                            <p className="text-[7px] text-text-secondary leading-relaxed font-light">
                              {renderEditableText('barberia', 'pageDescription', vsmForm.barberia.pageDescription, 'text-text-secondary')}
                            </p>
                          </div>

                          {/* Cards stack */}
                          <div className="space-y-2">
                            {[
                              { 
                                title: vsmForm.barberia.titleCabello || 'Ritual de Cabello', 
                                price: vsmForm.barberia.priceCabello || 'Desde $12.000', 
                                img: vsmForm.barberia.imageCabello, 
                                keyImg: 'imageCabello',
                                keyTitle: 'titleCabello',
                                keyPrice: 'priceCabello'
                              },
                              { 
                                title: vsmForm.barberia.titleBarba || 'Ritual de Barba', 
                                price: vsmForm.barberia.priceBarba || 'Desde $12.000', 
                                img: vsmForm.barberia.imageBarba, 
                                keyImg: 'imageBarba',
                                keyTitle: 'titleBarba',
                                keyPrice: 'priceBarba'
                              },
                              { 
                                title: vsmForm.barberia.titleCompleto || 'Ritual Completo', 
                                price: vsmForm.barberia.priceCompleto || 'Desde $20.000', 
                                img: vsmForm.barberia.imageCompleto, 
                                keyImg: 'imageCompleto',
                                keyTitle: 'titleCompleto',
                                keyPrice: 'priceCompleto'
                              }
                            ].map((rit, idx) => (
                              <div key={idx} className="relative h-[80px] rounded-xl overflow-hidden flex flex-col justify-end p-2.5 border border-white/5 group select-none">
                                <img src={rit.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-40 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                                
                                {renderEditableImage('barberia', rit.keyImg, rit.title, rit.img)}
                                
                                <div className="relative z-10 flex justify-between items-end">
                                  <div>
                                    <span className="text-[5px] text-gold uppercase block">Ritual 0{idx+1}</span>
                                    <span className="font-serif text-[8px] text-white font-medium block leading-none">
                                      {renderEditableText('barberia', rit.keyTitle, rit.title, 'text-white font-serif')}
                                    </span>
                                  </div>
                                  <span className="text-[7px] text-gold font-serif leading-none font-semibold">
                                    {renderEditableText('barberia', rit.keyPrice, rit.price, 'text-gold font-serif')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PELUQUERIA MOBILE PREVIEW */}
                      {vsmPage === 'peluqueria' && (
                        <div className="flex-1 flex flex-col bg-black relative">
                          <AnimatePresence mode="wait">
                            {!vsmPeluEntered ? (
                              <motion.div 
                                key="cover"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#080808] flex flex-col items-center justify-center p-6 text-center space-y-5 z-20"
                              >
                                <div className="space-y-1">
                                  <h2 className="font-serif text-2xl font-bold tracking-[0.15em] text-gold leading-none">
                                    {renderEditableText('peluqueria', 'overlayLine1', vsmForm.peluqueria.overlayLine1, 'text-gold font-serif')}
                                  </h2>
                                  <h2 className="font-serif text-2xl font-bold tracking-[0.15em] text-gold leading-none mt-1">
                                    {renderEditableText('peluqueria', 'overlayLine2', vsmForm.peluqueria.overlayLine2, 'text-gold font-serif')}
                                  </h2>
                                  <div className="w-8 h-[1px] bg-gold/30 mx-auto mt-3" />
                                  <span className="text-[5px] uppercase tracking-[0.3em] text-gold/80 block mt-2 font-semibold">
                                    {renderEditableText('peluqueria', 'overlaySubtitle', vsmForm.peluqueria.overlaySubtitle, 'text-gold/80')}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => setVsmPeluEntered(true)}
                                  className="px-4 py-2 border border-gold/45 text-gold text-[5px] uppercase tracking-[0.2em] rounded-full bg-black/40 font-bold"
                                >
                                  INGRESAR AL RITUAL
                                </button>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 space-y-4 pb-6"
                              >
                                <button 
                                  onClick={() => setVsmPeluEntered(false)}
                                  className="text-[5px] text-white/50 hover:text-gold uppercase tracking-wider border border-white/10 rounded-full px-2 py-0.5 bg-black/40 cursor-pointer"
                                >
                                  ← Volver
                                </button>

                                <div className="space-y-1">
                                  <span className="text-[5px] text-gold uppercase tracking-wider block font-bold">Carta de Estilo</span>
                                  <h4 className="font-serif text-2xs text-white font-medium">
                                    {renderEditableText('peluqueria', 'pageTitle', vsmForm.peluqueria.pageTitle, 'text-white font-serif')}
                                  </h4>
                                  <p className="text-[7px] text-text-secondary leading-relaxed font-light">
                                    {renderEditableText('peluqueria', 'pageDescription', vsmForm.peluqueria.pageDescription, 'text-text-secondary')}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { name: 'Corte de Diseño', price: '$38K', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=200&q=80' },
                                    { name: 'Color Orgánico', price: '$65K', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80' }
                                  ].map((item, idx) => (
                                    <div key={idx} className="relative h-[70px] rounded-xl overflow-hidden flex flex-col justify-end p-2 border border-white/5 select-none font-sans">
                                      <img src={item.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-45 pointer-events-none" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                                      <div className="relative z-10 text-left">
                                        <span className="text-[7px] text-white font-medium block leading-tight">{item.name}</span>
                                        <span className="text-[6px] text-gold block mt-0.5 font-semibold leading-none">{item.price}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* TERAPIAS MOBILE PREVIEW */}
                      {vsmPage === 'terapias' && (
                        <div className="p-4 space-y-4 pb-6">
                          
                          {/* Video Header representation */}
                          <div className="relative h-[130px] rounded-xl overflow-hidden flex flex-col justify-end p-3.5 border border-white/5 group text-left">
                            <div className="absolute inset-0 bg-zinc-900/60 pointer-events-none" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,224,216,0.06)_0%,transparent_70%)] animate-[pulse_4s_infinite] pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                            
                            {/* Cambiar Video */}
                            <div className="absolute top-2 right-2 z-35 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingAsset({ page: 'terapias', key: 'videoUrl', label: 'Video del Templo', currentValue: vsmForm.terapias.videoUrl });
                                }}
                                className="bg-black/85 hover:bg-gold hover:text-black border border-white/10 text-white rounded-full px-2 py-0.5 text-[6px] uppercase tracking-widest font-bold flex items-center space-x-1 transition-all cursor-pointer"
                              >
                                <Camera size={8} />
                                <span>Cambiar Video</span>
                              </button>
                            </div>

                            <div className="relative z-20 space-y-0.5">
                              <span className="text-[5px] text-[#E2E0D8] uppercase tracking-[0.3em] block leading-none font-bold">BIENVENIDO AL TEMPLO</span>
                              <h4 className="font-serif text-2xs font-bold text-white leading-tight">
                                {renderEditableText('terapias', 'pageTitle', vsmForm.terapias.pageTitle, 'text-white font-serif')}
                              </h4>
                              <p className="text-[7px] text-text-secondary leading-snug font-light line-clamp-2">
                                {renderEditableText('terapias', 'pageDescription', vsmForm.terapias.pageDescription, 'text-text-secondary')}
                              </p>
                            </div>
                          </div>

                          {/* Therapies stack */}
                          <div className="space-y-1.5">
                            <span className="text-[5px] text-gold uppercase tracking-wider block font-bold">Rituales de Sanación</span>
                            {[
                              { name: 'Ritual Piedras Calientes', price: '$55.000', duration: '60 min' },
                              { name: 'Alineación de Chakras & Reiki', price: '$45.000', duration: '50 min' }
                            ].map((srv, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-white/[0.01] border border-white/5 text-left font-sans">
                                <div>
                                  <span className="text-[8px] font-medium text-white block leading-none">{srv.name}</span>
                                  <span className="text-[6px] text-text-secondary block mt-0.5 leading-none">{srv.duration}</span>
                                </div>
                                <span className="text-[8px] text-gold font-serif font-bold leading-none">{srv.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>

              {/* Local keyframes for preview animations */}
              <style>{`
                @keyframes barberpole {
                  from { background-position: 0 0; }
                  to { background-position: 40px 0; }
                }
              `}</style>

            </div>

            {/* Floating Dock at the bottom center */}
            {vsmFullscreen && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-45 bg-black/85 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.65)] flex items-center space-x-5 select-none animate-in fade-in slide-in-from-bottom-5 duration-300">
                {/* Horizontal Page Tabs */}
                <div className="flex items-center space-x-1.5">
                  {[
                    { id: 'home', label: 'Inicio' },
                    { id: 'barberia', label: 'Barbería' },
                    { id: 'peluqueria', label: 'Peluquería' },
                    { id: 'peluqueria-gallery', label: 'Galería' },
                    { id: 'terapias', label: 'Terapias' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setVsmPage(p.id as any);
                        setVsmPeluEntered(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer ${
                        vsmPage === p.id 
                          ? 'bg-gold/10 border border-gold/25 text-gold shadow-md shadow-gold/5' 
                          : 'text-text-secondary hover:text-white border border-transparent'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-[1px] h-4 bg-white/10" />

                {/* Publicar Web button */}
                <button
                  onClick={handleVsmSave}
                  className="py-1.5 px-4 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-all duration-300 shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save size={11} />
                  <span>Publicar Web</span>
                </button>

                {/* Divider */}
                <div className="w-[1px] h-4 bg-white/10" />

                {/* Salir button */}
                <button
                  onClick={() => setVsmFullscreen(false)}
                  className="py-1.5 px-4 rounded-full border border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-[9px] transition-all duration-300 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Minimize2 size={11} />
                  <span>Salir</span>
                </button>
              </div>
            )}
            
            </div>

          </div>
        )}

        {/* 5. PROFILE TAB */}
        {activeTab === 'perfil' && (
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 max-w-2xl mx-auto shadow-xl space-y-8">
            <div className="flex items-center space-x-5 pb-6 border-b border-white/5">
              <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-3xl font-bold text-gold shadow-[inset_0_2px_15px_rgba(198,155,60,0.2)]">
                {currentUser ? currentUser.avatar || currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'SV'}
              </div>
              <div className="space-y-1 text-left">
                <h3 className="font-serif text-xl text-white font-medium">{profileName}</h3>
                <span className="text-[9px] uppercase tracking-widest text-gold font-bold bg-gold/5 border border-gold/15 px-3 py-1 rounded-full">{profileRole}</span>
              </div>
            </div>

            <div className="space-y-5 text-left">
              <h4 className="font-serif text-sm text-white tracking-wide border-b border-white/5 pb-1">Datos Personales</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Nombre Completo *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full bg-black/40 border rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none transition-colors ${
                      profileFormSubmitted && !profileName.trim()
                        ? 'border-red-500/80 focus:border-red-500'
                        : 'border-white/5 focus:border-gold/30'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Rol en el Negocio *</label>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={currentUser?.profileType !== 'admin'}
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className={`w-full bg-black/40 border rounded-lg py-2.5 px-3 text-xs text-white text-left flex justify-between items-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors ${
                        profileFormSubmitted && !profileRole.trim()
                          ? 'border-red-500/80 focus:border-red-500'
                          : 'border-white/5 focus:border-gold/30'
                      }`}
                    >
                      <span>{profileRole || 'Seleccionar Rol...'}</span>
                      {currentUser?.profileType === 'admin' && <ChevronDown size={12} className="text-text-secondary" />}
                    </button>

                    <AnimatePresence>
                      {isRoleDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-48 overflow-y-auto"
                          >
                            {[
                              'Administrador Principal',
                              'Administrador',
                              'Barbero',
                              'Barbero Senior',
                              'Estilista',
                              'Terapeuta Holístico'
                            ].map((role) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  setProfileRole(role);
                                  setIsRoleDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5 flex justify-between items-center ${
                                  profileRole === role ? 'text-gold font-bold bg-white/[0.02]' : 'text-white/80'
                                }`}
                              >
                                <span>{role}</span>
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Correo de Contacto</label>
                  <input
                    type="email"
                    value={profileEmail}
                    disabled={true}
                    className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-gold/30 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">WhatsApp</label>
                  <div className="flex space-x-2 relative">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsProfilePhoneDropdownOpen(!isProfilePhoneDropdownOpen)}
                        className="h-full bg-black/40 border border-white/5 rounded-lg px-3 text-[11px] text-white flex items-center space-x-1.5 focus:outline-none min-w-[70px] justify-between cursor-pointer"
                      >
                        <span className="font-mono">{profilePhoneCode}</span>
                        <ChevronDown size={10} className="text-text-secondary" />
                      </button>
                      
                      <AnimatePresence>
                        {isProfilePhoneDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsProfilePhoneDropdownOpen(false)} />
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
                                    setProfilePhoneCode(item.code);
                                    setIsProfilePhoneDropdownOpen(false);
                                    if (profilePhoneNum.length > 0 && profilePhoneNum.length !== 9) {
                                      setProfilePhoneError('El número debe tener exactamente 9 dígitos.');
                                    } else {
                                      setProfilePhoneError(null);
                                    }
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5 flex justify-between items-center ${
                                    profilePhoneCode === item.code ? 'text-gold font-bold' : 'text-white/80'
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
                      value={profilePhoneNum}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').substring(0, 9);
                        setProfilePhoneNum(cleaned);
                        if (cleaned.length > 0 && cleaned.length !== 9) {
                          setProfilePhoneError('El número debe tener exactamente 9 dígitos.');
                        } else {
                          setProfilePhoneError(null);
                        }
                      }}
                      className={`flex-1 bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-gold/30 ${
                        profilePhoneError ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                  </div>
                  {profilePhoneError && (
                    <p className="text-[10px] text-red-400 mt-1 font-light">{profilePhoneError}</p>
                  )}
                </div>
              </div>

              <h4 className="font-serif text-sm text-white tracking-wide border-b border-white/5 pb-1 pt-4">Seguridad de Acceso</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Nueva Contraseña</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (confirmPassword && e.target.value !== confirmPassword) {
                          setPasswordError('Las contraseñas no coinciden.');
                        } else {
                          setPasswordError(null);
                        }
                      }}
                      className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-gold/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-text-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Confirmar Nueva Contraseña</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirmar nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (newPassword && e.target.value !== newPassword) {
                          setPasswordError('Las contraseñas no coinciden.');
                        } else {
                          setPasswordError(null);
                        }
                      }}
                      className={`w-full bg-black/40 border border-white/5 rounded-lg py-2.5 pl-3 pr-10 text-xs text-white focus:outline-none focus:border-gold/30 ${
                        passwordError ? 'border-red-500/50 focus:border-red-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-text-secondary hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-[10px] text-red-400 mt-1 font-light">{passwordError}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleProfileResetPassword}
                  disabled={!newPassword || !confirmPassword || !!passwordError}
                  className="py-2 px-5 rounded-full border border-gold/30 hover:border-gold/60 bg-gold/5 hover:bg-gold/10 text-gold font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Restablecer Contraseña
                </button>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="py-3 px-8 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[10px] transition-all cursor-pointer shadow-lg shadow-gold/10"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SERVICES MANAGEMENT TAB */}
        {activeTab === 'servicios' && (
          <div className="space-y-8 text-left">
            {/* Top Bar with Category Selector and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c0c] border border-white/5 rounded-3xl p-5 shadow-xl">
              {/* Category Selector Tabs */}
              <div className="flex bg-black rounded-xl border border-white/5 p-1 max-w-md w-full">
                {[
                  { id: 'barberia', label: 'Barbería', color: 'text-gold' },
                  { id: 'peluqueria', label: 'Peluquería', color: 'text-[#CD7F32]' },
                  { id: 'terapias', label: 'Terapias Holísticas', color: 'text-[#E2E0D8]' }
                ].map((tab) => {
                  const isActive = activeServiceCategory === tab.id;
                  let activeBg = 'bg-gold/10 text-gold border-gold/20';
                  if (tab.id === 'peluqueria') activeBg = 'bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/20';
                  if (tab.id === 'terapias') activeBg = 'bg-white/10 text-white border-white/20';
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveServiceCategory(tab.id as any)}
                      className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all border ${
                        isActive
                          ? `${activeBg} shadow-md`
                          : 'border-transparent text-text-secondary hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Add New Service Button */}
              <button
                onClick={() => {
                  resetServiceForm();
                  setIsServiceDrawerOpen(true);
                }}
                className={`py-3 px-6 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeServiceCategory === 'barberia' ? 'bg-gold hover:bg-gold/90 text-black shadow-lg shadow-gold/10' :
                  activeServiceCategory === 'peluqueria' ? 'bg-[#CD7F32] hover:bg-[#CD7F32]/90 text-black shadow-lg shadow-[#CD7F32]/10' :
                  'bg-[#E2E0D8] hover:bg-white text-black shadow-lg shadow-white/5'
                }`}
              >
                <Plus size={14} />
                <span>Añadir Servicio</span>
              </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(servicesData[activeServiceCategory]?.services || []).map((service) => {
                const isInactive = service.isActive === false;
                const assignedSpecialists = (servicesData[activeServiceCategory]?.specialists || []).filter(
                  sp => (service.specialistIds || []).includes(sp.id)
                );
                
                let activeColorClass = 'text-gold';
                let activeBorder = 'hover:border-gold/30';
                if (activeServiceCategory === 'peluqueria') {
                  activeColorClass = 'text-[#CD7F32]';
                  activeBorder = 'hover:border-[#CD7F32]/30';
                } else if (activeServiceCategory === 'terapias') {
                  activeColorClass = 'text-white';
                  activeBorder = 'hover:border-white/30';
                }

                return (
                  <div key={service.id} className="w-full h-[245px]" style={{ perspective: '1000px' }}>
                    <motion.div
                      layout
                      animate={{ rotateY: isInactive ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="w-full h-full relative"
                    >
                      {/* FRONT FACE (ACTIVE) */}
                      <div
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        className={`bg-[#0c0c0c] border rounded-3xl p-6 transition-all duration-300 ${
                          activeServiceCategory === 'barberia' ? 'hover:border-gold/30' :
                          activeServiceCategory === 'peluqueria' ? 'hover:border-[#CD7F32]/30' : 'hover:border-white/30'
                        } border-white/5 shadow-xl`}
                      >
                        {/* Top Row: Title, Price & Active status */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-serif text-lg font-medium leading-snug text-white">
                              {service.name}
                            </h3>
                            {/* Toggle switch */}
                            <button
                              type="button"
                              onClick={() => toggleServiceActive(activeServiceCategory, service.id)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative cursor-pointer flex items-center border ${
                                activeServiceCategory === 'barberia' ? 'bg-gold/15 border-gold/30' :
                                activeServiceCategory === 'peluqueria' ? 'bg-[#CD7F32]/15 border-[#CD7F32]/30' :
                                'bg-white/10 border-white/20'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full shadow-md transform duration-300 translate-x-4 ${
                                  activeServiceCategory === 'barberia' ? 'bg-gold shadow-[0_0_8px_rgba(198,155,60,0.4)]' :
                                  activeServiceCategory === 'peluqueria' ? 'bg-[#CD7F32] shadow-[0_0_8px_rgba(205,127,50,0.4)]' :
                                  'bg-white'
                                }`}
                              />
                            </button>
                          </div>
                          
                          {/* Price & Duration tags */}
                          <div className="flex items-center space-x-3 text-xs">
                            <span className={`font-serif font-bold text-base ${activeColorClass}`}>
                              {service.price}
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="text-text-secondary flex items-center space-x-1 font-medium">
                              <Clock size={11} className="text-text-secondary" />
                              <span>{service.duration}</span>
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-text-secondary leading-relaxed font-light line-clamp-3">
                            {service.description || 'Sin descripción.'}
                          </p>
                        </div>

                        {/* Bottom Row: Specialists and Action buttons */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                          {/* Specialists assigned */}
                          <div className="flex items-center space-x-1.5">
                            {assignedSpecialists.length > 0 ? (
                              <>
                                <div className="flex -space-x-2">
                                  {assignedSpecialists.slice(0, 3).map((sp) => (
                                    <div
                                      key={sp.id}
                                      title={sp.name}
                                      className="w-6 h-6 rounded-full border border-black bg-[#121212] flex items-center justify-center text-[8px] font-bold text-white uppercase select-none"
                                    >
                                      {sp.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                  ))}
                                </div>
                                {assignedSpecialists.length > 3 && (
                                  <span className="text-[9px] text-text-secondary font-mono">
                                    +{assignedSpecialists.length - 3}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[9px] text-text-secondary italic">Sin personal</span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => populateServiceForm(service)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => setServiceToDelete({ category: activeServiceCategory, id: service.id, name: service.name })}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* BACK FACE (INACTIVE) */}
                      <div
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                        className="bg-[#050505] border border-dashed border-white/10 rounded-3xl p-6 shadow-inner select-none"
                      >
                        {/* Top: Switch Off */}
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold font-sans">
                            Servicio Inactivo
                          </span>
                          <button
                             type="button"
                             onClick={() => toggleServiceActive(activeServiceCategory, service.id)}
                             className="w-9 h-5 rounded-full p-0.5 bg-black/40 border border-white/10 transition-colors duration-300 relative cursor-pointer flex items-center"
                           >
                             <div
                               className="w-4 h-4 rounded-full bg-white/20 shadow-md transform duration-300 translate-x-0"
                             />
                           </button>
                        </div>

                        {/* Center: Title & Dimmed status */}
                        <div className="flex flex-col items-center justify-center flex-grow py-4 text-center">
                          <h3 className="font-serif text-base text-white/30 text-center tracking-wide font-medium max-w-[200px] line-through leading-snug">
                            {service.name}
                          </h3>
                          <span className="text-[8px] text-white/30 bg-white/[0.02] border border-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-semibold mt-2.5">
                            Desactivado
                          </span>
                        </div>

                        {/* Bottom: Action buttons (only delete) */}
                        <div className="pt-2 flex justify-end border-t border-white/5 border-dashed">
                          <button
                            onClick={() => setServiceToDelete({ category: activeServiceCategory, id: service.id, name: service.name })}
                            className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Slide-over Drawer Panel */}
            <AnimatePresence>
              {isServiceDrawerOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsServiceDrawerOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />

                  {/* Drawer Content */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0c0c0c] border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
                  >
                    <div className="space-y-6">
                      {/* Title Bar */}
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-gold font-bold">Configurador de Catálogo</span>
                          <h3 className="font-serif text-lg text-white font-medium">
                            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                          </h3>
                        </div>
                        <button
                          onClick={() => setIsServiceDrawerOpen(false)}
                          className="p-1.5 rounded-full hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleServiceFormSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Nombre del Servicio *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Ritual de Barba Premium"
                            value={serviceFormName}
                            onChange={(e) => setServiceFormName(e.target.value)}
                            className={`w-full bg-black/40 border rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-colors ${
                              serviceFormSubmitted && !serviceFormName.trim()
                                ? 'border-red-500/80 focus:border-red-500'
                                : 'border-white/10 focus:border-gold/30'
                            }`}
                          />
                        </div>

                        {/* Group Selection (Only for Barbería) */}
                        {activeServiceCategory === 'barberia' && (
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                              Grupo de Barbería *
                            </label>
                            <CustomSelect
                              value={serviceFormGroup}
                              onChange={(val) => setServiceFormGroup(val as any)}
                              options={[
                                { value: 'cabello', label: 'Ritual 01: Ritual de Cabello' },
                                { value: 'barba', label: 'Ritual 02: Ritual de Barba' },
                                { value: 'completo', label: 'Ritual 03: Ritual Completo' }
                              ]}
                              buttonClassName="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white flex items-center justify-between cursor-pointer focus:outline-none focus:border-gold/30 hover:border-white/10 transition-colors text-left"
                            />
                          </div>
                        )}

                        {/* Price & Duration */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                              Precio (CLP) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. $15.000 o 15000"
                              value={serviceFormPrice}
                              onChange={(e) => setServiceFormPrice(e.target.value)}
                              className={`w-full bg-black/40 border rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-colors font-mono ${
                                serviceFormSubmitted && !serviceFormPrice.trim()
                                  ? 'border-red-500/80 focus:border-red-500'
                                  : 'border-white/10 focus:border-gold/30'
                              }`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                              Duración *
                            </label>
                            <CustomSelect
                              value={serviceFormDuration}
                              onChange={(val) => setServiceFormDuration(val)}
                              options={['15 min', '30 min', '45 min', '60 min', '75 min', '90 min', '1 hrs', '1 hrs 15 min', '1 hrs 20 min', '1 hrs 30 min', '1 hrs 45 min', '2 hrs'].map((dur) => ({
                                value: dur,
                                label: dur
                              }))}
                              buttonClassName={`w-full bg-black/40 border rounded-xl py-3 px-4 text-xs text-white flex items-center justify-between cursor-pointer focus:outline-none hover:border-white/10 transition-colors text-left ${
                                serviceFormSubmitted && !serviceFormDuration
                                  ? 'border-red-500/80 focus:border-red-500'
                                  : 'border-white/10 focus:border-gold/30'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Descripción
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Describe los detalles, insumos y valor agregado de esta experiencia..."
                            value={serviceFormDescription}
                            onChange={(e) => setServiceFormDescription(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors resize-none leading-relaxed"
                          />
                        </div>

                        {/* Specialists Assignment */}
                        <div className="space-y-2.5">
                          {(() => {
                            const displayedSpecialists = (servicesData[activeServiceCategory]?.specialists || []).filter(sp => {
                              if (activeServiceCategory === 'barberia') return sp.profileType === 'barber' || sp.profileType === 'mixto';
                              if (activeServiceCategory === 'peluqueria') return sp.profileType === 'estilista' || sp.profileType === 'mixto';
                              if (activeServiceCategory === 'terapias') return sp.profileType === 'terapeuta' || sp.profileType === 'mixto';
                              return true;
                            });

                            const isAllSelected = displayedSpecialists.length > 0 && 
                              displayedSpecialists.every(sp => serviceFormSpecialists.includes(sp.id));

                            const handleSelectAll = () => {
                              if (isAllSelected) {
                                const displayedIds = displayedSpecialists.map(sp => sp.id);
                                setServiceFormSpecialists(prev => prev.filter(id => !displayedIds.includes(id)));
                              } else {
                                const displayedIds = displayedSpecialists.map(sp => sp.id);
                                setServiceFormSpecialists(prev => Array.from(new Set([...prev, ...displayedIds])));
                              }
                            };

                            return (
                              <>
                                <div className="flex justify-between items-center">
                                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                                    Personal Asignado
                                  </label>
                                  {displayedSpecialists.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={handleSelectAll}
                                      className="text-[9px] uppercase tracking-wider text-gold hover:text-gold/80 transition-colors font-bold cursor-pointer"
                                    >
                                      {isAllSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                  {displayedSpecialists.length === 0 ? (
                                    <p className="text-[10px] text-text-secondary italic text-left py-2">
                                      No hay profesionales registrados para esta unidad de negocio.
                                    </p>
                                  ) : (
                                    displayedSpecialists.map((sp) => {
                                      const isChecked = serviceFormSpecialists.includes(sp.id);
                                      return (
                                        <label
                                          key={sp.id}
                                          className={`flex items-center justify-between p-3 rounded-xl border border-white/5 transition-all cursor-pointer ${
                                            isChecked ? 'bg-white/[0.02] border-white/15' : 'hover:bg-white/[0.01]'
                                          }`}
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-xs font-bold text-gold">
                                              {sp.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="text-left leading-tight">
                                              <span className="block text-xs font-medium text-white">{sp.name}</span>
                                              <span className="block text-[9px] text-text-secondary">{sp.role}</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={() => {
                                                if (isChecked) {
                                                  setServiceFormSpecialists(prev => prev.filter(id => id !== sp.id));
                                                } else {
                                                  setServiceFormSpecialists(prev => [...prev, sp.id]);
                                                }
                                              }}
                                              className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-300 ${
                                              isChecked 
                                                ? activeServiceCategory === 'barberia' 
                                                  ? 'bg-gold border-gold text-black shadow-[0_0_8px_rgba(229,184,66,0.4)] scale-105'
                                                  : activeServiceCategory === 'peluqueria'
                                                  ? 'bg-[#CD7F32] border-[#CD7F32] text-black shadow-[0_0_8px_rgba(205,127,50,0.4)] scale-105'
                                                  : 'bg-[#E2E0D8] border-[#E2E0D8] text-black shadow-[0_0_8px_rgba(226,224,216,0.4)] scale-105'
                                                : 'border-white/20 bg-black/40 hover:border-white/40'
                                            }`}>
                                              {isChecked && <Check size={10} strokeWidth={3} className="text-black font-bold" />}
                                            </div>
                                          </div>
                                        </label>
                                      );
                                    })
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </form>
                    </div>

                    {/* Drawer Footer Buttons */}
                    <div className="flex space-x-3 pt-6 border-t border-white/5 mt-8">
                      <button
                        onClick={() => setIsServiceDrawerOpen(false)}
                        className="flex-1 py-3.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleServiceFormSubmit}
                        className={`flex-1 py-3.5 rounded-full font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer ${
                          activeServiceCategory === 'barberia' ? 'bg-gold hover:bg-gold/90 text-black' :
                          activeServiceCategory === 'peluqueria' ? 'bg-[#CD7F32] hover:bg-[#CD7F32]/90 text-black' :
                          'bg-[#E2E0D8] hover:bg-white text-black'
                        }`}
                      >
                        {editingService ? 'Guardar Cambios' : 'Añadir Servicio'}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* PROFESSIONALS MANAGEMENT TAB */}
        {activeTab === 'profesionales' && (
          <div className="space-y-8 text-left">
            {/* PENDING ACCESS REQUESTS SECTION */}
            {currentUser?.profileType === 'admin' && pendingRequests.length > 0 && (
              <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                      <Users size={15} />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-white">Solicitudes de Acceso Pendientes</h3>
                      <p className="text-[10px] text-text-secondary">Nuevos profesionales esperando credenciales y asignación de rol</p>
                    </div>
                  </div>
                  <span className="bg-gold/15 border border-gold/30 text-gold text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {pendingRequests.length} pendientes
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                        <th className="pb-3 pl-2">Nombre</th>
                        <th className="pb-3">Contacto</th>
                        <th className="pb-3">Negocio Solicitado</th>
                        <th className="pb-3 text-right pr-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingRequests.map((req) => (
                        <tr key={req.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 pl-2 font-medium text-white">
                            {req.first_name} {req.last_name}
                          </td>
                          <td className="py-4 space-y-0.5 text-text-secondary font-light">
                            <div className="flex items-center space-x-1.5">
                              <Mail size={10} />
                              <span>{req.email}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-mono">
                              <Smartphone size={10} />
                              <span>{req.phone}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                              req.business === 'barberia' ? 'bg-gold/10 border-gold/30 text-gold' :
                              req.business === 'peluqueria' ? 'bg-[#CD7F32]/10 border-[#CD7F32]/30 text-[#CD7F32]' :
                              'bg-white/10 border-white/20 text-[#E2E0D8]'
                            }`}>
                              {req.business === 'barberia' ? 'Barbería' : req.business === 'peluqueria' ? 'Peluquería' : 'Terapias'}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2">
                            <div className="inline-flex space-x-2">
                              <button
                                onClick={() => {
                                  setApproveProfileType(
                                    req.business === 'barberia' ? 'barber' :
                                    req.business === 'peluqueria' ? 'estilista' :
                                    'terapeuta'
                                  );
                                  setApproveRole(
                                    req.business === 'barberia' ? 'Barbero Senior' :
                                    req.business === 'peluqueria' ? 'Estilista Senior' :
                                    'Terapeuta Holístico'
                                  );
                                  setApproveSpecialty('');
                                  setApproveAgendas([req.business]);
                                  setRequestToApprove(req);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Rechazar Solicitud',
                                    message: `¿Estás seguro de rechazar la solicitud de acceso de ${req.first_name} ${req.last_name}?`,
                                    confirmText: 'Rechazar',
                                    confirmBtnClass: 'bg-red-600 hover:bg-red-700 shadow-red-900/20',
                                    onConfirm: async () => {
                                      try {
                                        const { error } = await supabase
                                          .from('access_requests')
                                          .update({ status: 'rejected' })
                                          .eq('id', req.id);
                                        if (error) throw error;
                                        triggerNotification(`Solicitud de ${req.first_name} rechazada.`);
                                        fetchPendingRequests();
                                      } catch (err) {
                                        triggerNotification('Error al rechazar la solicitud.');
                                      }
                                    }
                                  });
                                }}
                                className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Bar with Filter Selector and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c0c] border border-white/5 rounded-3xl p-5 shadow-xl">
              {/* Category Filter Tabs (Desktop Only) */}
              <div className="hidden sm:flex bg-black rounded-xl border border-white/5 p-1 max-w-lg w-full">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'barberia', label: 'Barbería' },
                  { id: 'peluqueria', label: 'Peluquería' },
                  { id: 'terapias', label: 'Terapias' }
                ].map((tab) => {
                  const isActive = activeStaffCategoryFilter === tab.id;
                  let activeBg = 'bg-gold/10 text-gold border-gold/20';
                  if (tab.id === 'peluqueria') activeBg = 'bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/20';
                  if (tab.id === 'terapias') activeBg = 'bg-white/10 text-white border-white/20';
                  if (tab.id === 'todos') activeBg = 'bg-white/10 text-white border-white/20';
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStaffCategoryFilter(tab.id as any)}
                      className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all border cursor-pointer ${
                        isActive
                          ? `${activeBg} shadow-md`
                          : 'border-transparent text-text-secondary hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Category Filter Dropdown (Mobile Only) */}
              <div className="sm:hidden relative w-full text-left">
                <select
                  value={activeStaffCategoryFilter}
                  onChange={(e) => setActiveStaffCategoryFilter(e.target.value as any)}
                  className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                >
                  {[
                    { id: 'todos', label: 'Todos los Negocios' },
                    { id: 'barberia', label: 'Barbería Tradicional' },
                    { id: 'peluqueria', label: 'Peluquería de Autor' },
                    { id: 'terapias', label: 'Terapias Holísticas' }
                  ].map(tab => (
                    <option key={tab.id} value={tab.id} className="bg-[#0c0c0c] text-white">
                      {tab.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Add New Staff Button */}
              <button
                onClick={() => {
                  resetStaffForm();
                  setIsStaffDrawerOpen(true);
                }}
                className="py-3 px-6 rounded-full font-bold bg-gold hover:bg-gold/90 text-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-gold/10"
              >
                <Plus size={14} />
                <span>Nuevo Profesional</span>
              </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const allSpecialists = specialistsList.map(sp => ({
                  ...sp,
                  primaryCategory: (sp.assignedAgendas && sp.assignedAgendas.length > 0)
                    ? sp.assignedAgendas[0]
                    : 'barberia'
                }));
                const uniqueSpecialists = Array.from(new Map(allSpecialists.map(sp => [sp.id, sp])).values());
                const filteredStaff = uniqueSpecialists.filter(sp => {
                  if (activeStaffCategoryFilter === 'todos') return true;
                  const agendas = sp.assignedAgendas || [sp.primaryCategory];
                  return agendas.includes(activeStaffCategoryFilter as any);
                });

                return filteredStaff.map((staff) => {
                  const agendas = staff.assignedAgendas || [staff.primaryCategory];
                  const isFlipped = !!flippedStaff[staff.id];
                  const toggleFlip = () => {
                    setFlippedStaff(prev => ({
                      ...prev,
                      [staff.id]: !prev[staff.id]
                    }));
                  };

                  // Calculate specialist stats
                  const staffBookings = bookings.filter(
                    b => b.specialistName === staff.name && (b.status as string) !== 'bloqueado' && (b.status as string) !== 'cancelado'
                  );
                  const totalCitas = staffBookings.length;
                  const totalRevenue = staffBookings.reduce((sum, b) => {
                    const priceStr = b.price.replace(/[^0-9]/g, '');
                    const priceNum = parseInt(priceStr, 10) || 0;
                    return sum + priceNum;
                  }, 0);
                  const averageRevenue = totalCitas > 0 ? Math.round(totalRevenue / totalCitas) : 0;

                  return (
                    <div key={staff.id} className="w-full h-[350px]" style={{ perspective: '1000px' }}>
                      <motion.div
                        layout
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="w-full h-full relative"
                      >
                        {/* FRONT FACE (IMAGE - DEFAULT STATE) */}
                        <div
                          onClick={toggleFlip}
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            pointerEvents: isFlipped ? 'none' : 'auto',
                            zIndex: isFlipped ? 0 : 10,
                          }}
                          className={`bg-[#0c0c0c] rounded-3xl overflow-hidden group shadow-xl transition-colors duration-300 cursor-pointer border ${staff.isActive !== false ? 'border-white/5 hover:border-gold/30' : 'border-white/[0.03] opacity-70'}`}
                        >
                          {/* Active / Inactive status indicator - top left corner */}
                          <div className="absolute top-3 left-3 z-30 flex items-center space-x-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                            {staff.isActive !== false ? (
                              <>
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                </span>
                                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Activo</span>
                              </>
                            ) : (
                              <>
                                <span className="relative flex h-2 w-2">
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white/30" />
                                </span>
                                <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider">Inactivo</span>
                              </>
                            )}
                          </div>

                          {staff.imageUrl ? (
                            <Image
                              src={staff.imageUrl}
                              alt={staff.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 30vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex flex-col items-center justify-center space-y-4">
                              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-2xl font-bold text-gold shadow-[0_4px_12px_rgba(198,155,60,0.15)]">
                                {staff.avatar || staff.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-light">Sin Imagen</span>
                            </div>
                          )}

                          {/* Gradient shadow for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                          {/* Text overlay */}
                          <div className="relative z-20 p-6 text-left space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-serif text-base font-semibold text-white group-hover:text-gold transition-colors truncate max-w-[70%]">
                                {staff.name}
                              </h3>
                              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                staff.profileType === 'admin' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                staff.profileType === 'barber' ? 'bg-gold/10 border-gold/30 text-gold' :
                                staff.profileType === 'estilista' ? 'bg-[#CD7F32]/10 border-[#CD7F32]/30 text-[#CD7F32]' :
                                staff.profileType === 'terapeuta' ? 'bg-[#E2E0D8]/10 border-white/20 text-[#E2E0D8]' :
                                'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                              }`}>
                                {staff.profileType || 'Staff'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-gold/80 font-medium truncate max-w-[75%]">{staff.role}</span>
                              <span className="text-[8px] text-white/40 group-hover:text-gold/60 transition-colors uppercase tracking-widest font-semibold flex items-center space-x-0.5">
                                <span>Detalles</span>
                                <span className="text-[9px]">↻</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BACK FACE (OPERATIONAL DETAILS) */}
                        <div
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            pointerEvents: isFlipped ? 'auto' : 'none',
                            zIndex: isFlipped ? 10 : 0,
                          }}
                          className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl text-left"
                        >
                          <div className="space-y-4">
                            {/* Header: Avatar, Name & role */}
                            <div 
                              onClick={toggleFlip}
                              className="flex items-start justify-between gap-3 cursor-pointer group/header hover:opacity-90 transition-opacity"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-base font-bold text-gold shadow-[inset_0_2px_8px_rgba(198,155,60,0.1)] flex-shrink-0">
                                  {staff.avatar || staff.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="text-left truncate max-w-[140px]">
                                  <h3 className="font-serif text-sm font-medium text-white group-hover/header:text-gold transition-colors truncate">
                                    {staff.name}
                                  </h3>
                                  <span className="text-[10px] text-text-secondary truncate block">{staff.role}</span>
                                </div>
                              </div>

                              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                staff.profileType === 'admin' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                staff.profileType === 'barber' ? 'bg-gold/10 border-gold/30 text-gold' :
                                staff.profileType === 'estilista' ? 'bg-[#CD7F32]/10 border-[#CD7F32]/30 text-[#CD7F32]' :
                                staff.profileType === 'terapeuta' ? 'bg-[#E2E0D8]/10 border-white/20 text-[#E2E0D8]' :
                                'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                              }`}>
                                {staff.profileType || 'Staff'}
                              </span>
                            </div>

                            {/* Credentials Info */}
                            <div className="space-y-1 text-[10px] text-text-secondary leading-relaxed font-light text-left">
                              <div className="flex items-center space-x-1.5 font-mono">
                                <Mail size={10} className="text-text-secondary flex-shrink-0" />
                                <span className="truncate max-w-[180px]">{staff.email}</span>
                              </div>
                              {(staff as any).phone && (
                                <div className="flex items-center space-x-1.5 font-mono">
                                  <Smartphone size={10} className="text-text-secondary flex-shrink-0" />
                                  <span>{(staff as any).phone}</span>
                                </div>
                              )}
                              {staff.specialty && (
                                <div className="text-[11px] text-text-secondary mt-1">
                                  <span className="font-semibold text-white/50">Especialidad:</span> {staff.specialty}
                                </div>
                              )}
                            </div>

                            {/* Bio preview */}
                            <p className="text-[11px] text-text-secondary leading-relaxed font-light line-clamp-2 text-left">
                              {staff.bio || 'Sin biografía ingresada.'}
                            </p>

                            {/* Stats Summary Grid */}
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                                <span className="text-[8px] uppercase tracking-widest text-text-secondary font-semibold block mb-0.5">Total</span>
                                <span className="font-mono text-[10px] font-bold text-gold truncate">
                                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(totalRevenue)}
                                </span>
                              </div>
                              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                                <span className="text-[8px] uppercase tracking-widest text-text-secondary font-semibold block mb-0.5">Promedio</span>
                                <span className="font-mono text-[10px] font-bold text-white truncate">
                                  {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(averageRevenue)}
                                </span>
                              </div>
                              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                                <span className="text-[8px] uppercase tracking-widest text-text-secondary font-semibold block mb-0.5">Citas</span>
                                <span className="font-mono text-[10px] font-bold text-white truncate">
                                  {totalCitas}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer: Agendas badges & Actions */}
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                            {/* Agendas list */}
                            <div className="flex items-center space-x-1">
                              {agendas.map((ag) => (
                                <span
                                  key={ag}
                                  title={`Agenda: ${ag}`}
                                  className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md ${
                                    ag === 'barberia' ? 'bg-gold/5 text-gold border border-gold/10' :
                                    ag === 'peluqueria' ? 'bg-[#CD7F32]/5 text-[#CD7F32] border border-[#CD7F32]/10' :
                                    'bg-white/5 text-white border border-white/10'
                                  }`}
                                >
                                  {ag.substring(0, 3)}
                                </span>
                              ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFlip();
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gold transition-colors cursor-pointer"
                                title="Volver a la foto"
                              >
                                <Undo2 size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  populateStaffForm(staff);
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                                title="Editar profesional"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStaffToDelete({
                                    category: staff.primaryCategory,
                                    id: staff.id,
                                    name: staff.name
                                  });
                                }}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                title="Eliminar profesional"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Staff Slide-over Drawer Panel */}
            <AnimatePresence>
              {isStaffDrawerOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsStaffDrawerOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />

                  {/* Drawer Content */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0c0c0c] border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
                  >
                    <div className="space-y-6 text-left">
                      {/* Title Bar */}
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-gold font-bold">Gestión de Personal</span>
                          <h3 className="font-serif text-lg text-white font-medium">
                            {editingStaff ? 'Editar Profesional' : 'Nuevo Profesional'}
                          </h3>
                        </div>
                        <button
                          onClick={() => setIsStaffDrawerOpen(false)}
                          className="p-1.5 rounded-full hover:bg-white/5 text-text-secondary hover:text-white cursor-pointer transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleStaffFormSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Nombre Completo *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Roberto Sánchez"
                            value={staffFormName}
                            onChange={(e) => setStaffFormName(e.target.value)}
                            className={`w-full bg-black/40 border rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-colors ${
                              staffFormSubmitted && !staffFormName.trim()
                                ? 'border-red-500/80 focus:border-red-500'
                                : 'border-white/10 focus:border-gold/30'
                            }`}
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Correo Electrónico (Credencial) *
                          </label>
                          <input
                            type="email"
                            required
                            disabled={!!editingStaff}
                            placeholder="Ej. roberto.sanchez@valentes.cl"
                            value={staffFormEmail}
                            onChange={(e) => setStaffFormEmail(e.target.value)}
                            className={`w-full bg-black/40 border rounded-xl py-3 px-4 text-xs text-white focus:outline-none transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed disabled:border-white/5 ${
                              staffFormSubmitted && !staffFormEmail.trim()
                                ? 'border-red-500/80 focus:border-red-500'
                                : 'border-white/10 focus:border-gold/30'
                            }`}
                          />
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold font-sans">
                            Teléfono de Contacto *
                          </label>
                          <div className="flex space-x-2 relative">
                            {/* Custom Country Dropdown */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsStaffCountryDropdownOpen(!isStaffCountryDropdownOpen)}
                                className="h-11 bg-black/40 border border-white/10 focus:border-gold/30 rounded-xl px-3 text-xs text-white flex items-center justify-between space-x-2 focus:outline-none transition-colors cursor-pointer min-w-[75px]"
                              >
                                <span>{staffFormCountryCode}</span>
                                <ChevronDown size={12} className="text-white/40" />
                              </button>
                              
                              {isStaffCountryDropdownOpen && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-45"
                                    onClick={() => setIsStaffCountryDropdownOpen(false)}
                                  />
                                  <div className="absolute left-0 mt-1.5 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-1 z-50 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 font-sans">
                                    {[
                                      { code: '+56', label: 'Chile (+56)' },
                                      { code: '+54', label: 'Argentina (+54)' },
                                      { code: '+51', label: 'Perú (+51)' },
                                      { code: '+57', label: 'Colombia (+57)' },
                                      { code: '+34', label: 'España (+34)' },
                                      { code: '+52', label: 'México (+52)' },
                                      { code: '+598', label: 'Uruguay (+598)' },
                                    ].map((c) => (
                                      <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => {
                                          setStaffFormCountryCode(c.code);
                                          setIsStaffCountryDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/5 ${
                                          staffFormCountryCode === c.code ? 'text-gold font-medium bg-gold/5' : 'text-white/70'
                                        }`}
                                      >
                                        {c.label}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Phone Input */}
                            <div className="flex-1">
                              <input
                                type="text"
                                required
                                value={staffFormPhone}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                                  setStaffFormPhone(val);
                                  if (val.length === 9) {
                                    setStaffPhoneError('');
                                  } else {
                                    setStaffPhoneError('El teléfono debe tener exactamente 9 dígitos.');
                                  }
                                }}
                                className={`w-full h-11 bg-black/40 border rounded-xl px-4 text-xs text-white focus:outline-none transition-colors ${
                                  staffPhoneError 
                                    ? 'border-red-500/50 focus:border-red-500' 
                                    : staffFormSubmitted && !staffFormPhone.trim()
                                    ? 'border-red-500/80 focus:border-red-500'
                                    : 'border-white/10 focus:border-gold/30'
                                }`}
                                placeholder="Ej. 966118844"
                              />
                            </div>
                          </div>
                          
                          {/* Error Message */}
                          {staffPhoneError && (
                            <p className="text-[10px] text-red-400 flex items-center space-x-1.5 mt-1 font-sans">
                              <AlertCircle size={10} className="shrink-0" />
                              <span>{staffPhoneError}</span>
                            </p>
                          )}
                        </div>


                        {/* Profile Type */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Perfil de Acceso *
                          </label>
                          <CustomSelect
                            value={staffFormProfileType}
                            onChange={(val) => {
                              const type = val as any;
                              setStaffFormProfileType(type);
                              // Auto-configure agenda assignments based on role
                              if (type === 'barber') setStaffFormAgendas(['barberia']);
                              else if (type === 'estilista') setStaffFormAgendas(['peluqueria']);
                              else if (type === 'terapeuta') setStaffFormAgendas(['terapias']);
                              else if (type === 'admin') setStaffFormAgendas(['barberia', 'peluqueria', 'terapias']);
                            }}
                            options={[
                              { value: 'barber', label: 'Barber (Solo Barbería)' },
                              { value: 'estilista', label: 'Estilista (Solo Peluquería)' },
                              { value: 'terapeuta', label: 'Terapeuta (Solo Terapias Holísticas)' },
                              { value: 'mixto', label: 'Mixto (Múltiples Agendas)' },
                              { value: 'admin', label: 'Administrador (Acceso Total)' }
                            ]}
                            buttonClassName={`w-full bg-black/40 border rounded-xl py-3 px-4 text-xs text-white flex items-center justify-between cursor-pointer focus:outline-none hover:border-white/10 transition-colors text-left ${
                              staffFormSubmitted && !staffFormProfileType
                                ? 'border-red-500/80 focus:border-red-500'
                                : 'border-white/10 focus:border-gold/30'
                            }`}
                          />
                        </div>

                        {/* Agendas checkboxes (Active only for Mixto profile) */}
                        <div className="space-y-2.5">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Agendas Autorizadas (Agenda Visibility)
                          </label>
                          <div className="flex flex-col space-y-2">
                            {[
                              { id: 'barberia', label: 'Barbería Tradicional' },
                              { id: 'peluqueria', label: 'Peluquería de Autor' },
                              { id: 'terapias', label: 'Terapias Holísticas' }
                            ].map((ag) => {
                              const isChecked = staffFormAgendas.includes(ag.id as any);
                              const isDisabled = staffFormProfileType !== 'mixto' && staffFormProfileType !== 'admin';
                              
                              return (
                                <label
                                  key={ag.id}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                    isDisabled ? 'opacity-50 bg-black/10 border-white/5 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.01]'
                                  } ${isChecked ? 'bg-gold/5 border-gold/30' : 'border-white/5'}`}
                                >
                                  <span className={`text-xs transition-colors ${isChecked ? 'text-white' : 'text-white/60'}`}>{ag.label}</span>
                                  <input
                                    type="checkbox"
                                    disabled={isDisabled}
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isDisabled) return;
                                      if (isChecked) {
                                        setStaffFormAgendas(prev => prev.filter(id => id !== ag.id));
                                      } else {
                                        setStaffFormAgendas(prev => [...prev, ag.id as any]);
                                      }
                                    }}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                    isChecked 
                                      ? 'bg-gold border-gold text-black shadow-[0_0_8px_rgba(198,155,60,0.25)]' 
                                      : 'border-white/20 bg-black/40'
                                  }`}>
                                    {isChecked && <Check size={12} className="stroke-[3]" />}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Estado Activo / Inactivo */}
                        <div className="space-y-2.5">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold font-sans">
                            Estado de la Cuenta
                          </label>
                          <label className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:bg-white/[0.01] ${
                            staffFormIsActive ? 'bg-gold/5 border-gold/30' : 'border-white/5 bg-black/20'
                          }`}>
                            <div className="flex flex-col">
                              <span className="text-xs text-white font-medium">Habilitado para trabajar</span>
                              <span className="text-[9px] text-text-secondary mt-0.5">
                                {staffFormIsActive 
                                  ? 'Disponible para citas y con acceso a la administración' 
                                  : 'Oculto en reservas y sin acceso a la administración'}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={staffFormIsActive}
                              onChange={(e) => setStaffFormIsActive(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 relative ${
                              staffFormIsActive ? 'bg-gold' : 'bg-white/10'
                            }`}>
                              <div className={`w-5 h-5 rounded-full bg-black shadow-md transform transition-transform duration-300 ${
                                staffFormIsActive ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                            </div>
                          </label>
                        </div>

                        {/* Imagen del Profesional */}
                        <div className="space-y-3">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Imagen del Profesional
                          </label>
                          <div className="flex items-center space-x-4">
                            {/* Preview */}
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center flex-shrink-0 relative">
                              {staffFormImageUrl ? (
                                <Image
                                  src={staffFormImageUrl}
                                  alt="Preview"
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-white/30 text-center font-light leading-none">Sin foto</span>
                              )}
                            </div>
                            
                            {/* File Upload Trigger */}
                            <div className="flex-1">
                              <label className="inline-block py-2.5 px-4 rounded-xl border border-white/10 text-white hover:border-gold/30 hover:text-gold transition-colors text-[10px] uppercase tracking-widest font-bold bg-white/5 cursor-pointer text-center w-full">
                                {isUploadingStaffImage ? (
                                  <div className="flex items-center justify-center space-x-2 py-0.5">
                                    <span className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
                                    <span>Subiendo...</span>
                                  </div>
                                ) : (
                                  <>
                                    <span>Subir Imagen</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={isUploadingStaffImage}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setIsUploadingStaffImage(true);
                                          try {
                                            const publicUrl = await optimizeAndUploadImage(file);
                                            setStaffFormImageUrl(publicUrl);
                                            triggerNotification('Imagen subida con éxito.');
                                          } catch (err: any) {
                                            console.error(err);
                                            triggerNotification('Error al subir la imagen.');
                                          } finally {
                                            setIsUploadingStaffImage(false);
                                          }
                                        }
                                      }}
                                    />
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Drawer Footer Buttons */}
                    <div className="flex space-x-3 pt-6 border-t border-white/5 mt-8">
                      <button
                        onClick={() => setIsStaffDrawerOpen(false)}
                        className="flex-1 py-3.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleStaffFormSubmit}
                        className="flex-1 py-3.5 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer"
                      >
                        {editingStaff ? 'Guardar Cambios' : 'Añadir Profesional'}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* HORARIOS Y BLOQUEOS TAB */}
        {activeTab === 'horarios' && (
          <div className="space-y-8 text-left">
            {/* Top selector and filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#0c0c0c] border border-white/5 rounded-3xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full lg:w-auto">
                {/* Selector */}
                <div className="relative">
                  <label className="block text-[8px] uppercase tracking-[0.25em] text-text-secondary font-bold mb-1.5">
                    Seleccionar Profesional
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsScheduleStaffDropdownOpen(!isScheduleStaffDropdownOpen)}
                    className="bg-black/60 border border-white/10 text-white text-xs px-4 py-2.5 rounded-xl flex items-center justify-between cursor-pointer focus:outline-none focus:border-gold/30 hover:border-white/15 transition-colors text-left min-w-[240px]"
                  >
                    <div className="flex items-center space-x-2.5">
                      {selectedStaffObj?.imageUrl ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden relative border border-white/10 flex-shrink-0">
                          <Image
                            src={selectedStaffObj.imageUrl}
                            alt={selectedStaffObj.name}
                            fill
                            sizes="20px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-[8px] font-bold text-gold flex-shrink-0">
                          {selectedStaffObj?.avatar || selectedStaffObj?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <span className="truncate font-medium">{selectedStaffObj ? selectedStaffObj.name : 'Seleccionar...'}</span>
                      {selectedStaffObj && (
                        <span className="text-[9px] text-white/40 font-light truncate max-w-[90px]">({selectedStaffObj.role})</span>
                      )}
                    </div>
                    <ChevronDown size={12} className="text-gold ml-2" />
                  </button>

                  {isScheduleStaffDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsScheduleStaffDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 z-50 bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 max-h-60 overflow-y-auto min-w-[280px] text-left">
                        {filteredScheduleStaffList.map((spec) => {
                          const isSelected = spec.id === selectedScheduleStaffId;
                          return (
                            <button
                              key={spec.id}
                              type="button"
                              onClick={() => {
                                setSelectedScheduleStaffId(spec.id);
                                setIsScheduleStaffDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-gold/15 text-gold font-bold' 
                                  : 'text-white/80 hover:text-gold hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {spec.imageUrl ? (
                                  <div className="w-5 h-5 rounded-full overflow-hidden relative border border-white/10 flex-shrink-0">
                                    <Image
                                      src={spec.imageUrl}
                                      alt={spec.name}
                                      fill
                                      sizes="20px"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-[8px] font-bold text-gold flex-shrink-0">
                                    {spec.avatar}
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-medium">{spec.name}</span>
                                  <span className="text-[9px] text-white/45">{spec.role}</span>
                                </div>
                              </div>
                              {isSelected && <Check size={12} className="text-gold" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Filters */}
                <div>
                  <label className="block text-[8px] uppercase tracking-[0.25em] text-text-secondary font-bold mb-1.5">
                    Filtrar por Negocio
                  </label>
                  <div className="flex bg-black rounded-xl border border-white/5 p-1 max-w-sm">
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'barberia', label: 'Barbería' },
                      { id: 'peluqueria', label: 'Peluquería' },
                      { id: 'terapias', label: 'Terapias' }
                    ].map((filter) => {
                      const isActive = activeScheduleBusinessFilter === filter.id;
                      return (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => handleScheduleFilterChange(filter.id as any)}
                          className={`py-1.5 px-3 rounded-lg text-[9px] uppercase tracking-wider font-semibold transition-all ${
                            isActive
                              ? 'bg-gold/15 text-gold border border-gold/25 shadow-md shadow-gold/5'
                              : 'border-transparent text-text-secondary hover:text-white'
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sub-tabs selector: Jornadas / Bloqueos */}
              <div className="flex bg-black rounded-xl border border-white/5 p-1">
                {[
                  { id: 'jornadas', label: 'Jornadas Semanales' },
                  { id: 'bloqueos', label: 'Bloqueos de Horas' }
                ].map((tab) => {
                  const isActive = activeScheduleSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveScheduleSubTab(tab.id as any)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gold/15 border border-gold/20 text-gold shadow-md shadow-gold/5'
                          : 'text-text-secondary hover:text-white border border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-tab Content: JORNADAS */}
            {activeScheduleSubTab === 'jornadas' && (
              <div className="grid grid-cols-1 gap-6 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl">
                <div>
                  <h3 className="font-serif text-lg text-white font-bold tracking-wide">Configuración de Jornada Laboral</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5 mb-6">
                    Define los días laborables, horarios de atención y horas de colación obligatoria.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Monday (1) to Saturday (6) and Sunday (0) */}
                  {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
                    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                    const dayLabel = dayNames[dayNum];
                    
                    // Fetch shift from store
                    const specialistShifts = workShifts[selectedScheduleStaffId] || [];
                    const shift = specialistShifts.find((s) => s.dayOfWeek === dayNum) || {
                      dayOfWeek: dayNum,
                      isActive: dayNum !== 0,
                      startTime: '09:00',
                      endTime: '18:00',
                      hasBreak: true,
                      breakStartTime: '13:00',
                      breakEndTime: '14:00'
                    };

                    const handleToggleActive = (checked: boolean) => {
                      updateWorkShift(selectedScheduleStaffId, dayNum, { isActive: checked });
                      triggerNotification(`Jornada del ${dayLabel} actualizada.`);
                    };

                    const handleToggleBreak = (checked: boolean) => {
                      updateWorkShift(selectedScheduleStaffId, dayNum, { hasBreak: checked });
                      triggerNotification(`Colación del ${dayLabel} actualizada.`);
                    };

                    const handleShiftTimeChange = (field: keyof DailyShift, val: string) => {
                      const digits = val.replace(/\D/g, '').slice(0, 4);
                      const formatted = digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
                      updateWorkShift(selectedScheduleStaffId, dayNum, { [field]: formatted });
                    };

                    return (
                      <div 
                        key={dayNum}
                        className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                          shift.isActive 
                            ? 'bg-[#0f0f0f]/60 border-white/5 hover:border-white/10' 
                            : 'bg-black/40 border-white/5 opacity-50'
                        }`}
                      >
                        {/* Day Name and Main Toggle */}
                        <div className="flex items-center space-x-4 min-w-[200px] mb-3 lg:mb-0">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={shift.isActive}
                              onChange={(e) => handleToggleActive(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#080808] after:border-white/20 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                          <span className={`text-xs font-bold uppercase tracking-wider ${shift.isActive ? 'text-white' : 'text-text-secondary'}`}>
                            {dayLabel}
                          </span>
                          {!shift.isActive && (
                            <span className="text-[8px] bg-red-950/40 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                              Cerrado
                            </span>
                          )}
                        </div>

                        {/* Working Hours configuration */}
                        {shift.isActive && (
                          <div className="flex flex-wrap items-center gap-4 lg:gap-8 flex-1 justify-start lg:justify-end">
                            {/* Working Times */}
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Jornada:</span>
                              <input
                                type="text"
                                placeholder="09:00"
                                maxLength={5}
                                value={shift.startTime}
                                onChange={(e) => handleShiftTimeChange('startTime', e.target.value)}
                                className="bg-[#050505] border border-white/5 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-gold/30 font-mono w-[65px] text-center"
                              />
                              <span className="text-text-secondary text-xs">-</span>
                              <input
                                type="text"
                                placeholder="18:00"
                                maxLength={5}
                                value={shift.endTime}
                                onChange={(e) => handleShiftTimeChange('endTime', e.target.value)}
                                className="bg-[#050505] border border-white/5 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-gold/30 font-mono w-[65px] text-center"
                              />
                            </div>

                            {/* Break Toggle and Times */}
                            <div className="flex items-center space-x-3 bg-black/40 border border-white/5 rounded-xl px-3 py-1.5">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={shift.hasBreak}
                                  onChange={(e) => handleToggleBreak(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-7 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#080808] after:border-white/20 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-gold/80"></div>
                              </label>
                              <span className="text-[9px] text-text-secondary uppercase tracking-widest font-bold font-serif">Hora Colación</span>
                              
                              {shift.hasBreak && (
                                <div className="flex items-center space-x-1 ml-2">
                                  <input
                                    type="text"
                                    placeholder="13:00"
                                    maxLength={5}
                                    value={shift.breakStartTime}
                                    onChange={(e) => handleShiftTimeChange('breakStartTime', e.target.value)}
                                    className="bg-[#050505] border border-white/5 rounded-lg px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-gold/30 w-[65px] text-center font-mono"
                                  />
                                  <span className="text-text-secondary text-[10px]">-</span>
                                  <input
                                    type="text"
                                    placeholder="14:00"
                                    maxLength={5}
                                    value={shift.breakEndTime}
                                    onChange={(e) => handleShiftTimeChange('breakEndTime', e.target.value)}
                                    className="bg-[#050505] border border-white/5 rounded-lg px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-gold/30 w-[65px] text-center font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-tab Content: BLOQUEOS DE HORAS */}
            {activeScheduleSubTab === 'bloqueos' && (() => {
              const currentYear = new Date().getFullYear();
              const todayDateStr = new Date().toISOString().split('T')[0];
              const allChileHolidays = [
                { date: `${currentYear}-01-01`, name: 'Año Nuevo', isIrrenunciable: true },
                { date: `${currentYear}-04-03`, name: 'Viernes Santo', isIrrenunciable: false },
                { date: `${currentYear}-04-04`, name: 'Sábado Santo', isIrrenunciable: false },
                { date: `${currentYear}-05-01`, name: 'Día del Trabajo', isIrrenunciable: true },
                { date: `${currentYear}-05-21`, name: 'Glorias Navales', isIrrenunciable: false },
                { date: `${currentYear}-06-21`, name: 'Pueblos Indígenas', isIrrenunciable: false },
                { date: `${currentYear}-06-29`, name: 'San Pedro y San Pablo', isIrrenunciable: false },
                { date: `${currentYear}-07-16`, name: 'Virgen del Carmen', isIrrenunciable: false },
                { date: `${currentYear}-08-15`, name: 'Asunción de la Virgen', isIrrenunciable: false },
                { date: `${currentYear}-09-18`, name: 'Independencia Nacional', isIrrenunciable: true },
                { date: `${currentYear}-09-19`, name: 'Glorias del Ejército', isIrrenunciable: true },
                { date: `${currentYear}-10-12`, name: 'Encuentro de Dos Mundos', isIrrenunciable: false },
                { date: `${currentYear}-10-31`, name: 'Día de las Iglesias Evangélicas', isIrrenunciable: false },
                { date: `${currentYear}-11-01`, name: 'Día de Todos los Santos', isIrrenunciable: false },
                { date: `${currentYear}-12-08`, name: 'Inmaculada Concepción', isIrrenunciable: false },
                { date: `${currentYear}-12-25`, name: 'Navidad', isIrrenunciable: true },
              ];
              const upcomingHolidays = allChileHolidays.filter(h => h.date >= todayDateStr);

              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Add block form panel */}
                  <div className="md:col-span-5 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl space-y-5 h-fit text-left">
                    <div>
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Bloquear Franja Horaria</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                        Ingresa una excepción en la agenda de este profesional.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Feriados Carousel */}
                      <div className="space-y-1.5 pb-2 border-b border-white/5">
                        <div className="flex justify-between items-center">
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Feriados Chile ({currentYear})</label>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => holidaysRowRef.current?.scrollBy({ left: -105, behavior: 'smooth' })}
                              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                            >
                              <ChevronLeft size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => holidaysRowRef.current?.scrollBy({ left: 105, behavior: 'smooth' })}
                              className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                            >
                              <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>

                        <div 
                          ref={holidaysRowRef}
                          className="flex space-x-2 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1 scroll-smooth"
                        >
                          {upcomingHolidays.map((h) => {
                            const [year, month, day] = h.date.split('-');
                            const monthNames: Record<string, string> = {
                              '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
                              '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
                            };
                            const displayDate = `${day} ${monthNames[month]}`;
                            const isSelected = blockFormDate === h.date;

                            return (
                              <button
                                key={h.date}
                                type="button"
                                onClick={() => {
                                  setBlockFormDate(h.date);
                                  setBlockFormReason(`Feriado: ${h.name}`);
                                  setBlockFormStart('00:00');
                                  setBlockFormEnd('23:59');
                                  triggerNotification(`Feriado "${h.name}" seleccionado.`);
                                }}
                                className={`flex-shrink-0 w-[95px] h-[75px] rounded-2xl p-2.5 flex flex-col justify-between items-start transition-all cursor-pointer border select-none snap-start ${
                                  isSelected
                                    ? 'bg-gold/10 border-gold shadow-[0_0_12px_rgba(198,155,60,0.15)] text-gold'
                                    : 'bg-white/[0.02] border-white/5 hover:border-gold/30 hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-gold' : 'text-gold/80'}`}>
                                    {displayDate}
                                  </span>
                                  {h.isIrrenunciable && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" title="Feriado Irrenunciable" />
                                  )}
                                </div>
                                <span className={`text-[9px] leading-tight font-medium line-clamp-2 text-left ${isSelected ? 'text-white font-semibold' : 'text-white/70'}`}>
                                  {h.name}
                                </span>
                              </button>
                            );
                          })}
                          {upcomingHolidays.length === 0 && (
                            <div className="text-[10px] text-text-secondary italic py-2">No quedan feriados en este año.</div>
                          )}
                        </div>
                      </div>

                      {/* Date picker */}
                      <div className="space-y-1">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Fecha *</label>
                        <input
                          type="date"
                          value={blockFormDate}
                          onChange={(e) => setBlockFormDate(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold/30 cursor-pointer font-mono"
                        />
                      </div>

                      {/* Start & End Times */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Hora Inicio *</label>
                          <input
                            type="time"
                            value={blockFormStart}
                            onChange={(e) => setBlockFormStart(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold/30 font-mono cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Hora Fin *</label>
                          <input
                            type="time"
                            value={blockFormEnd}
                            onChange={(e) => setBlockFormEnd(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold/30 font-mono cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Reason drop down selector */}
                      <div className="space-y-1">
                        <label className="block text-[8px] uppercase tracking-widest text-text-secondary font-bold">Motivo del Bloqueo *</label>
                        <CustomSelect
                          value={blockFormReason}
                          onChange={(val) => setBlockFormReason(val)}
                          options={[
                            { value: 'Almuerzo', label: 'Almuerzo' },
                            { value: 'Permiso Médico', label: 'Permiso Médico' },
                            { value: 'Capacitación', label: 'Capacitación' },
                            { value: 'Vacaciones', label: 'Vacaciones' },
                            { value: 'Asunto Personal', label: 'Asunto Personal' },
                            ...(!['Almuerzo', 'Permiso Médico', 'Capacitación', 'Vacaciones', 'Asunto Personal'].includes(blockFormReason) && blockFormReason
                              ? [{ value: blockFormReason, label: blockFormReason }]
                              : [])
                          ]}
                          buttonClassName="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white flex items-center justify-between cursor-pointer focus:outline-none focus:border-gold/30 hover:border-white/10 transition-colors text-left"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (!blockFormDate || !blockFormStart || !blockFormEnd) {
                            triggerNotification('Por favor completa todos los campos.');
                            return;
                          }
                          if (blockFormStart >= blockFormEnd) {
                            triggerNotification('La hora de inicio debe ser anterior a la hora de fin.');
                            return;
                          }

                          if (blockFormReason.startsWith('Feriado:')) {
                            if (specialistsList.length === 0) {
                              triggerNotification('No hay profesionales registrados para bloquear.');
                              return;
                            }
                            specialistsList.forEach((spec) => {
                              addTimeBlock({
                                specialistId: spec.id,
                                date: blockFormDate,
                                startTime: blockFormStart,
                                endTime: blockFormEnd,
                                reason: blockFormReason as any
                              });
                            });
                            triggerNotification('Feriado bloqueado para todos los profesionales.');
                          } else {
                            if (!selectedScheduleStaffId) {
                              triggerNotification('Por favor selecciona un profesional.');
                              return;
                            }
                            addTimeBlock({
                              specialistId: selectedScheduleStaffId,
                              date: blockFormDate,
                              startTime: blockFormStart,
                              endTime: blockFormEnd,
                              reason: blockFormReason as any
                            });
                            triggerNotification('Franja horaria bloqueada correctamente.');
                          }
                        }}
                        className="w-full py-3 bg-gold hover:bg-gold/90 text-black text-[10px] uppercase font-bold tracking-widest rounded-full transition-colors cursor-pointer"
                      >
                        Bloquear Horas
                      </button>
                    </div>
                  </div>

                  {/* Blocks list panel */}
                  <div className="md:col-span-7 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4 text-left">
                    <div>
                      <h3 className="font-serif text-base text-white font-bold tracking-wide">Bloqueos Activos</h3>
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-0.5">
                        Historial de franjas horarias bloqueadas para el profesional seleccionado.
                      </p>
                    </div>

                    <div className="overflow-x-auto w-full">
                      {timeBlocks.filter(b => b.specialistId === selectedScheduleStaffId).length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-black/20">
                          <Clock size={20} className="mx-auto text-text-secondary/35 mb-2" />
                          <p className="text-xs text-text-secondary font-light">No hay bloqueos activos para este profesional.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs text-white border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-text-secondary">
                              <th className="pb-3 font-semibold font-serif">Fecha</th>
                              <th className="pb-3 font-semibold font-serif">Horario</th>
                              <th className="pb-3 font-semibold font-serif">Motivo</th>
                              <th className="pb-3 font-semibold font-serif text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {timeBlocks
                              .filter(b => b.specialistId === selectedScheduleStaffId)
                              .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                              .map((block) => {
                                const [y, m, d] = block.date.split('-');
                                const formattedDate = `${d}/${m}/${y}`;
                                
                                let badgeColor = 'bg-stone-500/10 text-stone-400 border-stone-500/20';
                                if (block.reason === 'Permiso Médico') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                                else if (block.reason === 'Capacitación') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                                else if (block.reason === 'Vacaciones') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                                else if (block.reason === 'Almuerzo') badgeColor = 'bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/20';
                                
                                return (
                                  <tr key={block.id} className="hover:bg-white/[0.01]">
                                    <td className="py-3.5 font-mono text-[11px] font-semibold">{formattedDate}</td>
                                    <td className="py-3.5 font-mono text-[11px] text-text-secondary">{block.startTime} - {block.endTime}</td>
                                    <td className="py-3.5">
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold border ${badgeColor}`}>
                                        {block.reason}
                                      </span>
                                    </td>
                                    <td className="py-3.5 text-right">
                                      <button
                                        onClick={() => {
                                          setBlockToDelete({
                                            id: block.id,
                                            date: formattedDate,
                                            reason: block.reason,
                                            startTime: block.startTime,
                                            endTime: block.endTime
                                          });
                                        }}
                                        className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </main>

      {editingAsset && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0c0c0c] border border-gold/20 rounded-3xl p-6 max-w-md w-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif text-sm font-bold text-white tracking-wider uppercase">{editingAsset.label}</h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-text-secondary hover:text-white cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Media Type Selector */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Tipo de Medio</label>
                <div className="flex space-x-2 bg-black/40 p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaEditorType('image');
                      if (editingAsset && isVideoUrl(editingAsset.currentValue)) {
                        setEditingAsset(prev => prev ? { ...prev, currentValue: '' } : null);
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                      mediaEditorType === 'image'
                        ? 'bg-gold text-black shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Imagen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaEditorType('video');
                      if (editingAsset && !isVideoUrl(editingAsset.currentValue)) {
                        setEditingAsset(prev => prev ? { ...prev, currentValue: '' } : null);
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                      mediaEditorType === 'video'
                        ? 'bg-gold text-black shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              {mediaEditorType === 'video' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">URL del Video o Archivo</label>
                    <input
                      type="text"
                      value={editingAsset.currentValue}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setEditingAsset(prev => prev ? { ...prev, currentValue: newVal } : null);
                      }}
                      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Seleccionar imagen desde el computador</label>
                  <label className="flex items-center justify-center border border-dashed border-white/10 hover:border-gold/35 rounded-lg p-3.5 cursor-pointer transition-colors bg-white/[0.01]">
                    {isUploadingAsset ? (
                      <div className="flex items-center space-x-2 text-xs text-text-secondary py-1">
                        <span className="w-3.5 h-3.5 border border-gold border-t-transparent rounded-full animate-spin" />
                        <span>Optimizando y Subiendo...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1 text-center py-1">
                        <UploadCloud size={16} className="text-text-secondary hover:text-gold transition-colors" />
                        <span className="text-[10px] text-white font-semibold">Seleccionar imagen</span>
                        <span className="text-[8px] text-text-secondary">Se optimizará automáticamente</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingAsset}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingAsset(true);
                          try {
                            const publicUrl = await optimizeAndUploadImage(file);
                            setEditingAsset(prev => prev ? { ...prev, currentValue: publicUrl } : null);
                            triggerNotification('Imagen subida y optimizada con éxito.');
                          } catch (err: any) {
                            console.error(err);
                            triggerNotification('Error al subir/optimizar la imagen.');
                          } finally {
                            setIsUploadingAsset(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Previsualización del Recurso Cargado */}
              {editingAsset.currentValue && (
                <div className="space-y-1.5">
                  <span className="block text-[9px] uppercase tracking-wider text-gold font-bold">
                    {mediaEditorType === 'video' ? 'Video Previsualizado' : 'Imagen Previsualizada'}
                  </span>
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-black/50 flex items-center justify-center p-2">
                    {mediaEditorType === 'video' ? (
                      <video 
                        src={editingAsset.currentValue} 
                        className="max-h-40 rounded-xl"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={editingAsset.currentValue} 
                        alt="Vista previa" 
                        className="object-contain max-h-40 rounded-xl"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setEditingAsset(null)}
                className="flex-1 py-2.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (editingAsset.itemId) {
                    handleGalleryItemChange(editingAsset.itemId, editingAsset.key, editingAsset.currentValue);
                  } else {
                    handleVsmInputChange(editingAsset.key, editingAsset.currentValue);
                  }
                  setEditingAsset(null);
                  triggerNotification('Recurso de la vista previa actualizado.');
                }}
                className="flex-1 py-2.5 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer"
              >
                Aplicar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PROFESSIONAL CONFIRMATION MODAL */}
      <AnimatePresence>
        {staffToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStaffToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[32px] p-6 shadow-2xl z-10 text-left space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setStaffToDelete(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="space-y-4">
                {/* Warning Icon & Title */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-red-400 font-bold">Confirmar Eliminación</span>
                    <h3 className="font-serif text-sm font-medium text-white">¿Eliminar Profesional?</h3>
                  </div>
                </div>

                {/* Message */}
                <p className="text-xs text-text-secondary leading-relaxed font-light">
                  ¿Estás seguro de que deseas eliminar al profesional <strong className="text-white font-medium">{staffToDelete.name}</strong>?
                  Esta acción es permanente, se borrarán todos sus turnos configurados y no se podrá deshacer.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setStaffToDelete(null)}
                  className="flex-1 py-3.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (staffToDelete) {
                      await deleteSpecialist(staffToDelete.category, staffToDelete.id);
                      triggerNotification(`Profesional "${staffToDelete.name}" eliminado con éxito.`);
                      setStaffToDelete(null);
                    }
                  }}
                  className="flex-1 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Trash2 size={12} />
                  <span>Eliminar</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CLIENT CONFIRMATION MODAL */}
      <AnimatePresence>
        {clientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClientToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[32px] p-6 shadow-2xl z-10 text-left space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setClientToDelete(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="space-y-4">
                {/* Warning Icon & Title */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-red-400 font-bold">Confirmar Eliminación</span>
                    <h3 className="font-serif text-sm font-medium text-white">¿Eliminar Cliente?</h3>
                  </div>
                </div>

                {/* Message */}
                <p className="text-xs text-text-secondary leading-relaxed font-light">
                  ¿Estás seguro de que deseas eliminar al cliente <strong className="text-white font-medium">{clientToDelete.name}</strong>?
                  Esta acción eliminará el perfil del cliente de la base de datos de forma permanente y no se podrá deshacer.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setClientToDelete(null)}
                  className="flex-1 py-3.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (clientToDelete) {
                      await deleteClient(clientToDelete.phone);
                      triggerNotification(`Cliente "${clientToDelete.name}" eliminado con éxito.`);
                      if (selectedClient?.phone === clientToDelete.phone) {
                        setSelectedClient(null);
                      }
                      setClientToDelete(null);
                    }
                  }}
                  className="flex-1 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Trash2 size={12} />
                  <span>Eliminar</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CLIENT MODAL */}
      <AnimatePresence>
        {isEditingClient && clientToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingClient(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[32px] p-8 shadow-2xl z-10 text-left space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsEditingClient(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div>
                <span className="text-[8px] uppercase tracking-widest text-gold font-bold">Gestión de Clientes</span>
                <h3 className="font-serif text-xl text-white font-semibold">Editar Datos de Cliente</h3>
                <p className="text-xs text-text-secondary font-light mt-1">
                  Modifica los datos del perfil de <strong className="text-white font-medium">{clientToEdit.name}</strong>.
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  if (!editClientName.trim()) {
                    triggerNotification('El nombre es obligatorio.');
                    return;
                  }

                  if (editClientPhone.length !== 9) {
                    setPhoneError('El teléfono debe tener exactamente 9 dígitos.');
                    triggerNotification('Corrige los errores antes de guardar.');
                    return;
                  }
                  
                  const finalPhone = countryCode + editClientPhone.trim();
                  
                  await updateClient(clientToEdit.phone, {
                    name: editClientName.trim(),
                    phone: finalPhone,
                    email: editClientEmail.trim() || ''
                  });
                  
                  if (selectedClient?.phone === clientToEdit.phone) {
                    setSelectedClient({
                      ...selectedClient,
                      name: editClientName.trim(),
                      phone: finalPhone,
                      email: editClientEmail.trim() || ''
                    });
                  }
                  
                  triggerNotification(`Cliente "${editClientName.trim()}" actualizado con éxito.`);
                  setIsEditingClient(false);
                }} 
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full bg-[#141414] border border-white/5 focus:border-gold/30 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Teléfono de Contacto</label>
                  
                  <div className="flex space-x-2 relative">
                    {/* Custom Country Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsEditCountryDropdownOpen(!isEditCountryDropdownOpen)}
                        className="h-11 bg-[#141414] border border-white/5 focus:border-gold/30 rounded-2xl px-3 text-xs text-white flex items-center justify-between space-x-2 focus:outline-none transition-colors cursor-pointer min-w-[75px]"
                      >
                        <span>{countryCode}</span>
                        <ChevronDown size={12} className="text-white/40" />
                      </button>
                      
                      {isEditCountryDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-45"
                            onClick={() => setIsEditCountryDropdownOpen(false)}
                          />
                          <div className="absolute left-0 mt-1.5 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl py-1 z-50 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 font-sans">
                            {[
                              { code: '+56', label: 'Chile (+56)' },
                              { code: '+54', label: 'Argentina (+54)' },
                              { code: '+51', label: 'Perú (+51)' },
                              { code: '+57', label: 'Colombia (+57)' },
                              { code: '+34', label: 'España (+34)' },
                              { code: '+52', label: 'México (+52)' },
                              { code: '+598', label: 'Uruguay (+598)' },
                            ].map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setIsEditCountryDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/5 ${
                                  countryCode === c.code ? 'text-gold font-medium bg-gold/5' : 'text-white/70'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={editClientPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 9) {
                            setEditClientPhone(val);
                            if (val.length > 0 && val.length !== 9) {
                              setPhoneError('El teléfono debe tener exactamente 9 dígitos.');
                            } else {
                              setPhoneError('');
                            }
                          }
                        }}
                        className={`w-full h-11 bg-[#141414] border ${
                          phoneError ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-gold/30'
                        } rounded-2xl px-4 text-xs text-white placeholder-white/20 focus:outline-none transition-colors font-mono`}
                        placeholder="Ej. 966118844"
                      />
                    </div>
                  </div>

                  {phoneError && (
                    <p className="text-[10px] text-red-400 font-light flex items-center gap-1 mt-1">
                      <AlertCircle size={10} className="text-red-400" />
                      <span>{phoneError}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editClientEmail}
                    onChange={(e) => setEditClientEmail(e.target.value)}
                    className="w-full bg-[#141414] border border-white/5 focus:border-gold/30 rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none transition-colors"
                    placeholder="Ej. juan.perez@email.com"
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsEditingClient(false)}
                    className="flex-1 py-3 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Save size={12} />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* DELETE SERVICE CONFIRMATION MODAL */}
      <AnimatePresence>
        {serviceToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setServiceToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[32px] p-6 shadow-2xl z-10 text-left space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setServiceToDelete(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="space-y-4">
                {/* Warning Icon & Title */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-red-400 font-bold">Confirmar Eliminación</span>
                    <h3 className="font-serif text-sm font-medium text-white">¿Eliminar Servicio?</h3>
                  </div>
                </div>

                {/* Message */}
                <p className="text-xs text-text-secondary leading-relaxed font-light">
                  ¿Estás seguro de que deseas eliminar el servicio <strong className="text-white font-medium">{serviceToDelete.name}</strong>?
                  Esta acción es permanente, se eliminará del catálogo de servicios y no se podrá deshacer.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setServiceToDelete(null)}
                  className="flex-1 py-3.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (serviceToDelete) {
                      await deleteService(serviceToDelete.category, serviceToDelete.id);
                      triggerNotification(`Servicio "${serviceToDelete.name}" eliminado con éxito.`);
                      setServiceToDelete(null);
                    }
                  }}
                  className="flex-1 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Trash2 size={12} />
                  <span>Eliminar</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {blockToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBlockToDelete(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[32px] p-6 shadow-2xl z-10 text-left space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setBlockToDelete(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="space-y-4">
                {/* Warning Icon & Title */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-red-400 font-bold">Confirmar Eliminación</span>
                    <h3 className="font-serif text-sm font-medium text-white">¿Eliminar Bloqueo?</h3>
                  </div>
                </div>

                {/* Message */}
                <p className="text-xs text-text-secondary leading-relaxed font-light">
                  ¿Estás seguro de que deseas eliminar el bloqueo del día <strong className="text-white font-medium">{blockToDelete.date}</strong> ({blockToDelete.startTime} - {blockToDelete.endTime})?
                  El motivo registrado es <span className="text-white">"{blockToDelete.reason}"</span>. Esta acción volverá a habilitar el horario para reservas.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setBlockToDelete(null)}
                  className="flex-1 py-3.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (blockToDelete) {
                      await deleteTimeBlock(blockToDelete.id);
                      triggerNotification('Bloqueo eliminado correctamente.');
                      setBlockToDelete(null);
                    }
                  }}
                  className="flex-1 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Trash2 size={12} />
                  <span>Eliminar</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACCESS REQUEST APPROVAL MODAL */}
      <AnimatePresence>
        {requestToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRequestToApprove(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[32px] p-8 shadow-2xl z-10 text-left space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setRequestToApprove(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-2">
                <span className="text-[8px] uppercase tracking-widest text-gold font-bold">Aprobación de Acceso</span>
                <h3 className="font-serif text-lg text-white font-medium">Configurar Colaborador</h3>
                <p className="text-xs text-text-secondary font-light">
                  Configura el perfil de acceso y las agendas autorizadas para <strong className="text-white font-medium">{requestToApprove.first_name} {requestToApprove.last_name}</strong>.
                </p>
              </div>

              <div className="space-y-4">
                {/* Profile Type */}
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Perfil de Acceso *</label>
                  <CustomSelect
                    value={approveProfileType}
                    onChange={(val) => {
                      const type = val as any;
                      setApproveProfileType(type);
                      if (type === 'barber') setApproveAgendas(['barberia']);
                      else if (type === 'estilista') setApproveAgendas(['peluqueria']);
                      else if (type === 'terapeuta') setApproveAgendas(['terapias']);
                      else if (type === 'admin') setApproveAgendas(['barberia', 'peluqueria', 'terapias']);
                    }}
                    options={[
                      { value: 'barber', label: 'Barber (Solo Barbería)' },
                      { value: 'estilista', label: 'Estilista (Solo Peluquería)' },
                      { value: 'terapeuta', label: 'Terapeuta (Solo Terapias Holísticas)' },
                      { value: 'mixto', label: 'Mixto (Múltiples Agendas)' },
                      { value: 'admin', label: 'Administrador (Acceso Total)' }
                    ]}
                    buttonClassName="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white flex items-center justify-between cursor-pointer focus:outline-none focus:border-gold/30 hover:border-white/10 transition-colors text-left"
                  />
                </div>



                {/* Agendas checkboxes */}
                <div className="space-y-2.5">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Agendas Autorizadas *</label>
                  <div className="flex flex-col space-y-2">
                    {[
                      { id: 'barberia', label: 'Barbería Tradicional' },
                      { id: 'peluqueria', label: 'Peluquería de Autor' },
                      { id: 'terapias', label: 'Terapias Holísticas' }
                    ].map((ag) => {
                      const isChecked = approveAgendas.includes(ag.id as any);
                      const isDisabled = approveProfileType !== 'mixto';

                      return (
                        <label
                          key={ag.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isDisabled ? 'opacity-50 bg-black/10 border-white/5 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.01]'
                          } ${isChecked ? 'bg-gold/5 border-gold/30' : 'border-white/5'}`}
                        >
                          <span className={`text-xs transition-colors ${isChecked ? 'text-white' : 'text-white/60'}`}>{ag.label}</span>
                          <input
                            type="checkbox"
                            disabled={isDisabled}
                            checked={isChecked}
                            onChange={() => {
                              if (isDisabled) return;
                              if (isChecked) {
                                setApproveAgendas(prev => prev.filter(id => id !== ag.id));
                              } else {
                                setApproveAgendas(prev => [...prev, ag.id as any]);
                              }
                            }}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-gold border-gold text-black shadow-[0_0_8px_rgba(198,155,60,0.25)]' 
                              : 'border-white/20 bg-black/40'
                          }`}>
                            {isChecked && <Check size={12} className="stroke-[3]" />}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => setRequestToApprove(null)}
                  disabled={approvalLoading}
                  className="flex-1 py-3.5 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApproveRequest}
                  disabled={approvalLoading || approveAgendas.length === 0}
                  className="flex-1 py-3.5 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {approvalLoading ? 'Creando...' : 'Confirmar Acceso'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GENERATED CREDENTIALS POPUP */}
      <AnimatePresence>
        {approvedCredentials && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setApprovedCredentials(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#0c0c0c] border border-white/10 rounded-[32px] p-8 shadow-2xl z-10 text-left space-y-6"
            >
              <div className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mx-auto shadow-[0_4px_15px_rgba(198,155,60,0.15)]">
                  <UserCheck size={20} />
                </div>
                <h3 className="font-serif text-lg text-white font-medium">Credenciales Generadas</h3>
                <p className="text-xs text-text-secondary font-light">
                  Se ha generado un acceso administrativo temporal para el usuario. Copia estas credenciales para entregárselas de forma segura.
                </p>
              </div>

              <div className="space-y-3 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[11px] text-white">
                <div className="flex justify-between items-center py-1">
                  <span className="text-white/40 uppercase text-[9px] tracking-wider font-sans">Email:</span>
                  <span className="select-all">{approvedCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/5">
                  <span className="text-white/40 uppercase text-[9px] tracking-wider font-sans">Contraseña:</span>
                  <span className="text-gold select-all font-bold">{approvedCredentials.tempPass}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const text = `Credenciales Santuario de Bienestar\nEmail: ${approvedCredentials.email}\nContraseña Temporal: ${approvedCredentials.tempPass}\nNota: Al ingresar por primera vez, el sistema te solicitará cambiar esta contraseña por seguridad.`;
                  
                  try {
                    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                      navigator.clipboard.writeText(text);
                      triggerNotification('Credenciales copiadas al portapapeles.');
                    } else {
                      const textArea = document.createElement('textarea');
                      textArea.value = text;
                      textArea.style.top = '0';
                      textArea.style.left = '0';
                      textArea.style.position = 'fixed';
                      document.body.appendChild(textArea);
                      textArea.focus();
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      triggerNotification('Credenciales copiadas al portapapeles.');
                    }
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) {
                    console.error('Error copying text:', err);
                    triggerNotification('No se pudo copiar automáticamente. Por favor copia manualmente.');
                  }
                }}
                className="w-full py-3.5 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[9px] transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-gold/5"
              >
                <span>{copied ? '¡Copiado!' : 'Copiar Datos'}</span>
              </button>

              <button
                onClick={() => setApprovedCredentials(null)}
                className="w-full py-3 text-center text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ManualBookingModal 
        isOpen={isManualBookingOpen} 
        onClose={() => setIsManualBookingOpen(false)} 
        defaultCategory={activeBusinessTab} 
        defaultSpecialistId={prefillSpecialistId}
        defaultDate={prefillDate}
        defaultTime={prefillTime}
        onBookingCreated={(code) => triggerNotification(`Reserva ${code} creada con éxito.`)}
      />

      {/* CHANGE PASSWORD OVERLAY */}
      {requirePasswordChange && (
        <div className="fixed inset-0 z-50 bg-[#070707] text-[#F0F0F0] flex items-center justify-center p-4">
          {/* Toast Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-6 left-1/2 z-50 bg-[#121212] border border-gold/40 text-gold text-xs px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 font-medium tracking-wide backdrop-blur-md"
              >
                <Sparkles size={14} className="animate-pulse" />
                <span>{notification}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-[32px] p-8 shadow-2xl space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-3xl" />
            
            <div className="space-y-2">
              <span className="text-[8px] uppercase tracking-[0.4em] text-gold font-bold block">Consola Administrativa</span>
              <h2 className="font-serif text-2xl font-bold tracking-[0.1em] text-white">Cambiar Contraseña</h2>
              <p className="text-xs text-text-secondary font-light leading-relaxed">
                Por razones de seguridad, debes actualizar la contraseña temporal asignada en tu primer inicio de sesión antes de continuar.
              </p>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (forceNewPassword.length < 6) {
                  triggerNotification('La contraseña debe tener al menos 6 caracteres.');
                  return;
                }
                if (forceNewPassword !== forceConfirmPassword) {
                  triggerNotification('Las contraseñas no coinciden.');
                  return;
                }
                
                try {
                  setForcePasswordLoading(true);
                  const { error } = await supabase.auth.updateUser({
                    password: forceNewPassword,
                    data: { require_password_change: false }
                  });

                  if (error) {
                    triggerNotification(`Error: ${error.message}`);
                  } else {
                    triggerNotification('Contraseña actualizada con éxito.');
                    setRequirePasswordChange(false);
                  }
                } catch (err) {
                  triggerNotification('Error al conectar con el servidor.');
                } finally {
                  setForcePasswordLoading(false);
                }
              }} 
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={forceNewPassword}
                  onChange={(e) => setForceNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Confirmar Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repite la nueva contraseña"
                  value={forceConfirmPassword}
                  onChange={(e) => setForceConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={forcePasswordLoading}
                className="w-full mt-6 py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-[10px] transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/5 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {forcePasswordLoading ? 'Actualizando...' : 'Guardar y Continuar'}
              </button>
            </form>
          </div>
        </div>
      )}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl text-center z-10 overflow-hidden"
            >
              {/* Gold Top Glow */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <h3 className="font-serif text-base text-white mb-2 tracking-wide font-bold">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-6 px-2">
                {confirmModal.message}
              </p>
              
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2.5 rounded-full border border-white/10 text-white hover:bg-white/5 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`px-5 py-2.5 rounded-full text-white text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg ${confirmModal.confirmBtnClass}`}
                >
                  {confirmModal.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
