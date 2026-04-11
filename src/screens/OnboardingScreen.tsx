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
import { Z3_MODELS, Z3_YEARS } from '../constants/vehicleData';
import { Car, Calendar, Gauge, Euro, Shield, Disc, Thermometer, Zap, ChevronLeft, Aperture } from 'lucide-react-native';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const setProfile = useVehicleStore((state) => state.setProfile);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    model: '',
    year: '',
    mileage: '124000',
    price: '18500',
    insurance: '600',
    acquisitionDate: new Date().toISOString().split('T')[0],
  });

  const [wear, setWear] = useState<Record<string, { isNew: boolean, km: string }>>({
    tires: { isNew: true, km: '0' },
    brakes: { isNew: true, km: '0' },
    cooling: { isNew: true, km: '0' },
    spark_plugs: { isNew: true, km: '0' },
  });

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

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
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Aperture size={64} color={colors.primary} />
            <Text style={styles.title}>Z3 Partner</Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Configurez votre véhicule' : 'Santé du véhicule'}
            </Text>
          </View>

          {step === 1 ? (
            <>
              <GlassCard style={styles.formCard}>
                <GlassPicker 
                  label="Modèle" 
                  value={form.model} 
                  options={Z3_MODELS}
                  onSelect={(val) => setForm({...form, model: val})}
                  icon={Car}
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
                Précisez l'état actuel de vos consommables pour des prédictions précises.
              </Text>
              <GlassCard style={styles.formCard}>
                <WearItem id="tires" label="Pneus" icon={Disc} wear={wear} setWear={setWear} />
                <View style={styles.divider} />
                <WearItem id="brakes" label="Freins" icon={Disc} wear={wear} setWear={setWear} />
                <View style={styles.divider} />
                <WearItem id="cooling" label="Refroidissement" icon={Thermometer} wear={wear} setWear={setWear} />
                <View style={styles.divider} />
                <WearItem id="spark_plugs" label="Bougies" icon={Zap} wear={wear} setWear={setWear} />
              </GlassCard>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <ChevronLeft color={colors.textSecondary} size={24} />
                  <Text style={styles.backText}>Retour</Text>
                </TouchableOpacity>
                <PremiumButton 
                  title="Enregistrer" 
                  onPress={handleStart} 
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
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
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
});
