import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { APP_NAME, APP_VERSION, APP_TAGLINE } from '../config/vehicleConfig';
import { GlassCard } from '../components/common/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Bell, LogOut, ChevronRight, User, ShieldCheck, Mail, Building2, FileText, Download, Share2, Heart, BookOpen } from 'lucide-react-native';
import { exportData, importData } from '../services/backupService';
import { generateMaintenancePDF } from '../utils/pdfGenerator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';
import { Bug } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useVehicleStore((state) => state.profile);
  const expenses = useVehicleStore((state) => state.expenses);
  const gpsEnabled = useVehicleStore((state) => state.gpsEnabled);
  const setGPSEnabled = useVehicleStore((state) => state.setGPSEnabled);
  const notificationsEnabled = useVehicleStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useVehicleStore((state) => state.setNotificationsEnabled);
  const [isExporting, setIsExporting] = useState(false);

  if (!profile) return null;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await generateMaintenancePDF(profile, expenses);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de générer le document PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ? Les données locales seront conservées.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", style: "destructive", onPress: () => navigation.replace('Onboarding') }
      ]
    );
  };

  const showGPSLogs = async () => {
    try {
      const logsStr = await AsyncStorage.getItem('@gps_logs');
      const logs = logsStr ? JSON.parse(logsStr) : [];
      if (logs.length === 0) {
        Alert.alert("GPS Logs", "Aucun log enregistré pour le moment.");
      } else {
        Alert.alert("GPS Logs (50 derniers)", logs.join('\n'));
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de lire les logs.");
    }
  };

  const handleGPSToggle = async (value: boolean) => {
    if (!value) {
      // User is disabling
      setGPSEnabled(false);
      Alert.alert(
        "Auto-Log Désactivé",
        "Le suivi automatique est maintenant désactivé dans l'application. Pour une confidentialité totale, vous pouvez également révoquer l'accès à la position dans les réglages de votre iPhone.",
        [
          { text: "OK", style: "default" },
          { 
            text: "Réglages iPhone", 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
    } else {
      // User is enabling
      setGPSEnabled(true);
      // useLocationTracker will handle the permission request
    }
  };

  const SettingToggle = ({ label, description, icon: Icon, value, onValueChange }: any) => (
    <View style={styles.settingCardWrapper}>
      <LinearGradient
        colors={['#3a3a3a', '#1a1a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.settingGradientCard}
      >
        <View style={styles.settingHeader}>
          <View style={styles.iconBox}>
            <Icon color={colors.primary} size={25} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>{label}</Text>
            <Text style={styles.settingDesc}>{description}</Text>
          </View>
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary }}
            thumbColor={'#FFF'}
            ios_backgroundColor={'rgba(255,255,255,0.1)'}
          />
        </View>
      </LinearGradient>
    </View>
  );

  const MenuLink = ({ label, icon: Icon, onPress, color = colors.textPrimary }: any) => (
    <TouchableOpacity style={styles.menuLink} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon color={color} size={20} />
        <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      </View>
      <ChevronRight color={colors.textMuted} size={18} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.userName}>{profile.model}</Text>
            <Text style={styles.userEmail}>{APP_TAGLINE}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Services Connectés</Text>
        <SettingToggle 
          label="Auto-Log (GPS)" 
          description="Détection automatique de trajets et stations service."
          icon={MapPin}
          value={gpsEnabled}
          onValueChange={handleGPSToggle}
        />
        <SettingToggle 
          label="Alertes Maintenance" 
          description="Notifications pour Oil Service et Inspections."
          icon={Bell}
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />

        <Text style={styles.sectionTitle}>Diagnostic (Tests)</Text>
        <GlassCard style={styles.menuContainer}>
          <MenuLink 
            label="Voir les logs GPS" 
            icon={Bug} 
            onPress={showGPSLogs}
          />
        </GlassCard>


        <Text style={styles.sectionTitle}>Sauvegarde & Synchronisation</Text>
        <GlassCard style={styles.menuContainer}>
          <MenuLink 
            label="Restaurer l'historique" 
            icon={Download} 
            onPress={importData}
          />
          <View style={styles.divider} />
          <MenuLink 
            label="Export de sécurité (JSON)" 
            icon={Share2} 
            onPress={exportData}
          />
        </GlassCard>

        <Text style={styles.sectionTitle}>Véhicule</Text>
        <GlassCard style={styles.menuContainer}>
          <MenuLink 
            label="Mon garage" 
            icon={Building2} 
            onPress={() => navigation.navigate('MyGarage')}
          />
          <View style={styles.divider} />
          <MenuLink 
            label="Modifier le profil véhicule" 
            icon={({ color, size }: any) => <MaterialCommunityIcons name="steering" size={size} color={color} />} 
            onPress={() => navigation.navigate('Onboarding' as any)}
          />
          <View style={styles.divider} />
          <MenuLink 
            label={isExporting ? "Génération en cours..." : "Exporter l'historique (PDF)"} 
            icon={FileText} 
            onPress={handleExportPDF}
          />
        </GlassCard>

        <Text style={styles.sectionTitle}>Compte</Text>
        <GlassCard style={styles.menuContainer}>
          <MenuLink 
            label="Guide du Copilot" 
            icon={BookOpen} 
            onPress={() => navigation.navigate('Guide')}
          />
          <View style={styles.divider} />
          <MenuLink 
            label="Soutien & Support" 
            icon={Mail} 
            onPress={() => navigation.navigate('Support')}
          />
          <View style={styles.divider} />
          <MenuLink 
            label="Confidentialité" 
            icon={ShieldCheck} 
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <View style={styles.divider} />
          <MenuLink 
            label="Légal" 
            icon={FileText} 
            onPress={() => navigation.navigate('LegalNotice' as any)}
          />
          <View style={styles.divider} />
          <MenuLink 
            label="Déconnexion" 
            icon={LogOut} 
            color={colors.error} 
            onPress={handleLogout}
          />
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.versionText}>{APP_NAME} v{APP_VERSION} (Premium)</Text>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureText}>Handcrafted with </Text>
            <Heart size={10} color={colors.error} fill={colors.error} />
            <Text style={styles.signatureText}> by ftmx</Text>
          </View>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  settingCardWrapper: {
    marginBottom: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingGradientCard: {
    padding: spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    ...typography.h3,
    fontSize: 15,
    color: colors.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    padding: 0,
  },
  menuLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  versionText: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    opacity: 0.8,
  },
  signatureText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
