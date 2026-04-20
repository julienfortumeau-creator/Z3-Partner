import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { ChevronLeft, Home, MapPin, Phone, Mail, Building2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { APP_SHORT_NAME } from '../config/vehicleConfig';
import { colors, spacing, typography } from '../theme/colors';
import { InputField } from '../components/common/InputField';
import { PremiumButton } from '../components/common/PremiumButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyGarageScreen() {
  const navigation = useNavigation();
  const { profile, setGarage } = useVehicleStore();
  
  const [form, setForm] = useState({
    name: profile?.garage?.name || '',
    address: profile?.garage?.address || '',
    phone: profile?.garage?.phone || '',
    email: profile?.garage?.email || '',
  });

  const handleSave = () => {
    setGarage(form);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color={colors.textPrimary} size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>Mon Garage</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#3a3a3a', '#1a1a1a']}
              style={styles.card}
            >
              <View style={styles.iconContainer}>
                <Building2 size={32} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Coordonnées du réparateur</Text>
              <Text style={styles.cardSubtitle}>
                Ces informations seront utilisées pour vous permettre de prendre rendez-vous rapidement.
              </Text>
              
              <View style={styles.form}>
                <InputField 
                  label="NOM DU GARAGE" 
                  value={form.name} 
                  onChange={(t) => setForm({...form, name: t})}
                  icon={Home}
                  placeholder="Ex: BMW Sport Auto"
                />
                <InputField 
                  label="ADRESSE" 
                  value={form.address} 
                  onChange={(t) => setForm({...form, address: t})}
                  icon={MapPin}
                  placeholder={`123 rue de la ${APP_SHORT_NAME}...`}
                />
                <InputField 
                  label="TÉLÉPHONE" 
                  value={form.phone} 
                  onChange={(t) => setForm({...form, phone: t})}
                  icon={Phone}
                  placeholder="01 02 03 04 05"
                  keyboardType="phone-pad"
                />
                <InputField 
                  label="EMAIL" 
                  value={form.email} 
                  onChange={(t) => setForm({...form, email: t})}
                  icon={Mail}
                  placeholder="contact@garage.com"
                  keyboardType="email-address"
                />
              </View>
            </LinearGradient>
          </View>

          <PremiumButton 
            title="Enregistrer" 
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.xl,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 102, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  form: {
    marginTop: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
