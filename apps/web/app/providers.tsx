'use client';

import React from 'react';
import { QueryProvider } from '../providers/query-provider';
import { ThemeSync } from '../providers/theme-sync';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeSync />
      {children}
    </QueryProvider>
  );
}
