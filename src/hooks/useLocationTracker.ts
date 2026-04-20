import { useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TRACKING_TASK } from '../services/LocationTask';

import { useVehicleStore } from '../store/useVehicleStore';
import { APP_NAME, BRAND_COLORS } from '../config/vehicleConfig';

export const useLocationTracker = () => {
  const gpsEnabled = useVehicleStore((state) => state.gpsEnabled);

  useEffect(() => {
    const manageTracking = async () => {
      // 1. Vérification si activé dans les réglages
      if (!gpsEnabled) {
        try {
          const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);
          if (isRegistered) {
            await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
            console.log('GPS: Suivi arrêté avec succès');
          }
        } catch (error) {
          console.log('GPS: Erreur lors de l\'arrêt:', error);
        }
        return;
      }

      // 2. Demande de permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') return;

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') return;

      // 3. Lancement du tracking
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 20,
        foregroundService: {
          notificationTitle: APP_NAME,
          notificationBody: "Suivi de trajet actif",
          notificationColor: BRAND_COLORS.primary,
        },
        pausesUpdatesAutomatically: true,
      });
      
      console.log('GPS: Tracking réel activé');
    };

    manageTracking();
  }, [gpsEnabled]);
};
