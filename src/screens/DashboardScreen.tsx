import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { MaintenanceGauge } from '../components/common/MaintenanceGauge';
import { Car, Fuel, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getMaintenanceSchema } from '../utils/maintenanceSchema';
import { APP_NAME, APP_SHORT_NAME, VEHICLE_PROFILE_IMAGE, LEGAL_TEXTS } from '../config/vehicleConfig';
import { calculateAverageConsumption } from '../utils/fuelAnalytics';
import { calculateBudgetForecast } from '../utils/mileageAnalytics';

import * as Notifications from 'expo-notifications';
import { MileageModal } from '../components/common/MileageModal';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const profile = useVehicleStore((state) => state.profile);
  const expenses = useVehicleStore((state) => state.expenses);
  const trips = useVehicleStore((state) => state.trips);
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

  const nextMonthBudget = useMemo(() => {
    if (!profile) return 0;
    return calculateBudgetForecast(trips, profile, expenses, 1).total;
  }, [trips, profile, expenses]);

  if (!profile) return null;

  const currentMileage = profile.mileage;

  // Base commune de calcul de distance depuis la dernière sauvegarde
  const baseMileage = profile.profileLastSavedMileage || currentMileage;
  const drivenSinceSave = Math.max(0, currentMileage - baseMileage);

  // Calcul de la jauge Oil Service (Indépendante)
  const schema = getMaintenanceSchema(profile.model);
  const oilSchema = schema.find(m => m.id === 'oil')!;
  const initialOilWear = profile.initialWearKm?.['oil'] || 0;
  const oilProgress = initialOilWear + drivenSinceSave;

  // Calcul de la jauge Entretien & réparation (Pneus, Freins, etc.)
  const maintenanceItems = schema.filter(m => m.typeLabel === 'Entretien & réparation');
  
  const maintenanceStatus = maintenanceItems.map(item => {
    if (!item.intervalKm) return null;
    const initialWear = profile.initialWearKm?.[item.id] || 0;
    const usage = initialWear + drivenSinceSave;
    const percentage = (usage / item.intervalKm) * 100;
    
    return {
      ...item,
      progress: usage,
      percentage,
      remaining: item.intervalKm - usage
    };
  }).filter((i): i is any => i !== null);

  // On prend l'item le plus "urgent" (pourcentage le plus élevé)
  const mostUrgent = maintenanceStatus.sort((a: any, b: any) => b.percentage - a.percentage)[0];
  const oilInterval = oilSchema.intervalKm || 10000;
  const isHealthy = oilProgress < (oilInterval * 0.8) && mostUrgent.percentage < 80;

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

  const consumptionVal = useMemo(() => {
    const avg = calculateAverageConsumption(expenses);
    return avg ? avg.toFixed(1) : null;
  }, [expenses]);

  const StatItem = ({ label, value, subValue, icon: Icon, color }: any) => (
    <View style={styles.statItem}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={25} color={color || colors.textSecondary} />
      </View>
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        {subValue && (
          <View style={styles.subValueBadge}>
            <Text style={styles.subValueText}>{subValue}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.appTitle}>{APP_SHORT_NAME} <Text style={styles.appTitleLight}>Copilot</Text></Text>
          <Image 
            source={VEHICLE_PROFILE_IMAGE} 
            style={styles.headerProfileImage}
            resizeMode="contain"
          />
        </View>
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
            <TouchableOpacity onPress={() => navigation.navigate('MaintenanceDetail')}>
              <MaintenanceGauge 
                label="Oil Service" 
                currentValue={oilProgress} 
                maxValue={oilInterval}
                size={110}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('MaintenanceDetail')}>
              <MaintenanceGauge 
                label={mostUrgent.label} 
                currentValue={mostUrgent.progress} 
                maxValue={mostUrgent.intervalKm}
                size={110}
              />
            </TouchableOpacity>
          </View>
        </GlassCard>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[styles.tcoCardContainer, { marginTop: spacing.md }]} 
          onPress={() => navigation.navigate('AddExpense', { initialCategory: 'fuel' })}
        >
          <LinearGradient
            colors={['#3a3a3a', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statGradientCard}
          >
            <StatItem 
              label="Carburant" 
              value={consumptionVal ? `${consumptionVal} l/100km` : '--.- l/100km'} 
              subValue={`${expenses.filter(e => e.category === 'fuel').length} Pleins`}
              icon={Fuel} 
              color="#AAA"
            />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.tcoCardContainer} 
            onPress={() => navigation.navigate('EditProfile')}
          >
            <LinearGradient
              colors={['#3a3a3a', '#1a1a1a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradientCard}
            >
              <StatItem 
                label="Assurance" 
                value={`${profile.insuranceCost.toLocaleString()} € / an`} 
                icon={Shield} 
                color="#AAA"
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.tcoCardContainer} 
            onPress={navigateToStats}
          >
            <LinearGradient
              colors={['#4a0e0e', '#1a0505']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tcoCard}
            >
              <View>
                <Text style={styles.tcoLabel}>Budget prévisionnel (Mois Prochain)</Text>
                <Text style={styles.tcoValue}>{nextMonthBudget.toLocaleString()} €</Text>
              </View>
              <Text style={styles.tcoSubText}>Détails {'>'}</Text>
            </LinearGradient>
          </TouchableOpacity>
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

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {LEGAL_TEXTS.disclaimer}
          </Text>
        </View>

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerProfileImage: {
    width: 80,
    height: 40,
    opacity: 0.8,
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
    marginTop: spacing.sm,
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
    paddingRight: spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subValueBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subValueText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
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
  statGradientCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerContainer: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    opacity: 0.7,
  },
  disclaimerText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
});
