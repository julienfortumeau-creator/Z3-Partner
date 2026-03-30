import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import { colors } from './src/theme/colors';
import { useGPSSimulation } from './src/hooks/useGPSSimulation';

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    primary: colors.primary,
  },
};

export default function App() {
  // Activate simulations for demo (Road & Gas detection)
  useGPSSimulation();

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <MainNavigator />
    </NavigationContainer>
  );
}
