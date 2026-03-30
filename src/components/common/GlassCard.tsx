import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../theme/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'surface' | 'glass';
}

export const GlassCard = ({ children, style, variant = 'surface' }: GlassCardProps) => {
  return (
    <View style={[styles.card, variant === 'glass' && styles.glassVariant, style]}>
      <LinearGradient
        colors={variant === 'glass' 
          ? [colors.glassBorder, 'transparent'] 
          : [colors.surfaceHighlight, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.innerContent}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  glassVariant: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1.5,
  },
  gradient: {
    flex: 1,
  },
  innerContent: {
    padding: spacing.lg,
  },
});
