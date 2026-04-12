import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../theme/colors';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: any;
  disabled?: boolean;
}

export const PremiumButton = ({ title, onPress, variant = 'primary', style, textStyle, icon: Icon, disabled }: PremiumButtonProps) => {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isOutline = variant === 'outline';
  const colorsMap = {
    primary: [colors.primary, colors.primaryDark],
    secondary: [colors.accent, colors.primaryDark],
    outline: ['transparent', 'transparent'],
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[styles.button, isOutline && styles.outlineButton, style, disabled && { opacity: 0.5 }]}
      disabled={disabled}
    >
      <LinearGradient
        colors={colorsMap[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {Icon && <Icon size={20} color={colors.textPrimary} style={styles.icon} />}
          <Text style={[styles.text, isOutline && styles.outlineText, textStyle]}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 56,
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  text: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: colors.textPrimary,
  },
});
