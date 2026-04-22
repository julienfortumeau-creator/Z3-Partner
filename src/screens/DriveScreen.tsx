import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicleStore, Trip } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, ArrowUpRight, Navigation, Calendar, Trash2, X, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type TimelineItem = {
  id: string;
  type: 'past' | 'today' | 'future';
  date: string;
  label: string;
  distance?: number;
  mileageAtEnd?: number;
};

export default function DriveScreen() {
  const navigation = useNavigation<any>();
  const trips = useVehicleStore((state) => state.trips);
  const profile = useVehicleStore((state) => state.profile);
  const updateTrip = useVehicleStore((state) => state.updateTrip);
  const deleteTrip = useVehicleStore((state) => state.deleteTrip);

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [editDate, setEditDate] = useState(new Date().toISOString().split('T')[0]);
  const [editNotes, setEditNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!profile) return null;

  const timelineData = useMemo(() => {
    const now = new Date();
    const items: TimelineItem[] = [];

    // 1. Past trips
    trips.forEach(trip => {
      items.push({
        id: trip.id,
        type: 'past',
        date: trip.date,
        label: trip.label,
        distance: trip.distance,
        mileageAtEnd: trip.mileageAtEnd,
      });
    });

    // 2. Today (Current Progress)
    items.push({
      id: 'today',
      type: 'today',
      date: now.toISOString(),
      label: 'Aujourd\'hui',
    });

    // Simple sort: older to newer for timeline
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trips]);

  const openAddMileage = () => {
    navigation.navigate('AddMileage');
  };

  const handleEditTrip = (id: string) => {
    const trip = trips.find(t => t.id === id);
    if (trip) {
      setEditingTrip(trip);
      setEditLabel(trip.label);
      setEditDistance(trip.distance.toString());
      setEditDate(trip.date);
      setEditNotes(trip.notes || '');
      setModalVisible(true);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEditDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDateLabel = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSaveEdit = () => {
    if (editingTrip) {
      updateTrip(editingTrip.id, {
        label: editLabel,
        distance: parseInt(editDistance) || 0,
        date: editDate,
        notes: editNotes || undefined
      });
      setModalVisible(false);
      setEditingTrip(null);
    }
  };

  const handleDeleteTrip = () => {
    if (editingTrip) {
      Alert.alert(
        "Supprimer le trajet",
        "Voulez-vous vraiment supprimer ce trajet de l'historique ?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Supprimer", 
            style: "destructive", 
            onPress: () => {
              deleteTrip(editingTrip.id);
              setModalVisible(false);
              setEditingTrip(null);
            }
          }
        ]
      );
    }
  };

  const renderItem = ({ item, index }: { item: TimelineItem; index: number }) => {
    const isToday = item.type === 'today';
    const isPast = item.type === 'past';

    const dateObj = new Date(item.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '');
    
    return (
      <View style={[styles.itemWrapper, isToday && styles.todayWrapper]}>
        <View style={styles.timelineContainer}>
          <View style={[
            styles.dateBox, 
            isToday && styles.todayBox,
          ]}>
            <Text style={[
              styles.dateDay, 
              isToday && {color: '#FFF'}
            ]}>
              {day}
            </Text>
            <Text style={[
              styles.dateMonth, 
              isToday && {color: '#FFF'}
            ]}>
              {month}
            </Text>
          </View>
          <View style={[
            styles.timelineLine, 
            index === timelineData.length - 1 && { backgroundColor: 'transparent' }
          ]} />
        </View>

        <TouchableOpacity 
          style={styles.cardContainer} 
          disabled={!isPast}
          onPress={() => isPast && handleEditTrip(item.id)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              isToday 
                ? [colors.primary, colors.primaryDark]
                : ['#3a3a3a', '#1a1a1a']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.itemCard, styles.gradientCard]}
          >
            <View style={styles.itemHeader}>
              <View style={[
                styles.iconBox, 
                { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
              ]}>
                {isToday ? <Navigation size={18} color="#FFF" /> : <ArrowUpRight size={18} color="#FFF" />}
              </View>
              <View style={styles.itemContent}>
                <Text style={[
                  styles.itemLabel, 
                  {color: '#FFF'}
                ]} numberOfLines={1}>
                  {item.label}
                </Text>
                
                {isToday ? (
                  <Text style={[styles.itemDetail, { color: 'rgba(255,255,255,0.7)' }]}>
                    Kilométrage actuel : <Text style={{fontWeight: '800', color: '#FFF'}}>{profile.mileage.toLocaleString()}</Text> km
                  </Text>
                ) : (
                  <Text style={[styles.itemDetail, { color: 'rgba(255,255,255,0.7)' }]}>
                    Trajet de <Text style={{fontWeight: '700', color: '#FFF'}}>{item.distance}</Text> km
                  </Text>
                )}
              </View>
              
              {isPast && (
                <View style={[styles.mileageBadge, { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <Text style={[styles.badgeText, { color: '#FFF' }]}>{item.mileageAtEnd?.toLocaleString()}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Drive</Text>
          <Text style={styles.subtitle}>Suivi de pilotage</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddMileage}>
          <Plus color="#FFF" size={28} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={timelineData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={Math.max(0, timelineData.findIndex(i => i.id === 'today'))}
        getItemLayout={(_, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
        onScrollToIndexFailed={() => {}}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le trajet</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom du trajet</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editLabel}
                    onChangeText={setEditLabel}
                    placeholder="Ex: Balade dimanche"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Distance (km)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editDistance}
                    onChangeText={setEditDistance}
                    keyboardType="numeric"
                    placeholder="Ex: 50"
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
                    <Text style={styles.dateText}>{formatDateLabel(editDate)}</Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(editDate)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Commentaires / Détails</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={editNotes}
                    onChangeText={setEditNotes}
                    placeholder="Notes sur ce trajet..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]} 
                onPress={handleDeleteTrip}
              >
                <Trash2 color={colors.error} size={20} />
                <Text style={[styles.modalButtonText, { color: colors.error }]}>Supprimer</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveEdit}
              >
                <Check color="#FFF" size={20} />
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemWrapper: {
    flexDirection: 'row',
    minHeight: 100,
  },
  todayWrapper: {
    marginVertical: spacing.md,
  },
  timelineContainer: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighlight,
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 2,
  },
  todayBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 50,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  cardContainer: {
    flex: 1,
    paddingBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  itemCard: {
    padding: spacing.md,
    borderRadius: 20,
  },
  gradientCard: {
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mileageBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.xl,
    minHeight: 400,
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
  modalForm: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
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
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  modalButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: colors.error,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
