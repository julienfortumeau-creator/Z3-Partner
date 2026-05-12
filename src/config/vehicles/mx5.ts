import { VehicleConfig } from './types';

export const mx5Config: VehicleConfig = {
  APP_NAME: 'MX-5 Copilot',
  APP_SHORT_NAME: 'MX-5',
  APP_VERSION: '1.10',
  APP_TAGLINE: 'Passionné Mazda MX-5',
  BACKUP_FILENAME: 'mx5_copilot_backup.json',
  LOCATION_TASK_NAME: 'MX5_COPILOT_LOCATION_TRACKING',
  
  // Note: Il faudra ajouter l'image mx5_profile.png dans les assets
  VEHICLE_PROFILE_IMAGE: require('../../../assets/z3_profile.png'), 
  
  BRAND_COLORS: {
    primary: '#D01C1F',      // Mazda Classic Red
    primaryDark: '#8B1214',
    accent: '#222222',       // Black/Chrome accent
  },

  VEHICLE_MODELS: [
    'NA 1.6 (90ch)',
    'NA 1.6 (115ch)',
    'NA 1.8 (130ch)',
    'NB 1.6 (110ch)',
    'NB 1.8 (140ch)',
    'NBFL 1.6 (110ch)',
    'NBFL 1.8 (145ch)',
    'NC 1.8 (126ch)',
    'NC 2.0 (160ch)',
    'ND 1.5 (131ch)',
    'ND 2.0 (160ch)',
    'ND 2.0 (184ch)',
  ],

  VEHICLE_YEARS: [
    '1989', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997',
    '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005',
    '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015',
    '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'
  ],

  ENGINE_TYPE_LABELS: {
    '4cyl': '4 Cylindres Standard',
    '6cyl': 'V6 / Spécial', // Peu commun sur MX-5 mais gardé pour le type
    'M': 'Mazdaspeed / Turbo',
  },

  detectEngineType: (model: string) => {
    const m = model.toLowerCase();
    if (m.includes('mazdaspeed') || m.includes('turbo')) return 'M';
    if (m.includes('2.0')) return '6cyl'; // On utilise 6cyl comme slot pour les plus gros moteurs
    return '4cyl';
  },

  MAINTENANCE_ITEMS: [
    { id: 'oil', label: 'Vidange + filtre à huile', typeLabel: 'Oil Service', category: 'maintenance', icon: 'droplets' },
    { id: 'air_filter', label: 'Filtre à air', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'wind' },
    { id: 'spark_plugs', label: 'Bougies d\'allumage', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'zap' },
    { id: 'fuel_filter', label: 'Filtre à essence', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'fuel' },
    { id: 'gearbox_oil', label: 'Huile boîte de vitesses', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'settings' },
    { id: 'differential_oil', label: 'Huile différentiel', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'settings' },
    { id: 'timing_belt', label: 'Courroie de distribution', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'refresh-ccw' },
    { id: 'water_pump', label: 'Pompe à eau', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'refresh-cw' },
    { id: 'coolant', label: 'Liquide refroidissement', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'droplets' },
    { id: 'brake_fluid', label: 'Liquide de frein', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'droplets' },
    { id: 'brake_pads_front', label: 'Plaquettes AV', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'disc' },
    { id: 'brake_pads_rear', label: 'Plaquettes AR', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'disc' },
    { id: 'soft_top', label: 'Entretien Capote', typeLabel: 'Entretien & réparation', category: 'other', icon: 'umbrella' }, // Spécifique MX-5
    { id: 'battery', label: 'Batterie', typeLabel: 'Entretien & réparation', category: 'other', icon: 'battery' },
    { id: 'tires', label: 'Pneus', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'circle' },
  ],

  MAINTENANCE_SCHEMA: {
    '4cyl': {
      oil: { km: 10000, years: 1, detail: '10W40 ou 5W30 selon année', cost: '60 – 120 €' },
      air_filter: { km: 20000, detail: 'Simple', cost: '20 – 50 €' },
      spark_plugs: { km: 40000, detail: 'NGK Standard', cost: '40 – 80 €' },
      fuel_filter: { km: 60000, detail: 'Sous la caisse (NA/NB)', cost: '30 – 60 €' },
      gearbox_oil: { km: 60000, detail: 'Améliore le passage à froid', cost: '50 – 100 €' },
      differential_oil: { km: 60000, detail: '75W90 GL5', cost: '40 – 80 €' },
      timing_belt: { km: 100000, years: 5, detail: 'Moteur non-interférentiel (NA/NB)', cost: '300 – 600 €' },
      water_pump: { km: 100000, detail: 'À faire avec la distri', cost: '80 – 150 €' },
      coolant: { years: 2, detail: 'Important (Radiateur fragile)', cost: '40 – 80 €' },
      brake_fluid: { years: 2, detail: 'DOT 4', cost: '50 – 90 €' },
      soft_top: { years: 1, detail: 'Imperméabilisation + drainage', cost: '30 – 100 €' },
    },
    '6cyl': { // Utilisé pour les NC/ND 2.0
      oil: { km: 10000, years: 1, detail: '5W30 Synthèse', cost: '80 – 150 €' },
      timing_belt: { km: 200000, detail: 'Chaîne de distribution', cost: '0 €' }, // Chaîne sur NC/ND
      soft_top: { years: 1, detail: 'Nettoyage des drains', cost: '30 – 100 €' },
    },
    'M': {
      oil: { km: 7000, years: 1, detail: 'Usage intensif', cost: '100 – 180 €' },
      timing_belt: { km: 80000, years: 4, detail: 'Sécurité Turbo', cost: '400 – 800 €' },
    }
  },

  HEALTH_STEPS_CONFIG: [
    {
      title: 'Moteur & Fluides',
      description: 'Santé mécanique et lubrification.',
      enjeu: 'Fiabilité légendaire à préserver.',
      priority: 'Crucial pour le 1.6 et 1.8.',
      iconName: 'Activity',
      priorityLevel: 'high',
      itemIds: ['oil', 'spark_plugs', 'air_filter', 'fuel_filter'],
    },
    {
      title: 'Distribution & Refroidissement',
      description: 'Courroie et gestion thermique.',
      enjeu: 'Éviter la panne d\'immobilisation.',
      priority: 'Priorité haute (Courroie tous les 5-8 ans).',
      iconName: 'RefreshCcw',
      priorityLevel: 'critical',
      itemIds: ['timing_belt', 'water_pump', 'coolant'],
    },
    {
      title: 'Transmission',
      description: 'Boîte, pont et embrayage.',
      enjeu: 'Agrément de la boîte MX-5.',
      priority: 'Recommandé pour un passage de vitesses fluide.',
      iconName: 'Settings',
      priorityLevel: 'high',
      itemIds: ['gearbox_oil', 'differential_oil'],
    },
    {
      title: 'Capote & Étanchéité',
      description: 'Entretien du toit souple et drains.',
      enjeu: 'Éviter la corrosion interne.',
      priority: 'Spécifique Cabriolet : très important.',
      iconName: 'Umbrella',
      priorityLevel: 'high',
      itemIds: ['soft_top'],
    },
    {
      title: 'Sécurité & Liaison au sol',
      description: 'Freins et pneus.',
      enjeu: 'Sécurité et équilibre (50/50).',
      priority: 'Indispensable.',
      iconName: 'Disc',
      priorityLevel: 'critical',
      itemIds: ['brake_fluid', 'brake_pads_front', 'brake_pads_rear', 'tires'],
    },
  ],

  COMMUNITY_LINKS: [
    { name: 'MX5France', url: 'https://www.mx5france.com/' },
    { name: 'Passion MX-5', url: 'https://www.passion-mx5.com/' },
  ],

  LEGAL_TEXTS: {
    disclaimer: `MX-5 Copilot fournit des recommandations à titre indicatif. L'entretien et la sécurité du véhicule restent sous votre entière responsabilité.`,
    maintenanceDisclaimer: `Les intervalles sont donnés à titre indicatif. MX-5 Copilot ne se substitue pas à l'avis d'un professionnel.`,
    onboardingDisclaimer: `MX-5 Copilot est un outil d'assistance fourni à titre indicatif. `,
    onboardingBullets: [
      `Données communautaires pour moteurs Mazda B6/BP/LF/PE.`,
      `Ne remplace pas le manuel d'atelier Mazda.`,
      `L'utilisateur est responsable de son entretien.`,
    ],
    privacyIntro: `L'application MX-5 Copilot respecte votre vie privée.`,
    privacyStorage: `Données stockées localement sur votre téléphone.`,
    legalNotice: `Outil de suivi informatif pour Mazda MX-5.`,
    legalNoSubstitute: `Ne remplace pas un mécanicien qualifié.`,
    legalAcceptance: `Accord avec les conditions d'utilisation.`,
    pdfTitle: `Carnet d'Entretien - MX-5 Copilot`,
    pdfFooter: `© ${new Date().getFullYear()} MX-5 Copilot - Jinba Ittai`,
  },

  GPS_CONFIG: {
    speedThreshold: 4.16,
    stopThreshold: 1.0,
    stopDuration: 300000,
    stationCheckInterval: 7200000,
    stationKeywords: ['Station', 'Total', 'Esso', 'Shell', 'BP', 'Avia'],
    notifications: {
      tripEndTitle: "Roadtrip terminé 🏎️",
      tripEndBody: (kms: number) => `Belle balade de ${kms} km ! Mettre à jour le compteur ?`,
      stationTitle: "Plein d'essence ? ⛽",
      stationBody: (name: string) => `${name || 'Une station'} détectée. Noter le plein ?`,
    }
  },

  BACKUP_TEXTS: {
    exportError: "Erreur d'export.",
    importError: "Fichier invalide.",
    importInvalidFormat: "Format MX-5 non reconnu.",
    importConfirmTitle: "Restaurer MX-5 ?",
    importConfirmBody: "Écraser les données actuelles ?",
    importSuccess: "Restauration réussie.",
  },

  UI_TEXTS: {
    activeTripBanner: "Balade en cours...",
    greeting: "Jinba Ittai !",
    updateMileage: "Mise à jour",
    optimalStatus: "Optimal",
    maintenanceStatus: "Entretien",
    lastLogs: "Logs GPS",
    noLogs: "Aucun log.",
    gpsLogsTitle: "Historique GPS",
    gpsDisabledTitle: "GPS Off",
    gpsDisabledBody: "Le suivi est désactivé.",
    iphoneSettings: "Réglages",
    logoutTitle: "Quitter",
    logoutConfirm: "Voulez-vous quitter ?",
    cancel: "Annuler",
    errorTitle: "Oups",
    pdfError: "Erreur PDF.",
    logsError: "Erreur logs.",
  },
};
