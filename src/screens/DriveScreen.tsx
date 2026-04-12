import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicleStore, Trip } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { Plus, Clock, ArrowUpRight, Navigation, Calendar } from 'lucide-react-native';

type TimelineItem = {
  id: string;
  type: 'past' | 'today' | 'future';
  date: string;
  label: string;
  distance?: number;
  mileageAtEnd?: number;
};

export default function DriveScreen() {
  const navigation = useNavigation<any>();
  const trips = useVehicleStore((state) => state.trips);
  const profile = useVehicleStore((state) => state.profile);

  if (!profile) return null;

  const timelineData = useMemo(() => {
    const now = new Date();
    const items: TimelineItem[] = [];

    // 1. Past trips
    trips.forEach(trip => {
      items.push({
        id: trip.id,
        type: 'past',
        date: trip.date,
        label: trip.label,
        distance: trip.distance,
        mileageAtEnd: trip.mileageAtEnd,
      });
    });

    // 2. Today (Current Progress)
    items.push({
      id: 'today',
      type: 'today',
      date: now.toISOString(),
      label: 'Aujourd\'hui',
    });

    // Simple sort: older to newer for timeline
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [trips]);

  const openAddMileage = () => {
    navigation.navigate('AddMileage');
  };

  const renderItem = ({ item, index }: { item: TimelineItem; index: number }) => {
    const isToday = item.type === 'today';
    const isPast = item.type === 'past';

    const dateObj = new Date(item.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase().replace('.', '');
    
    return (
      <View style={[styles.itemWrapper, isToday && styles.todayWrapper]}>
        <View style={styles.timelineContainer}>
          <View style={[
            styles.dateBox, 
            isToday && styles.todayBox,
          ]}>
            <Text style={[
              styles.dateDay, 
              isToday && {color: '#FFF'}
            ]}>
              {day}
            </Text>
            <Text style={[
              styles.dateMonth, 
              isToday && {color: '#FFF'}
            ]}>
              {month}
            </Text>
          </View>
          <View style={[
            styles.timelineLine, 
            index === timelineData.length - 1 && { backgroundColor: 'transparent' }
          ]} />
        </View>

        <View style={styles.cardContainer}>
          <GlassCard 
            style={StyleSheet.flatten([
              styles.itemCard, 
              isToday && styles.todayCard,
            ])} 
            variant={isToday ? 'surface' : 'glass'}
          >
            <View style={styles.itemHeader}>
              <View style={[
                styles.iconBox, 
                { backgroundColor: (isToday ? colors.primary : colors.secondary) + '15' }
              ]}>
                {isToday ? <Navigation size={18} color={colors.primary} /> : <ArrowUpRight size={18} color={colors.secondary} />}
              </View>
              <View style={styles.itemContent}>
                <Text style={[
                  styles.itemLabel, 
                  isToday && {color: '#FFF'}
                ]} numberOfLines={1}>
                  {item.label}
                </Text>
                
                {isToday ? (
                  <Text style={[styles.itemDetail, { color: 'rgba(255,255,255,0.7)' }]}>
                    Kilométrage actuel : <Text style={{fontWeight: '800'}}>{profile.mileage.toLocaleString()}</Text> km
                  </Text>
                ) : (
                  <Text style={styles.itemDetail}>
                    Trajet de <Text style={{fontWeight: '700', color: colors.textPrimary}}>{item.distance}</Text> km
                  </Text>
                )}
              </View>
              
              {isPast && (
                <View style={styles.mileageBadge}>
                  <Text style={styles.badgeText}>{item.mileageAtEnd?.toLocaleString()}</Text>
                </View>
              )}
            </View>
          </GlassCard>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Drive</Text>
          <Text style={styles.subtitle}>Suivi de pilotage</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddMileage}>
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
  todayBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  },
  todayCard: {
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    borderColor: colors.primary,
    borderWidth: 1,
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
  itemDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mileageBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
