import React, { useState, Fragment } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { PremiumButton } from '../components/common/PremiumButton';
import { GlassCard } from '../components/common/GlassCard';
import { GlassPicker } from '../components/common/GlassPicker';
import { InputField } from '../components/common/InputField';
import { WearItem } from '../components/common/WearItem';
import { Z3_MODELS, Z3_YEARS } from '../constants/vehicleData';
import { 
  Car, Calendar, Gauge, Euro, Shield, Disc, Thermometer, Zap, 
  ChevronLeft, Activity, Wind, Fuel, Wrench, Layers, 
  ArrowUpDown, ZapOff, Droplets, Battery as BatteryIcon, Circle
} from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const HEALTH_STEPS = [
  {
    title: 'Moteur & lubrification',
    description: 'Fonctionnement interne du moteur et filtration.',
    enjeu: 'Longévité moteur + performances.',
    priority: 'Priorité élevée sur toutes les motorisations.',
    icon: Activity,
    priorityColor: colors.warning,
    items: [
      { id: 'oil', label: 'Filtre à huile', icon: Droplets },
      { id: 'spark_plugs', label: 'Bougies d’allumage', icon: Zap },
      { id: 'air_filter', label: 'Filtre à air', icon: Wind },
      { id: 'fuel_filter', label: 'Filtre à essence', icon: Fuel },
    ]
  },
  {
    title: 'Système de refroidissement',
    description: 'Point faible connu des BMW E36/E37.',
    enjeu: 'Éviter la surchauffe moteur.',
    priority: 'Priorité n°1 sur 6 cylindres et Z3 M.',
    icon: Thermometer,
    priorityColor: colors.error,
    items: [
      { id: 'water_pump', label: 'Pompe à eau', icon: Wrench },
      { id: 'thermostat', label: 'Thermostat', icon: Thermometer },
      { id: 'cooling_system', label: 'Radiateur', icon: Activity },
      { id: 'coolant', label: 'Refroidissement', icon: Droplets },
    ]
  },
  {
    title: 'Transmission & embrayage',
    description: 'Passage de puissance aux roues.',
    enjeu: 'Agrément de conduite + fiabilité.',
    priority: 'Plus sollicité sur 6 cylindres et M.',
    icon: ZapOff,
    priorityColor: colors.warning,
    items: [
      { id: 'clutch', label: 'Embrayage', icon: ZapOff },
    ]
  },
  {
    title: 'Trains roulants & suspension',
    description: 'Tenue de route et comportement.',
    enjeu: 'Stabilité, précision de conduite.',
    priority: 'Point faible structurel de la Z3.',
    icon: Layers,
    priorityColor: colors.error,
    items: [
      { id: 'shocks', label: 'Amortisseurs', icon: ArrowUpDown },
      { id: 'bushings', label: 'Silentblocs', icon: Layers },
    ]
  },
  {
    title: 'Système de freinage',
    description: 'Sécurité avant tout.',
    enjeu: 'Sécurité.',
    priority: 'À ne jamais négliger.',
    icon: Disc,
    priorityColor: colors.error,
    items: [
      { id: 'brake_fluid', label: 'Liquide de frein', icon: Droplets },
      { id: 'brake_pads', label: 'Plaquettes de frein', icon: Disc },
      { id: 'brake_discs', label: 'Disques de frein', icon: Disc },
    ]
  },
  {
    title: 'Confort & habitacle',
    description: 'Qualité de vie à bord.',
    enjeu: 'Confort, qualité de l’air.',
    priority: 'Moins critique mécaniquement.',
    icon: Wind,
    priorityColor: colors.success,
    items: [
      { id: 'cabin_filter', label: 'Filtre habitacle', icon: Wind },
    ]
  },
  {
    title: 'Électricité & énergie',
    description: 'Démarrage et alimentation.',
    enjeu: 'Fiabilité au quotidien.',
    priority: 'Important si voiture peu utilisée.',
    icon: BatteryIcon,
    priorityColor: colors.warning,
    items: [
      { id: 'battery', label: 'Batterie', icon: BatteryIcon },
    ]
  },
  {
    title: 'Pneumatiques',
    description: 'Liaison au sol.',
    enjeu: 'Sécurité + comportement routier.',
    priority: 'Impact direct sur plaisir de conduite.',
    icon: Circle,
    priorityColor: colors.error,
    items: [
      { id: 'tires_front', label: 'Pneus AV (avant)', icon: Circle },
      { id: 'tires_rear', label: 'Pneus AR (arrière)', icon: Circle },
    ]
  }
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const setProfile = useVehicleStore((state) => state.setProfile);
  const [step, setStep] = useState(1);

  const currentProfile = useVehicleStore((state) => state.profile);
  const [form, setForm] = useState({
    model: currentProfile?.model || '',
    year: currentProfile?.year || '',
    mileage: currentProfile?.mileage.toString() || '112634',
    price: currentProfile?.purchasePrice.toString() || '18500',
    insurance: currentProfile?.insuranceCost.toString() || '600',
    acquisitionDate: currentProfile?.acquisitionDate || new Date().toISOString().split('T')[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [wear, setWear] = useState<Record<string, { isNew: boolean, km: string }>>(() => {
    const initialState: Record<string, { isNew: boolean, km: string }> = {};
    const defaultKeys = [
      'oil', 'spark_plugs', 'air_filter', 'fuel_filter', 'water_pump', 
      'thermostat', 'cooling_system', 'coolant', 'clutch', 'shocks', 
      'bushings', 'brake_fluid', 'brake_pads', 'brake_discs', 
      'cabin_filter', 'battery', 'tires_front', 'tires_rear'
    ];
    
    defaultKeys.forEach(key => {
      const existingKm = currentProfile?.initialWearKm?.[key];
      initialState[key] = {
        isNew: existingKm === 0 || existingKm === undefined,
        km: existingKm?.toString() || '0'
      };
    });
    return initialState;
  });

  const handleNext = () => {
    if (step === 10) {
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
      mileage: parseInt(form.mileage) || 0,
      purchasePrice: parseInt(form.price) || 0,
      insuranceCost: parseInt(form.insurance) || 0,
      acquisitionDate: form.acquisitionDate,
      isCoupé: form.model.toLowerCase().includes('coupé'),
      initialWearKm,
    });
    
    if (currentProfile) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const renderHealthStep = () => {
    const currentHealthStep = HEALTH_STEPS[step - 2];
    if (!currentHealthStep) return null;

    return (
      <>
        <Text style={styles.sectionInfo}>
          {currentHealthStep.title}
        </Text>
        <Text style={styles.sectionDesc}>
          {currentHealthStep.description}
        </Text>
        
        <GlassCard style={styles.formCard}>
          {currentHealthStep.items.map((item, idx) => (
            <React.Fragment key={item.id}>
              <WearItem 
                id={item.id} 
                label={item.label} 
                icon={item.icon} 
                wear={wear} 
                setWear={setWear} 
              />
              {idx < currentHealthStep.items.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </GlassCard>

        <View style={styles.footerInfoBox}>
          <View style={[styles.footerInfoRow, { borderLeftColor: colors.primary }]}>
            <Text style={styles.infoLabel}>💡 ENJEU</Text>
            <Text style={styles.infoValue}>{currentHealthStep.enjeu ?? 'Non spécifié'}</Text>
          </View>
          <View style={[styles.footerInfoRow, { borderLeftColor: currentHealthStep.priorityColor }]}>
            <Text style={[styles.infoLabel, { color: currentHealthStep.priorityColor }]}>🔴 PRIORITÉ</Text>
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
        Suivez la valeur et les coûts fixes de votre Z3.
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

        {showDatePicker && (
          <DateTimePicker
            value={new Date(form.acquisitionDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (selectedDate) {
                setForm({...form, acquisitionDate: selectedDate.toISOString().split('T')[0]});
              }
            }}
            maximumDate={new Date()}
          />
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
            <Text style={styles.title}>{currentProfile ? 'Modifier Profil' : 'Z3 Copilot'}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 10) * 100}%` }]} />
              </View>
              <Text style={styles.stepCounter}>Étape {step} / 10</Text>
            </View>
          </View>

          {step === 1 ? (
            <>
              <Text style={styles.sectionTitle}>Configurez votre véhicule</Text>
              <GlassCard style={styles.formCard}>
                <GlassPicker 
                  label="Modèle" 
                  value={form.model} 
                  options={Z3_MODELS}
                  onSelect={(val) => setForm({...form, model: val})}
                  icon={(props: any) => <MaterialCommunityIcons name="piston" {...props} />}
                  placeholder="Sélectionner mon moteur..."
                />
                <GlassPicker 
                  label="Année" 
                  value={form.year} 
                  options={Z3_YEARS}
                  onSelect={(val) => setForm({...form, year: val})}
                  icon={Calendar}
                  placeholder="Millésime..."
                />
                <InputField 
                  label="Kilométrage actuel" 
                  value={form.mileage} 
                  onChange={(t: string) => setForm({...form, mileage: t})}
                  icon={Gauge}
                  placeholder="ex: 125000"
                  keyboardType="numeric"
                />
              </GlassCard>
            </>
          ) : step === 10 ? (
            renderInvestmentStep()
          ) : (
            renderHealthStep()
          )}

          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <ChevronLeft color={colors.textSecondary} size={24} />
                <Text style={styles.backText}>Retour</Text>
              </TouchableOpacity>
            )}
            <PremiumButton 
              title={step === 10 ? "Terminer" : "Suivant"} 
              onPress={handleNext} 
              style={styles.flexButton}
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
});
