'use client';

import { BuilderComponent } from '@builder.io/react';

interface BuilderContentProps {
  model: string;
  children?: React.ReactNode;
  className?: string;
  options?: Record<string, unknown>;
}

/**
 * Wrapper component for Builder.io content
 * Usage: <BuilderContent model="site-header" />
 */
export function BuilderContent({ model, children, options }: BuilderContentProps) {
  const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY || '';

  // If no API key or placeholder, render children or nothing
  if (!apiKey || apiKey === 'your-builder-api-key-here') {
    return <>{children || null}</>;
  }

  return (
    <BuilderComponent
      model={model}
      options={options}
    >
      {children}
    </BuilderComponent>
  );
}