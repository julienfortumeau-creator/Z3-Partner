import { ExpoConfig, ConfigContext } from 'expo/config';

const VEHICLE_VARIANT = (process.env.EXPO_PUBLIC_VEHICLE_VARIANT || 'z3').trim();

console.log(`\n🚗 Building for variant: [${VEHICLE_VARIANT}]\n`);

// Configuration de base partagée
const baseConfig = {
  name: "Z3 Copilot",
  slug: "z3-copilot",
  version: "1.1.4",
  orientation: "portrait" as const,
  userInterfaceStyle: "dark" as const,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ftmx.z3copilot",
    buildNumber: "11",
    infoPlist: {
      UIBackgroundModes: ["location", "fetch"],
      NSCameraUsageDescription: "Cette application nécessite l'accès à l'appareil photo pour scanner vos factures d'entretien.",
      NSLocationWhenInUseUsageDescription: "L'application utilise le GPS pour suivre vos trajets et recommander l'ajout de kilométrage.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "L'application utilise le GPS en arrière-plan pour détecter automatiquement vos trajets et calculer la distance parcourue.",
      ITSAppUsesNonExemptEncryption: false,
      applePrivacyManifest: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"]
          },
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
            NSPrivacyAccessedAPITypeReasons: ["85F4.1"]
          },
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
            NSPrivacyAccessedAPITypeReasons: ["C617.1"]
          }
        ]
      }
    }
  },
  android: {
    package: "com.ftmx.z3copilot",
    versionCode: 11,
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
      { locationAlwaysAndWhenInUsePermission: "L'application a besoin du GPS pour la détection de trajets." }
    ],
    [
      "expo-camera",
      { cameraPermission: "L'application a besoin de l'appareil photo pour scanner les factures." }
    ]
  ],
  extra: {
    eas: {
      projectId: "b51384d6-7471-4da4-9388-d4d02a944474"
    }
  }
};

// Configuration spécifique par variante
// IMPORTANT : Le `name` reste "Z3 Copilot" pour toutes les variantes
// afin que le target Xcode ("Z3Copilot") reste identique.
// Le nom affiché sur le téléphone est piloté par CFBundleDisplayName.
const variantConfigs: Record<string, any> = {
  z3: {
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
      bundleIdentifier: "com.ftmx.mx5copilot",
      infoPlist: {
        CFBundleDisplayName: "MX-5 Copilot"
      }
    }
  },
  z4: {
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
      bundleIdentifier: "com.ftmx.z4copilot",
      infoPlist: {
        CFBundleDisplayName: "Z4 Copilot"
      }
    }
  }
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = variantConfigs[VEHICLE_VARIANT] || variantConfigs.z3;
  
  return {
    ...config,
    ...baseConfig,
    ...variant,
    // Fusion profonde pour Android
    android: {
      ...baseConfig.android,
      ...variant.android,
      adaptiveIcon: {
        ...baseConfig.android.adaptiveIcon,
        ...variant.android?.adaptiveIcon
      }
    },
    // Fusion profonde pour iOS (infoPlist doit aussi être fusionné)
    ios: {
      ...baseConfig.ios,
      ...variant.ios,
      infoPlist: {
        ...baseConfig.ios.infoPlist,
        ...variant.ios?.infoPlist,
      }
    }
  } as ExpoConfig;
};
