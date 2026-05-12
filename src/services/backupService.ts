import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useVehicleStore } from '../store/useVehicleStore';
import { Alert } from 'react-native';

import { BACKUP_FILENAME, APP_NAME, BACKUP_TEXTS } from '../config/vehicles';

/**
 * Exporte l'intégralité des données de l'application vers un fichier JSON.
 */
export const exportData = async () => {
  try {
    const state = useVehicleStore.getState();
    const dataToExport = {
      profile: state.profile,
      expenses: state.expenses,
      trips: state.trips,
      gpsEnabled: state.gpsEnabled,
      notificationsEnabled: state.notificationsEnabled,
      exportDate: new Date().toISOString(),
      version: '1.1.0'
    };

    const fileUri = FileSystem.cacheDirectory + BACKUP_FILENAME;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(dataToExport), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: `Exporter ma sauvegarde ${APP_NAME}`,
      UTI: 'public.json',
    });
  } catch (error) {
    console.error('Export error:', error);
    Alert.alert('Erreur', BACKUP_TEXTS.exportError);
  }
};

/**
 * Importe des données depuis un fichier JSON sélectionné par l'utilisateur.
 */
export const importData = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri);
    const data = JSON.parse(content);

    // Validation basique du schéma
    if (!data.profile || !Array.isArray(data.expenses)) {
      throw new Error(BACKUP_TEXTS.importInvalidFormat);
    }

    Alert.alert(
      BACKUP_TEXTS.importConfirmTitle,
      BACKUP_TEXTS.importConfirmBody,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Restaurer', 
          style: 'destructive',
          onPress: () => {
            useVehicleStore.getState().restoreState(data);
            Alert.alert('Succès', BACKUP_TEXTS.importSuccess);
          }
        }
      ]
    );
  } catch (error) {
    console.error('Import error:', error);
    Alert.alert('Erreur', BACKUP_TEXTS.importError);
  }
};
