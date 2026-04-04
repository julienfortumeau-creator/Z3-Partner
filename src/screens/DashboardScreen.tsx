import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { MaintenanceGauge } from '../components/common/MaintenanceGauge';
import { Car, Fuel, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const profile = useVehicleStore((state) => state.profile);
  const expenses = useVehicleStore((state) => state.expenses);
  const getTCO = useVehicleStore((state) => state.getTCO);

  if (!profile) return null;

  const nextOilKm = 15000;
  const nextInspKm = 30000;
  const nextCoolingKm = 100000;

  const currentMileage = profile.mileage;
  const oilProgress = currentMileage % nextOilKm;
  const inspProgress = currentMileage % nextInspKm;
  const coolingProgress = currentMileage % nextCoolingKm;

  const isHealthy = oilProgress < (nextOilKm * 0.8) && inspProgress < (nextInspKm * 0.8);

  const StatItem = ({ label, value, icon: Icon, color }: any) => (
    <View style={styles.statItem}>
      <Icon size={20} color={color || colors.textSecondary} />
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, Passionné</Text>
            <Text style={styles.modelName}>{profile.model} {profile.year}</Text>
          </View>
          <View style={styles.profileBadge}>
            <Car color={colors.primary} size={28} />
          </View>
        </View>

        <GlassCard style={styles.mainCard} variant="glass">
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text style={styles.mileageLabel}>Kilométrage Actuel</Text>
              <Text style={styles.mileageValue}>{currentMileage.toLocaleString()} km</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isHealthy ? colors.success + '20' : colors.warning + '20' }]}>
              {isHealthy ? <CheckCircle2 size={18} color={colors.success} /> : <AlertTriangle size={18} color={colors.warning} />}
              <Text style={[styles.statusText, { color: isHealthy ? colors.success : colors.warning }]}>
                {isHealthy ? 'État Optimal' : 'Entretien Proche'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <MaintenanceGauge 
            label="Prochain Oil Service" 
            currentValue={oilProgress} 
            maxValue={nextOilKm} 
          />
          <MaintenanceGauge 
            label="Prochaine Inspection I/II" 
            currentValue={inspProgress} 
            maxValue={nextInspKm} 
          />
          <MaintenanceGauge 
            label="Circuit de Refroidissement" 
            currentValue={coolingProgress} 
            maxValue={nextCoolingKm} 
          />
        </GlassCard>

        <View style={styles.statsRow}>
          <GlassCard style={styles.halfCard}>
            <StatItem 
              label="Carburant" 
              value={`${expenses.filter(e => e.category === 'fuel').length} Pleins`} 
              icon={Fuel} 
              color={colors.secondary}
            />
          </GlassCard>
          <GlassCard style={styles.halfCard}>
            <StatItem 
              label="Assurance" 
              value={`${profile.insuranceCost.toLocaleString()} € / an`} 
              icon={Shield} 
              color={colors.success}
            />
          </GlassCard>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.tcoCardContainer}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modelName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  profileBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainCard: {
    marginBottom: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusInfo: {
    flex: 1,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  halfCard: {
    flex: 1,
    padding: 0,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
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
