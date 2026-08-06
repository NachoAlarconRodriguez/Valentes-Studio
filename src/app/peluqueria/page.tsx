import { Metadata } from 'next';
import PeluqueriaLayout from './PeluqueriaLayout';

export const metadata: Metadata = {
  title: 'Peluquería Alma Bela',
  description: 'Coloración botánica orgánica 100% libre de amoníaco, cortes de autor personalizados y tratamientos moleculares de hidratación capilar de lujo.',
};

export default function PeluqueriaPage() {
  return <PeluqueriaLayout />;
}

