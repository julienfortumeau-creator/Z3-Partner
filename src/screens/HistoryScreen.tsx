import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useVehicleStore, Expense } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { Wrench, Fuel, Shield, Plus, MoreHorizontal } from 'lucide-react-native';

export default function HistoryScreen() {
  const expenses = useVehicleStore((state) => state.expenses);

  const getIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return <Wrench size={20} color={colors.primary} />;
      case 'fuel': return <Fuel size={20} color={colors.secondary} />;
      case 'insurance': return <Shield size={20} color={colors.success} />;
      default: return <MoreHorizontal size={20} color={colors.textSecondary} />;
    }
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.itemWrapper}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.iconContainer}>
            {getIcon(item.category)}
          </View>
          <View style={styles.info}>
            <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>
          <Text style={styles.itemAmount}>{item.amount.toLocaleString()} €</Text>
        </View>
      </GlassCard>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Historique</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus color={colors.textPrimary} size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun frais enregistré</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  itemWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: spacing.md,
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: -5,
  },
  itemCard: {
    flex: 1,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  emptyText: {
    color: colors.textSecondary,
    ...typography.body,
  },
});
