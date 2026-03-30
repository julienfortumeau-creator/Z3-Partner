import { create } from 'zustand';

export interface Expense {
  id: string;
  category: 'maintenance' | 'fuel' | 'insurance' | 'other';
  amount: number;
  date: string;
  label: string;
}

export interface VehicleProfile {
  model: string;
  year: string;
  mileage: number;
  purchasePrice: number;
  acquisitionDate: string;
  isCoupé: boolean;
}

interface VehicleState {
  profile: VehicleProfile | null;
  expenses: Expense[];
  setProfile: (profile: VehicleProfile) => void;
  updateMileage: (newMileage: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  getTCO: () => number;
}

// Initial demo data
const demoProfile: VehicleProfile = {
  model: '3.0i',
  year: '2001',
  mileage: 124500,
  purchasePrice: 22000,
  acquisitionDate: '2023-01-15',
  isCoupé: true,
};

const demoExpenses: Expense[] = [
  { id: '1', category: 'maintenance', amount: 850, date: '2023-05-10', label: 'Oil Service + Filters' },
  { id: '2', category: 'fuel', amount: 85, date: '2024-03-20', label: 'Plein SP98' },
  { id: '3', category: 'insurance', amount: 600, date: '2024-01-01', label: 'Assurance Annuelle' },
  { id: '4', category: 'other', amount: 300, date: '2023-08-15', label: 'Polish & Ceramic' },
];

export const useVehicleStore = create<VehicleState>((set, get) => ({
  profile: demoProfile,
  expenses: demoExpenses,

  setProfile: (profile) => set({ profile }),

  updateMileage: (newMileage) => set((state) => ({
    profile: state.profile ? { ...state.profile, mileage: newMileage } : null
  })),

  addExpense: (expense) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    set((state) => ({ expenses: [newExpense, ...state.expenses] }));
  },

  getTCO: () => {
    const { profile, expenses } = get();
    const purchase = profile?.purchasePrice || 0;
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    return purchase + totalExpenses;
  },
}));
