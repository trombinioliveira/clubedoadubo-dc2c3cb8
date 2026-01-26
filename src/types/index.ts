export type ProStatus = 'processing' | 'ready' | 'sold' | 'paid';

export interface PRO {
  id: string;
  code: string;
  userId: string;
  batchId: string;
  status: ProStatus;
  weight: number; // in grams
  createdAt: Date;
  processedAt?: Date;
  soldAt?: Date;
  paidAt?: Date;
  fifoPosition: number;
}

export interface Batch {
  id: string;
  code: string;
  type: 'composting' | 'vermicomposting';
  status: 'processing' | 'ready' | 'partial_sold' | 'sold';
  totalWeight: number;
  startDate: Date;
  readyDate?: Date;
  prosCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'client';
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
}

export interface ImpactWave {
  userId: string;
  totalReferrals: number;
  totalPros: number;
  totalFertilizerKg: number;
  totalCO2Saved: number;
}

export interface Dream {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: Date;
}

export interface FifoQueue {
  position: number;
  totalInQueue: number;
  estimatedPaymentDate?: Date;
  salesUntilPayment: number;
}
