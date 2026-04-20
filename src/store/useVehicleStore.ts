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
  notes?: string;
  garageName?: string;
}

export interface GarageInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface VehicleProfile {
  model: string;
  year: string;
  acquisitionMileage: number;
  mileage: number; // Kilométrage actuel (calculé : acquisition + somme(trajets))
  purchasePrice: number;
  acquisitionDate: string;
  isCoupé: boolean;
  insuranceCost: number;
  initialWearKm: Record<string, number>;
  profileLastSavedMileage?: number;
  garage?: GarageInfo;
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
  gpsEnabled: boolean;
  notificationsEnabled: boolean;
  setHasHydrated: (state: boolean) => void;
  setGPSEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setProfile: (profile: VehicleProfile) => void;
  updateMileage: (newMileage: number) => void;
  updateInitialWear: (key: string, km: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setGarage: (garage: GarageInfo) => void;
  restoreState: (data: any) => void;
  getTCO: () => number;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      profile: null,
      expenses: [],
      trips: [],
      _hasHydrated: false,
      gpsEnabled: true,
      notificationsEnabled: true,
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      setGPSEnabled: (enabled) => set({ gpsEnabled: enabled }),
      
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

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
        set((state) => {
          // 1. Ajouter le nouveau trajet et trier chronologiquement (plus vieux au plus récent pour le calcul)
          const allTrips = [...state.trips, newTrip].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // 2. Recalculer le kilométrage d'arrivée pour CHAQUE trajet de l'histoire
          let runningMileage = state.profile?.acquisitionMileage || 0;
          const recalculatedTrips = allTrips.map(t => {
            runningMileage += t.distance;
            return { ...t, mileageAtEnd: runningMileage };
          });

          // 3. Trier pour l'affichage (plus récent en premier)
          const sortedForDisplay = [...recalculatedTrips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          return {
            trips: sortedForDisplay,
            profile: state.profile ? { ...state.profile, mileage: runningMileage } : null
          };
        });
      },

      updateTrip: (id, updates) => set((state) => {
        const allTrips = state.trips.map(t => t.id === id ? { ...t, ...updates } : t)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let runningMileage = state.profile?.acquisitionMileage || 0;
        const recalculatedTrips = allTrips.map(t => {
          runningMileage += t.distance;
          return { ...t, mileageAtEnd: runningMileage };
        });

        const sortedForDisplay = [...recalculatedTrips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          trips: sortedForDisplay,
          profile: state.profile ? { ...state.profile, mileage: runningMileage } : null
        };
      }),

      deleteTrip: (id) => set((state) => {
        const allTrips = state.trips.filter(t => t.id !== id)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let runningMileage = state.profile?.acquisitionMileage || 0;
        const recalculatedTrips = allTrips.map(t => {
          runningMileage += t.distance;
          return { ...t, mileageAtEnd: runningMileage };
        });

        const sortedForDisplay = [...recalculatedTrips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          trips: sortedForDisplay,
          profile: state.profile ? { ...state.profile, mileage: runningMileage } : null
        };
      }),
      
      setGarage: (garage) => set((state) => ({
        profile: state.profile ? { ...state.profile, garage } : null
      })),

      restoreState: (data) => set((state) => ({
        profile: data.profile || state.profile,
        expenses: data.expenses || state.expenses,
        trips: data.trips || state.trips,
        gpsEnabled: data.gpsEnabled ?? state.gpsEnabled,
        notificationsEnabled: data.notificationsEnabled ?? state.notificationsEnabled,
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
