import { Expense } from '../store/useVehicleStore';

export const calculateAverageConsumption = (expenses: Expense[]): number | null => {
  const fuelExpenses = expenses
    .filter(e => e.category === 'fuel' && e.liters && e.mileage)
    .sort((a, b) => (b.mileage || 0) - (a.mileage || 0));

  if (fuelExpenses.length >= 2) {
    const last = fuelExpenses[0];
    const prev = fuelExpenses[1];
    const distance = (last.mileage || 0) - (prev.mileage || 0);
    const ltrs = last.liters || 0;
    
    if (distance > 0 && ltrs > 0) {
      return (ltrs / distance) * 100;
    }
  }
  return null;
};

export const getLastFuelUnitPrice = (expenses: Expense[]): number => {
  const fuelExpenses = expenses
    .filter(e => e.category === 'fuel' && e.amount && e.liters)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (fuelExpenses.length > 0) {
    const last = fuelExpenses[0];
    if (last.amount && last.liters) {
      return last.amount / last.liters;
    }
  }
  
  return 2.0; // Default price
};
