import { VehicleConfig } from './types';

export const z4Config: VehicleConfig = {
  APP_NAME: 'Z4 Copilot',
  APP_SHORT_NAME: 'Z4',
  APP_VERSION: '1.10',
  APP_TAGLINE: 'Passionné BMW Z4',
  BACKUP_FILENAME: 'z4_copilot_backup.json',
  LOCATION_TASK_NAME: 'Z4_COPILOT_LOCATION_TRACKING',
  
  // Note: Il faudra ajouter l'image z4_profile.png dans les assets
  VEHICLE_PROFILE_IMAGE: require('../../../assets/z3_profile.png'), 
  
  BRAND_COLORS: {
    primary: '#003366',      // BMW Deep Blue
    primaryDark: '#001A33',
    accent: '#E63946',       // BMW M Red
  },

  VEHICLE_MODELS: [
    'E85 Roadster 2.0i (150ch)',
    'E85 Roadster 2.2i (170ch)',
    'E85 Roadster 2.5i (192ch)',
    'E85 Roadster 2.5si (218ch)',
    'E85 Roadster 3.0i (231ch)',
    'E85 Roadster 3.0si (265ch)',
    'E85 M Roadster (343ch)',
    'E86 Coupé 3.0si (265ch)',
    'E86 M Coupé (343ch)',
    'E89 sDrive18i (156ch)',
    'E89 sDrive20i (184ch)',
    'E89 sDrive23i (204ch)',
    'E89 sDrive28i (245ch)',
    'E89 sDrive30i (258ch)',
    'E89 sDrive35i (306ch)',
    'E89 sDrive35is (340ch)',
  ],

  VEHICLE_YEARS: [
    '2003', '2004', '2005', '2006', '2007', '2008', '2009',
    '2010', '2011', '2012', '2013', '2014', '2015', '2016'
  ],

  ENGINE_TYPE_LABELS: {
    '4cyl': '4 Cylindres (N46/N20)',
    '6cyl': '6 Cylindres (M54/N52/N54)',
    'M': 'Z4 M (S54)',
  },

  detectEngineType: (model: string) => {
    const m = model.toLowerCase();
    if (m.includes('m roadster') || m.includes('m coupé')) return 'M';
    if (m.includes('18i') || m.includes('20i')) return '4cyl';
    return '6cyl';
  },

  MAINTENANCE_ITEMS: [
    { id: 'oil', label: 'Vidange + filtre à huile', typeLabel: 'Oil Service', category: 'maintenance', icon: 'droplets' },
    { id: 'air_filter', label: 'Filtre à air', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'wind' },
    { id: 'cabin_filter', label: 'Filtre habitacle', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'wind' },
    { id: 'spark_plugs', label: 'Bougies', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'zap' },
    { id: 'fuel_filter', label: 'Filtre à essence', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'fuel' },
    { id: 'brake_fluid', label: 'Liquide de frein', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'droplets' },
    { id: 'coolant', label: 'Liquide refroidissement', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'droplets' },
    { id: 'water_pump', label: 'Pompe à eau + Thermostat', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'refresh-cw' },
    { id: 'disa_valve', label: 'Valve DISA', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'settings' }, // Spécifique M54/N52
    { id: 'vanos_solenoids', label: 'Solénoïdes VANOS', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'zap' },
    { id: 'soft_top_motor', label: 'Moteur capote (Relocalisation)', typeLabel: 'Entretien & réparation', category: 'other', icon: 'umbrella' }, // Spécifique E85
    { id: 'battery', label: 'Batterie', typeLabel: 'Entretien & réparation', category: 'other', icon: 'battery' },
    { id: 'tires', label: 'Pneus', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'circle' },
  ],

  MAINTENANCE_SCHEMA: {
    '4cyl': {
      oil: { km: 15000, years: 1, detail: 'LL-01 or LL-04', cost: '100 – 180 €' },
      air_filter: { km: 30000, detail: 'Standard', cost: '30 – 60 €' },
      cabin_filter: { km: 30000, years: 2, detail: 'Charbon actif recommandé', cost: '40 – 80 €' },
      spark_plugs: { km: 60000, detail: '4 bougies', cost: '80 – 150 €' },
      brake_fluid: { years: 2, detail: 'DOT 4', cost: '80 – 120 €' },
      water_pump: { km: 100000, detail: 'Électrique sur certains modèles', cost: '400 – 700 €' },
    },
    '6cyl': {
      oil: { km: 12000, years: 1, detail: '5W30 / 0W40 LL-01', cost: '120 – 200 €' },
      spark_plugs: { km: 60000, detail: '6 bougies NGK/Bosch', cost: '120 – 220 €' },
      disa_valve: { km: 100000, detail: 'Inspection/Kit reconstruction', cost: '100 – 300 €' },
      vanos_solenoids: { km: 80000, detail: 'Nettoyage ou remplacement', cost: '150 – 400 €' },
      water_pump: { km: 100000, detail: 'Pompe électrique fragile', cost: '500 – 900 €' },
      soft_top_motor: { years: 5, detail: 'Prévention drainage (E85)', cost: '200 – 600 €' },
    },
    'M': {
      oil: { km: 8000, years: 1, detail: '10W60 Exclusivement', cost: '150 – 250 €' },
      spark_plugs: { km: 40000, detail: 'Spécifiques S54', cost: '150 – 300 €' },
      vanos_solenoids: { km: 60000, detail: 'Kit Beisan recommandé', cost: '400 – 1200 €' },
      brake_fluid: { years: 1, detail: 'Usage intensif', cost: '100 – 150 €' },
    }
  },

  HEALTH_STEPS_CONFIG: [
    {
      title: 'Moteur & VANOS',
      description: 'Optimisation de la performance moteur.',
      enjeu: 'Souplesse et puissance.',
      priority: 'Crucial pour le S54 et N52.',
      iconName: 'Activity',
      priorityLevel: 'high',
      itemIds: ['oil', 'spark_plugs', 'vanos_solenoids', 'disa_valve'],
    },
    {
      title: 'Refroidissement & Électronique',
      description: 'Pompe à eau et gestion thermique.',
      enjeu: 'Éviter la surchauffe critique.',
      priority: 'Priorité élevée (Pompes électriques).',
      iconName: 'RefreshCw',
      priorityLevel: 'critical',
      itemIds: ['water_pump', 'coolant'],
    },
    {
      title: 'Capote & Drainage',
      description: 'Protection du moteur hydraulique.',
      enjeu: 'Éviter une réparation coûteuse.',
      priority: 'Point noir connu de la Z4 E85.',
      iconName: 'Umbrella',
      priorityLevel: 'high',
      itemIds: ['soft_top_motor'],
    },
    {
      title: 'Sécurité & Liaison au sol',
      description: 'Freins et pneus.',
      enjeu: 'Direction précise et grip.',
      priority: 'Indispensable pour le plaisir de conduire.',
      iconName: 'Disc',
      priorityLevel: 'critical',
      itemIds: ['brake_fluid', 'tires'],
    },
  ],

  COMMUNITY_LINKS: [
    { name: 'Z3-Z4 Club France', url: 'https://www.bmwz3club.fr/' },
    { name: 'ZPost (Global)', url: 'https://www.zpost.com/forums/' },
  ],

  LEGAL_TEXTS: {
    disclaimer: `Z4 Copilot fournit des recommandations à titre indicatif. L'entretien et la sécurité du véhicule restent sous votre entière responsabilité.`,
    maintenanceDisclaimer: `Les intervalles sont basés sur les standards BMW. Z4 Copilot ne remplace pas l'avis d'un expert.`,
    onboardingDisclaimer: `Bienvenue dans l'univers Z4. Cet outil est purement indicatif.`,
    onboardingBullets: [
      `Données pour motorisations BMW M54, N52, N54 et S54.`,
      `Focus sur les faiblesses connues (Pompe, VANOS, Capote).`,
      `L'utilisateur est responsable de la conformité de son entretien.`,
    ],
    privacyIntro: `Z4 Copilot respecte totalement votre vie privée.`,
    privacyStorage: `Vos données d'entretien restent dans votre iPhone.`,
    legalNotice: `Application de suivi pour BMW Z4.`,
    legalNoSubstitute: `Ne se substitue pas au carnet d'entretien constructeur.`,
    legalAcceptance: `Accord avec les mentions légales Z4 Copilot.`,
    pdfTitle: `Carnet d'Entretien - Z4 Copilot`,
    pdfFooter: `© ${new Date().getFullYear()} Z4 Copilot - Joy is BMW`,
  },

  GPS_CONFIG: {
    speedThreshold: 4.16,
    stopThreshold: 1.0,
    stopDuration: 300000,
    stationCheckInterval: 7200000,
    stationKeywords: ['Station', 'Total', 'Esso', 'Shell', 'BP', 'Avia', 'Eni'],
    notifications: {
      tripEndTitle: "Trajet terminé 🏎️",
      tripEndBody: (kms: number) => `Votre Z4 a parcouru ${kms} km. Enregistrer le kilométrage ?`,
      stationTitle: "Pause essence ? ⛽",
      stationBody: (name: string) => `${name || 'Une station'} détectée. Noter la dépense ?`,
    }
  },

  BACKUP_TEXTS: {
    exportError: "Erreur lors de l'exportation Z4.",
    importError: "Fichier Z4 corrompu.",
    importInvalidFormat: "Format Z4 non reconnu.",
    importConfirmTitle: "Restaurer la base Z4 ?",
    importConfirmBody: "Attention : les données actuelles seront remplacées.",
    importSuccess: "Données Z4 restaurées.",
  },

  UI_TEXTS: {
    activeTripBanner: "Suivi Auto-Log activé...",
    greeting: "Bonjour, Pilote Z4",
    updateMileage: "Mise à jour compteur",
    optimalStatus: "Optimal",
    maintenanceStatus: "Entretien",
    lastLogs: "Historique GPS",
    noLogs: "Aucun trajet enregistré.",
    gpsLogsTitle: "Trajets Z4",
    gpsDisabledTitle: "Auto-Log Off",
    gpsDisabledBody: "Le suivi automatique est désactivé.",
    iphoneSettings: "Réglages iPhone",
    logoutTitle: "Quitter",
    logoutConfirm: "Souhaitez-vous fermer la session ?",
    cancel: "Annuler",
    errorTitle: "Erreur",
    pdfError: "Génération PDF impossible.",
    logsError: "Lecture des logs impossible.",
  },
};
