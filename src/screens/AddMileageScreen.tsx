import React, { useState, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  FlatList,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { ChevronLeft, Save, Gauge, Navigation } from 'lucide-react-native';
import { PremiumButton } from '../components/common/PremiumButton';
import { GlassCard } from '../components/common/GlassCard';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 80;
const VISIBLE_ITEMS = 5;

export default function AddMileageScreen() {
  const navigation = useNavigation<any>();
  const { profile, addTrip } = useVehicleStore();
  const [distance, setDistance] = useState(0);
  
  // Array of numbers for the scroller (ex: 0 to 500 km)
  const numbers = useMemo(() => Array.from({ length: 101 }, (_, i) => i * 5), []); // 0, 5, 10, ..., 500

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / ITEM_WIDTH);
    if (numbers[index] !== undefined) {
      setDistance(numbers[index]);
    }
  };

  const handleSave = () => {
    if (distance === 0) return;
    
    if (profile) {
      addTrip({
        date: new Date().toISOString(),
        distance,
        mileageAtEnd: profile.mileage + distance,
        label: `Trajet du ${new Date().toLocaleDateString('fr-FR')}`,
      });
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Ajouter des KM</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.currentSection}>
          <Text style={styles.sectionLabel}>KILOMÉTRAGE ACTUEL</Text>
          <Text style={styles.currentMileage}>
            {profile?.mileage.toLocaleString()} <Text style={styles.unit}>KM</Text>
          </Text>
        </View>

        <GlassCard style={styles.scrollerCard} variant="glass">
          <Text style={styles.scrollerLabel}>DISTANCE PARCOURUE</Text>
          
          <View style={styles.distanceDisplay}>
            <Text style={styles.plusSign}>+</Text>
            <Text style={styles.distanceValue}>{distance}</Text>
            <Text style={styles.distanceUnit}>KM</Text>
          </View>

          <View style={styles.scrollerContainer}>
            <View style={styles.centerIndicator} />
            <FlatList
              data={numbers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.toString()}
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              onScroll={handleScroll}
              contentContainerStyle={{
                paddingHorizontal: (width - ITEM_WIDTH - spacing.xl * 4) / 2
              }}
              renderItem={({ item }) => (
                <View style={styles.numberItem}>
                  <Text style={[
                     styles.numberText,
                     distance === item && styles.activeNumberText
                  ]}>
                    {item}
                  </Text>
                  <View style={[
                    styles.tick,
                    distance === item && styles.activeTick
                  ]} />
                </View>
              )}
            />
          </View>
        </GlassCard>

        <View style={styles.resultSection}>
          <View style={styles.resultRow}>
            <Navigation size={20} color={colors.textSecondary} />
            <Text style={styles.resultLabel}>NOUVEAU COMPTEUR</Text>
          </View>
          <Text style={styles.resultValue}>
            {( (profile?.mileage || 0) + distance).toLocaleString()} km
          </Text>
        </View>

        <PremiumButton 
          title="Enregistrer" 
          onPress={handleSave}
          disabled={distance === 0}
          style={styles.saveButton}
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
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: 40,
  },
  currentSection: {
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  currentMileage: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  unit: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollerCard: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  scrollerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  distanceDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  plusSign: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.success,
    marginRight: 4,
  },
  distanceValue: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.textPrimary,
    lineHeight: 64,
  },
  distanceUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
    marginLeft: 8,
  },
  scrollerContainer: {
    height: 80,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  centerIndicator: {
    position: 'absolute',
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 2,
    zIndex: 10,
  },
  numberItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 8,
  },
  activeNumberText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  tick: {
    width: 2,
    height: 10,
    backgroundColor: colors.border,
  },
  activeTick: {
    backgroundColor: colors.primary,
    height: 20,
  },
  resultSection: {
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    padding: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  saveButton: {
    width: '100%',
  },
});
