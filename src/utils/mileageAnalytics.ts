import { Trip, VehicleProfile, Expense } from '../store/useVehicleStore';
import { getMaintenanceSchema } from './maintenanceSchema';
import { calculateAverageConsumption, getLastFuelUnitPrice } from './fuelAnalytics';

export interface MileageStats {
  dailyAverage: number;
  periodTotal: number;
  daysInPeriod: number;
}

/**
 * Calcule le kilométrage journalier moyen selon les règles :
 * 1. < 30 jours : 15 km/j
 * 2. 30-365 jours : Moyenne réelle totale
 * 3. > 365 jours : Moyenne réelle sur les 12 derniers mois
 */
export const calculateGlobalDailyAverage = (trips: Trip[], profile: VehicleProfile): number => {
  if (!profile.acquisitionDate) return 15;

  const acqDate = new Date(profile.acquisitionDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - acqDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  if (diffDays < 30) {
    return 15;
  }

  if (diffDays < 365) {
    const totalKm = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const avg = totalKm / diffDays;
    return avg > 0 ? avg : 15; // Fallback si pas de trajets
  }

  // Rolling 12 months
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  const recentTrips = trips.filter(t => new Date(t.date) >= oneYearAgo);
  const totalKmRecent = recentTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
  
  const avg = totalKmRecent / 365;
  return avg > 0 ? avg : 15;
};

/**
 * Calcule les stats pour une période donnée (mois, année, ou tout)
 */
export const calculatePeriodStats = (
  trips: Trip[], 
  filter: 'month' | 'year' | 'all',
  acquisitionDate?: string
): MileageStats => {
  const now = new Date();
  let startDate: Date;

  if (filter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = acquisitionDate ? new Date(acquisitionDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const periodTrips = trips.filter(t => new Date(t.date) >= startDate);
  const periodTotal = periodTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
  
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const daysInPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  return {
    dailyAverage: periodTotal / daysInPeriod,
    daysInPeriod
  };
};

/**
 * Extrait le coût moyen depuis un string type "100 – 200 €"
 */
const parseAverageCost = (costStr: string): number => {
  const matches = costStr.match(/\d+/g);
  if (!matches) return 0;
  const numbers = matches.map(Number);
  if (numbers.length === 1) return numbers[0];
  if (numbers.length >= 2) return (numbers[0] + numbers[1]) / 2;
  return 0;
};

export interface BudgetForecast {
  maintenance: number;
  fuel: number;
  insurance: number;
  total: number;
}

export const calculateBudgetForecast = (
  trips: Trip[], 
  profile: VehicleProfile,
  expenses: Expense[],
  months: number = 12
): BudgetForecast => {
  const dailyAvg = calculateGlobalDailyAverage(trips, profile);
  const forecastDays = months * 30.42; // Moyenne précise
  const forecastDistance = dailyAvg * forecastDays;
  
  // 1. Maintenance estimation
  const currentMileage = profile.mileage;
  const schema = getMaintenanceSchema(profile.model);
  let maintenanceCost = 0;

  schema.forEach(item => {
    if (!item.intervalKm) return;
    const initialWear = profile.initialWearKm?.[item.id] || 0;
    const effectiveMileage = currentMileage + initialWear;
    const progress = effectiveMileage % item.intervalKm;
    const remainingKm = item.intervalKm - progress;

    // Si l'entretien tombe dans la période choisie
    if (remainingKm <= forecastDistance) {
      maintenanceCost += parseAverageCost(item.estimatedCost);
    }
  });

  // 2. Fuel estimation
  const consumption = calculateAverageConsumption(expenses) || 10; 
  const fuelPrice = getLastFuelUnitPrice(expenses);
  const fuelCost = (forecastDistance / 100) * consumption * fuelPrice;

  // 3. Insurance (prorata)
  const insuranceCost = ((profile.insuranceCost || 0) / 12) * months;

  return {
    maintenance: Math.round(maintenanceCost),
    fuel: Math.round(fuelCost),
    insurance: Math.round(insuranceCost),
    total: Math.round(maintenanceCost + fuelCost + insuranceCost)
  };
};
