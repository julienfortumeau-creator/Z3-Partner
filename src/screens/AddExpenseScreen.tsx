import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useVehicleStore, Expense } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Wrench, Fuel, Sparkles, MoreHorizontal, ChevronLeft, Save, Trash2, Calendar, ScanLine } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Category = 'maintenance' | 'fuel' | 'aesthetic' | 'other';

export default function AddExpenseScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addExpense, updateExpense, deleteExpense, profile } = useVehicleStore();
  
  const { expense, initialCategory } = route.params || {};

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [liters, setLiters] = useState('');
  const [mileage, setMileage] = useState('');
  const [category, setCategory] = useState<Category>('maintenance');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [garageName, setGarageName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (expense) {
      setLabel(expense.label);
      setAmount(expense.amount.toString());
      setLiters(expense.liters?.toString() || '');
      setMileage(expense.mileage?.toString() || '');
      setCategory(expense.category);
      setDate(expense.date);
      setNotes(expense.notes || '');
      setGarageName(expense.garageName || '');
    } else {
      setLabel('');
      setAmount('');
      setLiters('');
      setMileage(profile?.mileage?.toString() || '');
      setCategory(initialCategory || 'maintenance');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setGarageName(profile?.garage?.name || '');
    }
  }, [expense, profile?.mileage, initialCategory]);

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

  useEffect(() => {
    if (!expense && category === 'fuel' && !label) {
      setLabel('Plein E98/E95');
    }
  }, [category]);

  const handleSave = () => {
    if (!label || !amount) return;

    const expenseData = {
      label,
      amount: parseFloat(amount.replace(',', '.')),
      category,
      date,
      liters: liters && category === 'fuel' ? parseFloat(liters.replace(',', '.')) : undefined,
      mileage: mileage && (category === 'maintenance' || category === 'fuel') ? parseInt(mileage) : undefined,
      notes: notes && category !== 'fuel' ? notes : undefined,
      garageName: garageName && category === 'maintenance' ? garageName : undefined,
    };

    if (expense) {
      updateExpense(expense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    navigation.goBack();
  };

  const pricePerLiter = useMemo(() => {
    const amt = parseFloat(amount.replace(',', '.'));
    const ltr = parseFloat(liters.replace(',', '.'));
    if (amt && ltr && ltr > 0) return (amt / ltr).toFixed(3);
    return null;
  }, [amount, liters]);

  const handleDelete = () => {
    if (expense) {
      deleteExpense(expense.id);
      navigation.goBack();
    }
  };

  const CategoryOption = ({ id, label, icon: Icon }: { id: Category, label: string, icon: any }) => (
    <TouchableOpacity 
      style={[
        styles.categoryOption, 
        category === id && styles.categoryOptionActive
      ]}
      onPress={() => setCategory(id)}
    >
      <Icon size={20} color={category === id ? '#FFF' : colors.textSecondary} />
      <Text style={[
        styles.categoryLabel, 
        category === id && styles.categoryLabelActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={colors.textPrimary} size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {expense ? 'Modifier l\'élément' : 'Ajouter un entretien'}
          </Text>
          <TouchableOpacity 
            onPress={() => alert("La fonctionnalité de scanner intelligente arrive bientôt :)")} 
            style={styles.scanButtonHeader}
          >
            <ScanLine color={colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formCardWrapper}>
            <LinearGradient
              colors={['#3a3a3a', '#1a1a1a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formCard}
            >
            <View style={styles.form}>
              <Text style={styles.inputLabel}>Catégorie</Text>
              <View style={styles.categoryGrid}>
                <CategoryOption id="maintenance" label="Réparation" icon={Wrench} />
                <CategoryOption id="aesthetic" label="Polish" icon={Sparkles} />
                <CategoryOption id="fuel" label="Carburant" icon={Fuel} />
                <CategoryOption id="other" label="Autre" icon={MoreHorizontal} />
              </View>

              {/* Titre - Toujours visible */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre / Description</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: Vidange moteur"
                  placeholderTextColor={colors.textMuted}
                  value={label}
                  onChangeText={setLabel}
                />
              </View>

              {/* Montant - Toujours visible */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Montant (€)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Date - Toujours visible */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date de l'opération</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color={colors.primary} />
                  <Text style={styles.dateText}>{formatDateLabel(date)}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(date)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Kilométrage - Réparation ou Carburant uniquement */}
              {(category === 'maintenance' || category === 'fuel') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kilométrage (Compteur)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ex: 125000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={mileage}
                    onChangeText={setMileage}
                  />
                </View>
              )}

              {/* Établissement - Réparation uniquement */}
              {category === 'maintenance' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Établissement / Garage</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ex: BMW Service"
                    placeholderTextColor={colors.textMuted}
                    value={garageName}
                    onChangeText={setGarageName}
                  />
                </View>
              )}

              {/* Volume - Carburant uniquement */}
              {category === 'fuel' && (
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                    <Text style={styles.inputLabel}>Volume (Litres)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ex: 45.5"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={liters}
                      onChangeText={setLiters}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, justifyContent: 'center', paddingTop: 20 }]}>
                    {pricePerLiter && (
                      <Text style={{ color: colors.success, fontWeight: '700' }}>
                        {pricePerLiter} € / L
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Commentaires - Sauf Carburant */}
              {category !== 'fuel' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Commentaires / Détails</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="ex: Changement des filtres et vidange 5W40..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>
              )}

              <View style={styles.actionRow}>
                {expense && (
                  <TouchableOpacity 
                    style={[styles.button, styles.deleteButton]} 
                    onPress={handleDelete}
                  >
                    <Trash2 color="#FFF" size={20} />
                    <Text style={styles.buttonText}>Supprimer</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton, !expense && { width: '100%' }]} 
                  onPress={handleSave}
                >
                  <Save color="#FFF" size={20} />
                  <Text style={styles.buttonText}>
                    {expense ? 'Enregistrer' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
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
  row: {
    flexDirection: 'row',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#FFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
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
  deleteButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButtonHeader: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
