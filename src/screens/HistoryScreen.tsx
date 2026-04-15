import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicleStore, Expense } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Wrench, Fuel, Sparkles, Plus, MoreHorizontal, Clock, ArrowRight } from 'lucide-react-native';
import { getMaintenanceSchema } from '../utils/maintenanceSchema';
import { calculateGlobalDailyAverage } from '../utils/mileageAnalytics';

type TimelineItem = {
  id: string;
  type: 'past' | 'today' | 'future' | 'empty_cta';
  date: string;
  label: string;
  category: string;
  amount?: number;
  remainingKm?: number;
  originalExpense?: Expense;
};

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const expenses = useVehicleStore((state) => state.expenses);
  const profile = useVehicleStore((state) => state.profile);

  if (!profile) return null;

  const timelineData = useMemo(() => {
    const now = new Date();
    const items: TimelineItem[] = [];

    // 1. Ajouter le passé
    expenses.forEach(exp => {
      items.push({
        id: exp.id,
        type: 'past',
        date: exp.date,
        label: exp.label,
        category: exp.category,
        amount: exp.amount,
        originalExpense: exp,
      });
    });

    // 2. Ajouter "Aujourd'hui"
    items.push({
      id: 'today',
      type: 'today',
      date: now.toISOString(),
      label: 'Aujourd\'hui',
      category: 'status',
    });

    // 3. Ajouter le futur
    const dailyAvg = calculateGlobalDailyAverage(useVehicleStore.getState().trips, profile);
    
    schema.forEach(item => {
      if (!item.intervalKm) return;
      const initialWear = profile.initialWearKm?.[item.id] || 0;
      const effectiveMileage = currentMileage + initialWear;
      const progress = effectiveMileage % item.intervalKm;
      const remainingKm = item.intervalKm - progress;
      
      const daysRemaining = Math.max(0, Math.round(remainingKm / dailyAvg));
      const estimatedDate = new Date();
      estimatedDate.setDate(now.getDate() + daysRemaining);

      items.push({
        id: `future-${item.id}`,
        type: 'future',
        date: estimatedDate.toISOString(),
        label: item.label,
        category: item.category,
        remainingKm,
      });
    });

    // Trier : Vieux -> Aujourd'hui -> Futur
    const sorted = items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 4. Si pas d'entretiens passés, ajouter un CTA spécial juste avant "Aujourd'hui"
    if (expenses.length === 0) {
      const todayIndex = sorted.findIndex(i => i.id === 'today');
      sorted.splice(todayIndex, 0, {
        id: 'empty_cta',
        type: 'empty_cta',
        date: new Date(now.getTime() - 1000).toISOString(), // Juste avant aujourd'hui
        label: 'Ajouter',
        category: 'action',
      });
    }

    return sorted;
  }, [expenses, profile]);

  const openAddModal = () => {
    navigation.navigate('AddExpense');
  };

  const handleItemPress = (item: TimelineItem) => {
    if (item.type === 'past' && item.originalExpense) {
      navigation.navigate('AddExpense', { expense: item.originalExpense });
    } else if (item.type === 'empty_cta') {
      openAddModal();
    } else if (item.type === 'future') {
      navigation.navigate('MaintenanceDetail');
    }
  };

  const getIcon = (item: TimelineItem, isFuture: boolean, isSolidBg: boolean) => {
    if (item.type === 'today') return <Clock size={18} color="#FFF" />;
    if (item.type === 'empty_cta') return <Plus size={18} color="#FFF" />;
    
    const solidColor = '#FFF';
    
    switch (item.category) {
      case 'maintenance': return <Wrench size={18} color={isFuture ? colors.textMuted : solidColor} />;
      case 'fuel': return <Fuel size={18} color={isFuture ? colors.textMuted : solidColor} />;
      case 'aesthetic': return <Sparkles size={18} color={isFuture ? colors.textMuted : solidColor} />;
      default: return <MoreHorizontal size={18} color={isFuture ? colors.textMuted : solidColor} />;
    }
  };

  const getCategoryColor = (cat: string, type: string) => {
    if (type === 'future') return colors.textMuted;
    if (type === 'empty_cta') return colors.primary;
    switch (cat) {
      case 'maintenance': return colors.primary;
      case 'fuel': return colors.secondary;
      case 'aesthetic': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'maintenance': return 'Réparation';
      case 'fuel': return 'Carburant';
      case 'aesthetic': return 'Polish';
      case 'status': return 'Votre Z3';
      case 'action': return 'Commencer';
      default: return 'Autre';
    }
  };

  const renderItem = ({ item, index }: { item: TimelineItem; index: number }) => {
    const isFuture = item.type === 'future';
    const isToday = item.type === 'today';
    const isEmptyCta = item.type === 'empty_cta';

    const dateObj = new Date(item.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '');
    
    const isSolidBg = !isFuture;

    const cardContent = (
      <View style={styles.itemHeader}>
        <View style={[
          styles.iconBox, 
          isFuture && { backgroundColor: getCategoryColor(item.category, item.type) + '10' },
          isSolidBg && { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
        ]}>
          {getIcon(item, isFuture, isSolidBg)}
        </View>
        <View style={styles.itemContent}>
          <Text style={[
            styles.itemLabel, 
            isFuture && styles.futureText, 
            isSolidBg && {color: '#FFF'}
          ]} numberOfLines={1}>
            {item.label}
          </Text>
          <Text style={[
            styles.itemCategory, 
            isFuture && styles.futureText,
            isSolidBg && {color: 'rgba(255, 255, 255, 0.7)'}
          ]}>
            {isFuture ? `Dans ${item.remainingKm?.toLocaleString()} km` : getCategoryLabel(item.category)}
          </Text>
        </View>
        {item.amount && (
          <Text style={[styles.itemAmount, isSolidBg && {color: '#FFF'}]}>{item.amount.toLocaleString()} €</Text>
        )}
        {(isFuture || isEmptyCta) && (
          <ArrowRight size={16} color={isSolidBg ? '#FFF' : colors.textMuted} />
        )}
      </View>
    );

    return (
      <View style={[styles.itemWrapper, isToday && styles.todayWrapper]}>
        <View style={styles.timelineContainer}>
          <View style={[
            styles.dateBox, 
            isFuture && styles.futureDateBox, 
            isToday && styles.todayBox,
            isEmptyCta && styles.emptyCtaBox
          ]}>
            <Text style={[
              styles.dateDay, 
              isFuture && styles.futureText, 
              (isToday || isEmptyCta) && {color: '#FFF'}
            ]}>
              {isEmptyCta ? '?' : day}
            </Text>
            <Text style={[
              styles.dateMonth, 
              isFuture && styles.futureText, 
              (isToday || isEmptyCta) && {color: '#FFF'}
            ]}>
              {isEmptyCta ? 'NEW' : month}
            </Text>
          </View>
          <View style={[
            styles.timelineLine, 
            index === timelineData.length - 1 && { backgroundColor: 'transparent' }
          ]} />
        </View>

        <TouchableOpacity 
          style={styles.cardContainer} 
          onPress={() => handleItemPress(item)}
          disabled={!item.originalExpense && !isEmptyCta && !isFuture}
          activeOpacity={0.7}
        >
          {isFuture ? (
            <View style={[styles.itemCard, styles.futureCard]}>
              {cardContent}
            </View>
          ) : (
            <LinearGradient
              colors={
                isToday 
                  ? [colors.primary, colors.primaryDark]
                  : isEmptyCta
                    ? [colors.secondary, '#004A7F']
                    : ['#3a3a3a', '#1a1a1a']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.itemCard, styles.gradientCard]}
            >
              {cardContent}
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    );

  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Entretien</Text>
            <Text style={styles.subtitle}>Passé & Futur de votre Z3</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus color="#FFF" size={28} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={timelineData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={Math.max(0, timelineData.findIndex(i => i.id === 'today'))}
          getItemLayout={(_, index) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
          onScrollToIndexFailed={() => {}}
        />
      </SafeAreaView>
    </>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemWrapper: {
    flexDirection: 'row',
    minHeight: 100,
  },
  todayWrapper: {
    marginVertical: spacing.md,
  },
  timelineContainer: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighlight,
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 2,
  },
  futureDateBox: {
    opacity: 0.5,
    borderStyle: 'dashed',
  },
  todayBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyCtaBox: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  futureText: {
    color: colors.textMuted,
  },
  timelineLine: {
    position: 'absolute',
    top: 50,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  cardContainer: {
    flex: 1,
    paddingBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  itemCard: {
    padding: spacing.md,
    borderRadius: 20,
  },
  gradientCard: {
    overflow: 'hidden',
  },
  futureCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
