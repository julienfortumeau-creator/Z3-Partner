import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useVehicleStore } from '../../store/useVehicleStore';
import { colors, spacing, typography } from '../../theme/colors';
import { GlassCard } from './GlassCard';
import { Check, X, ArrowUpRight, Gauge } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { APP_SHORT_NAME } from '../../config/vehicleConfig';

interface MileageModalProps {
  visible: boolean;
  onClose: () => void;
  suggestedKms: number;
}

export const MileageModal = ({ visible, onClose, suggestedKms }: MileageModalProps) => {
  const profile = useVehicleStore((state) => state.profile);
  const updateMileage = useVehicleStore((state) => state.updateMileage);
  
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (visible && profile) {
      setInputValue((profile.mileage + suggestedKms).toString());
    }
  }, [visible, profile, suggestedKms]);

  const handleConfirm = () => {
    const newMileage = parseInt(inputValue);
    if (!isNaN(newMileage) && profile && newMileage > profile.mileage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateMileage(newMileage);
      onClose();
    }
  };

  if (!profile) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <GlassCard style={styles.modalContent} variant="surface">
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Gauge size={24} color={colors.primary} />
                </View>
                <Text style={styles.title}>Trajet Terminé</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X color={colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Précédent</Text>
                  <Text style={styles.statValue}>{profile.mileage.toLocaleString()} km</Text>
                </View>
                <View style={styles.arrowBox}>
                  <ArrowUpRight size={20} color={colors.success} />
                  <Text style={styles.gainText}>+{suggestedKms} km</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Estimé</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {(profile.mileage + suggestedKms).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmer ou modifier le kilométrage actuel :</Text>
                <TextInput
                  style={styles.input}
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType="numeric"
                  placeholder="Kilométrages..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Check color="#FFF" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.confirmButtonText}>Mettre à jour mon {APP_SHORT_NAME}</Text>
              </TouchableOpacity>
            </GlassCard>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.xl,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  arrowBox: {
    alignItems: 'center',
  },
  gainText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    height: 65,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
