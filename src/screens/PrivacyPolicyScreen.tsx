import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { LEGAL_TEXTS } from '../config/vehicleConfig';
import { GlassCard } from '../components/common/GlassCard';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Confidentialité</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GlassCard variant="glass" style={styles.card}>
          <Text style={styles.date}>Dernière mise à jour : 15 avril 2026</Text>
          
          <Text style={styles.sectionTitle}>Engagement</Text>
          <Text style={styles.paragraph}>
            {LEGAL_TEXTS.privacyIntro}
          </Text>

          <Text style={styles.sectionTitle}>1. Données Collectées Localement</Text>
          <Text style={styles.paragraph}>
            {LEGAL_TEXTS.privacyStorage}
          </Text>

          <Text style={styles.sectionTitle}>2. Données de Localisation (GPS)</Text>
          <Text style={styles.paragraph}>
            L'application utilise les services de localisation de votre appareil pour :{"\n"}
            • Détecter automatiquement vos trajets et calculer la distance parcourue.{"\n"}
            • Vous suggérer des mises à jour de kilométrage après un trajet.
          </Text>
          <Text style={styles.paragraph}>
            Le suivi en arrière-plan est activé uniquement si vous donnez votre consentement explicite. Les données de localisation sont traitées localement et ne sont pas transmises à des serveurs tiers.
          </Text>

          <Text style={styles.sectionTitle}>3. Utilisation de l'Appareil Photo</Text>
          <Text style={styles.paragraph}>
            L'accès à l'appareil photo est demandé pour vous permettre de scanner vos factures et reçus d'entretien. Les images capturées restent sur votre appareil.
          </Text>

          <Text style={styles.sectionTitle}>4. Partage des Données</Text>
          <Text style={styles.paragraph}>
            Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers. Les données ne quittent votre appareil que lorsque vous décidez explicitement d'exporter une sauvegarde ou de générer un rapport PDF.
          </Text>

          <Text style={styles.sectionTitle}>5. Vos Droits</Text>
          <Text style={styles.paragraph}>
            Puisque toutes les données sont stockées localement, vous avez le contrôle total sur celles-ci. Vous pouvez supprimer toutes vos données en désinstallant l'application.
          </Text>
        </GlassCard>
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
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  card: {
    padding: spacing.lg,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
