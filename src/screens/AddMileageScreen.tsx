import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { ChevronLeft, Save, Navigation, Plus, Calendar, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddMileageScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const suggestedKms = route.params?.suggestedKms;
  const { profile, addTrip } = useVehicleStore();
  
  const [distance, setDistance] = useState(suggestedKms || 0);
  const [label, setLabel] = useState(suggestedKms ? 'Trajet auto-détecté' : 'On the road');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDistancePicker, setShowDistancePicker] = useState(false);
  const [notes, setNotes] = useState('');

  // Array of numbers 1 to 999
  const distanceOptions = useMemo(() => Array.from({ length: 999 }, (_, i) => i + 1), []);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDateLabel = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSave = () => {
    if (distance === 0 || !profile) return;
    
    addTrip({
      date: date,
      distance,
      mileageAtEnd: profile.mileage + distance,
      label: label || `Trajet du ${formatDateLabel(date)}`,
      notes: notes || undefined,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ChevronLeft color={colors.textPrimary} size={28} />
              </TouchableOpacity>
              <Text style={styles.title}>Ajouter des KM</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView 
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formCardWrapper}>
                <LinearGradient
                  colors={['#3a3a3a', '#1a1a1a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.formCard}
                >
                  <View style={styles.resultRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultLabel}>DISTANCE AJOUTÉE</Text>
                      <Text style={[styles.distanceValue, distance === 0 && { color: colors.textSecondary }]}>
                        + {distance} km
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.smallPlusButton} 
                      onPress={() => setShowDistancePicker(true)}
                    >
                      <Plus color="#FFF" size={28} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.resultRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultLabel}>NOUVEAU TOTAL</Text>
                      <Text style={styles.totalValue}>
                        {((profile?.mileage || 0) + distance).toLocaleString()} km
                      </Text>
                    </View>
                    <Navigation size={28} color={distance > 0 ? colors.primary : colors.textMuted} />
                  </View>

                  <View style={styles.formInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Titre / Description</Text>
                      <TextInput
                        style={styles.input}
                        value={label}
                        onChangeText={setLabel}
                        placeholder="Nom pour l'historique"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Date du trajet</Text>
                      <TouchableOpacity 
                        style={styles.datePickerButton} 
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Calendar size={20} color={colors.primary} />
                        <Text style={styles.dateText}>{formatDateLabel(date)}</Text>
                      </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                      <DateTimePicker
                        value={new Date(date)}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                      />
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Commentaires / Détails</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Notes sur ce trajet..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.button, styles.saveButton]} 
                      onPress={handleSave}
                    >
                      <Save color="#FFF" size={20} />
                      <Text style={styles.buttonText}>Enregistrer</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal Sélecteur KM */}
      <Modal
        visible={showDistancePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistancePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.dismissOverlay} 
            activeOpacity={1} 
            onPress={() => setShowDistancePicker(false)} 
          />
          <BlurView intensity={80} tint="dark" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Distance parcourue</Text>
              <TouchableOpacity onPress={() => setShowDistancePicker(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={distanceOptions}
              keyExtractor={(item) => item.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              getItemLayout={(data, index) => (
                {length: 60, offset: 60 * index, index}
              )}
              initialScrollIndex={Math.max(0, distance - 1)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, distance === item && styles.optionItemActive]}
                  onPress={() => {
                    setDistance(item);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowDistancePicker(false);
                  }}
                >
                  <Text style={[styles.optionText, distance === item && styles.optionTextActive]}>
                    {item} km
                  </Text>
                  {distance === item && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
            <SafeAreaView />
          </BlurView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  formCardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  formCard: {
    padding: spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.success,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  smallPlusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
    opacity: 0.5,
  },
  formInputs: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.xs,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    height: 50,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    height: 55,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.xl,
    maxHeight: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
    borderColor: colors.border,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  optionItem: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: 15,
    marginBottom: spacing.xs,
  },
  optionItemActive: {
    backgroundColor: 'rgba(0, 102, 178, 0.2)',
  },
  optionText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});
