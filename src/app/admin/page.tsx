'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Mail,
  Sparkles, 
  Save, 
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Monitor,
  Undo2,
  Redo2,
  Camera,
  X,
  Gift
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { useContentStore } from '@/store/useContentStore';
import { useGiftCardStore } from '@/store/useGiftCardStore';
import { useServicesStore } from '@/store/useServicesStore';
import { useScheduleStore, DailyShift, TimeBlock } from '@/store/useScheduleStore';
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
}

function CustomSelect({ value, onChange, options, placeholder = 'Seleccionar...', className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/60 border border-white/5 text-white text-xs px-4 py-2.5 rounded-xl flex items-center justify-between cursor-pointer focus:outline-none focus:border-gold/30 hover:border-white/10 transition-colors text-left"
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

  // Session User State
  const [currentUser, setCurrentUser] = useState<any | null>(null);

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

  // Staff Configuration State
  const [activeStaffCategoryFilter, setActiveStaffCategoryFilter] = useState<'todos' | 'barberia' | 'peluqueria' | 'terapias'>('todos');
  const [isStaffDrawerOpen, setIsStaffDrawerOpen] = useState(false);
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

  const resetServiceForm = () => {
    setServiceFormName('');
    setServiceFormPrice('');
    setServiceFormDuration('30 min');
    setServiceFormDescription('');
    setServiceFormSpecialists([]);
    setEditingService(null);
  };

  const populateServiceForm = (service: any) => {
    setEditingService(service);
    setServiceFormName(service.name);
    setServiceFormPrice(service.price);
    setServiceFormDuration(service.duration);
    setServiceFormDescription(service.description);
    setServiceFormSpecialists(service.specialistIds || []);
    setIsServiceDrawerOpen(true);
  };

  const handleServiceFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormName || !serviceFormPrice || !serviceFormDuration) {
      triggerNotification('Por favor, completa los campos obligatorios.');
      return;
    }

    // Ensure price has $ prefix if not present
    let formattedPrice = serviceFormPrice.trim();
    if (!formattedPrice.startsWith('$')) {
      formattedPrice = '$' + formattedPrice;
    }

    const serviceDataPayload = {
      name: serviceFormName.trim(),
      price: formattedPrice,
      duration: serviceFormDuration,
      description: serviceFormDescription.trim(),
      specialistIds: serviceFormSpecialists
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
    setEditingStaff(null);
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
    setIsStaffDrawerOpen(true);
  };

  const handleStaffFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormName || !staffFormEmail || !staffFormRole || !staffFormProfileType) {
      triggerNotification('Por favor, completa los campos obligatorios.');
      return;
    }

    // Determine target category based on profileType
    let primaryCategory = 'barberia';
    if (staffFormProfileType === 'estilista') primaryCategory = 'peluqueria';
    else if (staffFormProfileType === 'terapeuta') primaryCategory = 'terapias';
    else if (staffFormProfileType === 'mixto' && staffFormAgendas.length > 0) primaryCategory = staffFormAgendas[0];
    else if (staffFormProfileType === 'admin') primaryCategory = 'peluqueria'; // default

    const initials = staffFormName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const staffPayload = {
      name: staffFormName.trim(),
      email: staffFormEmail.trim(),
      role: staffFormRole.trim(),
      specialty: staffFormSpecialty.trim(),
      bio: staffFormBio.trim(),
      profileType: staffFormProfileType,
      assignedAgendas: staffFormAgendas,
      avatar: staffFormAvatar.trim() || initials
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('valentes123');
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'crm' | 'giftcards' | 'vsm' | 'servicios' | 'profesionales' | 'perfil' | 'horarios'>('dashboard');

  // Schedule and Time Block States
  const [selectedScheduleStaffId, setSelectedScheduleStaffId] = useState<string>('sb1');
  const [blockFormDate, setBlockFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [blockFormStart, setBlockFormStart] = useState('10:00');
  const [blockFormEnd, setBlockFormEnd] = useState('11:00');
  const [blockFormReason, setBlockFormReason] = useState<'Almuerzo' | 'Permiso Médico' | 'Capacitación' | 'Vacaciones' | 'Asunto Personal'>('Asunto Personal');
  const [activeScheduleSubTab, setActiveScheduleSubTab] = useState<'jornadas' | 'bloqueos'>('jornadas');
  
  // Booking Sub-tabs State
  const [activeBusinessTab, setActiveBusinessTab] = useState<'barberia' | 'peluqueria' | 'terapias'>('barberia');
  
  // Dashboard Filtering States
  const [dbDateFilter, setDbDateFilter] = useState<'hoy' | 'semana' | 'mes' | 'personalizado'>('semana');
  const [dbStartDate, setDbStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [dbEndDate, setDbEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dbBusinessFilter, setDbBusinessFilter] = useState<'todos' | 'barberia' | 'peluqueria' | 'terapias'>('todos');
  const [dbServiceFilter, setDbServiceFilter] = useState<string>('todos');
  
  // CRM Search & Filter State
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilter, setCrmFilter] = useState<'todos' | 'barberia' | 'peluqueria' | 'terapias' | 'crossover'>('todos');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
  // VSM Selected Page State
  const [vsmPage, setVsmPage] = useState<'home' | 'barberia' | 'peluqueria' | 'terapias' | 'peluqueria-gallery'>('home');
  const [notification, setNotification] = useState<string | null>(null);

  // Manual Booking Modal State
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [prefillSpecialistId, setPrefillSpecialistId] = useState<string | undefined>(undefined);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [prefillTime, setPrefillTime] = useState<string | undefined>(undefined);

  // Agenda Filter States
  const [agendaViewMode, setAgendaViewMode] = useState<'hoy' | 'manana' | 'semana' | 'prox_semana' | 'fecha'>('hoy');
  const [agendaCustomDate, setAgendaCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeSpecialistFilter, setActiveSpecialistFilter] = useState<string>('all');

  // Profile Form States
  const [profileName, setProfileName] = useState('Sofia Valente');
  const [profileRole, setProfileRole] = useState('Directora de Operaciones');
  const [profileEmail, setProfileEmail] = useState('sofia.valente@valentes.cl');
  const [newPassword, setNewPassword] = useState('');

  // Synchronize profile form states when currentUser changes (e.g. upon login or edit)
  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileRole(currentUser.role || '');
      setProfileEmail(currentUser.email || '');
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
  const { bookings, clients, addBooking, updateBookingStatus, deleteBooking, updateClientNotes, markAsNotGoodClient } = useBookingStore();
  const { content, updateContent } = useContentStore();

  // Temporary local VSM form state (initialized to content values)
  const [vsmForm, setVsmForm] = useState(content);
  const [vsmPeluEntered, setVsmPeluEntered] = useState(false);
  const [vsmViewMode, setVsmViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [editingAsset, setEditingAsset] = useState<{ page: string; key: string; label: string; currentValue: string; itemId?: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resolve all specialists flat list to check if username matches any email
    const allSpecialists = Object.keys(servicesData).flatMap(cat => servicesData[cat].specialists);
    const matchedSp = allSpecialists.find(sp => sp.email.toLowerCase() === username.trim().toLowerCase());
    
    if (matchedSp) {
      setCurrentUser(matchedSp);
      setIsLoggedIn(true);
      if (matchedSp.assignedAgendas && matchedSp.assignedAgendas.length > 0) {
        setActiveBusinessTab(matchedSp.assignedAgendas[0]);
      }
      if (matchedSp.profileType !== 'admin') {
        setActiveTab('agenda');
      } else {
        setActiveTab('dashboard');
      }
      triggerNotification(`Sesión iniciada como ${matchedSp.name} (${matchedSp.profileType.toUpperCase()}).`);
    } else if (username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'sofia') {
      setCurrentUser({
        id: 'admin',
        name: 'Sofía Valente',
        email: 'sofia.valente@valentes.cl',
        profileType: 'admin',
        assignedAgendas: ['barberia', 'peluqueria', 'terapias'],
        role: 'Directora de Operaciones',
        avatar: 'SV'
      });
      setIsLoggedIn(true);
      setActiveTab('dashboard');
      triggerNotification('Sesión iniciada como Administrador Principal.');
    } else {
      // Demo fallback: default to admin, let user know
      setCurrentUser({
        id: 'admin',
        name: 'Sofía Valente',
        email: 'sofia.valente@valentes.cl',
        profileType: 'admin',
        assignedAgendas: ['barberia', 'peluqueria', 'terapias'],
        role: 'Directora de Operaciones',
        avatar: 'SV'
      });
      setIsLoggedIn(true);
      setActiveTab('dashboard');
      triggerNotification('Acceso Demo: Iniciando sesión como Administrador.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername('admin');
    setPassword('valentes123');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileEmail || !profileRole) {
      triggerNotification('Por favor, completa los campos obligatorios.');
      return;
    }

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: profileName,
        role: profileRole,
        email: profileEmail,
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
              avatar: updatedUser.avatar
            });
          }
        });
      }
      triggerNotification('Perfil actualizado con éxito.');
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleVsmSave = () => {
    if (vsmPage === 'peluqueria-gallery') {
      updateContent('peluqueria', { galleryItems: vsmForm.peluqueria.galleryItems });
      triggerNotification('¡Galería de Peluquería actualizada con éxito en el sitio público!');
    } else {
      updateContent(vsmPage as any, (vsmForm as any)[vsmPage]);
      triggerNotification(`¡Página de ${vsmPage.toUpperCase()} actualizada con éxito en el sitio público!`);
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

  const getCurrentBookingStatus = (dateStr: string, timeStr: string, baseStatus: string): 'reservado' | 'proximo' | 'En Proceso' | 'Finalizado' | 'bloqueado' => {
    if (baseStatus === 'bloqueado') return 'bloqueado';
    
    try {
      const now = new Date();
      const [hours, minutes] = timeStr.split(':').map(Number);
      const start = new Date(dateStr + 'T00:00:00');
      start.setHours(hours, minutes, 0, 0);

      // A slot is 1 hour
      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      const diffMs = start.getTime() - now.getTime();
      const diffMins = diffMs / (1000 * 60);

      if (now >= end) {
        return 'Finalizado';
      } else if (now >= start) {
        return 'En Proceso';
      } else if (diffMins <= 30) {
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

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', 
    '17:00', '18:00', '19:00', '20:00'
  ];

  const gridRows: { time: string; specialist: typeof specialistsInUnit[0]; booking: any | null }[] = [];

  if (isSingleDayMode) {
    timeSlots.forEach(slot => {
      specialistsForView.forEach(sp => {
        const matchedBooking = bookings.find(b => 
          b.category === activeBusinessTab && 
          b.date === targetDate && 
          b.time.startsWith(slot.split(':')[0]) && 
          b.specialistName.trim() === sp.name.trim()
        );
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
    ? gridRows.filter(r => r.booking && r.booking.status !== 'bloqueado').length
    : listBookings.filter(b => b.status !== 'bloqueado').length;

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

  // Filter Bookings by active business tab
  const filteredBookings = bookings.filter(b => b.category === activeBusinessTab);

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

  // Channels count
  const webBookingsCount = dashboardBookings.filter(b => b.channel === 'Web').length;
  const waBookingsCount = dashboardBookings.filter(b => b.channel === 'WhatsApp').length;
  const walkinBookingsCount = dashboardBookings.filter(b => b.channel === 'Walk-in').length;
  
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
            <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-white">ADMINISTRACIÓN</h1>
            <p className="text-xs text-text-secondary font-light max-w-[280px] mx-auto leading-relaxed">
              Ingresa tus credenciales para acceder a la consola administrativa de los 3 negocios.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Usuario / Correo</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border-b border-white/10 text-white py-3 px-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border-b border-white/10 text-white py-3 px-2 text-sm focus:border-gold/60 focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-4 rounded-full bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-widest text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold/5 flex items-center justify-center space-x-2 shimmer-button"
            >
              <UserCheck size={14} />
              <span>Acceder al Panel</span>
            </button>
          </form>

          <div className="text-[10px] text-text-secondary font-light italic border-t border-white/5 pt-4 space-y-2 text-left">
            <p className="text-center font-semibold text-gold/80">Cuentas Demo de Prueba:</p>
            <div className="grid grid-cols-1 gap-1 font-mono text-[8px] md:text-[9px] bg-black/30 p-2.5 rounded-xl border border-white/5">
              <div>• Admin: <span className="text-white">admin</span> (Acceso Total)</div>
              <div>• Barber: <span className="text-white">carlos.mendoza@valentes.cl</span> (Solo Barbería)</div>
              <div>• Estilista: <span className="text-white">lucia.rivas@valentes.cl</span> (Solo Peluquería)</div>
              <div>• Terapeuta: <span className="text-white">mateo.silva@santuario.cl</span> (Solo Terapias)</div>
              <div>• Mixto (B+P): <span className="text-white">marcos.delgado@valentes.cl</span> (Barbería y Peluquería)</div>
            </div>
            <p className="text-center text-[8px] text-white/35 mt-1">* Contraseña demo: cualquier valor es aceptado.</p>
          </div>
        </motion.div>
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

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col justify-between p-6 md:h-screen md:sticky md:top-0 z-20">
        <div className="space-y-10">
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

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full relative">
        
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
                <div className="flex items-center space-x-3 flex-1 min-w-[220px]">
                  <div className="flex-1 flex flex-col space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-text-secondary">Desde</span>
                    <input
                      type="date"
                      value={dbStartDate}
                      onChange={(e) => setDbStartDate(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                    />
                  </div>
                  <div className="flex-1 flex flex-col space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-text-secondary">Hasta</span>
                    <input
                      type="date"
                      value={dbEndDate}
                      onChange={(e) => setDbEndDate(e.target.value)}
                      className="bg-black border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                    />
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

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Ingresos Totales (CLP)', val: `$${totalRevenue.toLocaleString('es-CL')}`, diff: '+12.4%', icon: DollarSign },
                { title: 'Rituales Agendados', val: totalBookings, diff: '+8.3%', icon: Calendar },
                { title: 'Ticket Promedio', val: `$${averageTicket.toLocaleString('es-CL')}`, diff: '+4.1%', icon: TrendingUp },
                { title: 'Retención de Clientes', val: '76%', diff: '+2.5%', icon: UserCheck }
              ].map((card, i) => {
                const Icon = card.icon;
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
                      <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded">{card.diff}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
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
                        <stop offset="0%" stopColor="#C69B3C" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#C69B3C" stopOpacity="0.0" />
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
                      stroke="#C69B3C"
                      strokeWidth="2.5"
                    />

                    {/* Circles at peaks */}
                    {svgPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle 
                          cx={p.x} 
                          cy={p.y} 
                          r="4" 
                          fill="#C69B3C" 
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
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#C69B3C" strokeWidth="3" 
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
                    <span className="flex items-center gap-1.5 text-white/95"><span className="w-2 h-2 rounded-full bg-[#E2E0D8]" /> Presencial (Walk-in)</span>
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
            {/* 3 Business Sub-tabs */}
            <div className="flex justify-center md:justify-start border-b border-white/5 pb-2">
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
                        setActiveSpecialistFilter('all'); // Reset specialist filter on subtab change
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

            {/* Specialist Round Filters */}
            {(!currentUser || currentUser.profileType === 'admin') && (
              <div className="flex flex-col space-y-3">
                <span className="text-[9px] uppercase tracking-[0.2em] text-text-secondary font-bold text-center md:text-left">
                  Filtrar por Profesional
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pb-2">
                  {/* Filter Option: TODOS */}
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

                  {/* Individual Specialists */}
                  {servicesData[activeBusinessTab]?.specialists.map((sp) => {
                    const isSelected = activeSpecialistFilter === sp.id;
                    const photo = specialistPhotos[sp.id];
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
                    {isSingleDayMode ? (
                      gridRows.map(({ time, specialist, booking }) => {
                        const rowKey = `${targetDate}-${time}-${specialist.id}`;

                        if (booking) {
                          if (booking.status === 'bloqueado') {
                            return (
                              <tr key={rowKey} className="hover:bg-red-500/[0.01] bg-red-950/[0.01] transition-colors group">
                                <td className="py-4.5 px-6 space-y-1">
                                  <div className="flex items-center space-x-1.5 font-bold text-red-400">
                                    <Clock size={11} />
                                    <span>{time} hrs</span>
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
                                      triggerNotification(`Horario ${time} desbloqueado.`);
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
                                  <span>{booking.time} hrs</span>
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
                                  {booking.channel === 'Web' ? <Globe size={11} className="text-blue-400" /> : <Smartphone size={11} className="text-emerald-400" />}
                                  <span>{booking.channel}</span>
                                </span>
                              </td>
                              {(() => {
                                const computedStatus = getCurrentBookingStatus(targetDate, booking.time, booking.status);
                                return (
                                  <td className="py-4.5 px-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${
                                      computedStatus === 'En Proceso'
                                        ? 'bg-emerald-500/5 border-emerald-500/35 text-emerald-400'
                                        : computedStatus === 'proximo'
                                        ? 'bg-amber-500/5 border-amber-500/35 text-amber-400'
                                        : computedStatus === 'reservado'
                                        ? 'bg-blue-500/5 border-blue-500/35 text-blue-400'
                                        : computedStatus === 'Finalizado'
                                        ? 'bg-zinc-700/5 border-zinc-700/35 text-zinc-400'
                                        : 'bg-red-500/5 border-red-500/35 text-red-400'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        computedStatus === 'En Proceso'
                                          ? 'bg-emerald-400'
                                          : computedStatus === 'proximo'
                                          ? 'bg-amber-400'
                                          : computedStatus === 'reservado'
                                          ? 'bg-blue-400'
                                          : computedStatus === 'Finalizado'
                                          ? 'bg-zinc-400'
                                          : 'bg-red-400'
                                      }`} />
                                      <span>{computedStatus}</span>
                                    </span>
                                  </td>
                                );
                              })()}
                              <td className="py-4.5 px-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {(() => {
                                    const computedStatus = getCurrentBookingStatus(targetDate, booking.time, booking.status);
                                    if (computedStatus === 'Finalizado') {
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
                                    }
                                    return null;
                                  })()}
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
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        // RENDER AVAILABLE SLOT
                        return (
                          <tr key={rowKey} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="py-4.5 px-6 space-y-1">
                              <div className="flex items-center space-x-1.5 font-bold text-white/35">
                                <Clock size={11} />
                                <span>{time} hrs</span>
                              </div>
                              <div className="text-[8px] font-mono text-white/20">DISPONIBLE</div>
                            </td>
                            <td className="py-4.5 px-6 text-white/30 italic font-light">
                              Disponible
                            </td>
                            <td className="py-4.5 px-6 text-white/20 font-light italic">
                              Sin agendar
                            </td>
                            <td className="py-4.5 px-6">
                              <div className="flex items-center space-x-2 text-white/40">
                                <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-1 rounded-full font-bold">
                                  {specialist.avatar}
                                </span>
                                <span>{specialist.name}</span>
                              </div>
                            </td>
                            <td className="py-4.5 px-6 text-white/20">-</td>
                            <td className="py-4.5 px-6">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border border-dashed border-white/10 text-white/20">
                                Libre
                              </span>
                            </td>
                            <td className="py-4.5 px-6 text-right">
                              <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setPrefillSpecialistId(specialist.id);
                                    setPrefillDate(targetDate);
                                    setPrefillTime(time);
                                    setIsManualBookingOpen(true);
                                  }}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer flex items-center space-x-1 ${
                                    activeBusinessTab === 'barberia'
                                      ? 'bg-gold/10 hover:bg-gold/20 text-gold border-gold/20'
                                      : activeBusinessTab === 'peluqueria'
                                      ? 'bg-[#CD7F32]/10 hover:bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/20'
                                      : 'bg-[#E2E0D8]/10 hover:bg-[#E2E0D8]/20 text-[#E2E0D8] border-[#E2E0D8]/20'
                                  }`}
                                >
                                  <span>Agendar</span>
                                </button>
                                <button
                                  onClick={() => {
                                    addBooking({
                                      clientName: 'Horario Bloqueado',
                                      clientPhone: '-',
                                      clientEmail: '-',
                                      category: activeBusinessTab,
                                      serviceName: 'Bloqueo Administrativo',
                                      price: '$0',
                                      specialistName: specialist.name,
                                      date: targetDate,
                                      time: time,
                                      channel: 'Walk-in',
                                      status: 'bloqueado'
                                    });
                                    triggerNotification(`Horario ${time} bloqueado con éxito.`);
                                  }}
                                  className="px-2.5 py-1 bg-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-400 text-[10px] font-bold rounded-lg border border-white/5 hover:border-red-500/20 transition-all cursor-pointer flex items-center space-x-1"
                                >
                                  <span>Bloquear</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      listBookings.length === 0 ? (
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
                                  {booking.channel === 'Web' ? <Globe size={11} className="text-blue-400" /> : <Smartphone size={11} className="text-emerald-400" />}
                                  <span>{booking.channel}</span>
                                </span>
                              </td>
                              {(() => {
                                const computedStatus = getCurrentBookingStatus(booking.date, booking.time, booking.status);
                                return (
                                  <td className="py-4.5 px-6">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${
                                      computedStatus === 'En Proceso'
                                        ? 'bg-emerald-500/5 border-emerald-500/35 text-emerald-400'
                                        : computedStatus === 'proximo'
                                        ? 'bg-amber-500/5 border-amber-500/35 text-amber-400'
                                        : computedStatus === 'reservado'
                                        ? 'bg-blue-500/5 border-blue-500/35 text-blue-400'
                                        : computedStatus === 'Finalizado'
                                        ? 'bg-zinc-700/5 border-zinc-700/35 text-zinc-400'
                                        : 'bg-red-500/5 border-red-500/35 text-red-400'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        computedStatus === 'En Proceso'
                                          ? 'bg-emerald-400'
                                          : computedStatus === 'proximo'
                                          ? 'bg-amber-400'
                                          : computedStatus === 'reservado'
                                          ? 'bg-blue-400'
                                          : computedStatus === 'Finalizado'
                                          ? 'bg-zinc-400'
                                          : 'bg-red-400'
                                      }`} />
                                      <span>{computedStatus}</span>
                                    </span>
                                  </td>
                                );
                              })()}
                              <td className="py-4.5 px-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {(() => {
                                    const computedStatus = getCurrentBookingStatus(booking.date, booking.time, booking.status);
                                    if (computedStatus === 'Finalizado') {
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
                                    }
                                    return null;
                                  })()}
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
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )
                    )}
                  </tbody>
                </table>
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

              {/* Table list of clients */}
              <div className="overflow-x-auto">
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
                    {filteredClients.map((client) => {
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
                            <ChevronRight size={14} className="text-text-secondary group-hover:text-gold inline-block transition-transform group-hover:translate-x-0.5" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Client CRM Details & Cross-Selling Panel */}
            <div className="lg:col-span-4 bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6 min-h-[400px]">
              {selectedClient ? (
                <div className="space-y-6">
                  {/* Avatar & Basic Info */}
                  <div className="text-center space-y-3 pb-6 border-b border-white/5">
                    <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-2xl font-bold text-gold mx-auto shadow-[inset_0_2px_12px_rgba(198,155,60,0.15)]">
                      {selectedClient.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="font-serif text-lg text-white font-medium">{selectedClient.name}</h3>
                        {selectedClient.notSoGoodClient && (
                          <span className="text-[8px] uppercase font-bold tracking-widest bg-red-500/10 border border-red-500/35 text-red-400 px-2 py-0.5 rounded-full animate-pulse select-none">
                            No tan buen cliente
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-secondary tracking-wide flex items-center justify-center gap-1.5 flex-wrap">
                        <a 
                          href={`https://wa.me/${selectedClient.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <Smartphone size={10} className="text-emerald-500/80" />
                          <span>{selectedClient.phone}</span>
                        </a>
                        <span className="text-white/20">•</span>
                        {selectedClient.email ? (
                          <a 
                            href={`mailto:${selectedClient.email}`}
                            className="hover:text-gold hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Mail size={10} className="text-gold/80" />
                            <span>{selectedClient.email}</span>
                          </a>
                        ) : (
                          <span className="text-white/40">Sin correo</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Booking Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl text-center space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-text-secondary block">Última Visita</span>
                      <span className="text-xs font-semibold text-white">{formatDateToDMY(selectedClient.lastVisit)}</span>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl text-center space-y-1">
                      <span className="text-[8px] uppercase tracking-widest text-text-secondary block">Inversión Total</span>
                      <span className="text-xs font-semibold text-gold">${selectedClient.totalSpent.toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  {/* Booking History */}
                  {(() => {
                    const clientBookings = bookings.filter(
                      b => b.clientPhone === selectedClient.phone && b.status !== 'bloqueado'
                    ).sort((a, b) => {
                      const dateDiff = b.date.localeCompare(a.date);
                      if (dateDiff !== 0) return dateDiff;
                      return b.time.localeCompare(a.time);
                    });

                    return (
                      <div className="space-y-3 flex flex-col flex-1">
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">Historial de Reservas</span>
                        <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                          {clientBookings.length === 0 ? (
                            <p className="text-xs text-text-secondary italic">Sin reservas registradas.</p>
                          ) : (
                            clientBookings.map((b) => {
                              const status = getCurrentBookingStatus(b.date, b.time, b.status);
                              let statusStyles = '';
                              if (status === 'Finalizado') {
                                statusStyles = 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
                              } else if (status === 'En Proceso') {
                                statusStyles = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
                              } else if (status === 'proximo') {
                                statusStyles = 'bg-blue-500/10 border-blue-500/25 text-blue-400';
                              } else { // reservado
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
                                      {status}
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
                    );
                  })()}

                  {/* Creative Cross-Selling Campaign trigger */}
                  <div className="bg-gold/5 border border-gold/15 rounded-2xl p-4.5 space-y-3.5">
                    <div className="flex items-center space-x-2 text-gold">
                      <Sparkles size={13} className="animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Campaña de Venta Cruzada (CRM)</span>
                    </div>
                    
                    {/* Check which business they haven't visited and offer promotion */}
                    {selectedClient.businesses.length === 3 ? (
                      <p className="text-[11px] text-emerald-400 font-light leading-relaxed">
                        ¡Este cliente es un embajador unificado! Ya ha completado rituales en Barbería, Peluquería y Terapias.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[11px] text-text-secondary leading-relaxed font-light">
                          {selectedClient.name} aún no ha experimentado{' '}
                          <span className="text-white font-semibold">
                            {!selectedClient.businesses.includes('terapias') && 'nuestras Terapias Holísticas'}
                            {selectedClient.businesses.includes('terapias') && !selectedClient.businesses.includes('peluqueria') && 'nuestra Peluquería de Autor'}
                            {selectedClient.businesses.includes('terapias') && selectedClient.businesses.includes('peluqueria') && !selectedClient.businesses.includes('barberia') && 'nuestra Barbería Tradicional'}
                          </span>.
                        </p>
                        <button
                          onClick={() => {
                            let promo = '';
                            if (!selectedClient.businesses.includes('terapias')) promo = 'Masaje con Piedras Calientes Obsidiana con 15% DCTO';
                            else if (!selectedClient.businesses.includes('peluqueria')) promo = 'Corte de diseño capilar con 15% DCTO';
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Visual CMS Sidebar Navigation */}
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

            {/* Right Column: Browser Simulator */}
            <div className="lg:col-span-9 bg-[#0c0c0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              
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
                  {/* View Switcher */}
                  <div className="flex bg-black rounded-lg border border-white/5 p-0.5">
                    <button
                      onClick={() => setVsmViewMode('desktop')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        vsmViewMode === 'desktop' ? 'bg-gold/15 text-gold' : 'text-text-secondary hover:text-white'
                      }`}
                      title="Vista Escritorio"
                    >
                      <Monitor size={12} />
                    </button>
                    <button
                      onClick={() => setVsmViewMode('mobile')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        vsmViewMode === 'mobile' ? 'bg-gold/15 text-gold' : 'text-text-secondary hover:text-white'
                      }`}
                      title="Vista Móvil"
                    >
                      <Smartphone size={12} />
                    </button>
                  </div>

                  {/* Undo / Redo */}
                  <div className="flex items-center space-x-1 text-text-secondary">
                    <button className="p-1 hover:text-white transition-colors cursor-not-allowed opacity-40" disabled title="Deshacer">
                      <Undo2 size={12} />
                    </button>
                    <button className="p-1 hover:text-white transition-colors cursor-not-allowed opacity-40" disabled title="Rehacer">
                      <Redo2 size={12} />
                    </button>
                  </div>

                  {/* Zoom indicator */}
                  <div className="bg-black rounded-lg border border-white/5 px-2.5 py-1 text-[9px] uppercase tracking-widest text-text-secondary font-bold">
                    ZOOM 100%
                  </div>
                </div>
              </div>

              {/* Browser Canvas Content Area */}
              <div className="p-6 bg-black/60 min-h-[500px] flex items-center justify-center overflow-auto max-h-[550px] w-full">
                
                {vsmPage === 'peluqueria-gallery' ? (
                  /* Render the custom Gallery Editor */
                  <div className="w-full max-w-4xl mx-auto space-y-6 text-left py-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <h3 className="font-serif text-lg text-white font-medium">Gestión de Galería de Trabajos</h3>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Agrega, edita o elimina los trabajos destacados en la sección de Peluquería</p>
                      </div>
                      <button
                        onClick={handleGalleryItemAdd}
                        className="py-2.5 px-5 rounded-full bg-gold hover:bg-gold/90 text-black text-[10px] uppercase font-bold tracking-widest flex items-center space-x-1.5 cursor-pointer transition-all shadow-md shadow-gold/10"
                      >
                        <Plus size={12} />
                        <span>Añadir Trabajo</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(vsmForm.peluqueria.galleryItems || []).map((item) => (
                        <div key={item.id} className="bg-[#121212] border border-white/5 rounded-2xl p-5 space-y-4 hover:border-white/10 transition-all relative group flex flex-col justify-between">
                          
                          {/* Card Header: Image Preview & Remove button */}
                          <div className="flex gap-4 items-start">
                            <div className="w-20 h-20 rounded-xl overflow-hidden relative border border-white/10 bg-zinc-900 flex-shrink-0 group">
                              <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => setEditingAsset({ page: 'peluqueria-gallery', key: 'imageUrl', label: 'Imagen de Portafolio', currentValue: item.imageUrl, itemId: item.id })}
                                  className="p-1.5 rounded-full bg-gold text-black hover:scale-110 transition-all cursor-pointer"
                                  title="Cambiar Imagen"
                                >
                                  <Camera size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 space-y-3 text-left">
                              {/* Title */}
                              <div className="space-y-1">
                                <label className="block text-[8px] uppercase tracking-wider text-text-secondary font-bold">Título del Trabajo</label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => handleGalleryItemChange(item.id, 'title', e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold/30"
                                  placeholder="Ej. Balayage Premium Vainilla"
                                />
                                <span className="text-[7px] text-text-secondary">Se usa para inferir el servicio de reserva (ej: "Coloración")</span>
                              </div>

                              {/* Style/Technique */}
                              <div className="space-y-1">
                                <label className="block text-[8px] uppercase tracking-wider text-text-secondary font-bold">Técnica / Detalles</label>
                                <textarea
                                  rows={2}
                                  value={item.technique}
                                  onChange={(e) => handleGalleryItemChange(item.id, 'technique', e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-gold/30 resize-none leading-relaxed"
                                  placeholder="Ej. Balayage tridimensional..."
                                />
                              </div>
                            </div>
                          </div>

                          {/* Card Details: Stylist, Duration, Price */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                            <div className="space-y-1 text-left">
                              <label className="block text-[8px] uppercase tracking-wider text-text-secondary font-bold">Estilista</label>
                              <input
                                type="text"
                                value={item.stylist}
                                onChange={(e) => handleGalleryItemChange(item.id, 'stylist', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 px-2.5 text-[10px] text-white focus:outline-none focus:border-gold/30"
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="block text-[8px] uppercase tracking-wider text-text-secondary font-bold">Duración</label>
                              <input
                                type="text"
                                value={item.duration}
                                onChange={(e) => handleGalleryItemChange(item.id, 'duration', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 px-2.5 text-[10px] text-white focus:outline-none focus:border-gold/30"
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="block text-[8px] uppercase tracking-wider text-text-secondary font-bold">Precio</label>
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) => handleGalleryItemChange(item.id, 'price', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 px-2.5 text-[10px] text-white focus:outline-none focus:border-gold/30 font-mono"
                              />
                            </div>
                          </div>

                          {/* Card Footer: Remove Button */}
                          <div className="flex justify-end pt-2 border-t border-white/5">
                            <button
                              onClick={() => handleGalleryItemDelete(item.id)}
                              className="py-1 px-3.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center space-x-1"
                            >
                              <Trash2 size={10} />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      ))}
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
                            { title: vsmForm.home.panel1Title, subtitle: vsmForm.home.panel1Subtitle, img: vsmForm.home.panel1Image, keyTitle: 'panel1Title', keySubtitle: 'panel1Subtitle', keyImg: 'panel1Image', num: '01', label: 'Barbería' },
                            { title: vsmForm.home.panel2Title, subtitle: vsmForm.home.panel2Subtitle, img: vsmForm.home.panel2Image, keyTitle: 'panel2Title', keySubtitle: 'panel2Subtitle', keyImg: 'panel2Image', num: '02', label: 'Peluquería' },
                            { title: vsmForm.home.panel3Title, subtitle: vsmForm.home.panel3Subtitle, img: vsmForm.home.panel3Image, keyTitle: 'panel3Title', keySubtitle: 'panel3Subtitle', keyImg: 'panel3Image', num: '03', label: 'Terapias' }
                          ].map((panel, idx) => (
                            <div key={idx} className="flex-1 relative overflow-hidden flex flex-col justify-end p-5 border-r border-white/5 last:border-0 group select-none">
                              <img src={panel.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-55 grayscale group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-700 pointer-events-none" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                              
                              {renderEditableImage('home', panel.keyImg, `Imagen ${panel.label}`, panel.img)}
                              
                              <div className="relative z-20 space-y-1">
                                <span className="text-[7px] uppercase tracking-[0.25em] text-gold font-bold block">Ritual {panel.num}</span>
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
                              { title: 'Ritual de Cabello', price: 'Desde $12.000', img: vsmForm.barberia.imageCabello, keyImg: 'imageCabello' },
                              { title: 'Ritual de Barba', price: 'Desde $12.000', img: vsmForm.barberia.imageBarba, keyImg: 'imageBarba' },
                              { title: 'Ritual Completo', price: 'Desde $20.000', img: vsmForm.barberia.imageCompleto, keyImg: 'imageCompleto' }
                            ].map((rit, idx) => (
                              <div key={idx} className="relative h-[130px] rounded-xl overflow-hidden flex flex-col justify-end p-3.5 border border-white/5 group select-none">
                                <img src={rit.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-45 group-hover:opacity-75 transition-all duration-700 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                                
                                {renderEditableImage('barberia', rit.keyImg, rit.title, rit.img)}
                                
                                <div className="relative z-10 flex justify-between items-end">
                                  <div className="text-left">
                                    <span className="text-[6px] text-gold uppercase block">Ritual 0{idx+1}</span>
                                    <span className="font-serif text-[10px] text-white font-medium block leading-none mt-0.5">{rit.title}</span>
                                  </div>
                                  <span className="text-[8px] text-gold font-serif leading-none font-semibold">{rit.price}</span>
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
                              <motion.div 
                                key="cover"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#080808] border border-white/5 rounded-xl p-8 text-center space-y-6 flex flex-col items-center justify-center relative min-h-[280px]"
                              >
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
                              <motion.div 
                                key="grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-5 text-left"
                              >
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                  <div className="space-y-1">
                                    <span className="text-[8px] text-gold uppercase tracking-wider block font-bold">Carta de Estilo</span>
                                    <h3 className="font-serif text-sm text-white font-medium">
                                      {renderEditableText('peluqueria', 'pageTitle', vsmForm.peluqueria.pageTitle, 'text-white font-serif')}
                                    </h3>
                                  </div>
                                  <button 
                                    onClick={() => setVsmPeluEntered(false)}
                                    className="text-[8px] text-white/50 hover:text-gold uppercase tracking-wider border border-white/10 rounded-full px-2.5 py-1 bg-black/40 cursor-pointer"
                                  >
                                    ← Volver a Portada
                                  </button>
                                </div>

                                <p className="text-[10px] text-text-secondary leading-relaxed font-light max-w-xl">
                                  {renderEditableText('peluqueria', 'pageDescription', vsmForm.peluqueria.pageDescription, 'text-text-secondary')}
                                </p>

                                {/* Services Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                  {[
                                    { name: 'Corte de Diseño', price: '$38K', img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=200&q=80' },
                                    { name: 'Color Orgánico', price: '$65K', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80' },
                                    { name: 'Tratamiento Seda', price: '$48K', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=200&q=80' }
                                  ].map((item, idx) => (
                                    <div key={idx} className="relative h-[100px] rounded-xl overflow-hidden flex flex-col justify-end p-3 border border-white/5 group select-none">
                                      <img src={item.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-45 group-hover:opacity-75 transition-all duration-500 pointer-events-none" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                                      <div className="relative z-10 text-left">
                                        <span className="text-[9px] text-white font-medium block leading-tight">{item.name}</span>
                                        <span className="text-[7px] text-gold block mt-0.5 font-semibold leading-none">{item.price}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
                            { title: vsmForm.home.panel1Title, subtitle: vsmForm.home.panel1Subtitle, img: vsmForm.home.panel1Image, keyTitle: 'panel1Title', keySubtitle: 'panel1Subtitle', keyImg: 'panel1Image', num: '01', label: 'Barbería' },
                            { title: vsmForm.home.panel2Title, subtitle: vsmForm.home.panel2Subtitle, img: vsmForm.home.panel2Image, keyTitle: 'panel2Title', keySubtitle: 'panel2Subtitle', keyImg: 'panel2Image', num: '02', label: 'Peluquería' },
                            { title: vsmForm.home.panel3Title, subtitle: vsmForm.home.panel3Subtitle, img: vsmForm.home.panel3Image, keyTitle: 'panel3Title', keySubtitle: 'panel3Subtitle', keyImg: 'panel3Image', num: '03', label: 'Terapias' }
                          ].map((panel, idx) => (
                            <div key={idx} className="relative h-[135px] flex flex-col justify-end p-4 border-b border-white/5 last:border-0 group/panel overflow-hidden">
                              <img src={panel.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-50 grayscale group-hover/panel:opacity-80 transition-all duration-700 pointer-events-none" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
                              
                              {renderEditableImage('home', panel.keyImg, `Imagen ${panel.label}`, panel.img)}
                              
                              <div className="relative z-10 space-y-0.5">
                                <span className="text-[6px] text-gold uppercase tracking-widest font-semibold block">Ritual {panel.num}</span>
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
                              { title: 'Ritual de Cabello', price: '$12K', img: vsmForm.barberia.imageCabello, keyImg: 'imageCabello' },
                              { title: 'Ritual de Barba', price: '$12K', img: vsmForm.barberia.imageBarba, keyImg: 'imageBarba' },
                              { title: 'Ritual Completo', price: '$20K', img: vsmForm.barberia.imageCompleto, keyImg: 'imageCompleto' }
                            ].map((rit, idx) => (
                              <div key={idx} className="relative h-[80px] rounded-xl overflow-hidden flex flex-col justify-end p-2.5 border border-white/5 group select-none">
                                <img src={rit.img} alt="" className="absolute inset-0 object-cover w-full h-full opacity-40 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                                
                                {renderEditableImage('barberia', rit.keyImg, rit.title, rit.img)}
                                
                                <div className="relative z-10 flex justify-between items-end">
                                  <div>
                                    <span className="text-[5px] text-gold uppercase block">Ritual 0{idx+1}</span>
                                    <span className="font-serif text-[8px] text-white font-medium block leading-none">{rit.title}</span>
                                  </div>
                                  <span className="text-[7px] text-gold font-serif leading-none font-semibold">{rit.price}</span>
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
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Nombre Completo</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-gold/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Rol en el Negocio</label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-gold/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Correo de Contacto</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                />
              </div>

              <h4 className="font-serif text-sm text-white tracking-wide border-b border-white/5 pb-1 pt-4">Seguridad de Acceso</h4>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Restablecer Contraseña</label>
                <input
                  type="password"
                  placeholder="Escribe la nueva contraseña para cambiarla"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-gold/30"
                />
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
                  <motion.div
                    layout
                    key={service.id}
                    className={`bg-[#0c0c0c] border rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-300 relative group ${
                      isInactive 
                        ? 'border-white/5 opacity-50 shadow-none' 
                        : `border-white/5 shadow-xl ${activeBorder}`
                    }`}
                  >
                    {/* Top Row: Title, Price & Active status */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-serif text-lg font-medium leading-snug ${isInactive ? 'text-text-secondary line-through' : 'text-white group-hover:text-white transition-colors'}`}>
                          {service.name}
                        </h3>
                        {/* Toggle switch */}
                        <button
                          onClick={() => toggleServiceActive(activeServiceCategory, service.id)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 relative ${
                            isInactive ? 'bg-white/10' :
                            activeServiceCategory === 'barberia' ? 'bg-gold' :
                            activeServiceCategory === 'peluqueria' ? 'bg-[#CD7F32]' : 'bg-white'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-black shadow-md transform duration-300 ${
                              isInactive ? 'translate-x-0' : 'translate-x-4'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Price & Duration tags */}
                      <div className="flex items-center space-x-3 text-xs">
                        <span className={`font-serif font-bold text-base ${isInactive ? 'text-text-secondary' : activeColorClass}`}>
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
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
                              deleteService(activeServiceCategory, service.id);
                              triggerNotification(`Servicio "${service.name}" eliminado.`);
                            }
                          }}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors"
                          />
                        </div>

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
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                              Duración *
                            </label>
                            <select
                              value={serviceFormDuration}
                              onChange={(e) => setServiceFormDuration(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors select-custom cursor-pointer"
                            >
                              {['15 min', '30 min', '45 min', '60 min', '75 min', '90 min', '1 hrs', '1 hrs 15 min', '1 hrs 20 min', '1 hrs 30 min', '1 hrs 45 min', '2 hrs'].map((dur) => (
                                <option key={dur} value={dur} className="bg-[#0c0c0c] text-white">
                                  {dur}
                                </option>
                              ))}
                            </select>
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
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Personal Asignado
                          </label>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {(servicesData[activeServiceCategory]?.specialists || []).map((sp) => {
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
                                    className="rounded border-white/10 text-gold focus:ring-0 focus:ring-offset-0 bg-black"
                                  />
                                </label>
                              );
                            })}
                          </div>
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
            {/* Top Bar with Filter Selector and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c0c] border border-white/5 rounded-3xl p-5 shadow-xl">
              {/* Category Filter Tabs */}
              <div className="flex bg-black rounded-xl border border-white/5 p-1 max-w-lg w-full">
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
                const allSpecialists = Object.keys(servicesData).flatMap(cat => 
                  servicesData[cat].specialists.map(sp => ({ ...sp, primaryCategory: cat }))
                );
                const uniqueSpecialists = Array.from(new Map(allSpecialists.map(sp => [sp.id, sp])).values());
                const filteredStaff = uniqueSpecialists.filter(sp => {
                  if (activeStaffCategoryFilter === 'todos') return true;
                  const agendas = sp.assignedAgendas || [sp.primaryCategory];
                  return agendas.includes(activeStaffCategoryFilter as any);
                });

                return filteredStaff.map((staff) => {
                  const agendas = staff.assignedAgendas || [staff.primaryCategory];
                  return (
                    <motion.div
                      layout
                      key={staff.id}
                      className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-300 hover:border-gold/30 shadow-xl group"
                    >
                      <div className="space-y-4">
                        {/* Header: Name and profileType tag */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-base font-bold text-gold shadow-[inset_0_2px_8px_rgba(198,155,60,0.1)]">
                              {staff.avatar || staff.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="text-left">
                              <h3 className="font-serif text-sm font-medium text-white group-hover:text-gold transition-colors">
                                {staff.name}
                              </h3>
                              <span className="text-[10px] text-text-secondary">{staff.role}</span>
                            </div>
                          </div>

                          {/* Profile type badge */}
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
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
                            <Mail size={10} className="text-text-secondary" />
                            <span>{staff.email}</span>
                          </div>
                          {staff.specialty && (
                            <div className="text-[11px] text-text-secondary mt-1">
                              <span className="font-semibold text-white/50">Especialidad:</span> {staff.specialty}
                            </div>
                          )}
                        </div>

                        {/* Bio preview */}
                        <p className="text-[11px] text-text-secondary leading-relaxed font-light line-clamp-3 text-left">
                          {staff.bio || 'Sin biografía ingresada.'}
                        </p>
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
                            onClick={() => populateStaffForm(staff)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                            title="Editar profesional"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar al profesional "${staff.name}"?`)) {
                                deleteSpecialist(staff.primaryCategory, staff.id);
                                triggerNotification(`Profesional "${staff.name}" eliminado.`);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Eliminar profesional"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
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
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors"
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
                            placeholder="Ej. roberto.sanchez@valentes.cl"
                            value={staffFormEmail}
                            onChange={(e) => setStaffFormEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors font-mono"
                          />
                        </div>

                        {/* Custom Role Title & Specialty */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                              Rol / Cargo *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Barbero Senior"
                              value={staffFormRole}
                              onChange={(e) => setStaffFormRole(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                              Especialidad
                            </label>
                            <input
                              type="text"
                              placeholder="Ej. Degradados, Barbas"
                              value={staffFormSpecialty}
                              onChange={(e) => setStaffFormSpecialty(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Profile Type */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Perfil de Acceso *
                          </label>
                          <select
                            value={staffFormProfileType}
                            onChange={(e) => {
                              const type = e.target.value as any;
                              setStaffFormProfileType(type);
                              // Auto-configure agenda assignments based on role
                              if (type === 'barber') setStaffFormAgendas(['barberia']);
                              else if (type === 'estilista') setStaffFormAgendas(['peluqueria']);
                              else if (type === 'terapeuta') setStaffFormAgendas(['terapias']);
                              else if (type === 'admin') setStaffFormAgendas(['barberia', 'peluqueria', 'terapias']);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors select-custom cursor-pointer"
                          >
                            <option value="barber">Barber (Solo Barbería)</option>
                            <option value="estilista">Estilista (Solo Peluquería)</option>
                            <option value="terapeuta">Terapeuta (Solo Terapias Holísticas)</option>
                            <option value="mixto">Mixto (Múltiples Agendas)</option>
                            <option value="admin">Administrador (Acceso Total)</option>
                          </select>
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
                              const isDisabled = staffFormProfileType !== 'mixto';
                              
                              return (
                                <label
                                  key={ag.id}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                    isDisabled ? 'opacity-40 bg-black/10 border-white/5 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.01]'
                                  } ${isChecked && !isDisabled ? 'bg-white/[0.02] border-white/15' : 'border-white/5'}`}
                                >
                                  <span className="text-xs text-white">{ag.label}</span>
                                  <input
                                    type="checkbox"
                                    disabled={isDisabled}
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setStaffFormAgendas(prev => prev.filter(id => id !== ag.id));
                                      } else {
                                        setStaffFormAgendas(prev => [...prev, ag.id as any]);
                                      }
                                    }}
                                    className="rounded border-white/10 text-gold focus:ring-0 focus:ring-offset-0 bg-black disabled:opacity-50"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Biografía
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Breve reseña del profesional para el cliente..."
                            value={staffFormBio}
                            onChange={(e) => setStaffFormBio(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors resize-none leading-relaxed"
                          />
                        </div>

                        {/* Optional Avatar initials */}
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                            Iniciales Avatar (Opcional)
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="Ej. RS (Dejar en blanco para auto-generar)"
                            value={staffFormAvatar}
                            onChange={(e) => setStaffFormAvatar(e.target.value.toUpperCase())}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-gold/30 transition-colors font-mono"
                          />
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
            {/* Top selector for active professional */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0c0c] border border-white/5 rounded-3xl p-5 shadow-xl">
              <div>
                <label className="block text-[8px] uppercase tracking-[0.25em] text-text-secondary font-bold mb-1.5">
                  Seleccionar Profesional
                </label>
                <div className="relative">
                  <select
                    value={selectedScheduleStaffId}
                    onChange={(e) => setSelectedScheduleStaffId(e.target.value)}
                    className="bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 min-w-[220px] cursor-pointer"
                  >
                    {specialistsList.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name} ({spec.role})
                      </option>
                    ))}
                  </select>
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
                      updateWorkShift(selectedScheduleStaffId, dayNum, { [field]: val });
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
                                type="time"
                                value={shift.startTime}
                                onChange={(e) => handleShiftTimeChange('startTime', e.target.value)}
                                className="bg-[#050505] border border-white/5 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-gold/30 font-mono"
                              />
                              <span className="text-text-secondary text-xs">-</span>
                              <input
                                type="time"
                                value={shift.endTime}
                                onChange={(e) => handleShiftTimeChange('endTime', e.target.value)}
                                className="bg-[#050505] border border-white/5 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-gold/30 font-mono"
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
                                    type="time"
                                    value={shift.breakStartTime}
                                    onChange={(e) => handleShiftTimeChange('breakStartTime', e.target.value)}
                                    className="bg-[#050505] border border-white/5 rounded-lg px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-gold/30 w-[65px] font-mono"
                                  />
                                  <span className="text-text-secondary text-[10px]">-</span>
                                  <input
                                    type="time"
                                    value={shift.breakEndTime}
                                    onChange={(e) => handleShiftTimeChange('breakEndTime', e.target.value)}
                                    className="bg-[#050505] border border-white/5 rounded-lg px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-gold/30 w-[65px] font-mono"
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
            {activeScheduleSubTab === 'bloqueos' && (
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
                      <select
                        value={blockFormReason}
                        onChange={(e) => setBlockFormReason(e.target.value as any)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-gold/30 cursor-pointer"
                      >
                        <option value="Almuerzo">Almuerzo</option>
                        <option value="Permiso Médico">Permiso Médico</option>
                        <option value="Capacitación">Capacitación</option>
                        <option value="Vacaciones">Vacaciones</option>
                        <option value="Asunto Personal">Asunto Personal</option>
                      </select>
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
                        addTimeBlock({
                          specialistId: selectedScheduleStaffId,
                          date: blockFormDate,
                          startTime: blockFormStart,
                          endTime: blockFormEnd,
                          reason: blockFormReason
                        });
                        triggerNotification('Franja horaria bloqueada correctamente.');
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
                              // format YYYY-MM-DD to DD/MM/YYYY
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
                                        deleteTimeBlock(block.id);
                                        triggerNotification('Bloqueo eliminado correctamente.');
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
            )}
          </div>
        )}

      </main>

      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
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
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-gold font-bold">URL del Recurso (Imagen o Video)</label>
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

              {/* Curated Presets */}
              <div className="space-y-1.5">
                <span className="block text-[9px] uppercase tracking-wider text-text-secondary font-bold">Galería de Ajustes Rápidos</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
                    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=300&q=80'
                  ].map((presetUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setEditingAsset(prev => prev ? { ...prev, currentValue: presetUrl } : null);
                      }}
                      className={`relative h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        editingAsset.currentValue === presetUrl ? 'border-gold scale-95 shadow-md shadow-gold/25' : 'border-white/5 hover:border-white/25'
                      }`}
                    >
                      <img src={presetUrl} alt="" className="object-cover w-full h-full pointer-events-none" />
                    </button>
                  ))}
                </div>
              </div>
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

      <ManualBookingModal 
        isOpen={isManualBookingOpen} 
        onClose={() => setIsManualBookingOpen(false)} 
        defaultCategory={activeBusinessTab} 
        defaultSpecialistId={prefillSpecialistId}
        defaultDate={prefillDate}
        defaultTime={prefillTime}
        onBookingCreated={(code) => triggerNotification(`Reserva ${code} creada con éxito.`)}
      />
    </div>
  );
}
