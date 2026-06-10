import { create } from 'zustand';

export interface GalleryItem {
  id: string;
  title: string;
  technique: string;
  stylist: string;
  duration: string;
  price: string;
  imageUrl: string;
}

export interface PageContent {
  home: {
    panel1Title: string;
    panel1Subtitle: string;
    panel1Image: string;
    panel2Title: string;
    panel2Subtitle: string;
    panel2Image: string;
    panel3Title: string;
    panel3Subtitle: string;
    panel3Image: string;
  };
  barberia: {
    heroTitle: string;
    heroSubtitle: string;
    discoverBtn: string;
    imageCabello: string;
    imageBarba: string;
    imageCompleto: string;
    pageTitle: string;
    pageDescription: string;
  };
  peluqueria: {
    overlayLine1: string;
    overlayLine2: string;
    overlaySubtitle: string;
    pageTitle: string;
    pageDescription: string;
    galleryItems: GalleryItem[];
  };
  terapias: {
    pageTitle: string;
    pageDescription: string;
    videoUrl: string;
  };
}

interface ContentStore {
  content: PageContent;
  updateContent: (section: keyof PageContent, fields: Partial<PageContent[keyof PageContent]>) => void;
  resetToDefault: () => void;
}

const defaultContent: PageContent = {
  home: {
    panel1Title: 'Barbería Tradicional',
    panel1Subtitle: 'Cortes de autor, afeitados con navaja libre y rituales de toallas calientes.',
    panel1Image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    panel2Title: 'Peluquería de Autor',
    panel2Subtitle: 'Coloración botánica orgánica, cortes de diseño y nutrición molecular profunda.',
    panel2Image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    panel3Title: 'Terapias Holísticas',
    panel3Subtitle: 'Masajes con piedras calientes volcánicas, reiki y sonoterapia vibracional.',
    panel3Image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  },
  barberia: {
    heroTitle: 'VALENTES',
    heroSubtitle: 'Barbería',
    discoverBtn: 'Descubrir Rituales',
    imageCabello: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
    imageBarba: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    imageCompleto: 'https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&w=800&q=80',
    pageTitle: 'Barbería Tradicional',
    pageDescription: 'Cortes de autor, afeitados con navaja libre y rituales de toallas calientes diseñados para el caballero contemporáneo en un ambiente de calma absoluta.'
  },
  peluqueria: {
    overlayLine1: 'ALMA',
    overlayLine2: 'BELA',
    overlaySubtitle: 'STUDIO',
    pageTitle: 'Peluquería de Autor',
    pageDescription: 'Un espacio de empatía, técnica y cuidado donde transformamos vidas. Entendemos que la belleza es mucho más que apariencia: es identidad, expresión, confianza y, sobre todo, tu autoestima.',
    galleryItems: [
      {
        id: 'g1',
        title: 'Balayage Premium Vainilla',
        technique: 'Balayage tridimensional con difuminado de raíz y matices dorados fríos.',
        stylist: 'Sofia Valente',
        duration: '3.5 hrs',
        price: '$65.000',
        imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g2',
        title: 'Ondas Editorial Surf',
        technique: 'Peinado texturizado con ondas desestructuradas y protector térmico orgánico.',
        stylist: 'Valentina Paz',
        duration: '45 min',
        price: '$30.000',
        imageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g3',
        title: 'Corte Shag Moderno',
        technique: 'Corte texturizado en capas desconectadas con flequillo y volumen natural.',
        stylist: 'Andrés Silva',
        duration: '60 min',
        price: '$38.000',
        imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g4',
        title: 'Tratamiento Seda Celular',
        technique: 'Nutrición molecular profunda con ácido hialurónico y cauterización fría.',
        stylist: 'Lucía Rivas',
        duration: '60 min',
        price: '$48.000',
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g5',
        title: 'Corte Bob Simétrico',
        technique: 'Corte seco de precisión milimétrica adaptado a la forma del mentón.',
        stylist: 'Andrés Silva',
        duration: '60 min',
        price: '$38.000',
        imageUrl: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'g6',
        title: 'Iluminación Babylights Platinada',
        technique: 'Micro-reflejos de alta costura para un efecto aclarado natural ultra fino.',
        stylist: 'Valentina Paz',
        duration: '3 hrs',
        price: '$65.000',
        imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  terapias: {
    pageTitle: 'Terapias Holísticas',
    pageDescription: 'Espacio consagrado a la reconexión cuerpo-mente a través de terapias manuales de relajación profunda, masajes geotermales y sanación energética.',
    videoUrl: '/videos/massage.mp4'
  }
};

export const useContentStore = create<ContentStore>((set) => ({
  content: defaultContent,
  updateContent: (section, fields) => set((state) => ({
    content: {
      ...state.content,
      [section]: {
        ...state.content[section],
        ...fields
      }
    }
  })),
  resetToDefault: () => set({ content: defaultContent })
}));
export default useContentStore;
