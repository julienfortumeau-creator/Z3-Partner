import { ExpoConfig, ConfigContext } from 'expo/config';

// On récupère la variante, et on s'assure qu'elle est définie
const VEHICLE_VARIANT = (process.env.EXPO_PUBLIC_VEHICLE_VARIANT || '').trim().toLowerCase();

if (!VEHICLE_VARIANT) {
  console.error("\n❌ ERROR: EXPO_PUBLIC_VEHICLE_VARIANT is not set!");
  console.error("Please set it before building (e.g. set EXPO_PUBLIC_VEHICLE_VARIANT=z4)\n");
  // En local on peut fallback pour le dev, mais en build on veut de la rigueur
  if (process.env.EAS_BUILD) {
    throw new Error("EXPO_PUBLIC_VEHICLE_VARIANT must be set for EAS builds");
  }
}

const activeVariant = VEHICLE_VARIANT || 'z3';
console.log(`\n🚗 Building for variant: [${activeVariant}]\n`);

const variantConfigs: Record<string, any> = {
  z3: {
    bundleIdentifier: "com.ftmx.z3copilot",
    packageName: "com.ftmx.z3copilot",
    displayName: "Z3 Copilot",
    icon: "./assets/vehicles/z3/icon.png",
    foregroundImage: "./assets/vehicles/z3/adaptive-icon.png",
    splashImage: "./assets/vehicles/z3/splash.png"
  },
  mx5: {
    bundleIdentifier: "com.ftmx.mx5copilot",
    packageName: "com.ftmx.mx5copilot",
    displayName: "MX-5 Copilot",
    icon: "./assets/vehicles/mx5/icon.png",
    foregroundImage: "./assets/vehicles/mx5/adaptive-icon.png",
    splashImage: "./assets/vehicles/mx5/splash.png"
  },
  z4: {
    bundleIdentifier: "com.ftmx.z4copilot",
    packageName: "com.ftmx.z4copilot",
    displayName: "Z4 Copilot",
    icon: "./assets/vehicles/z4/icon.png",
    foregroundImage: "./assets/vehicles/z4/adaptive-icon.png",
    splashImage: "./assets/vehicles/z4/splash.png"
  }
};

const v = variantConfigs[activeVariant];

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "Z3 Copilot", 
    slug: "z3-copilot",
    version: "1.1.7",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    icon: v.icon,
    splash: {
      image: v.splashImage,
      resizeMode: "contain",
      backgroundColor: "#121212"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: v.bundleIdentifier,
      buildNumber: "14",
      infoPlist: {
        CFBundleDisplayName: v.displayName,
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
      package: v.packageName,
      versionCode: 14,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      adaptiveIcon: {
        backgroundColor: "#121212",
        foregroundImage: v.foregroundImage
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
  } as ExpoConfig;
};
