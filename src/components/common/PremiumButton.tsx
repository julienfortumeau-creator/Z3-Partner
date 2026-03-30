import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../theme/colors';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PremiumButton = ({ title, onPress, variant = 'primary', style, textStyle }: PremiumButtonProps) => {
  const handlePress = () => {
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
    <TouchableOpacity onPress={handlePress} style={[styles.button, isOutline && styles.outlineButton, style]}>
      <LinearGradient
        colors={colorsMap[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, isOutline && styles.outlineText, textStyle]}>{title}</Text>
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
  outlineButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: colors.textPrimary,
  },
});
