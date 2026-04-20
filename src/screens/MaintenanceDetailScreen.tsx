import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Platform
} from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { ChevronLeft, Phone, AlertTriangle, CheckCircle2, Info, Wrench, RefreshCcw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getMaintenanceSchema, getEngineType } from '../utils/maintenanceSchema';
import { ENGINE_TYPE_LABELS, LEGAL_TEXTS } from '../config/vehicleConfig';
import { LinearGradient } from 'expo-linear-gradient';

export default function MaintenanceDetailScreen() {
  const navigation = useNavigation<any>();
  const profile = useVehicleStore((state) => state.profile);
  const expenses = useVehicleStore((state) => state.expenses);

  if (!profile) return null;

  const currentMileage = profile.mileage;
  const SCHEMA = getMaintenanceSchema(profile.model);
  const engineType = getEngineType(profile.model);

  // Base commune : km parcourus depuis la dernière sauvegarde du profil
  const baseMileage = profile.profileLastSavedMileage || currentMileage;
  const drivenSinceSave = Math.max(0, currentMileage - baseMileage);

  const maintenanceStatus = SCHEMA.map(item => {
    const initialWear = profile.initialWearKm?.[item.id] || 0;
    const usage = initialWear + drivenSinceSave;
    
    let percentage = 0;
    let remaining = 0;

    if (item.intervalKm) {
      percentage = (usage / item.intervalKm) * 100;
      remaining = item.intervalKm - usage;
    }

    return {
      ...item,
      percentage,
      remaining,
      status: percentage > 90 ? 'critical' : percentage > 70 ? 'warning' : 'ok'
    };
  });

  const categories = {
    maintenance: maintenanceStatus.filter(i => i.category === 'maintenance'),
    safety: maintenanceStatus.filter(i => i.category === 'safety'),
    other: maintenanceStatus.filter(i => i.category === 'other'),
  };

  const handleCall = () => {
    if (profile.garage?.phone) {
      Linking.openURL(`tel:${profile.garage.phone}`);
    } else {
      navigation.navigate('MyGarage');
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'critical') return <AlertTriangle size={18} color={colors.error} />;
    if (status === 'warning') return <AlertTriangle size={18} color={colors.warning} />;
    return <CheckCircle2 size={18} color={colors.success} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Entretien du véhicule</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.engineNotice}>
          <Info size={20} color={colors.primary} />
          <Text style={styles.engineNoticeText}>
            Planning optimisé pour moteur <Text style={{fontWeight: '700'}}>{ENGINE_TYPE_LABELS[engineType]}</Text>.
          </Text>
        </View>

        {Object.entries(categories).map(([catKey, items]) => (
          <React.Fragment key={catKey}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {catKey === 'maintenance' ? 'ENTRETIEN MÉCANIQUE' : catKey === 'safety' ? 'SÉCURITÉ & LIAISON SOL' : 'AUTRES'}
              </Text>
              
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  <View style={styles.cardWrapper}>
                    <LinearGradient
                      colors={['#2a2a2a', '#1a1a1a']}
                      style={styles.card}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemLabel}>{item.label}</Text>
                          <StatusIcon status={item.status} />
                        </View>
                        <Text style={styles.itemDetail}>{item.detail}</Text>
                        <View style={styles.costBadge}>
                          <Text style={styles.costLabel}>BUDGET ESTIMÉ : </Text>
                          <Text style={styles.costValue}>{item.estimatedCost}</Text>
                        </View>
                      </View>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                          <View 
                            style={[
                              styles.progressBarFill, 
                              { 
                                width: `${Math.min(100, item.percentage)}%`,
                                backgroundColor: item.status === 'critical' ? colors.error : item.status === 'warning' ? colors.warning : colors.primary
                              }
                            ]} 
                          />
                        </View>
                        <View style={styles.progressLabelRow}>
                          <Text style={styles.progressText}>
                            {item.intervalKm ? `${item.remaining.toLocaleString()} km restants` : 'Basé sur le temps'}
                          </Text>
                          <Text style={styles.intervalText}>Intervalle : {item.intervalKm?.toLocaleString()} km</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </React.Fragment>
        ))}

        <View style={styles.garageCTA}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.ctaCard}
          >
            <View style={styles.ctaHeader}>
              <Wrench color="#FFF" size={24} />
              <Text style={styles.ctaTitle}>Besoin d'un entretien ?</Text>
            </View>
            <Text style={styles.ctaSubtitle}>
              {profile.garage 
                ? `Prenez rendez-vous chez ${profile.garage.name}` 
                : "Enregistrez votre garage habituel pour le contacter en un clic."}
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={handleCall}>
              <Phone size={20} color={colors.primary} />
              <Text style={styles.ctaButtonText}>
                {profile.garage ? "Appeler mon garage" : "Ajouter mon garage"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => navigation.navigate('Onboarding', { startStep: 2 })}
          activeOpacity={0.85}
        >
          <RefreshCcw size={18} color={colors.primary} />
          <Text style={styles.updateButtonText}>Mettre à jour mon carnet d'entretien</Text>
        </TouchableOpacity>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {LEGAL_TEXTS.maintenanceDisclaimer}
          </Text>
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
  scroll: {
    padding: spacing.xl,
  },
  engineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 178, 0.1)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  engineNoticeText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    letterSpacing: 2,
  },
  cardWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemDetail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  costLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  costValue: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  intervalText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  garageCTA: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  ctaCard: {
    borderRadius: 20,
    padding: spacing.xl,
  },
  ctaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  ctaTitle: {
    ...typography.h3,
    color: '#FFF',
  },
  ctaSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xl,
  },
  ctaButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  ctaButtonText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 102, 178, 0.08)',
  },
  updateButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  disclaimerContainer: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
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
