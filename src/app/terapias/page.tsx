import { Metadata } from 'next';
import ServicePageLayout from '@/components/ServicePageLayout';

export const metadata: Metadata = {
  title: 'Terapias Holísticas | Valentes Santuario de Bienestar',
  description: 'Rituales de piedras calientes, baños de sonido con cuencos tibetanos, reiki y aromaterapia clínica para equilibrar cuerpo, mente y espíritu.',
};

export default function TerapiasPage() {
  return <ServicePageLayout category="terapias" />;
}
