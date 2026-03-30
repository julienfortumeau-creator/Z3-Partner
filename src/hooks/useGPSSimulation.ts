import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useVehicleStore } from '../store/useVehicleStore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useGPSSimulation = () => {
  const profile = useVehicleStore((state) => state.profile);

  const simulateDriveAlert = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Trajet détecté 🚘",
        body: "Vous avez roulé avec votre Z3. Souhaitez-vous mettre à jour votre kilométrage ?",
        data: { type: 'mileage_update' },
      },
      trigger: null, // deliver immediately
    });
  };

  const simulateGasStationAlert = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Station service à proximité ⛽",
        body: "Une station TotalEnergies a été détectée. Ajouter un plein ?",
        data: { type: 'fuel_add' },
      },
      trigger: null,
    });
  };

  useEffect(() => {
    // Permission request simulate
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };

    requestPermissions();

    // Trigger simulation after a few seconds of app load (for demo)
    const driveTimer = setTimeout(() => {
      simulateDriveAlert();
    }, 15000); // 15 seconds

    const gasTimer = setTimeout(() => {
      simulateGasStationAlert();
    }, 45000); // 45 seconds

    return () => {
      clearTimeout(driveTimer);
      clearTimeout(gasTimer);
    };
  }, []);

  return { simulateDriveAlert, simulateGasStationAlert };
};
