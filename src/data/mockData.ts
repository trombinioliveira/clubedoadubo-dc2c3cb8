import { PRO, Batch, User, ImpactWave, Dream, FifoQueue } from '@/types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Maria Silva',
  email: 'maria@email.com',
  role: 'client',
  referralCode: 'MARIA2024',
  createdAt: new Date('2024-01-15'),
};

export const mockPros: PRO[] = [
  {
    id: 'pro-1',
    code: 'PRO-2024-0001',
    userId: 'user-1',
    batchId: 'batch-1',
    status: 'paid',
    weight: 100,
    createdAt: new Date('2024-01-20'),
    processedAt: new Date('2024-02-15'),
    soldAt: new Date('2024-02-20'),
    paidAt: new Date('2024-02-21'),
    fifoPosition: 1,
  },
  {
    id: 'pro-2',
    code: 'PRO-2024-0002',
    userId: 'user-1',
    batchId: 'batch-1',
    status: 'sold',
    weight: 100,
    createdAt: new Date('2024-01-22'),
    processedAt: new Date('2024-02-15'),
    soldAt: new Date('2024-02-25'),
    fifoPosition: 15,
  },
  {
    id: 'pro-3',
    code: 'PRO-2024-0003',
    userId: 'user-1',
    batchId: 'batch-2',
    status: 'ready',
    weight: 100,
    createdAt: new Date('2024-02-01'),
    processedAt: new Date('2024-03-01'),
    fifoPosition: 142,
  },
  {
    id: 'pro-4',
    code: 'PRO-2024-0004',
    userId: 'user-1',
    batchId: 'batch-2',
    status: 'ready',
    weight: 100,
    createdAt: new Date('2024-02-05'),
    processedAt: new Date('2024-03-01'),
    fifoPosition: 143,
  },
  {
    id: 'pro-5',
    code: 'PRO-2024-0005',
    userId: 'user-1',
    batchId: 'batch-3',
    status: 'processing',
    weight: 100,
    createdAt: new Date('2024-02-20'),
    fifoPosition: 250,
  },
];

export const mockBatches: Batch[] = [
  {
    id: 'batch-1',
    code: 'LOTE-2024-001',
    type: 'composting',
    status: 'sold',
    totalWeight: 50000,
    startDate: new Date('2024-01-15'),
    readyDate: new Date('2024-02-15'),
    prosCount: 500,
  },
  {
    id: 'batch-2',
    code: 'LOTE-2024-002',
    type: 'vermicomposting',
    status: 'partial_sold',
    totalWeight: 30000,
    startDate: new Date('2024-02-01'),
    readyDate: new Date('2024-03-01'),
    prosCount: 300,
  },
  {
    id: 'batch-3',
    code: 'LOTE-2024-003',
    type: 'composting',
    status: 'processing',
    totalWeight: 40000,
    startDate: new Date('2024-02-20'),
    prosCount: 400,
  },
];

export const mockImpactWave: ImpactWave = {
  userId: 'user-1',
  totalReferrals: 12,
  totalPros: 85,
  totalFertilizerKg: 8.5,
  totalCO2Saved: 21.25,
};

export const mockDreams: Dream[] = [
  {
    id: 'dream-1',
    userId: 'user-1',
    title: 'Viagem para a praia',
    targetAmount: 500,
    currentAmount: 120,
    createdAt: new Date('2024-01-20'),
  },
];

export const mockFifoQueue: FifoQueue = {
  position: 142,
  totalInQueue: 1250,
  salesUntilPayment: 3,
  estimatedPaymentDate: new Date('2024-03-15'),
};

export const getStatusLabel = (status: PRO['status']): string => {
  const labels = {
    processing: 'Em processamento',
    ready: 'Virou adubo',
    sold: 'Adubo vendido',
    paid: 'Pagamento liberado',
  };
  return labels[status];
};

export const getStatusColor = (status: PRO['status']): string => {
  const colors = {
    processing: 'status-processing',
    ready: 'status-ready',
    sold: 'status-sold',
    paid: 'status-paid',
  };
  return colors[status];
};
