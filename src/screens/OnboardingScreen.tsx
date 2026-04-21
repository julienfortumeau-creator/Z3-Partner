import React, { useState, Fragment } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Modal
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { PremiumButton } from '../components/common/PremiumButton';
import { GlassCard } from '../components/common/GlassCard';
import { GlassPicker } from '../components/common/GlassPicker';
import { InputField } from '../components/common/InputField';
import { WearItem } from '../components/common/WearItem';
import { 
  APP_NAME, APP_SHORT_NAME, VEHICLE_MODELS, VEHICLE_YEARS, 
  HEALTH_STEPS_CONFIG, MAINTENANCE_ITEMS, LEGAL_TEXTS
} from '../config/vehicleConfig';
import { 
  Car, Calendar, Gauge, Euro, Shield, Disc, Thermometer, Zap, 
  ChevronLeft, Activity, Wind, Fuel, Wrench, Layers, 
  ArrowUpDown, ZapOff, Droplets, Battery as BatteryIcon, Circle, Settings, RefreshCcw,
  RefreshCw, ShieldAlert, CircleDashed
} from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

// Helper pour mapper les noms d'icônes de la config aux composants Lucide
const getIcon = (name: string) => {
  const map: Record<string, any> = {
    'Activity': Activity,
    'Thermometer': Thermometer,
    'ZapOff': ZapOff,
    'Layers': Layers,
    'Disc': Disc,
    'Wind': Wind,
    'Battery': BatteryIcon,
    'Circle': Circle,
    'droplets': Droplets,
    'wind': Wind,
    'thermometer': Thermometer,
    'zap': Zap,
    'fuel': Fuel,
    'settings': Settings,
    'zap-off': ZapOff,
    'refresh-ccw': RefreshCcw,
    'circle-dashed': CircleDashed,
    'disc': Disc,
    'arrow-up-down': ArrowUpDown,
    'layers': Layers,
    'refresh-cw': RefreshCw,
    'shield-alert': ShieldAlert,
    'battery': BatteryIcon,
    'circle': Circle,
  };
  return map[name] || HelpCircle;
};

import { HelpCircle } from 'lucide-react-native';

// Les étapes de santé sont maintenant pilotées par HEALTH_STEPS_CONFIG dans vehicleConfig.ts

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const startStep = route.params?.startStep ?? 1;
  const setProfile = useVehicleStore((state) => state.setProfile);
  const [step, setStep] = useState(startStep);

  const currentProfile = useVehicleStore((state) => state.profile);
  const [form, setForm] = useState({
    model: currentProfile?.model || '',
    year: currentProfile?.year || '',
    mileage: currentProfile?.acquisitionMileage.toString() || '112634',
    price: currentProfile?.purchasePrice.toString() || '18500',
    insurance: currentProfile?.insuranceCost.toString() || '600',
    acquisitionDate: currentProfile?.acquisitionDate || new Date().toISOString().split('T')[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [wear, setWear] = useState<Record<string, { isNew: boolean, km: string }>>(() => {
    const initialState: Record<string, { isNew: boolean, km: string }> = {};
    
    MAINTENANCE_ITEMS.forEach(item => {
      const existingKm = currentProfile?.initialWearKm?.[item.id];
      initialState[item.id] = {
        isNew: existingKm === 0 || existingKm === undefined,
        km: existingKm?.toString() || '0'
      };
    });
    return initialState;
  });

  const handleNext = () => {
    if (step === 11) {
      handleStart();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStart = () => {
    if (!form.model || !form.year) return;

    const initialWearKm: Record<string, number> = {};
    Object.keys(wear).forEach(key => {
      initialWearKm[key] = wear[key].isNew ? 0 : (parseInt(wear[key].km) || 0);
    });

    setProfile({
      model: form.model,
      year: form.year,
      acquisitionMileage: parseInt(form.mileage) || 0,
      mileage: parseInt(form.mileage) || 0, // Initialement égal à l'acquisition
      purchasePrice: parseInt(form.price) || 0,
      insuranceCost: parseInt(form.insurance) || 0,
      acquisitionDate: form.acquisitionDate,
      isCoupé: form.model.toLowerCase().includes('coupé'),
      initialWearKm,
      profileLastSavedMileage: parseInt(form.mileage) || 0,
    });
    
    if (currentProfile) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const renderHealthStep = () => {
    const currentHealthStep = HEALTH_STEPS_CONFIG[step - 2];
    if (!currentHealthStep) return null;

    const priorityColor = currentHealthStep.priorityLevel === 'critical' ? colors.error : 
                         currentHealthStep.priorityLevel === 'high' ? colors.warning : colors.success;

    return (
      <>
        <Text style={styles.sectionInfo}>
          {currentHealthStep.title}
        </Text>
        <Text style={styles.sectionDesc}>
          {currentHealthStep.description}
        </Text>
        
        <GlassCard style={styles.formCard}>
          {currentHealthStep.itemIds.map((itemId, idx) => {
            const item = MAINTENANCE_ITEMS.find(m => m.id === itemId);
            if (!item) return null;
            return (
              <React.Fragment key={item.id}>
                <WearItem 
                  id={item.id} 
                  label={item.label} 
                  icon={getIcon(item.icon)} 
                  wear={wear} 
                  setWear={setWear} 
                  defaultKm={form.mileage}
                />
                {idx < currentHealthStep.itemIds.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            );
          })}
        </GlassCard>

        <View style={styles.footerInfoBox}>
          <View style={[styles.footerInfoRow, { borderLeftColor: colors.primary }]}>
            <Text style={styles.infoLabel}>💡 ENJEU</Text>
            <Text style={styles.infoValue}>{currentHealthStep.enjeu ?? 'Non spécifié'}</Text>
          </View>
          <View style={[styles.footerInfoRow, { borderLeftColor: priorityColor }]}>
            <Text style={[styles.infoLabel, { color: priorityColor }]}>🔴 PRIORITÉ</Text>
            <Text style={styles.infoValue}>{currentHealthStep.priority ?? 'Non spécifiée'}</Text>
          </View>
        </View>
      </>
    );
  };

  const renderInvestmentStep = () => (
    <>
      <Text style={styles.sectionTitle}>💵 Investissement</Text>
      <Text style={styles.sectionDesc}>
        Suivez la valeur et les coûts fixes de votre {APP_SHORT_NAME}.
      </Text>
      <GlassCard style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date d'acquisition</Text>
          <TouchableOpacity 
            style={styles.datePickerButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.dateText}>
              {new Date(form.acquisitionDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' ? (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalDoneText}>Terminer</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={new Date(form.acquisitionDate)}
                  mode="date"
                  display="spinner"
                  textColor="#FFFFFF"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setForm({...form, acquisitionDate: selectedDate.toISOString().split('T')[0]});
                    }
                  }}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={new Date(form.acquisitionDate)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setForm({...form, acquisitionDate: selectedDate.toISOString().split('T')[0]});
                }
              }}
              maximumDate={new Date()}
            />
          )
        )}

        <InputField 
          label="Prix d'achat (€)" 
          value={form.price} 
          onChange={(t: string) => setForm({...form, price: t})}
          icon={Euro}
          placeholder="ex: 15000"
          keyboardType="numeric"
        />
        <InputField 
          label="Coût Assurance Annuel (€)" 
          value={form.insurance} 
          onChange={(t: string) => setForm({...form, insurance: t})}
          icon={Shield}
          placeholder="ex: 600"
          keyboardType="numeric"
        />
      </GlassCard>
    </>
  );

  const renderLegalStep = () => (
    <>
      <Text style={styles.sectionTitle}>⚠️ Avertissement Légal</Text>
      <GlassCard style={styles.formCard}>
        <Text style={styles.paragraph}>
          {LEGAL_TEXTS.onboardingDisclaimer}
          Les intervalles d'entretien et les alertes générées sont basés sur des données générales.
        </Text>
        <Text style={[styles.paragraph, { marginTop: spacing.md }]}>
          En continuant, vous reconnaissez que :{"\n"}
          {LEGAL_TEXTS.onboardingBullets.map((bullet, idx) => `• ${bullet}${idx < LEGAL_TEXTS.onboardingBullets.length - 1 ? '\n' : ''}`).join('')}
        </Text>
      </GlassCard>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            {currentProfile && (
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => navigation.goBack()}
              >
                <ChevronLeft color={colors.textSecondary} size={28} />
              </TouchableOpacity>
            )}
            <MaterialCommunityIcons name="steering" size={64} color={colors.primary} />
            <Text style={styles.title}>{currentProfile ? 'Modifier Profil' : APP_NAME}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 11) * 100}%` }]} />
              </View>
              <Text style={styles.stepCounter}>Étape {step} / 11</Text>
            </View>
          </View>

          {step === 1 ? (
            <>
              <Text style={styles.sectionTitle}>Configurez votre véhicule</Text>
              <GlassCard style={styles.formCard}>
                <GlassPicker 
                  label="Modèle" 
                  value={form.model} 
                  options={VEHICLE_MODELS}
                  onSelect={(val) => setForm({...form, model: val})}
                  icon={(props: any) => <MaterialCommunityIcons name="piston" {...props} />}
                  placeholder="Sélectionner mon moteur..."
                />
                <GlassPicker 
                  label="Année" 
                  value={form.year} 
                  options={VEHICLE_YEARS}
                  onSelect={(val) => setForm({...form, year: val})}
                  icon={Calendar}
                  placeholder="Millésime..."
                />
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date d'achat / début du suivi</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton} 
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={20} color={colors.primary} />
                    <Text style={styles.dateText}>
                      {new Date(form.acquisitionDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={new Date(form.acquisitionDate)}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setForm({...form, acquisitionDate: selectedDate.toISOString().split('T')[0]});
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}

                <InputField 
                  label="Kilométrage à cette date" 
                  value={form.mileage} 
                  onChange={(t: string) => setForm({...form, mileage: t})}
                  icon={Gauge}
                  placeholder="ex: 110000"
                  keyboardType="numeric"
                />
              </GlassCard>

              {/* Modal iOS DatePicker */}
              {Platform.OS === 'ios' && (
                <Modal visible={showDatePicker} transparent animationType="slide">
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.modalDoneText}>Terminer</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={new Date(form.acquisitionDate)}
                        mode="date"
                        display="spinner"
                        textColor="#FFFFFF"
                        onChange={(event, selectedDate) => {
                          if (selectedDate) {
                            setForm({...form, acquisitionDate: selectedDate.toISOString().split('T')[0]});
                          }
                        }}
                        maximumDate={new Date()}
                      />
                    </View>
                  </View>
                </Modal>
              )}
            </>
          ) : step === 10 ? (
            renderInvestmentStep()
          ) : step === 11 ? (
            renderLegalStep()
          ) : (
            renderHealthStep()
          )}

          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <ChevronLeft color={colors.textSecondary} size={24} />
                {step !== 11 && <Text style={styles.backText}>Retour</Text>}
              </TouchableOpacity>
            )}
            <PremiumButton 
              title={step === 11 ? "J'accepte et je termine" : "Suivant"} 
              onPress={handleNext} 
              style={styles.flexButton}
              textStyle={step === 11 ? { fontSize: 16 } : undefined}
            />
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
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: spacing.md,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionInfo: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sectionDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  paragraph: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 102, 178, 0.05)',
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 6,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    width: 75,
  },
  infoValue: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    fontWeight: '500',
  },
  footerInfoBox: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  footerInfoRow: {
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  flexButton: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  backText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.sm,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1, 
    justifyContent: 'flex-end', 
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: colors.background, 
    paddingBottom: 40, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalDoneText: {
    color: colors.primary, 
    fontWeight: 'bold', 
    fontSize: 16,
  },
});
