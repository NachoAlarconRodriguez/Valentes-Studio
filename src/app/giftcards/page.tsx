import { Metadata } from 'next';
import GiftcardsLayout from './GiftcardsLayout';

export const metadata: Metadata = {
  title: 'Comprar Tarjeta de Regalo | Santuario de Bienestar',
  description: 'Regala una experiencia de cuidado y relajación profunda. Adquiere nuestras Gift Cards digitales exclusivas válidas para Barbería, Peluquería o Terapias Holísticas.',
};

export default function GiftcardsPage() {
  return <GiftcardsLayout />;
}
