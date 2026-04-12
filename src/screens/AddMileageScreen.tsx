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
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { ChevronLeft, Save, Navigation, Plus, Calendar, X, Check } from 'lucide-react-native';
import { PremiumButton } from '../components/common/PremiumButton';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddMileageScreen() {
  const navigation = useNavigation<any>();
  const { profile, addTrip } = useVehicleStore();
  
  const [distance, setDistance] = useState(0);
  const [label, setLabel] = useState('On the road');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDistancePicker, setShowDistancePicker] = useState(false);

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
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Ajouter des KM</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Kilométrage actuel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>COMPTEUR ACTUEL</Text>
          <Text style={styles.currentValue}>{profile?.mileage.toLocaleString()} km</Text>
        </View>

        {/* Bouton d'ajout central */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.plusButton} 
            onPress={() => setShowDistancePicker(true)}
            activeOpacity={0.8}
          >
            <Plus color="#FFF" size={40} />
          </TouchableOpacity>
          <Text style={styles.actionPrompt}>Ajouter des kilomètres</Text>
        </View>

        {/* Bloc Nouveau Compteur */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#3a3a3a', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resultCard}
          >
            <View style={styles.resultRow}>
              <View>
                <Text style={styles.resultLabel}>DISTANCE AJOUTÉE</Text>
                <Text style={[styles.distanceValue, distance === 0 && { color: colors.textSecondary }]}>
                  + {distance} km
                </Text>
              </View>
              <Navigation size={32} color={distance > 0 ? colors.primary : colors.textMuted} />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.resultRow}>
              <View>
                <Text style={styles.resultLabel}>NOUVEAU TOTAL</Text>
                <Text style={styles.totalValue}>
                  {((profile?.mileage || 0) + distance).toLocaleString()} km
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Titre du Trajet */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>TITRE DU TRAJET</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Nom pour l'historique"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Sélecteur de Date */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>DATE DU TRAJET</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
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

        <PremiumButton 
          title="Enregistrer" 
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>

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
  content: {
    flex: 1,
    padding: spacing.xl,
    gap: 30,
  },
  sectionHeader: {
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  inputSection: {
    alignItems: 'center',
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
    width: '100%',
    textAlign: 'center',
    marginTop: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  actionContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  plusButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  actionPrompt: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  resultCard: {
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
    opacity: 0.5,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 'auto',
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
