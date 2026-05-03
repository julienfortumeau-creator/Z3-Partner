import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LOCATION_TASK_NAME } from '../config/vehicleConfig';

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

    const GAS_STATION_KEYWORDS = ['Station', 'Total', 'Shell', 'Esso', 'BP', 'Avia', 'Eni', 'Relais', 'Garage', 'Carrefour', 'Leclerc', 'Intermarché', 'Super U', 'Auchan'];

    // DÉTECTION DE MOUVEMENT
    // On ne considère le trajet comme commencé que si on bouge vraiment (> 15 km/h)
    if (speed > 4.16) {
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

    // DÉTECTION STATION SERVICE
    // Si arrêté (< 1m/s) depuis plus de 2 minutes ET pas de check depuis 2 heures (7200000 ms)
    if (speed < 1 && (Date.now() - state.lastMoveTime > 120000) && (Date.now() - state.lastStationCheckTime > 7200000)) {
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
                title: "Station service détectée ⛽",
                body: `${place.name || 'Une station'} a été détectée. Ajouter un plein ?`,
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

    // Détection de fin de trajet (arrêt > 5 minutes)
    if (state.isDriving && speed < 1 && (Date.now() - state.lastMoveTime > 300000)) {
       const kms = Math.round(state.totalTripDistance / 1000);
       await addLog(`Fin de trajet: ${kms} km détectés`);
       
       if (kms >= 1) {
         await Notifications.scheduleNotificationAsync({
           content: {
             title: "Trajet terminé 🚘",
             body: `Vous avez parcouru ${kms} km. Mettre à jour votre compteur ?`,
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
