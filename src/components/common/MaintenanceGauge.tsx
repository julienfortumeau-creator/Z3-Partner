import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';

interface MaintenanceGaugeProps {
  label: string;
  currentValue: number;
  maxValue: number;
  unit?: string;
}

export const MaintenanceGauge = ({ label, currentValue, maxValue, unit = 'km' }: MaintenanceGaugeProps) => {
  const percentage = Math.min((currentValue / maxValue) * 100, 100);
  
  const getStatusColor = () => {
    if (percentage > 90) return colors.error;
    if (percentage > 70) return colors.warning;
    return colors.primary;
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: statusColor }]}>
          {currentValue.toLocaleString()} / {maxValue.toLocaleString()} {unit}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barForeground, 
            { width: `${percentage}%`, backgroundColor: statusColor }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barForeground: {
    height: '100%',
    borderRadius: 4,
  },
});
