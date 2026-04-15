import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { TrendingUp, Wallet, Banknote, PieChart as PieIcon, Navigation, Calendar, Droplets, Fuel } from 'lucide-react-native';
import { calculatePeriodStats, calculateBudgetForecast } from '../utils/mileageAnalytics';

const { width } = Dimensions.get('window');

type FilterType = 'month' | 'year' | 'all';

export default function StatsScreen() {
  const expenses = useVehicleStore((state) => state.expenses);
  const profile = useVehicleStore((state) => state.profile);
  const getTCO = useVehicleStore((state) => state.getTCO);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      if (filter === 'month') {
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      }
      if (filter === 'year') {
        return expDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [expenses, filter]);

  const totalFiltered = useMemo(() => 
    filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0), 
  [filteredExpenses]);

  // Group by category
  const data = useMemo(() => [
    { value: filteredExpenses.filter(e => e.category === 'maintenance').reduce((s, e) => s + e.amount, 0), color: colors.primary, label: 'Réparation' },
    { value: filteredExpenses.filter(e => e.category === 'aesthetic').reduce((s, e) => s + e.amount, 0), color: colors.success, label: 'Polish' },
    { value: filteredExpenses.filter(e => e.category === 'fuel').reduce((s, e) => s + e.amount, 0), color: colors.secondary, label: 'Carburant' },
    { value: filteredExpenses.filter(e => e.category === 'other').reduce((s, e) => s + e.amount, 0), color: colors.accent, label: 'Autre' },
  ], [filteredExpenses]);

  const pieData = useMemo(() => {
    const total = data.reduce((s, i) => s + i.value, 0);
    return data
      .filter(item => item.value > 0)
      .map(item => ({
        value: item.value,
        color: item.color,
        text: `${Math.round((item.value / (total || 1)) * 100)}%`
      }));
  }, [data]);

  const dynamicLineData = useMemo(() => {
    const months: { value: number, label: string }[] = [];
    const now = new Date();
    const count = filter === 'month' ? 6 : 12;

    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === m && expDate.getFullYear() === y;
      });

      const totalExp = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const insurance = (profile?.insuranceCost || 0) / 12;

      months.push({
        value: totalExp + insurance,
        label: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
      });
    }

    const data = months.reverse();
    // On ne considère le graphique "vide" que s'il n'y a AUCUNE dépense saisie sur la période
    const hasExpenses = expenses.some(exp => {
      const expDate = new Date(exp.date);
      const firstMonthDate = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
      return expDate >= firstMonthDate;
    });

    return { data, isEmpty: !hasExpenses && expenses.length === 0 };
  }, [expenses, profile, filter]);

  const { distanceInPeriod, costPerKm } = useMemo(() => {
    const mileages = filteredExpenses
      .filter(e => e.mileage !== undefined && e.mileage > 0)
      .map(e => e.mileage as number)
      .sort((a, b) => a - b);

    if (mileages.length < 2) return { distanceInPeriod: 0, costPerKm: null };

    const dist = mileages[mileages.length - 1] - mileages[0];
    if (dist <= 0) return { distanceInPeriod: 0, costPerKm: null };

    // Prorated insurance
    let insurance = 0;
    if (profile) {
      if (filter === 'month') insurance = profile.insuranceCost / 12;
      else if (filter === 'year') insurance = profile.insuranceCost;
      else {
        // For 'all', estimate years since acquisition
        const acq = new Date(profile.acquisitionDate);
        const now = new Date();
        const years = Math.max(1, now.getFullYear() - acq.getFullYear());
        insurance = profile.insuranceCost * years;
      }
    }

    const total = totalFiltered + insurance;
    return { distanceInPeriod: dist, costPerKm: (total / dist).toFixed(2) };
  }, [filteredExpenses, totalFiltered, filter, profile]);

  const mileageStats = useMemo(() => {
    return calculatePeriodStats(
      useVehicleStore.getState().trips, 
      filter, 
      profile?.acquisitionDate
    );
  }, [filter, profile]);

  const budgetForecast = useMemo(() => {
    return calculateBudgetForecast(
      useVehicleStore.getState().trips,
      profile!,
      expenses
    );
  }, [expenses, profile]);

  const StatSummary = ({ label, value, icon: Icon, color, isCurrency = true, customValue }: any) => (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={20} />
      </View>
      <View>
        <Text style={styles.summaryValue}>
          {customValue ? customValue : (isCurrency ? `${value.toLocaleString()} €` : value)}
        </Text>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    </View>
  );

  const FilterButton = ({ type, label }: { type: FilterType, label: string }) => (
    <TouchableOpacity 
      style={[styles.filterBtn, filter === type && styles.filterBtnActive]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.filterBtnText, filter === type && styles.filterBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Analytique</Text>

        <View style={styles.filterRow}>
          <FilterButton type="month" label="Mois" />
          <FilterButton type="year" label="Année" />
          <FilterButton type="all" label="Tout" />
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.tcoCardContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tcoCard}
          >
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <TrendingUp size={28} color="#FFF" />
              </View>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Coût au Kilomètre</Text>
                  <Text style={styles.statValue}>{costPerKm ? `${costPerKm} €/km` : "--"}</Text>
                </View>
                <View style={styles.subValueBadge}>
                  <Text style={styles.subValueText}>Sur {distanceInPeriod} km</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.mileageStatsRow}>
          <TouchableOpacity activeOpacity={0.9} style={styles.mileageCardContainer}>
            <LinearGradient
              colors={['#2c3e50', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mileageCard}
            >
              <View style={styles.statItem}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 152, 219, 0.2)' }]}>
                  <Navigation size={28} color={colors.primary} />
                </View>
                <View style={styles.statContent}>
                  <View>
                    <Text style={styles.statLabel}>Km Moyen ({filter === 'month' ? 'Mois' : (filter === 'year' ? 'Année' : 'Total')})</Text>
                    <Text style={styles.statValue}>{Math.round(mileageStats.periodTotal).toLocaleString()} km</Text>
                    <Text style={styles.miniSubValue}>≈ {mileageStats.dailyAverage.toFixed(1)} km / jour</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[styles.tcoCardContainer, { marginTop: spacing.md }]}>
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
          </LinearGradient>
        </View>

        <View style={styles.chartCardWrapper}>
          <LinearGradient
            colors={['#3a3a3a', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chartGradientCard}
          >
            <View style={styles.chartHeader}>
              <PieIcon size={20} color="#FFF" />
              <Text style={styles.chartTitle}>Répartition des Dépenses</Text>
            </View>
          
          {pieData.length > 0 ? (
            <View style={styles.pieContainer}>
              <PieChart
                data={pieData}
                donut
                radius={80}
                innerRadius={50}
                innerCircleColor={colors.card}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ ...typography.h3, color: colors.textPrimary, fontSize: 16 }}>
                      {totalFiltered.toLocaleString()}€
                    </Text>
                    <Text style={{ ...typography.bodySmall, color: colors.textSecondary, fontSize: 10 }}>Total</Text>
                  </View>
                )}
              />
              <View style={styles.legend}>
                {data.filter(i => i.value > 0).map((item, index) => (
                  <View 
                    {...({ key: `stat-legend-${index}` } as any)}
                    style={styles.legendItem}
                  >
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune donnée pour cette période</Text>
            </View>
          )}
          </LinearGradient>
        </View>

        <View style={styles.chartCardWrapper}>
          <LinearGradient
            colors={['#3a3a3a', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chartGradientCard}
          >
            <View style={styles.chartHeader}>
              <TrendingUp size={20} color={colors.success} />
              <Text style={styles.chartTitle}>Évolution</Text>
            </View>
          {dynamicLineData.isEmpty ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>En attente de vos premières dépenses</Text>
            </View>
          ) : (
            <LineChart
              data={dynamicLineData.data}
              height={150}
              width={width - 80}
              color={colors.primary}
              thickness={3}
              startFillColor="rgba(0, 102, 178, 0.3)"
              endFillColor="rgba(0, 102, 178, 0.01)"
              startOpacity={0.4}
              endOpacity={0.1}
              noOfSections={3}
              yAxisColor={colors.border}
              xAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#FFF', fontSize: 10, fontWeight: '600' }}
              rulesColor="rgba(255, 255, 255, 0.1)"
              rulesType="solid"
              hideDataPoints={false}
              dataPointsColor={colors.primary}
            />
          )}
          </LinearGradient>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCardWrapper}>
            <LinearGradient
              colors={['#3a3a3a', '#1a1a1a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryGradientCard}
            >
              <StatSummary 
                label={filter === 'year' ? "Budget Moyen / An" : "Budget Moyen / Mois"} 
                value={filter === 'year' ? totalFiltered : Math.round(totalFiltered / 12)} 
                icon={Wallet} 
                color={colors.secondary}
              />
            </LinearGradient>
          </View>
          <View style={styles.summaryCardWrapper}>
            <LinearGradient
              colors={['#3a3a3a', '#1a1a1a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryGradientCard}
            >
              <StatSummary 
                label={filter === 'year' ? "Assurance / An" : "Assurance / Mois"} 
                value={filter === 'year' ? (profile?.insuranceCost || 0) : Math.round((profile?.insuranceCost || 0) / 12)} 
                icon={Banknote} 
                color={colors.warning}
              />
            </LinearGradient>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.forecastCardContainer}>
          <LinearGradient
            colors={['#4a0e0e', '#1a0505']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.forecastCard}
          >
            <View style={styles.forecastHeader}>
              <Calendar size={20} color={colors.error} />
              <Text style={styles.forecastTitle}>Prévision Budget (1 an)</Text>
            </View>
            
            <View style={styles.forecastMain}>
              <Text style={styles.forecastTotalLabel}>Total Estimé</Text>
              <Text style={styles.forecastTotalValue}>{budgetForecast.total.toLocaleString()} €</Text>
            </View>

            <View style={styles.forecastDivider} />

            <View style={styles.forecastGrid}>
              <View style={styles.forecastRow}>
                <Droplets size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.forecastLabel}>Maintenance</Text>
                <Text style={styles.forecastValue}>{budgetForecast.maintenance.toLocaleString()} €</Text>
              </View>
              <View style={styles.forecastRow}>
                <Fuel size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.forecastLabel}>Carburant</Text>
                <Text style={styles.forecastValue}>{budgetForecast.fuel.toLocaleString()} €</Text>
              </View>
              <View style={styles.forecastRow}>
                <Shield size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.forecastLabel}>Assurance</Text>
                <Text style={styles.forecastValue}>{budgetForecast.insurance.toLocaleString()} €</Text>
              </View>
            </View>
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
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHighlight,
    padding: 4,
    borderRadius: 12,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterBtnTextActive: {
    color: '#FFF',
  },
  chartCardWrapper: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  chartGradientCard: {
    padding: spacing.md,
  },
  tcoCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  tcoCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  subValueBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  subValueText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  mileageStatsRow: {
    marginTop: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mileageCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  mileageCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  miniSubValue: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    fontWeight: '600',
  },
  forecastCardContainer: {
    marginBottom: spacing.xxl,
    borderRadius: 20,
    overflow: 'hidden',
  },
  forecastCard: {
    padding: spacing.lg,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  forecastTitle: {
    ...typography.h3,
    color: '#FFF',
  },
  forecastMain: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  forecastTotalLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  forecastTotalValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  forecastDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.lg,
  },
  forecastGrid: {
    gap: spacing.md,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  forecastLabel: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  forecastValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chartTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  legend: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  summaryCardWrapper: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryGradientCard: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
});
