import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useVehicleStore } from '../store/useVehicleStore';
import { Alert } from 'react-native';

const BACKUP_FILENAME = 'z3_copilot_backup.json';

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
      dialogTitle: 'Exporter ma sauvegarde Z3 Copilot',
      UTI: 'public.json',
    });
  } catch (error) {
    console.error('Export error:', error);
    Alert.alert('Erreur', 'Impossible d\'exporter les données.');
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
      throw new Error('Format de fichier invalide');
    }

    Alert.alert(
      'Restaurer la sauvegarde ?',
      'Cette action remplacera toutes vos données actuelles par celles du fichier de sauvegarde. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Restaurer', 
          style: 'destructive',
          onPress: () => {
            useVehicleStore.getState().restoreState(data);
            Alert.alert('Succès', 'Votre historique a été restauré avec succès.');
          }
        }
      ]
    );
  } catch (error) {
    console.error('Import error:', error);
    Alert.alert('Erreur', 'Le fichier de sauvegarde est corrompu ou invalide.');
  }
};
