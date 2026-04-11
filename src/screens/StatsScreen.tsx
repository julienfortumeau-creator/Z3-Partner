import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { TrendingUp, Wallet, Banknote, PieChart as PieIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type FilterType = 'month' | 'year' | 'all';

export default function StatsScreen() {
  const expenses = useVehicleStore((state) => state.expenses);
  const profile = useVehicleStore((state) => state.profile);
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

  const lineData = [
    { value: 120, label: 'Jan' },
    { value: 80, label: 'Fév' },
    { value: 250, label: 'Mar' },
    { value: 180, label: 'Avr' },
    { value: 450, label: 'Mai' },
    { value: 300, label: 'Juin' },
  ];

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

        <GlassCard style={styles.highlightCard}>
          <StatSummary 
            label="Coût au Kilomètre" 
            customValue={costPerKm ? `${costPerKm} €/km` : "--"}
            icon={TrendingUp} 
            color={colors.success}
          />
        </GlassCard>

        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <PieIcon size={20} color={colors.primary} />
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
        </GlassCard>

        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={styles.chartTitle}>Évolution</Text>
          </View>
          <LineChart
            data={lineData}
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
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            rulesColor={colors.border}
            rulesType="solid"
            hideDataPoints={false}
            dataPointsColor={colors.primary}
          />
        </GlassCard>

        <View style={styles.summaryGrid}>
          <GlassCard style={styles.summaryCard}>
            <StatSummary 
              label={filter === 'year' ? "Budget Moyen / An" : "Budget Moyen / Mois"} 
              value={filter === 'year' ? totalFiltered : Math.round(totalFiltered / 12)} 
              icon={Wallet} 
              color={colors.secondary}
            />
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <StatSummary 
              label={filter === 'year' ? "Assurance / An" : "Assurance / Mois"} 
              value={filter === 'year' ? (profile?.insuranceCost || 0) : Math.round((profile?.insuranceCost || 0) / 12)} 
              icon={Banknote} 
              color={colors.warning}
            />
          </GlassCard>
        </View>

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
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  highlightCard: {
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderColor: colors.success + '40',
    borderWidth: 1,
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
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2, // Accounting for 1 gap in 2 columns
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
