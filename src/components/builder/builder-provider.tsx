'use client';

import { builder } from '@builder.io/react';
import { BuilderComponent } from '@builder.io/react';
import { usePathname } from 'next/navigation';

// Initialize Builder with API key
const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY || '';

if (apiKey && apiKey !== 'your-builder-api-key-here') {
  builder.init(apiKey);
}

interface BuilderProviderProps {
  children: React.ReactNode;
}

export function BuilderProvider({ children }: BuilderProviderProps) {
  return (
    <>
      {children}
    </>
  );
}

// Components that can be edited in Builder
export { BuilderComponent };
export { builder };