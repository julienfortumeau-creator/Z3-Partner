import { z3Config } from './z3';
import { mx5Config } from './mx5';
import { 
  EngineType as EngineTypeBase, 
  MaintenanceItemConfig as MaintenanceItemConfigBase, 
  MaintenanceInterval as MaintenanceIntervalBase, 
  HealthStepConfig as HealthStepConfigBase 
} from './types';

/**
 * LOGIQUE DE SÉLECTION DU VÉHICULE
 * Pour le moment, on peut basculer manuellement ici.
 * À terme, cela pourra être piloté par une variable d'environnement (EXPO_PUBLIC_VEHICLE_TYPE)
 * ou par une sélection dans l'application.
 */
const VEHICLE_VARIANT: 'z3' | 'mx5' = 'z3'; // <--- Changez ici pour tester la MX-5

export const vehicleConfig = VEHICLE_VARIANT === 'mx5' ? mx5Config : z3Config;

// Ré-export des types pour un accès centralisé
export type EngineType = EngineTypeBase;
export type MaintenanceItemConfig = MaintenanceItemConfigBase;
export type MaintenanceInterval = MaintenanceIntervalBase;
export type HealthStepConfig = HealthStepConfigBase;

// Exports nommés pour compatibilité descendante et facilité d'usage dans le Core
export const {
  APP_NAME,
  APP_SHORT_NAME,
  APP_VERSION,
  APP_TAGLINE,
  BACKUP_FILENAME,
  LOCATION_TASK_NAME,
  VEHICLE_PROFILE_IMAGE,
  BRAND_COLORS,
  VEHICLE_MODELS,
  VEHICLE_YEARS,
  ENGINE_TYPE_LABELS,
  detectEngineType,
  MAINTENANCE_ITEMS,
  MAINTENANCE_SCHEMA,
  HEALTH_STEPS_CONFIG,
  COMMUNITY_LINKS,
  LEGAL_TEXTS,
  GPS_CONFIG,
  BACKUP_TEXTS,
  UI_TEXTS
} = vehicleConfig;
