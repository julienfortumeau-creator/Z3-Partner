import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export const LOCATION_TRACKING_TASK = 'Z3_COPILOT_LOCATION_TRACKING';

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

let lastPoint: { latitude: number, longitude: number } | null = null;
let totalTripDistance = 0;
let isDriving = false;
let lastMoveTime = Date.now();

TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
  if (error) {
    console.error('BG Location Error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    const { latitude, longitude, speed } = location.coords;

    // Détection de mouvement (> 15 km/h)
    // speed est en m/s -> 15 km/h = 4.16 m/s
    if (speed > 4.16) {
      if (!isDriving) {
        console.log('GPS BG: Trajet commencé');
        isDriving = true;
        totalTripDistance = 0;
      }
      lastMoveTime = Date.now();
    }

    if (isDriving && lastPoint) {
      const dist = getDistance(lastPoint.latitude, lastPoint.longitude, latitude, longitude);
      // On ignore les sauts GPS aberrants (> 500m entre deux points rapprochés)
      if (dist < 500) {
        totalTripDistance += dist;
      }
    }

    lastPoint = { latitude, longitude };

    // Détection de fin de trajet (arrêt > 5 minutes)
    if (isDriving && speed < 1 && (Date.now() - lastMoveTime > 300000)) {
       const kms = Math.round(totalTripDistance / 1000);
       
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
       
       isDriving = false;
       totalTripDistance = 0;
    }
  }
});
