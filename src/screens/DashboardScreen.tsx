import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { MaintenanceGauge } from '../components/common/MaintenanceGauge';
import { Car, Fuel, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MAINTENANCE_SCHEMA } from '../utils/maintenanceSchema';

import * as Notifications from 'expo-notifications';
import { MileageModal } from '../components/common/MileageModal';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const profile = useVehicleStore((state) => state.profile);
  const expenses = useVehicleStore((state) => state.expenses);
  const getTCO = useVehicleStore((state) => state.getTCO);

  const [mileageModalVisible, setMileageModalVisible] = React.useState(false);
  const [suggestedKms, setSuggestedKms] = React.useState(0);

  React.useEffect(() => {
    // Écouteur pour les clics sur les notifications
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'mileage_update') {
        navigation.navigate('AddMileage');
      } else if (data.type === 'fuel_add') {
        navigation.navigate('AddExpense', { initialCategory: 'fuel' });
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  if (!profile) return null;

  const currentMileage = profile.mileage;

  // Calcul de la jauge Oil Service (Indépendante)
  const oilSchema = MAINTENANCE_SCHEMA.find(m => m.id === 'oil')!;
  const lastOilExpense = expenses.find(e => e.label.toLowerCase().includes('oil') || e.label.toLowerCase().includes('vidange'));
  const oilStartMileage = lastOilExpense ? (expenses.indexOf(lastOilExpense) > -1 ? 0 : 0) : 0; // Simplifié pour démo, à affiner avec de vraies données
  const oilProgress = (currentMileage % oilSchema.intervalKm);

  // Calcul de la jauge Entretien Consolidée (Pneus, Freins, etc.)
  const maintenanceItems = MAINTENANCE_SCHEMA.filter(m => m.id !== 'oil');
  
  const maintenanceStatus = maintenanceItems.map(item => {
    const initialWear = profile.initialWearKm?.[item.id] || 0;
    // On considère que l'usure initiale s'ajoute au kilométrage de départ "virtuel"
    const effectiveMileage = currentMileage + initialWear;
    const progress = (effectiveMileage % item.intervalKm);
    const percentage = (progress / item.intervalKm) * 100;
    
    return {
      ...item,
      progress,
      percentage,
      remaining: item.intervalKm - progress
    };
  });

  // On prend l'item le plus "urgent" (pourcentage le plus élevé)
  const mostUrgent = maintenanceStatus.sort((a, b) => b.percentage - a.percentage)[0];

  const isHealthy = oilProgress < (oilSchema.intervalKm * 0.8) && mostUrgent.percentage < 80;

  const navigateToHistory = () => {
    navigation.navigate('History');
  };

  const navigateToStats = () => {
    navigation.navigate('Stats');
  };

  // Calcul de la consommation entre deux pleins
  const fuelExpenses = expenses
    .filter(e => e.category === 'fuel' && e.liters && e.mileage)
    .sort((a, b) => (b.mileage || 0) - (a.mileage || 0));

  const consumption = useMemo(() => {
    if (fuelExpenses.length >= 2) {
      const last = fuelExpenses[0];
      const prev = fuelExpenses[1];
      const distance = (last.mileage || 0) - (prev.mileage || 0);
      const ltrs = last.liters || 0;
      
      if (distance > 0 && ltrs > 0) {
        return ((ltrs / distance) * 100).toFixed(1);
      }
    }
    return null;
  }, [fuelExpenses]);

  const StatItem = ({ label, value, subValue, icon: Icon, color }: any) => (
    <View style={styles.statItem}>
      <Icon size={20} color={color || colors.textSecondary} />
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text style={styles.statValue}>{value}</Text>
          {subValue && <Text style={{ fontSize: 10, color: colors.textMuted }}>• {subValue}</Text>}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedHeader}>
        <Text style={styles.appTitle}>Z3 <Text style={styles.appTitleLight}>Partner</Text></Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, Passionné</Text>
            <Text style={styles.modelName}>{profile.model} {profile.year}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isHealthy ? colors.success + '20' : colors.warning + '20' }]}>
            {isHealthy ? <CheckCircle2 size={16} color={colors.success} /> : <AlertTriangle size={16} color={colors.warning} />}
            <Text style={[styles.statusText, { color: isHealthy ? colors.success : colors.warning }]}>
              {isHealthy ? 'Optimal' : 'Entretien'}
            </Text>
          </View>
        </View>

        <GlassCard style={styles.mainCard} variant="glass">
          <TouchableOpacity 
            style={styles.mileageSection} 
            onPress={() => navigation.navigate('AddMileage')}
            activeOpacity={0.7}
          >
            <Text style={styles.mileageLabel}>Kilométrage Actuel</Text>
            <Text style={styles.mileageValue}>{currentMileage.toLocaleString()} km</Text>
            <Text style={styles.mileageAction}>Mettre à jour {'>'}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.gaugesRow}>
            <MaintenanceGauge 
              label="Oil Service" 
              currentValue={oilProgress} 
              maxValue={oilSchema.intervalKm}
              size={110}
            />
            <MaintenanceGauge 
              label={`Prochain : ${mostUrgent.label}`} 
              currentValue={mostUrgent.progress} 
              maxValue={mostUrgent.intervalKm}
              size={110}
              onPress={navigateToHistory}
            />
          </View>
        </GlassCard>

        <View style={styles.statsContainer}>
          <GlassCard style={styles.listCard} variant="glass">
            <StatItem 
              label="Carburant" 
              value={`${expenses.filter(e => e.category === 'fuel').length} Pleins`} 
              subValue={consumption ? `${consumption} l/100km` : undefined}
              icon={Fuel} 
              color={colors.secondary}
            />
          </GlassCard>
          
          <GlassCard style={styles.listCard} variant="glass">
            <StatItem 
              label="Assurance" 
              value={`${profile.insuranceCost.toLocaleString()} € / an`} 
              icon={Shield} 
              color={colors.success}
            />
          </GlassCard>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.tcoCardContainer} onPress={navigateToStats}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tcoCard}
          >
            <View>
              <Text style={styles.tcoLabel}>Coût de Revient Total (TCO)</Text>
              <Text style={styles.tcoValue}>{getTCO().toLocaleString()} €</Text>
            </View>
            <Text style={styles.tcoSubText}>Détails des frais {'>'}</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>

      <MileageModal 
        visible={mileageModalVisible} 
        onClose={() => setMileageModalVisible(false)} 
        suggestedKms={suggestedKms} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  fixedHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  appTitleLight: {
    fontWeight: '300',
    color: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  modelName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  mainCard: {
    marginBottom: spacing.lg,
  },
  mileageSection: {
    alignItems: 'center',
  },
  mileageLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mileageValue: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  mileageAction: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  statsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  listCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tcoCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  tcoCard: {
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tcoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  tcoValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  tcoSubText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
});
