import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  TextInput,
  Alert
} from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { PremiumButton } from '../components/common/PremiumButton';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Mail, ExternalLink, HelpCircle, Heart, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function SupportScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    // Simulation d'envoi
    setTimeout(() => {
      setIsSending(false);
      setMessage('');
      Alert.alert(
        "Message envoyé",
        "Merci pour votre message ! Notre équipe technique vous répondra dans les plus brefs délais.",
        [{ text: "OK" }]
      );
    }, 1500);
  };

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Envoyer un message</Text>
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#3a3a3a', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.formCard}
          >
            <TextInput
              style={styles.input}
              placeholder="Comment pouvons-nous vous aider ?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
            <PremiumButton 
              title={isSending ? "Envoi en cours..." : "Envoyer"} 
              onPress={handleSend}
              icon={isSending ? undefined : Send}
              style={styles.sendButton}
            />
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Questions Fréquentes</Text>
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#3a3a3a', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.faqCard}
          >
            <FAQItem 
              question="Comment ajouter un entretien ?" 
              answer="Rendez-vous dans l'onglet 'Entretien' et appuyez sur le bouton '+' en haut à droite." 
            />
            <View style={styles.divider} />
            <FAQItem 
              question="Qu'est-ce que le TCO ?" 
              answer="Le Total Cost of Ownership représente le coût total de possession (Prix d'achat + Entretien + Carburant + Assurance)." 
            />
            <View style={styles.divider} />
            <FAQItem 
              question="Où sont stockées mes données ?" 
              answer="Toutes vos données restent localement sur votre téléphone pour une confidentialité totale." 
            />
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Communauté Z3</Text>
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#3a3a3a', '#1a1a1a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.linkCard}
          >
            <TouchableOpacity 
              style={styles.linkRow} 
              onPress={() => handleLink('https://www.z3-france.com')}
            >
              <View style={styles.linkInfo}>
                <HelpCircle color={colors.textSecondary} size={20} />
                <Text style={styles.linkText}>Z3 Club France</Text>
              </View>
              <ExternalLink color={colors.textMuted} size={16} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.linkRow} 
              onPress={() => handleLink('https://www.bimmerforums.com/forum/forumdisplay.php?137-Z3-Roadster-Coupe-M-Roadster-M-Coupe-(Z3)')}
            >
              <View style={styles.linkInfo}>
                <HelpCircle color={colors.textSecondary} size={20} />
                <Text style={styles.linkText}>Bimmerforums Z3</Text>
              </View>
              <ExternalLink color={colors.textMuted} size={16} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.credits}>
          <View style={styles.heartBox}>
            <Heart color={colors.error} size={16} fill={colors.error} />
          </View>
          <Text style={styles.creditsText}>Z3 Copilot v1.1.0</Text>
          <Text style={styles.subCredits}>Développé par un passionné pour des passionnés</Text>
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
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  contactCard: {
    padding: spacing.md,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  faqCard: {
    paddingHorizontal: spacing.lg,
  },
  faqItem: {
    paddingVertical: spacing.lg,
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  answer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  linkCard: {
    paddingHorizontal: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  credits: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  heartBox: {
    marginBottom: spacing.md,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subCredits: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  formCard: {
    padding: spacing.lg,
  },
  input: {
    minHeight: 120,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sendButton: {
    height: 50,
  },
});
