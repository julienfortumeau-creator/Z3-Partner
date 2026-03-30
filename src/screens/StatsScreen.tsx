import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { PieChart, LineChart } from 'react-native-gifted-charts';
import { TrendingUp, Wallet, Banknote, PieChart as PieIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const expenses = useVehicleStore((state) => state.expenses);
  const getTCO = useVehicleStore((state) => state.getTCO);

  // Group by category
  const data = [
    { value: expenses.filter(e => e.category === 'maintenance').reduce((s, e) => s + e.amount, 0), color: colors.primary, label: 'Entretien' },
    { value: expenses.filter(e => e.category === 'fuel').reduce((s, e) => s + e.amount, 0), color: colors.secondary, label: 'Carburant' },
    { value: expenses.filter(e => e.category === 'insurance').reduce((s, e) => s + e.amount, 0), color: colors.success, label: 'Assurance' },
    { value: expenses.filter(e => e.category === 'other').reduce((s, e) => s + e.amount, 0), color: colors.accent, label: 'Autre' },
  ];

  const pieData = data.map(item => ({
    value: item.value,
    color: item.color,
    text: `${Math.round((item.value / (getTCO() || 1)) * 100)}%`
  }));

  const lineData = [
    { value: 120, label: 'Jan' },
    { value: 80, label: 'Fév' },
    { value: 250, label: 'Mar' },
    { value: 180, label: 'Avr' },
    { value: 450, label: 'Mai' },
    { value: 300, label: 'Juin' },
  ];

  const StatSummary = ({ label, value, icon: Icon, color }: any) => (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={20} />
      </View>
      <View>
        <Text style={styles.summaryValue}>{value.toLocaleString()} €</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Analytique</Text>

        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <PieIcon size={20} color={colors.primary} />
            <Text style={styles.chartTitle}>Répartition des Dépenses</Text>
          </View>
          <View style={styles.pieContainer}>
            <PieChart
              data={pieData}
              donut
              radius={80}
              innerRadius={50}
              innerCircleColor={colors.card}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ ...typography.h3, color: colors.textPrimary }}>Total</Text>
                  <Text style={{ ...typography.bodySmall, color: colors.textSecondary }}>{(getTCO() - (useVehicleStore.getState().profile?.purchasePrice || 0)).toLocaleString()} €</Text>
                </View>
              )}
            />
            <View style={styles.legend}>
              {data.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={styles.chartTitle} >Évolution Mensuelle</Text>
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
              label="Prix de revient au km" 
              value={0.45} 
              icon={Wallet} 
              color={colors.secondary}
            />
          </GlassCard>
          <GlassCard style={styles.summaryCard}>
            <StatSummary 
              label="Budget Annuel Est." 
              value={3200} 
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
    marginBottom: spacing.xl,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
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
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
});
