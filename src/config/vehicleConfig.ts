/**
 * VEHICLE CONFIGURATION FILE
 * 
 * Ce fichier centralise TOUTE la personnalisation spécifique au véhicule.
 * Pour créer une déclinaison pour un autre véhicule :
 * 1. Dupliquer ce fichier
 * 2. Modifier les valeurs (modèles, maintenance, textes, couleurs)
 * 3. Mettre à jour app.json (nom, bundle ID, icônes)
 * 
 * Le reste du code (core) n'a PAS besoin d'être modifié.
 */

// ── BRANDING ──────────────────────────────────────────────
export const APP_NAME = 'Z3 Copilot';
export const APP_SHORT_NAME = 'Z3';
export const APP_VERSION = '1.0.5';
export const APP_TAGLINE = 'Passionné BMW Z3';
export const BACKUP_FILENAME = 'z3_copilot_backup.json';
export const LOCATION_TASK_NAME = 'Z3_COPILOT_LOCATION_TRACKING';

// Image du véhicule affichée sur le Dashboard
export const VEHICLE_PROFILE_IMAGE = require('../../assets/z3_profile.png');

// ── COULEURS MARQUE (optionnel, override) ──────────────────
export const BRAND_COLORS = {
  primary: '#0066B2',      // BMW Blue
  primaryDark: '#003366',
  accent: '#E63946',       // BMW Red
};

// ── CATALOGUE VÉHICULE ────────────────────────────────────
export const VEHICLE_MODELS = [
  'Roadster 1.8 (115ch)',
  'Roadster 1.9 (140ch)',
  'Roadster 1.9i (118ch)',
  'Roadster 2.0 (150ch)',
  'Roadster 2.2i (170ch)',
  'Roadster 2.8 (192ch)',
  'Roadster 3.0i (231ch)',
  'M Roadster (S50 - 321ch)',
  'M Roadster (S54 - 325ch)',
  'Coupé 2.8 (192ch)',
  'Coupé 3.0i (231ch)',
  'M Coupé (S50 - 321ch)',
  'M Coupé (S54 - 325ch)',
];

export const VEHICLE_YEARS = [
  '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002'
];

// ── TYPES MOTEUR ──────────────────────────────────────────
export type EngineType = '4cyl' | '6cyl' | 'M';

export const ENGINE_TYPE_LABELS: Record<EngineType, string> = {
  '4cyl': '4 Cylindres M43/M44',
  '6cyl': '6 Cylindres M52/M54',
  'M': 'Z3 M (S50/S54)',
};

export const detectEngineType = (model: string): EngineType => {
  const m = model.toLowerCase();
  if (m.includes('m roadster') || m.includes('m coupé')) return 'M';
  if (m.includes('2.0') || m.includes('2.2') || m.includes('2.8') || m.includes('3.0')) return '6cyl';
  return '4cyl';
};

// ── PIÈCES DE MAINTENANCE ─────────────────────────────────
export interface MaintenanceItemConfig {
  id: string;
  label: string;
  typeLabel: 'Oil Service' | 'Entretien & réparation';
  category: 'maintenance' | 'safety' | 'other';
  icon: string;
}

export const MAINTENANCE_ITEMS: MaintenanceItemConfig[] = [
  { id: 'oil', label: 'Vidange + filtre à huile', typeLabel: 'Oil Service', category: 'maintenance', icon: 'droplets' },
  { id: 'air_filter', label: 'Filtre à air', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'wind' },
  { id: 'cabin_filter', label: 'Filtre habitacle', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'wind' },
  { id: 'ac_recharge', label: 'Recharge climatisation', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'thermometer' },
  { id: 'spark_plugs', label: 'Bougies', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'zap' },
  { id: 'fuel_filter', label: 'Filtre à essence', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'fuel' },
  { id: 'gearbox_oil', label: 'Huile boîte de vitesses', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'settings' },
  { id: 'differential_oil', label: 'Huile différentiel', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'settings' },
  { id: 'clutch', label: 'Embrayage', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'zap-off' },
  { id: 'accessory_belt', label: 'Courroie accessoires', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'refresh-ccw' },
  { id: 'pulleys', label: 'Galets (tendeurs + enrouleurs)', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'circle-dashed' },
  { id: 'brake_fluid', label: 'Liquide de frein', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'droplets' },
  { id: 'brake_pads_front', label: 'Plaquettes AV', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'disc' },
  { id: 'brake_pads_rear', label: 'Plaquettes AR', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'disc' },
  { id: 'brake_discs_front', label: 'Disques AV', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'disc' },
  { id: 'brake_discs_rear', label: 'Disques AR', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'disc' },
  { id: 'shocks', label: 'Amortisseurs', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'arrow-up-down' },
  { id: 'bushings', label: 'Silentblocs', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'layers' },
  { id: 'water_pump', label: 'Pompe à eau', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'refresh-cw' },
  { id: 'thermostat', label: 'Thermostat', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'thermometer' },
  { id: 'cooling_system', label: 'Radiateur + vase expansion', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'shield-alert' },
  { id: 'coolant', label: 'Liquide refroidissement', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'droplets' },
  { id: 'timing', label: 'Chaîne / tendeur', typeLabel: 'Entretien & réparation', category: 'maintenance', icon: 'settings' },
  { id: 'battery', label: 'Batterie', typeLabel: 'Entretien & réparation', category: 'other', icon: 'battery' },
  { id: 'tires_front', label: 'Pneus AV (avant)', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'circle' },
  { id: 'tires_rear', label: 'Pneus AR (arrière)', typeLabel: 'Entretien & réparation', category: 'safety', icon: 'circle' },
];

// ── INTERVALLES PAR MOTEUR ────────────────────────────────
export interface MaintenanceInterval {
  km?: number;
  years?: number;
  detail: string;
  cost: string;
}

export const MAINTENANCE_SCHEMA: Record<EngineType, Record<string, MaintenanceInterval>> = {
  '4cyl': {
    oil: { km: 10000, years: 1, detail: 'Usage standard', cost: '100 – 200 €' },
    air_filter: { km: 20000, detail: 'Simple', cost: '30 – 80 €' },
    cabin_filter: { km: 20000, years: 2, detail: 'Confort', cost: '40 – 100 €' },
    ac_recharge: { years: 3, detail: 'Perte naturelle', cost: '80 – 150 €' },
    spark_plugs: { km: 60000, detail: '4 bougies', cost: '80 – 200 €' },
    fuel_filter: { km: 60000, detail: 'Souvent oublié', cost: '80 – 150 €' },
    gearbox_oil: { km: 120000, detail: 'Préventif', cost: '100 – 250 €' },
    differential_oil: { km: 120000, detail: 'Propulsion', cost: '100 – 200 €' },
    clutch: { km: 150000, detail: 'Usage normal', cost: '700 – 1 500 €' },
    accessory_belt: { km: 100000, years: 5, detail: 'Préventif', cost: '80 – 200 €' },
    pulleys: { km: 120000, detail: 'Bruits à surveiller', cost: '100 – 300 €' },
    brake_fluid: { years: 2, detail: 'Standard', cost: '80 – 150 €' },
    brake_pads_front: { km: 50000, detail: 'Freinage principal', cost: '120 – 250 €' },
    brake_pads_rear: { km: 70000, detail: 'Usure lente', cost: '100 – 200 €' },
    brake_discs_front: { km: 100000, detail: 'Ventilés', cost: '200 – 500 €' },
    brake_discs_rear: { km: 120000, detail: 'Moins sollicités', cost: '150 – 400 €' },
    shocks: { km: 120000, detail: 'Confort', cost: '400 – 900 €' },
    bushings: { km: 120000, detail: 'Vieillissement', cost: '300 – 800 €' },
    water_pump: { km: 120000, detail: 'Préventif', cost: '300 – 600 €' },
    thermostat: { km: 120000, detail: 'Avec pompe', cost: '150 – 300 €' },
    cooling_system: { km: 150000, detail: 'Vieillissement', cost: '400 – 800 €' },
    coolant: { years: 4, detail: 'Standard', cost: '80 – 150 €' },
    timing: { km: 200000, detail: 'Faible risque', cost: '300 – 1 000 €' },
    battery: { years: 6, detail: 'Simple', cost: '100 – 250 €' },
    tires_front: { km: 35000, detail: 'Usure faible', cost: '200 – 500 €' },
    tires_rear: { km: 25000, detail: 'Propulsion', cost: '250 – 600 €' },
  },
  '6cyl': {
    oil: { km: 9000, detail: 'Huile exigeante', cost: '100 – 200 €' },
    air_filter: { km: 17500, detail: 'Plus sollicité', cost: '30 – 80 €' },
    cabin_filter: { km: 17500, detail: 'Ventilation', cost: '40 – 100 €' },
    ac_recharge: { years: 3, detail: 'Idem', cost: '80 – 150 €' },
    spark_plugs: { km: 50000, detail: '6 bougies', cost: '80 – 200 €' },
    fuel_filter: { km: 50000, detail: 'Important', cost: '80 – 150 €' },
    gearbox_oil: { km: 100000, detail: 'Améliore passages', cost: '100 – 250 €' },
    differential_oil: { km: 100000, detail: '🔴', cost: '100 – 200 €' },
    clutch: { km: 135000, detail: 'Couple ↑', cost: '700 – 1 500 €' },
    accessory_belt: { km: 90000, detail: '🔴 Plus sollicitée', cost: '80 – 200 €' },
    pulleys: { km: 100000, detail: '🔴 Usure plus rapide', cost: '100 – 300 €' },
    brake_fluid: { years: 2, detail: 'Important', cost: '80 – 150 €' },
    brake_pads_front: { km: 40000, detail: 'Plus sollicité', cost: '120 – 250 €' },
    brake_pads_rear: { km: 60000, detail: 'Moins sollicité', cost: '100 – 200 €' },
    brake_discs_front: { km: 80000, detail: '🔴', cost: '200 – 500 €' },
    brake_discs_rear: { km: 100000, detail: 'Standard', cost: '150 – 400 €' },
    shocks: { km: 90000, detail: 'Plus sollicités', cost: '400 – 900 €' },
    bushings: { km: 90000, detail: '🔴 Faiblesse Z3', cost: '300 – 800 €' },
    water_pump: { km: 90000, detail: '🔴 Critique', cost: '300 – 600 €' },
    thermostat: { km: 100000, detail: 'Risque surchauffe', cost: '150 – 300 €' },
    cooling_system: { km: 110000, detail: '🔴 Fragile', cost: '400 – 800 €' },
    coolant: { years: 4, detail: '🔴', cost: '80 – 150 €' },
    timing: { km: 200000, detail: 'Tendeur', cost: '300 – 1 000 €' },
    battery: { years: 5, detail: '+ équipements', cost: '100 – 250 €' },
    tires_front: { km: 30000, detail: 'Direction', cost: '200 – 500 €' },
    tires_rear: { km: 20000, detail: 'Couple élevé', cost: '250 – 600 €' },
  },
  'M': {
    oil: { km: 6000, detail: '🔴 Premium', cost: '100 – 200 €' },
    air_filter: { km: 12500, detail: 'Sport', cost: '30 – 80 €' },
    cabin_filter: { km: 15000, detail: 'Clim', cost: '40 – 100 €' },
    ac_recharge: { years: 2, detail: 'Intensif', cost: '80 – 150 €' },
    spark_plugs: { km: 35000, detail: '🔴', cost: '80 – 200 €' },
    fuel_filter: { km: 40000, detail: '🔴', cost: '80 – 150 €' },
    gearbox_oil: { km: 70000, detail: '🔴', cost: '100 – 250 €' },
    differential_oil: { km: 70000, detail: '🔴', cost: '100 – 200 €' },
    clutch: { km: 100000, detail: '🔴', cost: '700 – 1 500 €' },
    accessory_belt: { km: 70000, detail: '🔴', cost: '80 – 200 €' },
    pulleys: { km: 80000, detail: '🔴', cost: '100 – 300 €' },
    brake_fluid: { years: 2, detail: '🔴', cost: '80 – 150 €' },
    brake_pads_front: { km: 30000, detail: '🔴', cost: '120 – 250 €' },
    brake_pads_rear: { km: 40000, detail: '🔴', cost: '100 – 200 €' },
    brake_discs_front: { km: 60000, detail: '🔴', cost: '200 – 500 €' },
    brake_discs_rear: { km: 80000, detail: '🔴', cost: '150 – 400 €' },
    shocks: { km: 70000, detail: '🔴', cost: '400 – 900 €' },
    bushings: { km: 70000, detail: '🔴', cost: '300 – 800 €' },
    water_pump: { km: 80000, detail: '🔴', cost: '300 – 600 €' },
    thermostat: { km: 90000, detail: '🔴', cost: '150 – 300 €' },
    cooling_system: { km: 100000, detail: '🔴', cost: '400 – 800 €' },
    coolant: { years: 3, detail: '🔴', cost: '80 – 150 €' },
    timing: { km: 150000, detail: '🔴 VANOS', cost: '300 – 1 000 €' },
    battery: { years: 4, detail: '', cost: '100 – 250 €' },
    tires_front: { km: 25000, detail: '🔴', cost: '200 – 500 €' },
    tires_rear: { km: 15000, detail: '🔴', cost: '250 – 600 €' },
  }
};

// ── ÉTAPES ONBOARDING ─────────────────────────────────────
// Définit les groupes de pièces affichés lors de l'onboarding.
// Chaque step référence des IDs de MAINTENANCE_ITEMS.
// L'icône et la couleur sont des identifiants résolus côté écran.

export interface HealthStepConfig {
  title: string;
  description: string;
  enjeu: string;
  priority: string;
  iconName: string;           // Nom de l'icône lucide-react
  priorityLevel: 'high' | 'critical' | 'low';
  itemIds: string[];          // IDs des pièces de MAINTENANCE_ITEMS
}

export const HEALTH_STEPS_CONFIG: HealthStepConfig[] = [
  {
    title: 'Moteur & lubrification',
    description: 'Fonctionnement interne du moteur et filtration.',
    enjeu: 'Longévité moteur + performances.',
    priority: 'Priorité élevée sur toutes les motorisations.',
    iconName: 'Activity',
    priorityLevel: 'high',
    itemIds: ['oil', 'spark_plugs', 'air_filter', 'timing', 'fuel_filter'],
  },
  {
    title: 'Système de refroidissement',
    description: 'Point faible connu des BMW E36/E37.',
    enjeu: 'Éviter la surchauffe moteur.',
    priority: 'Priorité n°1 sur 6 cylindres et Z3 M.',
    iconName: 'Thermometer',
    priorityLevel: 'critical',
    itemIds: ['water_pump', 'thermostat', 'cooling_system', 'coolant'],
  },
  {
    title: 'Transmission & embrayage',
    description: 'Passage de puissance aux roues.',
    enjeu: 'Agrément de conduite + fiabilité.',
    priority: 'Plus sollicité sur 6 cylindres et M.',
    iconName: 'ZapOff',
    priorityLevel: 'high',
    itemIds: ['gearbox_oil', 'differential_oil', 'clutch', 'accessory_belt', 'pulleys'],
  },
  {
    title: 'Trains roulants & suspension',
    description: 'Tenue de route et comportement.',
    enjeu: 'Stabilité, précision de conduite.',
    priority: 'Point faible structurel de la Z3.',
    iconName: 'Layers',
    priorityLevel: 'critical',
    itemIds: ['shocks', 'bushings'],
  },
  {
    title: 'Système de freinage',
    description: 'Sécurité avant tout.',
    enjeu: 'Sécurité.',
    priority: 'À ne jamais négliger.',
    iconName: 'Disc',
    priorityLevel: 'critical',
    itemIds: ['brake_fluid', 'brake_pads_front', 'brake_pads_rear', 'brake_discs_front', 'brake_discs_rear'],
  },
  {
    title: 'Confort & habitacle',
    description: 'Qualité de vie à bord.',
    enjeu: 'Confort, qualité de l\'air.',
    priority: 'Moins critique mécaniquement.',
    iconName: 'Wind',
    priorityLevel: 'low',
    itemIds: ['cabin_filter', 'ac_recharge'],
  },
  {
    title: 'Électricité & énergie',
    description: 'Démarrage et alimentation.',
    enjeu: 'Fiabilité au quotidien.',
    priority: 'Important si voiture peu utilisée.',
    iconName: 'Battery',
    priorityLevel: 'high',
    itemIds: ['battery'],
  },
  {
    title: 'Pneumatiques',
    description: 'Liaison au sol.',
    enjeu: 'Sécurité + comportement routier.',
    priority: 'Impact direct sur plaisir de conduite.',
    iconName: 'Circle',
    priorityLevel: 'critical',
    itemIds: ['tires_front', 'tires_rear'],
  },
];

// ── COMMUNAUTÉ & LIENS ────────────────────────────────────
export const COMMUNITY_LINKS = [
  { name: 'BMW Z3 Club France', url: 'https://www.bmwz3club.fr/' },
  { name: 'Forum BMW', url: 'https://www.forumbmw.net/' },
];

// ── TEXTES LÉGAUX ─────────────────────────────────────────
export const LEGAL_TEXTS = {
  disclaimer: `${APP_NAME} fournit des recommandations à titre indicatif. L'entretien et la sécurité du véhicule restent sous votre entière responsabilité.`,
  maintenanceDisclaimer: `Les intervalles sont donnés à titre indicatif selon les plans d'entretien standards. ${APP_NAME} ne se substitue pas à l'avis d'un professionnel.`,
  onboardingDisclaimer: `${APP_NAME} est un outil d'assistance fourni à titre indicatif. `,
  onboardingBullets: [
    `Les données proviennent de retours d'expérience communautaire et non de documents constructeur officiels.`,
    `${APP_NAME} ne remplace pas l'avis d'un professionnel.`,
    `Vous restez seul responsable de l'entretien et de la sécurité de votre véhicule.`,
  ],
  privacyIntro: `L'application ${APP_NAME} s'engage à respecter votre vie privée. Cette politique détaille comment nous traitons vos données.`,
  privacyStorage: `${APP_NAME} est une application axée sur la confidentialité. La majorité des données que vous saisissez (profil du véhicule, dépenses, historique de maintenance) sont stockées uniquement sur votre appareil.`,
  legalNotice: `L'application ${APP_NAME} est un outil de suivi informatif. Les recommandations d'entretien, de remplacements de pièces et les échéances kilométriques fournies par l'application sont basées sur des principes généraux.`,
  legalNoSubstitute: `En aucun cas les informations de ${APP_NAME} ne peuvent se substituer à l'avis d'un professionnel qualifié, d'un mécanicien certifié ou aux préconisations officielles adaptées à l'état réel et précis de votre véhicule.`,
  legalAcceptance: `Ce document récapitule les termes juridiques acceptés lors de l'enregistrement initial de votre véhicule dans l'application. En poursuivant l'utilisation de ${APP_NAME}, vous maintenez votre accord avec ces conditions.`,
  pdfTitle: `Carnet d'Entretien - ${APP_NAME}`,
  pdfFooter: `© ${new Date().getFullYear()} ${APP_NAME} - Compagnon d'Entretien`,
};
