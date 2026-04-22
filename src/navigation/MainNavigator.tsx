import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Gauge, Wrench, ScanLine, Timer, Settings, Navigation } from 'lucide-react-native';
import { View, ActivityIndicator } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DriveScreen from '../screens/DriveScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SupportScreen from '../screens/SupportScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AddMileageScreen from '../screens/AddMileageScreen';
import GuideScreen from '../screens/GuideScreen';
import MaintenanceDetailScreen from '../screens/MaintenanceDetailScreen';
import MyGarageScreen from '../screens/MyGarageScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import LegalNoticeScreen from '../screens/LegalNoticeScreen';
import { colors } from '../theme/colors';
import { useVehicleStore } from '../store/useVehicleStore';

export type RootStackParamList = {
  Onboarding: { startStep?: number } | undefined;
  MainTabs: undefined;
  Support: undefined;
  AddExpense: { expense?: any, initialCategory?: any };
  AddMileage: { suggestedKms?: number } | undefined;
  Guide: undefined;
  MaintenanceDetail: { itemId: string };
  MyGarage: undefined;
  PrivacyPolicy: undefined;
  LegalNotice: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  History: undefined;
  Drive: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Cockpit',
          tabBarIcon: ({ color, size }) => <Gauge color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          tabBarLabel: 'Entretien',
          tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Drive" 
        component={DriveScreen} 
        options={{
          tabBarLabel: 'Drive',
          tabBarIcon: ({ color, size }) => <Navigation color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => <Timer color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  const isHydrated = useVehicleStore((state) => state._hasHydrated);
  const profile = useVehicleStore((state) => state.profile);
  const setHasHydrated = useVehicleStore((state) => state.setHasHydrated);

  React.useEffect(() => {
    // Sécurité : si l'hydratation prend plus de 1.5s, on force l'affichage
    const timer = setTimeout(() => {
      if (!isHydrated) {
        console.warn('Hydration timeout: forcing display');
        setHasHydrated(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={profile ? 'MainTabs' : 'Onboarding'}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="AddMileage" component={AddMileageScreen} />
      <Stack.Screen name="Guide" component={GuideScreen} />
      <Stack.Screen name="MaintenanceDetail" component={MaintenanceDetailScreen} />
      <Stack.Screen name="MyGarage" component={MyGarageScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="LegalNotice" component={LegalNoticeScreen} />
    </Stack.Navigator>
  );
}
