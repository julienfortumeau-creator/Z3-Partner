/**
 * Ce fichier est maintenant un wrapper léger autour de vehicleConfig.
 * Toute la configuration est dans src/config/vehicleConfig.ts
 */
import {
  EngineType,
  MaintenanceItemConfig,
  MAINTENANCE_ITEMS,
  MAINTENANCE_SCHEMA,
  detectEngineType,
} from '../config/vehicleConfig';

export type { EngineType };

export interface DetailedMaintenanceItem extends MaintenanceItemConfig {
  intervalKm?: number;
  intervalYears?: number;
  detail: string;
  estimatedCost: string;
}

export const getEngineType = detectEngineType;

export const MAINTENANCE_BASE = MAINTENANCE_ITEMS;

export const getMaintenanceSchema = (model: string): DetailedMaintenanceItem[] => {
  const engineType = detectEngineType(model);
  const data = MAINTENANCE_SCHEMA[engineType];
  
  return MAINTENANCE_ITEMS.map(base => ({
    ...base,
    intervalKm: data[base.id]?.km,
    intervalYears: data[base.id]?.years,
    detail: data[base.id]?.detail || '',
    estimatedCost: data[base.id]?.cost || 'Sur devis',
  }));
};
