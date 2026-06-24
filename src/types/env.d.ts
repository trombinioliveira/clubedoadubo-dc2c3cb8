/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type augmentations to resolve version drift between
 * installed packages and their type declarations.
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

// ── Vite env vars ───────────────────────────────────────
interface ImportMetaEnv {
  /** ID do Google Tag Manager, formato GTM-XXXXXXX. Vazio = GTM desativado. */
  readonly VITE_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
