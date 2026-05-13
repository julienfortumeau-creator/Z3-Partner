export type EngineType = '4cyl' | '6cyl' | 'M';

export interface MaintenanceItemConfig {
  id: string;
  label: string;
  typeLabel: 'Oil Service' | 'Entretien & réparation';
  category: 'maintenance' | 'safety' | 'other';
  icon: string;
}

export interface MaintenanceInterval {
  km?: number;
  years?: number;
  detail: string;
  cost: string;
}

export interface HealthStepConfig {
  title: string;
  description: string;
  enjeu: string;
  priority: string;
  iconName: string;
  priorityLevel: 'high' | 'critical' | 'low';
  itemIds: string[];
}

export interface VehicleConfig {
  APP_NAME: string;
  APP_SHORT_NAME: string;
  APP_VERSION: string;
  APP_TAGLINE: string;
  BACKUP_FILENAME: string;
  LOCATION_TASK_NAME: string;
  VEHICLE_PROFILE_IMAGE: any;
  ASSETS: {
    icon: string;
    splash: string;
    adaptiveIcon: string;
    favicon: string;
  };
  BRAND_COLORS: {
    primary: string;
    primaryDark: string;
    accent: string;
  };
  VEHICLE_MODELS: string[];
  VEHICLE_YEARS: string[];
  ENGINE_TYPE_LABELS: Record<EngineType, string>;
  detectEngineType: (model: string) => EngineType;
  MAINTENANCE_ITEMS: MaintenanceItemConfig[];
  MAINTENANCE_SCHEMA: Record<EngineType, Record<string, MaintenanceInterval>>;
  HEALTH_STEPS_CONFIG: HealthStepConfig[];
  COMMUNITY_LINKS: { name: string; url: string }[];
  LEGAL_TEXTS: {
    disclaimer: string;
    maintenanceDisclaimer: string;
    onboardingDisclaimer: string;
    onboardingBullets: string[];
    privacyIntro: string;
    privacyStorage: string;
    legalNotice: string;
    legalNoSubstitute: string;
    legalAcceptance: string;
    pdfTitle: string;
    pdfFooter: string;
  };
  GPS_CONFIG: {
    speedThreshold: number;
    stopThreshold: number;
    stopDuration: number;
    stationCheckInterval: number;
    stationKeywords: string[];
    notifications: {
      tripEndTitle: string;
      tripEndBody: (kms: number) => string;
      stationTitle: string;
      stationBody: (name: string) => string;
    };
  };
  BACKUP_TEXTS: {
    exportError: string;
    importError: string;
    importInvalidFormat: string;
    importConfirmTitle: string;
    importConfirmBody: string;
    importSuccess: string;
  };
  UI_TEXTS: {
    activeTripBanner: string;
    greeting: string;
    updateMileage: string;
    optimalStatus: string;
    maintenanceStatus: string;
    lastLogs: string;
    noLogs: string;
    gpsLogsTitle: string;
    gpsDisabledTitle: string;
    gpsDisabledBody: string;
    iphoneSettings: string;
    logoutTitle: string;
    logoutConfirm: string;
    cancel: string;
    errorTitle: string;
    pdfError: string;
    logsError: string;
  };
}
