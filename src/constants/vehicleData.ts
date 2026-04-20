/**
 * Re-export du catalogue véhicule depuis la config centrale.
 * Les anciens noms Z3_MODELS / Z3_YEARS sont conservés pour compatibilité.
 */
import { VEHICLE_MODELS, VEHICLE_YEARS } from '../config/vehicleConfig';

export const Z3_MODELS = VEHICLE_MODELS;
export const Z3_YEARS = VEHICLE_YEARS;
