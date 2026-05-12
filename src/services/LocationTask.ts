import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LOCATION_TASK_NAME, GPS_CONFIG } from '../config/vehicles';

export const LOCATION_TRACKING_TASK = LOCATION_TASK_NAME;

/**
 * Calcule la distance entre deux coordonnées en mètres (Haversine).
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; 
}

const STORAGE_KEY = '@gps_trip_state';
const LOGS_KEY = '@gps_logs';

async function addLog(message: string) {
  try {
    const logsStr = await AsyncStorage.getItem(LOGS_KEY);
    const logs = logsStr ? JSON.parse(logsStr) : [];
    logs.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {}
}

TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  if (error) {
    await addLog(`Erreur: ${error.message}`);
    return;
  }
  
  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    const { latitude, longitude, speed } = location.coords;

    // Charger l'état actuel
    const stateStr = await AsyncStorage.getItem(STORAGE_KEY);
    let state = stateStr ? JSON.parse(stateStr) : {
      lastPoint: null,
      totalTripDistance: 0,
      isDriving: false,
      lastMoveTime: Date.now(),
      lastStationCheckTime: 0,
    };

    const GAS_STATION_KEYWORDS = GPS_CONFIG.stationKeywords;

    // On ne considère le trajet comme commencé que si on bouge vraiment (> threshold)
    if (speed > GPS_CONFIG.speedThreshold) {
      if (!state.isDriving) {
        await addLog('Trajet commencé');
        state.isDriving = true;
        state.totalTripDistance = 0;
      }
      state.lastMoveTime = Date.now();
    }

    // ACCUMULATION DE LA DISTANCE (Optimisée)
    // On ne cumule que si :
    // 1. On est en mode conduite
    // 2. On a un point précédent
    // 3. La précision du point actuel est bonne (< 30 mètres)
    // 4. On bouge réellement (vitesse > 2 m/s, soit ~7 km/h) pour éviter la dérive à l'arrêt
    if (state.isDriving && state.lastPoint && location.coords.accuracy < 30 && speed > 2) {
      const dist = getDistance(state.lastPoint.latitude, state.lastPoint.longitude, latitude, longitude);
      // Sécurité supplémentaire : on ignore les sauts impossibles (> 500m entre deux points en 10s)
      if (dist < 500) {
        state.totalTripDistance += dist;
      }
    }

    state.lastPoint = { latitude, longitude };

    // Si arrêté (< threshold) depuis plus de 2 minutes ET pas de check depuis l'intervalle configuré
    if (speed < GPS_CONFIG.stopThreshold && (Date.now() - state.lastMoveTime > 120000) && (Date.now() - state.lastStationCheckTime > GPS_CONFIG.stationCheckInterval) ) {
      state.lastStationCheckTime = Date.now();
      try {
        const addr = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addr && addr.length > 0) {
          const place = addr[0];
          const searchStr = `${place.name} ${place.street}`.toLowerCase();
          const isStation = GAS_STATION_KEYWORDS.some(kw => searchStr.includes(kw.toLowerCase()));
          
          if (isStation) {
            await addLog(`Station détectée: ${place.name}`);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: GPS_CONFIG.notifications.stationTitle,
                body: GPS_CONFIG.notifications.stationBody(place.name || ''),
                data: { type: 'fuel_add' },
              },
              trigger: null,
            });
          }
        }
      } catch (e) {
        await addLog("Erreur Geocoding Station");
      }
    }

    // Détection de fin de trajet (arrêt prolongé)
    if (state.isDriving && speed < GPS_CONFIG.stopThreshold && (Date.now() - state.lastMoveTime > GPS_CONFIG.stopDuration)) {
       const kms = Math.round(state.totalTripDistance / 1000);
       await addLog(`Fin de trajet: ${kms} km détectés`);
       
       if (kms >= 1) {
         await Notifications.scheduleNotificationAsync({
           content: {
             title: GPS_CONFIG.notifications.tripEndTitle,
             body: GPS_CONFIG.notifications.tripEndBody(kms),
             data: { type: 'mileage_update', suggestedKms: kms },
           },
           trigger: null,
         });
       }
       
       state.isDriving = false;
       state.totalTripDistance = 0;
    }

    // Sauvegarder l'état
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
});
