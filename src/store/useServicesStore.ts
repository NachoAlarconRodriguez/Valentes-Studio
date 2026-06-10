import { create } from 'zustand';
import { servicesData as initialRawServices, ServiceSection, ServiceItem, Specialist as RawSpecialist } from '@/data/mockData';

export interface Specialist extends RawSpecialist {
  email: string;
  profileType: 'barber' | 'estilista' | 'terapeuta' | 'mixto' | 'admin';
  assignedAgendas: ('barberia' | 'peluqueria' | 'terapias')[];
}

interface ServicesStore {
  servicesData: Record<string, Omit<ServiceSection, 'specialists'> & { specialists: Specialist[] }>;
  specialistsList: Specialist[];
  addService: (category: string, service: Omit<ServiceItem, 'id'>) => void;
  updateService: (category: string, serviceId: string, updatedFields: Partial<ServiceItem>) => void;
  deleteService: (category: string, serviceId: string) => void;
  toggleServiceActive: (category: string, serviceId: string) => void;
  
  // Specialists Actions
  addSpecialist: (category: string, specialist: Omit<Specialist, 'id'>) => void;
  updateSpecialist: (category: string, specialistId: string, updatedFields: Partial<Specialist>) => void;
  deleteSpecialist: (category: string, specialistId: string) => void;
}

// Flat list of initial specialists with enriched roles, emails, and agenda access
const getInitialSpecialists = (): Specialist[] => {
  const allRawSpecialists = Object.keys(initialRawServices).flatMap((category) => {
    return initialRawServices[category].specialists.map((sp) => ({
      ...sp,
      initialCategory: category
    }));
  });

  return allRawSpecialists.map((sp): Specialist => {
    let email = `${sp.name.toLowerCase().replace(/\s+/g, '.')}@valentes.cl`;
    let profileType: Specialist['profileType'] = 'barber';
    let assignedAgendas: Specialist['assignedAgendas'] = [sp.initialCategory as any];

    // Assign specific roles and emails based on initial mockup data
    if (sp.id === 'sp1') { // Sofia Valente
      email = 'sofia.valente@valentes.cl';
      profileType = 'admin';
      assignedAgendas = ['barberia', 'peluqueria', 'terapias'];
    } else if (sp.id === 'sp2') { // Lucía Rivas
      email = 'lucia.rivas@valentes.cl';
      profileType = 'estilista';
      assignedAgendas = ['peluqueria'];
    } else if (sp.id === 'sp3') { // Andrés Silva
      email = 'andres.silva@valentes.cl';
      profileType = 'estilista';
      assignedAgendas = ['peluqueria'];
    } else if (sp.id === 'sp4') { // Valentina Paz
      email = 'valentina.paz@valentes.cl';
      profileType = 'estilista';
      assignedAgendas = ['peluqueria'];
    } else if (sp.id === 'sb1') { // Carlos Mendoza
      email = 'carlos.mendoza@valentes.cl';
      profileType = 'barber';
      assignedAgendas = ['barberia'];
    } else if (sp.id === 'sb2') { // Enrique Soto
      email = 'enrique.soto@valentes.cl';
      profileType = 'barber';
      assignedAgendas = ['barberia'];
    } else if (sp.id === 'sb3') { // Marcos Delgado (Mixto barber & estilista)
      email = 'marcos.delgado@valentes.cl';
      profileType = 'mixto';
      assignedAgendas = ['barberia', 'peluqueria'];
    } else if (sp.id === 'sb4') { // Javier Ortega
      email = 'javier.ortega@valentes.cl';
      profileType = 'barber';
      assignedAgendas = ['barberia'];
    } else if (sp.id === 'st1') { // Mateo Silva
      email = 'mateo.silva@santuario.cl';
      profileType = 'terapeuta';
      assignedAgendas = ['terapias'];
    } else if (sp.id === 'st2') { // Elena Rostova (Mixto terapias & peluqueria)
      email = 'elena.rostova@santuario.cl';
      profileType = 'mixto';
      assignedAgendas = ['terapias', 'peluqueria'];
    } else if (sp.id === 'st3') { // Camila Fuentes
      email = 'camila.fuentes@santuario.cl';
      profileType = 'terapeuta';
      assignedAgendas = ['terapias'];
    } else if (sp.id === 'st4') { // Nicolás Prat
      email = 'nicolas.prat@santuario.cl';
      profileType = 'terapeuta';
      assignedAgendas = ['terapias'];
    }

    return {
      id: sp.id,
      name: sp.name,
      role: sp.role,
      specialty: sp.specialty,
      bio: sp.bio,
      avatar: sp.avatar,
      email,
      profileType,
      assignedAgendas
    };
  });
};

// Pure utility to map specialists to their assigned service sections
const getServicesDataWithSpecialists = (
  currentServicesData: any,
  specialists: Specialist[]
) => {
  const result: any = {};
  Object.keys(currentServicesData).forEach((category) => {
    const section = currentServicesData[category];
    result[category] = {
      ...section,
      specialists: specialists.filter((sp) => sp.assignedAgendas.includes(category as any))
    };
  });
  return result;
};

// Initial services data with specialists mapped
const getInitialServicesData = () => {
  const result: any = {};
  const specs = getInitialSpecialists();
  Object.keys(initialRawServices).forEach((category) => {
    const section = initialRawServices[category];
    result[category] = {
      ...section,
      specialists: specs.filter((sp) => sp.assignedAgendas.includes(category as any))
    };
  });
  return result;
};

export const useServicesStore = create<ServicesStore>((set) => ({
  specialistsList: getInitialSpecialists(),
  servicesData: getInitialServicesData(),
  
  addService: (category, service) => set((state) => {
    const section = state.servicesData[category];
    if (!section) return state;
    
    const prefix = category.substring(0, 2);
    const newService: ServiceItem = {
      ...service,
      id: `${prefix}_${Date.now()}`,
      isActive: true
    };
    
    return {
      servicesData: {
        ...state.servicesData,
        [category]: {
          ...section,
          services: [...section.services, newService]
        }
      }
    };
  }),
  
  updateService: (category, serviceId, updatedFields) => set((state) => {
    const section = state.servicesData[category];
    if (!section) return state;
    
    return {
      servicesData: {
        ...state.servicesData,
        [category]: {
          ...section,
          services: section.services.map((s) => 
            s.id === serviceId ? { ...s, ...updatedFields } : s
          )
        }
      }
    };
  }),
  
  deleteService: (category, serviceId) => set((state) => {
    const section = state.servicesData[category];
    if (!section) return state;
    
    return {
      servicesData: {
        ...state.servicesData,
        [category]: {
          ...section,
          services: section.services.filter((s) => s.id !== serviceId)
        }
      }
    };
  }),
  
  toggleServiceActive: (category, serviceId) => set((state) => {
    const section = state.servicesData[category];
    if (!section) return state;
    
    return {
      servicesData: {
        ...state.servicesData,
        [category]: {
          ...section,
          services: section.services.map((s) => 
            s.id === serviceId ? { ...s, isActive: s.isActive === false ? true : false } : s
          )
        }
      }
    };
  }),

  // Specialists/Staff management actions with dynamic distribution
  addSpecialist: (category, specialist) => set((state) => {
    const prefix = category.substring(0, 2);
    const newSpecialist: Specialist = {
      ...specialist,
      id: `${prefix}_sp_${Date.now()}`
    };

    const updatedSpecialists = [...state.specialistsList, newSpecialist];

    return {
      specialistsList: updatedSpecialists,
      servicesData: getServicesDataWithSpecialists(state.servicesData, updatedSpecialists)
    };
  }),

  updateSpecialist: (category, specialistId, updatedFields) => set((state) => {
    const updatedSpecialists = state.specialistsList.map((sp) => 
      sp.id === specialistId ? { ...sp, ...updatedFields } : sp
    );

    return {
      specialistsList: updatedSpecialists,
      servicesData: getServicesDataWithSpecialists(state.servicesData, updatedSpecialists)
    };
  }),

  deleteSpecialist: (category, specialistId) => set((state) => {
    const updatedSpecialists = state.specialistsList.filter((sp) => sp.id !== specialistId);

    return {
      specialistsList: updatedSpecialists,
      servicesData: getServicesDataWithSpecialists(state.servicesData, updatedSpecialists)
    };
  })
}));
