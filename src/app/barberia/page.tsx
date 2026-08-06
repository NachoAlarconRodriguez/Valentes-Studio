import { Metadata } from 'next';
import BarberiaLayout from './BarberiaLayout';

export const metadata: Metadata = {
  title: 'Barbería Valentes',
  description: 'Cortes de autor, afeitados con navaja clásica y rituales de toallas calientes en nuestra barbería de lujo. Un espacio dedicado al cuidado y estilo del caballero moderno.',
};

export default function BarberiaPage() {
  return <BarberiaLayout />;
}
