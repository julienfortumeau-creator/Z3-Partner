import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
  id: string;
  category: 'maintenance' | 'fuel' | 'aesthetic' | 'other';
  amount: number;
  date: string;
  label: string;
  liters?: number;
  mileage?: number;
}

export interface VehicleProfile {
  model: string;
  year: string;
  mileage: number;
  purchasePrice: number;
  acquisitionDate: string;
  isCoupé: boolean;
  insuranceCost: number;
  initialWearKm: Record<string, number>; // Usure enregistrée à l'onboarding
}

export interface Trip {
  id: string;
  date: string;
  distance: number;
  mileageAtEnd: number;
  label: string;
}

interface VehicleState {
  profile: VehicleProfile | null;
  expenses: Expense[];
  trips: Trip[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setProfile: (profile: VehicleProfile) => void;
  updateMileage: (newMileage: number) => void;
  updateInitialWear: (key: string, km: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  deleteTrip: (id: string) => void;
  getTCO: () => number;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      profile: null,
      expenses: [],
      trips: [],
      _hasHydrated: false,
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setProfile: (profile) => set({ profile }),

      updateMileage: (newMileage) => set((state) => ({
        profile: state.profile ? { ...state.profile, mileage: newMileage } : null
      })),

      updateInitialWear: (key, km) => set((state) => ({
        profile: state.profile 
          ? { ...state.profile, initialWearKm: { ...state.profile.initialWearKm, [key]: km } } 
          : null
      })),

      addExpense: (expense) => {
        const newExpense = { ...expense, id: Date.now().toString() };
        set((state) => ({ 
          expenses: [newExpense, ...state.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }));
      },

      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      })),

      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(exp => exp.id !== id)
      })),

      addTrip: (trip) => {
        const newTrip = { ...trip, id: Date.now().toString() };
        set((state) => ({
          trips: [newTrip, ...state.trips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          profile: state.profile ? { ...state.profile, mileage: trip.mileageAtEnd } : null
        }));
      },

      deleteTrip: (id) => set((state) => ({
        trips: state.trips.filter(t => t.id !== id)
      })),

      getTCO: () => {
        const { profile, expenses } = get();
        const purchase = profile?.purchasePrice || 0;
        const insuranceAcrossYears = profile?.insuranceCost || 0;
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        return purchase + totalExpenses + insuranceAcrossYears;
      },
    }),
    {
      name: 'vehicle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
