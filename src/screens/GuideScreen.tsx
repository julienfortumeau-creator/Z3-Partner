import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Fuel, Banknote, Navigation, Calendar, Bell, FileText, ShieldCheck, TrendingUp, Info } from 'lucide-react-native';

export default function GuideScreen() {
  const navigation = useNavigation();

  const GuideSection = ({ title, icon: Icon, children, color = colors.primary }: any) => (
    <View style={styles.sectionWrapper}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <Icon color={color} size={22} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.contentCard}>
        <LinearGradient
          colors={['#3a3a3a', '#1a1a1a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {children}
        </LinearGradient>
      </View>
    </View>
  );

  const GuideText = ({ children, bold }: { children: React.ReactNode, bold?: boolean }) => (
    <Text style={[styles.guideText, bold && styles.boldText]}>{children}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Guide du Copilot</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Info size={32} color={colors.primary} />
          <Text style={styles.introText}>
            Bienvenue dans votre manuel utilisateur. Voici comment Z3 Copilot analyse vos données pour vous aider à gérer votre Roadster.
          </Text>
        </View>

        <GuideSection title="Calcul du Carburant" icon={Fuel} color={colors.secondary}>
          <GuideText>
            La consommation moyenne est calculée selon la méthode du <GuideText bold>plein à plein</GuideText>.
          </GuideText>
          <GuideText>
            L'application compare les litres ajoutés lors de votre dernier plein avec la distance parcourue depuis le plein précédent. C'est la méthode la plus fiable, bien plus précise que l'ordinateur de bord d'époque.
          </GuideText>
        </GuideSection>

        <GuideSection title="Total Cost of Ownership (TCO)" icon={Banknote} color={colors.success}>
          <GuideText>
            Le <GuideText bold>TCO</GuideText> représente le coût de revient total de votre véhicule depuis son acquisition.
          </GuideText>
          <GuideText>
            Il additionne : Prix d'achat + Total des entretiens + Carburant + Assurance. C'est l'indicateur ultime pour connaître le coût réel de votre passion.
          </GuideText>
        </GuideSection>

        <GuideSection title="Prévisions Budgétaires" icon={Calendar} color={colors.warning}>
          <GuideText>
            Le Copilot projette vos dépenses futures sur 1 ou 12 mois en combinant :
          </GuideText>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Votre kilométrage journalier moyen.</Text>
            <Text style={styles.bullet}>• L'usure théorique des pièces de maintenance.</Text>
            <Text style={styles.bullet}>• Le prix moyen du carburant de vos derniers passages à la pompe.</Text>
          </View>
        </GuideSection>

        <GuideSection title="Suivi Automatique (GPS)" icon={Navigation} color={colors.primary}>
          <GuideText>
            Si l'option <GuideText bold>Auto-Log</GuideText> est activée, l'application utilise les services de localisation en arrière-plan pour détecter vos trajets.
          </GuideText>
          <GuideText>
            Le système est optimisé pour ne pas vider votre batterie : il s'active uniquement lors de mouvements significatifs et s'arrête dès que vous stationnez.
          </GuideText>
        </GuideSection>

        <GuideSection title="Alertes Maintenance" icon={Bell} color={colors.error}>
          <GuideText>
            Les échéances (Oil Service, Inspection, Freins, etc.) sont surveillées en temps réel.
          </GuideText>
          <GuideText>
            Dès qu'une pièce approche de sa limite d'usure ou de sa date d'échéance, une alerte s'affiche sur votre cockpit. Pensez à mettre à jour votre kilométrage régulièrement !
          </GuideText>
        </GuideSection>

        <GuideSection title="Exports & Rapports" icon={FileText} color={colors.textPrimary}>
          <GuideText>
            <GuideText bold>Rapport PDF</GuideText> : Génère un carnet d'entretien numérique complet et élégant, idéal pour valoriser votre Z3 lors d'une expertise ou d'une revente.
          </GuideText>
          <GuideText>
            <GuideText bold>Export JSON</GuideText> : Une sauvegarde brute de toutes vos données que vous pouvez conserver en sécurité ou transférer sur un autre appareil.
          </GuideText>
        </GuideSection>

        <GuideSection title="Confidentialité" icon={ShieldCheck} color={colors.success}>
          <GuideText>
            Z3 Copilot adopte une approche <GuideText bold>Local-First</GuideText>. 
          </GuideText>
          <GuideText>
            Aucune donnée n'est envoyée sur un serveur tiers. Vos trajets, vos factures et vos positions GPS restent exclusivement dans votre téléphone.
          </GuideText>
        </GuideSection>

        <View style={styles.footer}>
          <TrendingUp size={24} color={colors.textMuted} />
          <Text style={styles.footerText}>Bonne route avec votre Z3 !</Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  intro: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  introText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  sectionWrapper: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  contentCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: spacing.lg,
  },
  guideText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  boldText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  bulletList: {
    marginTop: spacing.xs,
    paddingLeft: spacing.sm,
  },
  bullet: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
