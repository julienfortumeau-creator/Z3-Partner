import { ExpoConfig, ConfigContext } from 'expo/config';

const VEHICLE_VARIANT = process.env.EXPO_PUBLIC_VEHICLE_VARIANT || 'z3';

// Configuration de base partagée
const baseConfig = {
  version: "1.1.1",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ftmx.z3copilot",
    buildNumber: "9",
    infoPlist: {
      UIBackgroundModes: ["location", "fetch"],
      NSCameraUsageDescription: "Cette application nécessite l'accès à l'appareil photo pour scanner vos factures d'entretien.",
      NSLocationWhenInUseUsageDescription: "L'application utilise le GPS pour suivre vos trajets et recommander l'ajout de kilométrage.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "L'application utilise le GPS en arrière-plan pour détecter automatiquement vos trajets et calculer la distance parcourue.",
      "ITSAppUsesNonExemptEncryption": false,
    }
  },
  android: {
    package: "com.ftmx.z3copilot",
    versionCode: 9,
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO"
    ],
    adaptiveIcon: {
      backgroundColor: "#121212"
    }
  },
  plugins: [
    [
      "expo-location",
      { "locationAlwaysAndWhenInUsePermission": "L'application a besoin du GPS pour la détection de trajets." }
    ],
    [
      "expo-camera",
      { "cameraPermission": "L'application a besoin de l'appareil photo pour scanner les factures." }
    ]
  ],
  extra: {
    eas: {
      projectId: "b51384d6-7471-4da4-9388-d4d02a944474"
    }
  }
};

// Configuration spécifique par variante
const variantConfigs: Record<string, any> = {
  z3: {
    name: "Z3 Copilot",
    slug: "z3-copilot",
    icon: "./assets/vehicles/z3/icon.png",
    splash: {
      image: "./assets/vehicles/z3/splash.png",
      resizeMode: "contain",
      backgroundColor: "#121212"
    },
    android: {
      package: "com.ftmx.z3copilot",
      adaptiveIcon: {
        foregroundImage: "./assets/vehicles/z3/adaptive-icon.png"
      }
    },
    ios: {
      bundleIdentifier: "com.ftmx.z3copilot"
    }
  },
  mx5: {
    name: "MX-5 Copilot",
    slug: "mx5-copilot",
    icon: "./assets/vehicles/mx5/icon.png",
    splash: {
      image: "./assets/vehicles/mx5/splash.png",
      resizeMode: "contain",
      backgroundColor: "#121212"
    },
    android: {
      package: "com.ftmx.mx5copilot",
      adaptiveIcon: {
        foregroundImage: "./assets/vehicles/mx5/adaptive-icon.png"
      }
    },
    ios: {
      bundleIdentifier: "com.ftmx.mx5copilot"
    }
  },
  z4: {
    name: "Z4 Copilot",
    slug: "z4-copilot",
    icon: "./assets/vehicles/z4/icon.png",
    splash: {
      image: "./assets/vehicles/z4/splash.png",
      resizeMode: "contain",
      backgroundColor: "#121212"
    },
    android: {
      package: "com.ftmx.z4copilot",
      adaptiveIcon: {
        foregroundImage: "./assets/vehicles/z4/adaptive-icon.png"
      }
    },
    ios: {
      bundleIdentifier: "com.ftmx.z4copilot"
    }
  }
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = variantConfigs[VEHICLE_VARIANT] || variantConfigs.z3;
  
  return {
    ...config,
    ...baseConfig,
    ...variant,
    // Fusion profonde pour Android car baseConfig a aussi une clé android
    android: {
      ...baseConfig.android,
      ...variant.android,
      adaptiveIcon: {
        ...baseConfig.android.adaptiveIcon,
        ...variant.android.adaptiveIcon
      }
    },
    // Fusion profonde pour iOS
    ios: {
      ...baseConfig.ios,
      ...variant.ios,
    }
  } as ExpoConfig;
};
