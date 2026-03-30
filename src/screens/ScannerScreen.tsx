import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, Scan, X, Zap } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme/colors';
import { PremiumButton } from '../components/common/PremiumButton';
import { GlassCard } from '../components/common/GlassCard';

const { height, width } = Dimensions.get('window');

export default function ScannerScreen() {
  const navigation = useNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  const startScan = () => {
    setIsScanning(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulation d'une analyse IA qui réussit au bout de 5 secondes
    setTimeout(() => {
      setIsScanning(false);
      scanAnim.stopAnimation();
      // On simule l'ajout réussi ou on redirige
      alert("Facture détectée : Vidange + Filtre (BMW Service) - 185,50 €");
    }, 5000);
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 400],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <X color={colors.textPrimary} size={28} />
            </TouchableOpacity>
            <Text style={styles.title}>Scanner Facture</Text>
            <Zap color={colors.warning} size={24} />
          </View>

          <View style={styles.scanAreaContainer}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {isScanning && (
                <Animated.View 
                  style={[
                    styles.laserLine, 
                    { transform: [{ translateY }] }
                  ]} 
                />
              )}
            </View>
          </View>

          <View style={styles.footer}>
            {!isScanning ? (
              <PremiumButton 
                title="Scanner maintenant" 
                onPress={startScan} 
                style={styles.scanButton}
              />
            ) : (
              <GlassCard style={styles.scanningCard}>
                <Text style={styles.scanningText}>Analyse IA en cours...</Text>
                <Text style={styles.scanningSubText}>Détection des montants et prestations</Text>
              </GlassCard>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Simulé, en réel on aurait Camera de expo-camera
  },
  overlay: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scanAreaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: width * 0.8,
    height: 450,
    borderWidth: 0,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  laserLine: {
    height: 4,
    width: '100%',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
    position: 'absolute',
    left: 0,
  },
  footer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  scanButton: {
    width: '100%',
  },
  scanningCard: {
    width: '100%',
    alignItems: 'center',
  },
  scanningText: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 4,
  },
  scanningSubText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
