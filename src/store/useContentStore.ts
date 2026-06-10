import { create } from 'zustand';

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
    pageDescription: 'Un espacio de empatía, técnica y cuidado donde transformamos vidas. Entendemos que la belleza es mucho más que apariencia: es identidad, expresión, confianza y, sobre todo, tu autoestima.'
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
