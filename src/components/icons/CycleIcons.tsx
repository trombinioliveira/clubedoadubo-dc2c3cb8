import React from 'react';

export const LeafIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C12 21 4 15 4 9C4 5.5 7.5 2 12 2C16.5 2 20 5.5 20 9C20 15 12 21 12 21Z" fill="currentColor" opacity="0.2"/>
    <path d="M12 21C12 21 4 15 4 9C4 5.5 7.5 2 12 2C16.5 2 20 5.5 20 9C20 15 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 13V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 9C10 11 12 11 12 11C12 11 14 11 16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CompostIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.2"/>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 16C8 14 10 13 12 13C14 13 16 14 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const FertilizerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19L8 10H16L20 19H4Z" fill="currentColor" opacity="0.2"/>
    <path d="M4 19L8 10H16L20 19H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 10V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 7L12 5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const MoneyIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 9C15 7.5 13.5 7 12 7C10.5 7 9 7.5 9 9C9 10.5 10.5 11 12 11C13.5 11 15 11.5 15 13C15 14.5 13.5 15 12 15C10.5 15 9 14.5 9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const RecycleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L16 8H13V12H11V8H8L12 3Z" fill="currentColor"/>
    <path d="M5.5 14L3 18.5L6 20.5L7.5 18H12V16H6.5L5.5 14Z" fill="currentColor"/>
    <path d="M18.5 14L21 18.5L18 20.5L16.5 18H12V16H17.5L18.5 14Z" fill="currentColor"/>
  </svg>
);

export const WaveIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C2 12 4 8 8 8C12 8 12 16 16 16C20 16 22 12 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M2 6C2 6 4 2 8 2C12 2 12 10 16 10C20 10 22 6 22 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <path d="M2 18C2 18 4 14 8 14C12 14 12 22 16 22C20 22 22 18 22 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

export const QueueIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="4" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="3" y="10" width="18" height="4" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor"/>
  </svg>
);
