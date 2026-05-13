import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { PremiumButton } from '../components/common/PremiumButton';
import { GlassCard } from '../components/common/GlassCard';
import { InputField } from '../components/common/InputField';
import { 
  MAINTENANCE_ITEMS 
} from '../config/vehicles';
import { 
  ChevronLeft, Settings, Activity, Disc, Thermometer, Zap, Wind, Fuel, 
  ZapOff, RefreshCcw, RefreshCw, CircleDashed, Battery as BatteryIcon, Circle,
  ArrowUpDown, Layers
} from 'lucide-react-native';
import { getMaintenanceSchema } from '../utils/maintenanceSchema';

const getIcon = (name: string) => {
  const map: Record<string, any> = {
    'droplets': Activity,
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

export default function ExpertSettingsScreen() {
  const navigation = useNavigation<any>();
  const { profile, setProfile } = useVehicleStore();

  if (!profile) return null;

  const [customIntervals, setCustomIntervals] = useState<Record<string, { km: string, years: string }>>(() => {
    const state: Record<string, { km: string, years: string }> = {};
    const schema = getMaintenanceSchema(profile.model);
    
    MAINTENANCE_ITEMS.forEach(item => {
      const custom = profile.customMaintenanceIntervals?.[item.id];
      const defaultValue = schema.find(s => s.id === item.id);
      state[item.id] = {
        km: custom?.km?.toString() ?? defaultValue?.intervalKm?.toString() ?? '',
        years: custom?.years?.toString() ?? defaultValue?.intervalYears?.toString() ?? '',
      };
    });
    return state;
  });

  const handleSave = () => {
    const customMaintenanceIntervals: Record<string, { km?: number; years?: number }> = {};
    Object.keys(customIntervals).forEach(key => {
      const km = parseInt(customIntervals[key].km);
      const years = parseInt(customIntervals[key].years);
      if (!isNaN(km) || !isNaN(years)) {
        customMaintenanceIntervals[key] = {
          ...(isNaN(km) ? {} : { km }),
          ...(isNaN(years) ? {} : { years }),
        };
      }
    });

    setProfile({
      ...profile,
      customMaintenanceIntervals,
    });
    
    Alert.alert("Succès", "Vos réglages experts ont été enregistrés.");
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
          <Text style={styles.title}>Réglages expert</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionInfo}>
            Personnalisez ici les intervalles de maintenance par défaut de votre moteur. 
            Ces valeurs remplacent les préconisations d'usine.
          </Text>
          
          <GlassCard style={styles.formCard}>
            {MAINTENANCE_ITEMS.map((item, idx) => (
              <View key={item.id} style={styles.expertItem}>
                <View style={styles.expertItemHeader}>
                  <View style={styles.iconCircle}>
                    {React.createElement(getIcon(item.icon), { size: 16, color: colors.primary })}
                  </View>
                  <Text style={styles.expertItemLabel}>{item.label}</Text>
                </View>
                
                <View style={styles.expertInputsRow}>
                  <View style={{ flex: 1 }}>
                    <InputField 
                      label="Intervalle (km)" 
                      value={customIntervals[item.id].km} 
                      onChange={(t: string) => setCustomIntervals({
                        ...customIntervals,
                        [item.id]: { ...customIntervals[item.id], km: t }
                      })}
                      placeholder="ex: 10000"
                      keyboardType="numeric"
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField 
                      label="Intervalle (ans)" 
                      value={customIntervals[item.id].years} 
                      onChange={(t: string) => setCustomIntervals({
                        ...customIntervals,
                        [item.id]: { ...customIntervals[item.id], years: t }
                      })}
                      placeholder="ex: 2"
                      keyboardType="numeric"
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </View>
                </View>
                {idx < MAINTENANCE_ITEMS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </GlassCard>

          <PremiumButton 
            title="Enregistrer les réglages" 
            onPress={handleSave} 
            style={styles.saveButton}
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
  sectionInfo: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    opacity: 0.5,
  },
  expertItem: {
    marginBottom: spacing.md,
  },
  expertItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 102, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expertItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  expertInputsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingLeft: 36,
  }
});
