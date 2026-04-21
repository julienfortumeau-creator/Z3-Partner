import React, { useState } from 'react';
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
import { 
  VEHICLE_MODELS, VEHICLE_YEARS, MAINTENANCE_ITEMS 
} from '../config/vehicleConfig';
import { 
  ChevronLeft, Disc, Thermometer, Zap, Car, Calendar, Gauge, Euro, Shield,
  Activity, Wind, Fuel, Wrench, Layers, ArrowUpDown, ZapOff, Droplets, 
  Battery as BatteryIcon, Circle, Settings, RefreshCcw, RefreshCw, CircleDashed
} from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const getIcon = (name: string) => {
  const map: Record<string, any> = {
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
    'battery': BatteryIcon,
    'circle': Circle,
  };
  return map[name] || Activity;
};

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, setProfile } = useVehicleStore();
  const [step, setStep] = useState(1);

  if (!profile) return null;

  const [form, setForm] = useState({
    model: profile.model,
    year: profile.year,
    mileage: profile.acquisitionMileage.toString(),
    price: profile.purchasePrice.toString(),
    insurance: profile.insuranceCost.toString(),
    acquisitionDate: profile.acquisitionDate,
  });

  const [mileage, setMileage] = useState(profile.acquisitionMileage.toString());

  const [wear, setWear] = useState<Record<string, { isNew: boolean, km: string }>>(() => {
    const initialState: Record<string, { isNew: boolean, km: string }> = {};
    MAINTENANCE_ITEMS.forEach(item => {
      const wearValue = profile.initialWearKm[item.id] ?? 0;
      initialState[item.id] = {
        isNew: wearValue === 0,
        km: wearValue.toString()
      };
    });
    return initialState;
  });

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSave = () => {
    const initialWearKm: Record<string, number> = {};
    Object.keys(wear).forEach(key => {
      initialWearKm[key] = wear[key].isNew ? 0 : (parseInt(wear[key].km) || 0);
    });

    setProfile({
      ...profile,
      model: form.model,
      year: form.year,
      acquisitionMileage: parseInt(mileage) || 0,
      purchasePrice: parseInt(form.price) || 0,
      insuranceCost: parseInt(form.insurance) || 0,
      acquisitionDate: form.acquisitionDate,
      isCoupé: form.model.toLowerCase().includes('coupé'),
      initialWearKm,
    });
    navigation.goBack();
  };

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
          <Text style={styles.title}>Modifier Profil</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.stepIndicator}>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Informations Véhicule (1/2)' : 'Santé & Consommables (2/2)'}
            </Text>
          </View>

          {step === 1 ? (
            <>
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
                <InputField 
                  label="Kilométrage à l'achat" 
                  value={mileage} 
                  onChange={(t: string) => setMileage(t)}
                  icon={Gauge}
                  placeholder="ex: 110000"
                  keyboardType="numeric"
                />
                
                <View style={styles.infoBox}>
                  <Activity size={18} color={colors.primary} />
                  <View>
                    <Text style={styles.infoBoxLabel}>KILOMÉTRAGE ACTUEL CALCULÉ</Text>
                    <Text style={styles.infoBoxValue}>{profile.mileage.toLocaleString()} km</Text>
                    <Text style={styles.infoBoxHelper}>Basé sur vos trajets enregistrés</Text>
                  </View>
                </View>
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

              <PremiumButton 
                title="Suivant" 
                onPress={handleNext} 
                style={styles.button}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionInfo}>
                Mettez à jour l'usure de vos consommables pour ajuster les alertes d'entretien.
              </Text>
              <GlassCard style={styles.formCard}>
                {MAINTENANCE_ITEMS.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <WearItem 
                      id={item.id} 
                      label={item.label} 
                      icon={getIcon(item.icon)} 
                      wear={wear} 
                      setWear={setWear} 
                      defaultKm={mileage}
                    />
                    {idx < MAINTENANCE_ITEMS.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </GlassCard>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButtonRow} onPress={handleBack}>
                  <ChevronLeft color={colors.textSecondary} size={24} />
                  <Text style={styles.backText}>Retour</Text>
                </TouchableOpacity>
                <PremiumButton 
                  title="Enregistrer" 
                  onPress={handleSave} 
                  style={styles.flexButton}
                />
              </View>
            </>
          )}
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
  stepIndicator: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  subtitle: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 14,
  },
  sectionInfo: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flexButton: {
    flex: 1,
  },
  backButtonRow: {
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  infoBoxValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  infoBoxHelper: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic',
  }
});
