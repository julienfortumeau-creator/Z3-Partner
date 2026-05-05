import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVehicleStore } from '../store/useVehicleStore';

const STORAGE_KEY = '@gps_trip_state';

export interface TripStatus {
  isDriving: boolean;
  totalTripDistance: number; // in meters
  lastMoveTime: number;
}

export const useTripStatus = () => {
  const [status, setStatus] = useState<TripStatus>({
    isDriving: false,
    totalTripDistance: 0,
    lastMoveTime: 0,
  });
  
  const gpsEnabled = useVehicleStore((state) => state.gpsEnabled);

  useEffect(() => {
    if (!gpsEnabled) {
      setStatus({ isDriving: false, totalTripDistance: 0, lastMoveTime: 0 });
      return;
    }

    const checkStatus = async () => {
      try {
        const stateStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (stateStr) {
          const state = JSON.parse(stateStr);
          setStatus({
            isDriving: state.isDriving || false,
            totalTripDistance: state.totalTripDistance || 0,
            lastMoveTime: state.lastMoveTime || 0,
          });
        }
      } catch (e) {
        // Silent error
      }
    };

    // Poll every 5 seconds when the app is in foreground
    const interval = setInterval(checkStatus, 5000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [gpsEnabled]);

  return status;
};
