'use client';

import { useState, useEffect } from 'react';

export type BrandDomain = 'valentes' | 'almabela' | 'jefferson';

export function useBrandDomain() {
  const [brand, setBrand] = useState<BrandDomain>('jefferson');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const paramBrand = searchParams.get('brand') || searchParams.get('domain');

    if (paramBrand === 'valentes' || hostname.includes('valentes')) {
      setBrand('valentes');
    } else if (paramBrand === 'almabela' || hostname.includes('almabela')) {
      setBrand('almabela');
    } else {
      setBrand('jefferson');
    }
  }, []);

  return {
    brand,
    isValentes: brand === 'valentes',
    isAlmaBela: brand === 'almabela',
    isJefferson: brand === 'jefferson',
    isMultiBrand: brand === 'jefferson',
  };
}

export default useBrandDomain;
