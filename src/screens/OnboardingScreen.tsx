import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
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
import { Car, Calendar, Gauge, Euro, User } from 'lucide-react-native';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const setProfile = useVehicleStore((state) => state.setProfile);

  const [form, setForm] = useState({
    model: 'Roadster 2.2i',
    year: '2001',
    mileage: '124000',
    price: '18500',
    acquisitionDate: '2023-05-15',
  });

  const handleStart = () => {
    setProfile({
      model: form.model,
      year: form.year,
      mileage: parseInt(form.mileage),
      purchasePrice: parseInt(form.price),
      acquisitionDate: form.acquisitionDate,
      isCoupé: form.model.toLowerCase().includes('coupé'),
    });
    navigation.replace('MainTabs');
  };

  const InputField = ({ label, value, onChange, icon: Icon, placeholder }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={label.includes('Kilométrage') || label.includes('Prix') ? 'numeric' : 'default'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Car size={64} color={colors.primary} />
            <Text style={styles.title}>Z3 Partner</Text>
            <Text style={styles.subtitle}>Configurez votre compagnon de route</Text>
          </View>

          <GlassCard style={styles.formCard}>
            <InputField 
              label="Modèle" 
              value={form.model} 
              onChange={(t: string) => setForm({...form, model: t})}
              icon={Car}
              placeholder="ex: Roadster 2.8, M Coupé..."
            />
            <InputField 
              label="Année" 
              value={form.year} 
              onChange={(t: string) => setForm({...form, year: t})}
              icon={Calendar}
              placeholder="ex: 1999"
            />
            <InputField 
              label="Kilométrage actuel" 
              value={form.mileage} 
              onChange={(t: string) => setForm({...form, mileage: t})}
              icon={Gauge}
              placeholder="ex: 125000"
            />
            <InputField 
              label="Prix d'achat (€)" 
              value={form.price} 
              onChange={(t: string) => setForm({...form, price: t})}
              icon={Euro}
              placeholder="ex: 15000"
            />
          </GlassCard>

          <PremiumButton 
            title="Démarrer l'Aventure" 
            onPress={handleStart} 
            style={styles.button}
          />
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
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
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
  formCard: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
  button: {
    marginTop: spacing.md,
  },
});
