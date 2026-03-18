/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type augmentations to resolve version drift between
 * installed packages and their type declarations.
 *
 * This file ensures the project compiles cleanly without
 * altering any runtime behaviour.
 */

// ── react-helmet-async ──────────────────────────────────
declare module 'react-helmet-async' {
  import * as React from 'react';

  export interface HelmetProps {
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const Helmet: React.FC<HelmetProps>;

  export interface HelmetProviderProps {
    children?: React.ReactNode;
    context?: any;
  }

  export const HelmetProvider: React.FC<HelmetProviderProps>;
}

// ── @tanstack/react-query ───────────────────────────────
// Re-export QueryClient so TS finds it even if the
// installed type bundle doesn't surface it directly.
declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(config?: any);
    invalidateQueries(filters?: any): Promise<void>;
    [key: string]: any;
  }
  export function QueryClientProvider(props: {
    client: QueryClient;
    children?: React.ReactNode;
  }): JSX.Element;

  // keep everything else the module already exports
  export * from '@tanstack/react-query';
}

// ── @supabase/supabase-js ───────────────────────────────
declare module '@supabase/supabase-js' {
  export interface User {
    id: string;
    email?: string;
    app_metadata: Record<string, any>;
    user_metadata: Record<string, any>;
    aud: string;
    created_at: string;
    [key: string]: any;
  }

  export interface Session {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: User;
    [key: string]: any;
  }

  // keep everything else the module already exports
  export * from '@supabase/supabase-js';
}

// ── input-otp ───────────────────────────────────────────
declare module 'input-otp' {
  import * as React from 'react';

  export interface OTPInputProps {
    maxLength?: number;
    containerClassName?: string;
    className?: string;
    render?: (props: any) => React.ReactNode;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const OTPInput: React.ForwardRefExoticComponent<OTPInputProps & React.RefAttributes<HTMLInputElement>>;

  export interface SlotInfo {
    char: string | null;
    hasFakeCaret: boolean;
    isActive: boolean;
  }

  export interface OTPInputContextValue {
    slots: SlotInfo[];
    [key: string]: any;
  }

  export const OTPInputContext: React.Context<OTPInputContextValue>;
}
