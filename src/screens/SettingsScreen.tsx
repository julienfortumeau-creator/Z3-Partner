import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useVehicleStore } from '../store/useVehicleStore';
import { colors, spacing, typography } from '../theme/colors';
import { GlassCard } from '../components/common/GlassCard';
import { MapPin, Bell, LogOut, ChevronRight, User, ShieldCheck, Mail } from 'lucide-react-native';

export default function SettingsScreen() {
  const profile = useVehicleStore((state) => state.profile);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!profile) return null;

  const SettingToggle = ({ label, description, icon: Icon, value, onValueChange }: any) => (
    <GlassCard style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <View style={styles.iconBox}>
          <Icon color={colors.primary} size={22} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDesc}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.textPrimary}
          ios_backgroundColor={colors.border}
        />
      </View>
    </GlassCard>
  );

  const MenuLink = ({ label, icon: Icon, color = colors.textPrimary }: any) => (
    <TouchableOpacity style={styles.menuLink}>
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
            <Text style={styles.userName}>Z3 Driver</Text>
            <Text style={styles.userEmail}>passion@bmw-z3.com</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Services Connectés</Text>
        <SettingToggle 
          label="Auto-Log (GPS)" 
          description="Détection automatique de trajets et stations service."
          icon={MapPin}
          value={gpsEnabled}
          onValueChange={setGpsEnabled}
        />
        <SettingToggle 
          label="Alertes Maintenance" 
          description="Notifications pour Oil Service et Inspections."
          icon={Bell}
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />

        <Text style={styles.sectionTitle}>Véhicule & Compte</Text>
        <GlassCard style={styles.menuContainer}>
          <MenuLink label="Modifier le profil véhicule" icon={ShieldCheck} />
          <View style={styles.divider} />
          <MenuLink label="Soutien & Support" icon={Mail} />
          <View style={styles.divider} />
          <MenuLink label="Déconnexion" icon={LogOut} color={colors.error} />
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Z3 Partner v1.0.0 (Premium)</Text>
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
  settingCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighlight,
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
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
