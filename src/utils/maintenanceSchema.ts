/**
 * Ce fichier est maintenant un wrapper léger autour de vehicleConfig.
 * Toute la configuration est dans src/config/vehicles/
 */
import {
  EngineType,
  MaintenanceItemConfig,
  MAINTENANCE_ITEMS,
  MAINTENANCE_SCHEMA,
  detectEngineType,
} from '../config/vehicles';

export type { EngineType };

export interface DetailedMaintenanceItem extends MaintenanceItemConfig {
  intervalKm?: number;
  intervalYears?: number;
  detail: string;
  estimatedCost: string;
}

export const getEngineType = detectEngineType;

export const MAINTENANCE_BASE = MAINTENANCE_ITEMS;

export const getMaintenanceSchema = (model: string, customIntervals?: Record<string, { km?: number; years?: number }>): DetailedMaintenanceItem[] => {
  const engineType = detectEngineType(model);
  const data = MAINTENANCE_SCHEMA[engineType];
  
  return MAINTENANCE_ITEMS.map(base => {
    const custom = customIntervals?.[base.id];
    return {
      ...base,
      intervalKm: custom?.km ?? data[base.id]?.km,
      intervalYears: custom?.years ?? data[base.id]?.years,
      detail: data[base.id]?.detail || '',
      estimatedCost: data[base.id]?.cost || 'Sur devis',
    };
  });
};
