import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ScanBarcode,
  Disc,
  Layers,
  Users,
  History,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRightLeft,
  Scale,
  Download,
  Upload,
  Trash2,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Zap,
  PackagePlus,
  Printer,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Edit3,
  HelpCircle,
  Sparkles,
  Check,
  X,
  SlidersHorizontal,
  Thermometer,
  Droplets,
  FileSpreadsheet,
  Copy,
  QrCode,
  ShieldCheck,
  UserPlus,
  Lock,
  LogOut,
  Clock,
  Send,
  ExternalLink,
  ThumbsUp,
  PackageCheck,
  Bell,
  Ban,
  Database
} from 'lucide-react';

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db = null;
try {
  if (firebaseConfig.apiKey) {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase init error:", e);
}

// ============================================================================
// SEED DATASET (189 OFFICIAL BAMBU LAB FILAMENTS)
// ============================================================================
const SEED_BAMBU_CATALOG = [
  // PLA Basic
  { material: 'PLA Basic', name: 'Jade White (10100)', hex: '#FFFFFF' },
  { material: 'PLA Basic', name: 'Beige (10201)', hex: '#F7E6DE' },
  { material: 'PLA Basic', name: 'Light Gray (10104)', hex: '#D1D3D5' },
  { material: 'PLA Basic', name: 'Yellow (10400)', hex: '#F4EE2A' },
  { material: 'PLA Basic', name: 'Sunflower Yellow (10402)', hex: '#FEC600' },
  { material: 'PLA Basic', name: 'Gold (10401)', hex: '#E4BD68' },
  { material: 'PLA Basic', name: 'Pumpkin Orange (10301)', hex: '#FF9016' },
  { material: 'PLA Basic', name: 'Orange (10300)', hex: '#FF6A13' },
  { material: 'PLA Basic', name: 'Pink (10203)', hex: '#F55A74' },
  { material: 'PLA Basic', name: 'Hot Pink (10204)', hex: '#F5547C' },
  { material: 'PLA Basic', name: 'Magenta (10202)', hex: '#EC008C' },
  { material: 'PLA Basic', name: 'Red (10200)', hex: '#C12E1F' },
  { material: 'PLA Basic', name: 'Maroon Red (10205)', hex: '#9D2235' },
  { material: 'PLA Basic', name: 'Purple (10700)', hex: '#5E43B7' },
  { material: 'PLA Basic', name: 'Indigo Purple (10701)', hex: '#482960' },
  { material: 'PLA Basic', name: 'Bright Green (10503)', hex: '#BECF00' },
  { material: 'PLA Basic', name: 'Bambu Green (10501)', hex: '#00AE42' },
  { material: 'PLA Basic', name: 'Mistletoe Green (10502)', hex: '#3F8E43' },
  { material: 'PLA Basic', name: 'Turquoise (10605)', hex: '#00B1B7' },
  { material: 'PLA Basic', name: 'Cyan (10603)', hex: '#0086D6' },
  { material: 'PLA Basic', name: 'Cobalt Blue (10604)', hex: '#0056B8' },
  { material: 'PLA Basic', name: 'Blue (10601)', hex: '#0A2989' },
  { material: 'PLA Basic', name: 'Brown (10800)', hex: '#9D432C' },
  { material: 'PLA Basic', name: 'Cocoa Brown (10802)', hex: '#6F5034' },
  { material: 'PLA Basic', name: 'Bronze (10801)', hex: '#847D48' },
  { material: 'PLA Basic', name: 'Gray (10103)', hex: '#8E9089' },
  { material: 'PLA Basic', name: 'Silver (10102)', hex: '#A6A9AA' },
  { material: 'PLA Basic', name: 'Blue Grey (10602)', hex: '#5B6579' },
  { material: 'PLA Basic', name: 'Dark Gray (10105)', hex: '#545454' },
  { material: 'PLA Basic', name: 'Black (10101)', hex: '#000000' },

  // PLA Matte
  { material: 'PLA Matte', name: 'Ivory White (11100)', hex: '#FFFFFF' },
  { material: 'PLA Matte', name: 'Bone White (11103)', hex: '#CBC6B8' },
  { material: 'PLA Matte', name: 'Lemon Yellow (11400)', hex: '#F7D959' },
  { material: 'PLA Matte', name: 'Mandarin Orange (11300)', hex: '#F99963' },
  { material: 'PLA Matte', name: 'Sakura Pink (11201)', hex: '#E8AFCF' },
  { material: 'PLA Matte', name: 'Lilac Purple (11700)', hex: '#AE96D4' },
  { material: 'PLA Matte', name: 'Plum (11204)', hex: '#950051' },
  { material: 'PLA Matte', name: 'Scarlet Red (11200)', hex: '#DE4343' },
  { material: 'PLA Matte', name: 'Dark Red (11202)', hex: '#BB3D43' },
  { material: 'PLA Matte', name: 'Apple Green (11502)', hex: '#C2E189' },
  { material: 'PLA Matte', name: 'Grass Green (11500)', hex: '#61C680' },
  { material: 'PLA Matte', name: 'Dark Green (11501)', hex: '#68724D' },
  { material: 'PLA Matte', name: 'Ice Blue (11601)', hex: '#A3D8E1' },
  { material: 'PLA Matte', name: 'Sky Blue (11603)', hex: '#56B7E6' },
  { material: 'PLA Matte', name: 'Marine Blue (11600)', hex: '#0078BF' },
  { material: 'PLA Matte', name: 'Dark Blue (11602)', hex: '#042F56' },
  { material: 'PLA Matte', name: 'Desert Tan (11401)', hex: '#E8DBB7' },
  { material: 'PLA Matte', name: 'Latte Brown (11800)', hex: '#D3B7A7' },
  { material: 'PLA Matte', name: 'Caramel (11803)', hex: '#AE835B' },
  { material: 'PLA Matte', name: 'Terracotta (11203)', hex: '#B15533' },
  { material: 'PLA Matte', name: 'Dark Brown (11801)', hex: '#7D6556' },
  { material: 'PLA Matte', name: 'Dark Chocolate (11802)', hex: '#4D3324' },
  { material: 'PLA Matte', name: 'Ash Gray (11102)', hex: '#9B9EA0' },
  { material: 'PLA Matte', name: 'Nardo Gray (11104)', hex: '#757575' },
  { material: 'PLA Matte', name: 'Charcoal (11101)', hex: '#000000' },

  // PLA Tough+
  { material: 'PLA Tough+', name: 'Yellow (12401)', hex: '#F4D53F' },
  { material: 'PLA Tough+', name: 'White (12107)', hex: '#FFFFFF' },
  { material: 'PLA Tough+', name: 'Orange (12301)', hex: '#DC3A27' },
  { material: 'PLA Tough+', name: 'Gray (12105)', hex: '#AFB1AE' },
  { material: 'PLA Tough+', name: 'Silver (12106)', hex: '#959698' },
  { material: 'PLA Tough+', name: 'Cyan (12601)', hex: '#009BD8' },
  { material: 'PLA Tough+', name: 'Black (12104)', hex: '#000000' },

  // PLA Pure
  { material: 'PLA Pure', name: 'Milky Pink (17200)', hex: '#F7CED7' },
  { material: 'PLA Pure', name: 'Baby Blue (17600)', hex: '#A4DBE8' },
  { material: 'PLA Pure', name: 'Apricot (17300)', hex: '#FFB673' },
  { material: 'PLA Pure', name: 'Pure White (17100)', hex: '#FFFFFF' },
  { material: 'PLA Pure', name: 'Absolute Black (17101)', hex: '#000000' },

  // PETG HF
  { material: 'PETG HF', name: 'Red (33200)', hex: '#EB3A3A' },
  { material: 'PETG HF', name: 'Blue (33600)', hex: '#002E96' },
  { material: 'PETG HF', name: 'Black (33102)', hex: '#000000' },
  { material: 'PETG HF', name: 'White (33100)', hex: '#FFFFFF' },
  { material: 'PETG HF', name: 'Gray (33101)', hex: '#ADB1B2' },
  { material: 'PETG HF', name: 'Yellow (33400)', hex: '#FFD00B' },
  { material: 'PETG HF', name: 'Orange (33300)', hex: '#F75403' },
  { material: 'PETG HF', name: 'Green (33500)', hex: '#00AE42' },
  { material: 'PETG HF', name: 'Forest Green (33502)', hex: '#39541A' },
  { material: 'PETG HF', name: 'Peanut Brown (33801)', hex: '#875718' },
  { material: 'PETG HF', name: 'Dark Gray (33103)', hex: '#515151' },
  { material: 'PETG HF', name: 'Cream (33401)', hex: '#F9DFB9' },
  { material: 'PETG HF', name: 'Lime Green (33501)', hex: '#6EE53C' },
  { material: 'PETG HF', name: 'Lake Blue (33601)', hex: '#1F79E5' },

  // PETG Basic
  { material: 'PETG Basic', name: 'Orange (30301)', hex: '#FF671F' },
  { material: 'PETG Basic', name: 'Red (30201)', hex: '#D6001C' },
  { material: 'PETG Basic', name: 'Green (30502)', hex: '#009639' },
  { material: 'PETG Basic', name: 'Yellow (30402)', hex: '#FCE300' },
  { material: 'PETG Basic', name: 'Navy Blue (30604)', hex: '#0086D6' },
  { material: 'PETG Basic', name: 'Reflex Blue (30603)', hex: '#001489' },
  { material: 'PETG Basic', name: 'White (30106)', hex: '#FFFFFF' },
  { material: 'PETG Basic', name: 'Dark Beige (30403)', hex: '#DBC8B6' },
  { material: 'PETG Basic', name: 'Black (30105)', hex: '#000000' },
  { material: 'PETG Basic', name: 'Dark Brown (30800)', hex: '#4F2C1D' },
  { material: 'PETG Basic', name: 'Gray (30107)', hex: '#7F7E83' },
  { material: 'PETG Basic', name: 'Misty Blue (30108)', hex: '#688197' },
  { material: 'PETG Basic', name: 'Pine Green (30503)', hex: '#034638' },

  // PETG Matte
  { material: 'PETG Matte', name: 'Black (35101)', hex: '#000000' },
  { material: 'PETG Matte', name: 'White (35100)', hex: '#FFFFFF' },
  { material: 'PETG Matte', name: 'Gray (35102)', hex: '#7F7E83' },
  { material: 'PETG Matte', name: 'Pink (35700)', hex: '#FABBCB' },
  { material: 'PETG Matte', name: 'Violet (35702)', hex: '#A7A4E0' },
  { material: 'PETG Matte', name: 'Baby Blue (35600)', hex: '#B9D9EB' },
  { material: 'PETG Matte', name: 'Avocado Green (35501)', hex: '#BCE194' },
  { material: 'PETG Matte', name: 'Lime (35500)', hex: '#C0DF16' },

  // ABS
  { material: 'ABS', name: 'Orange (40300)', hex: '#FF6A13' },
  { material: 'ABS', name: 'Blue (40600)', hex: '#0A2CA5' },
  { material: 'ABS', name: 'Bambu Green (40500)', hex: '#00AE42' },
  { material: 'ABS', name: 'Olive (40502)', hex: '#789D4A' },
  { material: 'ABS', name: 'Silver (40102)', hex: '#87909A' },
  { material: 'ABS', name: 'Red (40200)', hex: '#D32941' },
  { material: 'ABS', name: 'Tangerine Yellow (40402)', hex: '#FFC72C' },
  { material: 'ABS', name: 'Azure (40601)', hex: '#489FDF' },
  { material: 'ABS', name: 'Navy Blue (40602)', hex: '#0C2340' },
  { material: 'ABS', name: 'Black (40101)', hex: '#000000' },
  { material: 'ABS', name: 'White (40100)', hex: '#FFFFFF' },

  // ASA
  { material: 'ASA', name: 'White (45100)', hex: '#FFFAF2' },
  { material: 'ASA', name: 'Red (45200)', hex: '#E02928' },
  { material: 'ASA', name: 'Green (45500)', hex: '#00A6A0' },
  { material: 'ASA', name: 'Gray (45102)', hex: '#8A949E' },
  { material: 'ASA', name: 'Blue (45600)', hex: '#2140B4' },
  { material: 'ASA', name: 'Black (45101)', hex: '#000000' },

  // TPU 95A HF
  { material: 'TPU 95A HF', name: 'White (51102)', hex: '#FFFFFF' },
  { material: 'TPU 95A HF', name: 'Gray (51101)', hex: '#898D8D' },
  { material: 'TPU 95A HF', name: 'Yellow (51400)', hex: '#F3E600' },
  { material: 'TPU 95A HF', name: 'Blue (51600)', hex: '#0072CE' },
  { material: 'TPU 95A HF', name: 'Red (51200)', hex: '#C8102E' },
  { material: 'TPU 95A HF', name: 'Black (51100)', hex: '#101820' },

  // TPU for AMS
  { material: 'TPU for AMS', name: 'Blue (53600)', hex: '#5898DD' },
  { material: 'TPU for AMS', name: 'Red (53200)', hex: '#ED0000' },
  { material: 'TPU for AMS', name: 'Yellow (53400)', hex: '#F9EF41' },
  { material: 'TPU for AMS', name: 'Gray (53102)', hex: '#939393' },
  { material: 'TPU for AMS', name: 'Neon Green (53500)', hex: '#90FF1A' },
  { material: 'TPU for AMS', name: 'White (53100)', hex: '#FFFFFF' },
  { material: 'TPU for AMS', name: 'Black (53101)', hex: '#000000' },

  // PLA Glow
  { material: 'PLA Glow', name: 'Glow Green (15500)', hex: '#A1FFAC' },
  { material: 'PLA Glow', name: 'Glow Pink (15200)', hex: '#F17B8F' },
  { material: 'PLA Glow', name: 'Glow Blue (15600)', hex: '#7AC0E9' },
  { material: 'PLA Glow', name: 'Glow Orange (15300)', hex: '#FF9D5B' },
  { material: 'PLA Glow', name: 'Glow Yellow (15400)', hex: '#F8FF80' },

  // PLA Silk+
  { material: 'PLA Silk+', name: 'Pink (13207)', hex: '#F7ADA6' },
  { material: 'PLA Silk+', name: 'Gold (13405)', hex: '#F4A925' },
  { material: 'PLA Silk+', name: 'Silver (13109)', hex: '#C8C8C8' },
  { material: 'PLA Silk+', name: 'Titan Gray (13108)', hex: '#5F6367' },
  { material: 'PLA Silk+', name: 'Candy Red (13205)', hex: '#D02727' },
  { material: 'PLA Silk+', name: 'Candy Green (13506)', hex: '#018814' },
  { material: 'PLA Silk+', name: 'Blue (13604)', hex: '#008BDA' },
  { material: 'PLA Silk+', name: 'Purple (13702)', hex: '#8671CB' },
  { material: 'PLA Silk+', name: 'Rose Gold (13206)', hex: '#BA9594' },
  { material: 'PLA Silk+', name: 'Baby Blue (13603)', hex: '#A8C6EE' },
  { material: 'PLA Silk+', name: 'Mint (13507)', hex: '#96DCB9' },
  { material: 'PLA Silk+', name: 'Champagne (13404)', hex: '#F3CFB2' },
  { material: 'PLA Silk+', name: 'White (13110)', hex: '#FFFFFF' },

  // PLA Silk Multi-Color
  { material: 'PLA Silk Multi-Color', name: 'Dawn Radiance (13912)', hex: '#EC984C/#6CD4BC/#A66EB9/#D87694' },
  { material: 'PLA Silk Multi-Color', name: 'Aurora Purple (13909)', hex: '#7F3696/#006EC9' },
  { material: 'PLA Silk Multi-Color', name: 'South Beach (13906)', hex: '#F772A4/#00918B' },
  { material: 'PLA Silk Multi-Color', name: 'Neon City (13903)', hex: '#0047BB/#BB22A3' },
  { material: 'PLA Silk Multi-Color', name: 'Midnight Blaze (13902)', hex: '#0047BB/#7D1B49' },
  { material: 'PLA Silk Multi-Color', name: 'Blue Hawaii (13904)', hex: '#418FDE/#70C884' },
  { material: 'PLA Silk Multi-Color', name: 'Gilded Rose (13901)', hex: '#FF9425/#C16784' },
  { material: 'PLA Silk Multi-Color', name: 'Velvet Eclipse (13905)', hex: '#000000/#A34342' },
  { material: 'PLA Silk Multi-Color', name: 'Mystic Magenta (13913)', hex: '#720062/#3A913F' },
  { material: 'PLA Silk Multi-Color', name: 'Phantom Blue (13916)', hex: '#00629B/#000000' },

  // PLA Basic Gradient
  { material: 'PLA Basic Gradient', name: 'Blueberry Bubblegum (10905)', hex: '#6FCAEF/#8573DD' },
  { material: 'PLA Basic Gradient', name: 'Cotton Candy Cloud (10907)', hex: '#E7C1D5/#8EC9E9' },
  { material: 'PLA Basic Gradient', name: 'Pink Citrus (10903)', hex: '#F78F77/#E4505A' },
  { material: 'PLA Basic Gradient', name: 'Mint Lime (10904)', hex: '#B6FF43/#4EC939' },
  { material: 'PLA Basic Gradient', name: 'Dusk Glare (10906)', hex: '#CE4406/#ED9558' },
  { material: 'PLA Basic Gradient', name: 'Ocean to Meadow (10902)', hex: '#307FE2/#54FF9B' },
  { material: 'PLA Basic Gradient', name: 'Solar Breeze (10901)', hex: '#E94B3C/#FFFFFF' },
  { material: 'PLA Basic Gradient', name: 'Arctic Whisper (10900)', hex: '#9CDBD9/#FFFFFF' },

  // PLA Marble
  { material: 'PLA Marble', name: 'Red Granite (13201)', hex: '#AD4E38' },
  { material: 'PLA Marble', name: 'White Marble (13103)', hex: '#F7F3F0' },

  // PLA Sparkle
  { material: 'PLA Sparkle', name: 'Alpine Green Sparkle (13501)', hex: '#3F5443' },
  { material: 'PLA Sparkle', name: 'Slate Gray Sparkle (13102)', hex: '#8E9089' },
  { material: 'PLA Sparkle', name: 'Royal Purple Sparkle (13700)', hex: '#483D8B' },
  { material: 'PLA Sparkle', name: 'Crimson Red Sparkle (13200)', hex: '#792B36' },
  { material: 'PLA Sparkle', name: 'Onyx Black Sparkle (13101)', hex: '#2D2B28' },
  { material: 'PLA Sparkle', name: 'Classic Gold Sparkle (13402)', hex: '#CEA629' },

  // PLA Galaxy
  { material: 'PLA Galaxy', name: 'Purple (13602)', hex: '#594177' },
  { material: 'PLA Galaxy', name: 'Green (13503)', hex: '#3B665E' },
  { material: 'PLA Galaxy', name: 'Nebulae (13504)', hex: '#424379' },
  { material: 'PLA Galaxy', name: 'Brown (13203)', hex: '#684A43' },

  // PLA Metal
  { material: 'PLA Metal', name: 'Cobalt Blue Metallic (13600)', hex: '#39699E' },
  { material: 'PLA Metal', name: 'Oxide Green Metallic (13500)', hex: '#1D7C6A' },
  { material: 'PLA Metal', name: 'Iridium Gold Metallic (13400)', hex: '#B39B84' },
  { material: 'PLA Metal', name: 'Copper Brown Metallic (13800)', hex: '#AA6443' },
  { material: 'PLA Metal', name: 'Iron Gray Metallic (13100)', hex: '#43403D' },

  // PLA Wood
  { material: 'PLA Wood', name: 'Black Walnut (13107)', hex: '#4F3F24' },
  { material: 'PLA Wood', name: 'Rosewood (13204)', hex: '#4C241C' },
  { material: 'PLA Wood', name: 'Clay Brown (13801)', hex: '#995F11' },
  { material: 'PLA Wood', name: 'Classic Birch (13505)', hex: '#918669' },
  { material: 'PLA Wood', name: 'White Oak (13106)', hex: '#D6CCA3' },
  { material: 'PLA Wood', name: 'Ochre Yellow (13403)', hex: '#C98935' },

  // PLA Translucent
  { material: 'PLA Translucent', name: 'Teal (13612)', hex: '#009FA1' },
  { material: 'PLA Translucent', name: 'Blue (13611)', hex: '#0047BB' },
  { material: 'PLA Translucent', name: 'Purple (13710)', hex: '#8344B0' },
  { material: 'PLA Translucent', name: 'Orange (13301)', hex: '#F74E02' },
  { material: 'PLA Translucent', name: 'Red (13210)', hex: '#B50011' },
  { material: 'PLA Translucent', name: 'Light Jade (13510)', hex: '#96D8AF' },
  { material: 'PLA Translucent', name: 'Mellow Yellow (13410)', hex: '#F5DBAB' },
  { material: 'PLA Translucent', name: 'Cherry Pink (13211)', hex: '#F5B6CD' },
  { material: 'PLA Translucent', name: 'Ice Blue (13610)', hex: '#B8CDE9' },
  { material: 'PLA Translucent', name: 'Lavender (13711)', hex: '#B8ACD6' },

  // PETG Translucent
  { material: 'PETG Translucent', name: 'Light Blue (32600)', hex: '#61B0FF' },
  { material: 'PETG Translucent', name: 'Teal (32501)', hex: '#77EDD7' },
  { material: 'PETG Translucent', name: 'Clear (32101)', hex: '#E2E8F0' },
  { material: 'PETG Translucent', name: 'Olive (32500)', hex: '#748C45' },
  { material: 'PETG Translucent', name: 'Brown (32800)', hex: '#C9A381' },
  { material: 'PETG Translucent', name: 'Orange (32300)', hex: '#FF911A' },
  { material: 'PETG Translucent', name: 'Purple (32700)', hex: '#D6ABFF' },
  { material: 'PETG Translucent', name: 'Pink (32200)', hex: '#F9C1BD' },
  { material: 'PETG Translucent', name: 'Gray (32100)', hex: '#8E8E8E' },

  // PLA-CF
  { material: 'PLA-CF', name: 'Burgundy Red (14200)', hex: '#951E23' },
  { material: 'PLA-CF', name: 'Jeans Blue (14600)', hex: '#6E88BC' },
  { material: 'PLA-CF', name: 'Lava Gray (14101)', hex: '#4D5054' },
  { material: 'PLA-CF', name: 'Matcha Green (14500)', hex: '#5C9748' },
  { material: 'PLA-CF', name: 'Royal Blue (14601)', hex: '#2842AD' },
  { material: 'PLA-CF', name: 'Iris Purple (14700)', hex: '#69398E' },
  { material: 'PLA-CF', name: 'Black (14100)', hex: '#000000' },

  // PETG-CF
  { material: 'PETG-CF', name: 'Violet Purple (31700)', hex: '#583061' },
  { material: 'PETG-CF', name: 'Indigo Blue (31600)', hex: '#324585' },
  { material: 'PETG-CF', name: 'Brick Red (31200)', hex: '#9F332A' },
  { material: 'PETG-CF', name: 'Black (31100)', hex: '#000000' },
  { material: 'PETG-CF', name: 'Malachite Green (31500)', hex: '#16B08E' },
  { material: 'PETG-CF', name: 'Titan Gray (31101)', hex: '#565656' }
];

const OWNER_COLORS = [
  { name: 'Amber', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/50', hex: '#F59E0B' },
  { name: 'Emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/50', hex: '#10B981' },
  { name: 'Cyan', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/50', hex: '#06B6D4' },
  { name: 'Purple', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/50', hex: '#A855F7' },
  { name: 'Rose', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/50', hex: '#F43F5E' },
  { name: 'Blue', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/50', hex: '#3B82F6' }
];

const AMS_SLOTS = ['A1', 'A2', 'A3', 'A4'];

// Helper for filament weight threshold styling
const getWeightColorConfig = (grams) => {
  if (grams > 250) {
    return { textClass: 'text-emerald-400 font-bold', bgClass: 'bg-emerald-500' };
  } else if (grams > 50) {
    return { textClass: 'text-yellow-400 font-bold', bgClass: 'bg-yellow-400' };
  } else {
    return { textClass: 'text-red-500 font-bold animate-pulse', bgClass: 'bg-red-500' };
  }
};

// Helper to safely extract primary hex color when multi-color strings like "#EC984C/#6CD4BC" are used
const getPrimaryHex = (hexStr) => {
  if (!hexStr) return '#FFFFFF';
  return String(hexStr).split('/')[0].trim() || '#FFFFFF';
};

// ============================================================================
// SOUND SYNTHESIZER
// ============================================================================
const playZebraBeep = (type = 'scan', enabled = true) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'scan') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(2450, now);
      osc.frequency.setValueAtTime(2950, now + 0.045);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      osc.start(now);
      osc.stop(now + 0.11);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(2100, now + 0.07);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(240, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.start(now);
      osc.stop(now + 0.26);
    }
  } catch (e) {}
};

// ============================================================================
// SPOOL GAUGE
// ============================================================================
const SpoolGaugeSVG = ({ hex = '#00AE42', percentage = 75, size = 54 }) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const safeHex = getPrimaryHex(hex);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill="#18181B" stroke="#3F3F46" strokeWidth="1.5" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#27272A" strokeWidth="6" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={safeHex}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="8" fill="#09090B" stroke="#52525B" strokeWidth="1.5" />
      </svg>
      <span className="absolute text-[10px] font-mono font-bold text-zinc-200">
        {Math.round(clamped)}%
      </span>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zebra_ams_current_user_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [owners, setOwners] = useState([]);
  const [spools, setSpools] = useState([]);
  const [logs, setLogs] = useState([]);
  const [printRequests, setPrintRequests] = useState([]);
  const [bambuLabColors, setBambuLabColors] = useState([]);
  const [isSeedingCatalog, setIsSeedingCatalog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loginNotificationModal, setLoginNotificationModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  // Function to batch-upload all 189 items into Firestore 'catalog' collection
  const seedFirestoreCatalog = useCallback(async () => {
    if (!db) {
      showToast('Firestore is not connected!', 'error');
      return;
    }
    setIsSeedingCatalog(true);
    try {
      const batch = writeBatch(db);
      SEED_BAMBU_CATALOG.forEach((item, index) => {
        const docId = `cat-${String(index + 1).padStart(3, '0')}`;
        const ref = doc(db, 'catalog', docId);
        batch.set(ref, {
          id: docId,
          material: item.material,
          name: item.name,
          hex: item.hex || '#FFFFFF',
          order: index + 1
        });
      });
      await batch.commit();
      playZebraBeep('success', soundEnabled);
      showToast(`Successfully seeded all ${SEED_BAMBU_CATALOG.length} colors to Firestore 'catalog'!`, 'success');
    } catch (err) {
      console.error("Failed to seed catalog:", err);
      showToast(`Catalog seed error: ${err.message}`, 'error');
    } finally {
      setIsSeedingCatalog(false);
    }
  }, [soundEnabled, showToast]);

  // --- Real-time Firestore Sync ---
  useEffect(() => {
    if (!db) {
      console.warn("Firestore db is not initialized. Check your environment variables.");
      return;
    }

    try {
      const unsubSpools = onSnapshot(collection(db, 'spools'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setSpools(list);
      }, (err) => console.error("Spools sync error:", err));

      const unsubOwners = onSnapshot(collection(db, 'owners'), (snapshot) => {
        const list = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            username: data.username || '',
            pin: String(data.pin || ''),
            isAdmin: Boolean(data.isAdmin),
            role: data.role || 'Member',
            colorIdx: Number(data.colorIdx ?? 0),
            notes: data.notes || '',
            ...data
          };
        });
        setOwners(list);
      }, (err) => console.error("Owners sync error:", err));

      const unsubCatalog = onSnapshot(collection(db, 'catalog'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs
            .map(d => ({ ...d.data(), id: d.id }))
            .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          setBambuLabColors(list);
        } else {
          // Automatically seed Firestore if 'catalog' collection is empty or has < 50 items
          seedFirestoreCatalog();
        }
      }, (err) => console.error("Catalog sync error:", err));

      const unsubLogs = onSnapshot(collection(db, 'logs'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setLogs(list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }, (err) => console.error("Logs sync error:", err));

      const unsubRequests = onSnapshot(collection(db, 'printRequests'), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setPrintRequests(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }, (err) => console.error("Requests sync error:", err));

      return () => {
        unsubSpools();
        unsubOwners();
        unsubCatalog();
        unsubLogs();
        unsubRequests();
      };
    } catch (e) {
      console.error("Firestore subscription error:", e);
    }
  }, [seedFirestoreCatalog]);

  const MATERIALS = useMemo(() => {
    const activeCatalog = bambuLabColors.length > 0 ? bambuLabColors : SEED_BAMBU_CATALOG;
    return Array.from(new Set(activeCatalog.map(c => c.material)));
  }, [bambuLabColors]);

  // Keep currentUser synced with database owner records if data updates
  useEffect(() => {
    if (!currentUser || owners.length === 0) return;
    const liveOwner = owners.find(o => o.id === currentUser.id);
    if (liveOwner) {
      setCurrentUser(liveOwner);
    }
  }, [owners]);

  // Check login notifications once user logs in
  useEffect(() => {
    if (!currentUser || printRequests.length === 0) return;
    const userNotifs = printRequests.filter(req => req.ownerId === currentUser.id && (req.status === 'AWAITING_PICKUP' || req.status === 'DENIED') && !req.notified);
    if (userNotifs.length > 0) {
      setLoginNotificationModal(userNotifs);
    }
  }, [currentUser, printRequests]);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem('zebra_ams_current_user_v1', JSON.stringify(currentUser));
      else localStorage.removeItem('zebra_ams_current_user_v1');
    } catch (e) {}
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState('ams');
  const [scanMode, setScanMode] = useState('AUTO');
  const [manualScanInput, setManualScanInput] = useState('');
  const [scannerDrawerOpen, setScannerDrawerOpen] = useState(true);

  const [scannedSpoolModal, setScannedSpoolModal] = useState(null);
  const [loadSlotModal, setLoadSlotModal] = useState(null);
  const [printModal, setPrintModal] = useState(null);
  const [spoolFormModal, setSpoolFormModal] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [scaleModal, setScaleModal] = useState(null);
  const [labelModal, setLabelModal] = useState(null);
  const [ownerModal, setOwnerModal] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [completeRequestModal, setCompleteRequestModal] = useState(null);
  const [denyModal, setDenyModal] = useState(null);

  const ownerMap = useMemo(() => {
    const map = {};
    owners.forEach((o) => { map[o.id] = o; });
    return map;
  }, [owners]);

  const getOwnerStyle = useCallback((ownerId) => {
    const owner = ownerMap[ownerId];
    const idx = owner ? (owner.colorIdx ?? 0) % OWNER_COLORS.length : 0;
    return OWNER_COLORS[idx];
  }, [ownerMap]);

  const generateNextBarcode = useCallback(() => {
    let maxNum = 100000;
    spools.forEach((s) => {
      const match = String(s.barcode).match(/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum) maxNum = val;
      }
    });
    return `BBL-${maxNum + 1}`;
  }, [spools]);

  const [batchConfig, setBatchConfig] = useState({
    ownerId: currentUser?.id || 'own-1',
    material: 'PLA Basic',
    brand: 'Bambu Lab',
    colorName: 'Jade White (10100)',
    colorHex: '#FFFFFF',
    initialWeight: 1000,
    tareWeight: 250,
    targetCount: 29
  });
  const [batchSessionSpools, setBatchSessionSpools] = useState([]);
  const [batchBarcodeInput, setBatchBarcodeInput] = useState('');
  const [slotScanBarcode, setSlotScanBarcode] = useState('');

  const handleBarcodeScanned = useCallback(
    async (rawCode) => {
      const code = String(rawCode || '').trim().toUpperCase();
      if (!code) return;

      if (batchModalOpen) {
        const existing = spools.find((s) => s.barcode.toUpperCase() === code);
        if (existing) {
          playZebraBeep('error', soundEnabled);
          showToast(`Barcode ${code} is already registered!`, 'error');
          return;
        }
        const newSpoolId = `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newSpool = {
          id: newSpoolId,
          barcode: code,
          material: batchConfig.material,
          colorName: batchConfig.colorName,
          colorHex: batchConfig.colorHex,
          brand: batchConfig.brand || 'Bambu Lab',
          ownerId: batchConfig.ownerId,
          initialWeight: Number(batchConfig.initialWeight) || 1000,
          remainingWeight: Number(batchConfig.initialWeight) || 1000,
          tareWeight: Number(batchConfig.tareWeight) || 250,
          amsSlot: null,
          createdAt: new Date().toISOString(),
          notes: `Batch Intake Roll #${batchSessionSpools.length + 1}`
        };
        if (db) {
          await setDoc(doc(db, 'spools', newSpoolId), newSpool).catch(() => {});
        }
        setBatchSessionSpools((prev) => [newSpool, ...prev]);
        setBatchBarcodeInput('');
        playZebraBeep('success', soundEnabled);
        showToast(`Batch Scanned [${batchSessionSpools.length + 1}/${batchConfig.targetCount}]: ${code}`, 'success');
        return;
      }

      if (loadSlotModal && loadSlotModal.slot) {
        const targetSlot = loadSlotModal.slot;
        const found = spools.find((s) => s.barcode.toUpperCase() === code);
        if (found) {
          if (db) {
            for (const s of spools) {
              if (s.amsSlot === targetSlot) {
                await setDoc(doc(db, 'spools', s.id), { ...s, amsSlot: null }, { merge: true }).catch(() => {});
              }
            }
            await setDoc(doc(db, 'spools', found.id), { ...found, amsSlot: targetSlot }, { merge: true }).catch(() => {});
          }
          setLoadSlotModal(null);
          setSlotScanBarcode('');
          playZebraBeep('success', soundEnabled);
          showToast(`Loaded ${found.barcode} into AMS Slot ${targetSlot}!`, 'success');
          return;
        } else {
          playZebraBeep('scan', soundEnabled);
          setLoadSlotModal(null);
          setSlotScanBarcode('');
          setSpoolFormModal({
            isEdit: false,
            targetAmsSlot: targetSlot,
            spool: {
              barcode: code,
              material: 'PLA Basic',
              colorName: 'Jade White (10100)',
              colorHex: '#FFFFFF',
              brand: 'Bambu Lab',
              ownerId: currentUser?.id || owners[0]?.id || 'own-1',
              initialWeight: 1000,
              remainingWeight: 1000,
              tareWeight: 250,
              amsSlot: targetSlot,
              notes: ''
            }
          });
          showToast(`New barcode ${code}! Registering directly into AMS Slot ${targetSlot}.`, 'info');
          return;
        }
      }

      const matchedSpool = spools.find((s) => s.barcode.toUpperCase() === code);
      if (!matchedSpool) {
        playZebraBeep('scan', soundEnabled);
        setSpoolFormModal({
          isEdit: false,
          spool: {
            barcode: code,
            material: 'PLA Basic',
            colorName: 'Jade White (10100)',
            colorHex: '#FFFFFF',
            brand: 'Bambu Lab',
            ownerId: currentUser?.id || owners[0]?.id || 'own-1',
            initialWeight: 1000,
            remainingWeight: 1000,
            tareWeight: 250,
            amsSlot: null,
            notes: ''
          }
        });
        showToast(`Unrecognized Barcode [${code}] — Ready to register new spool`, 'warning');
        return;
      }

      playZebraBeep('scan', soundEnabled);
      if (scanMode === 'LOG_USAGE') {
        setPrintModal({ mode: 'SINGLE', singleSpoolId: matchedSpool.id, initialSlot: matchedSpool.amsSlot });
        showToast(`Scanned ${matchedSpool.barcode}: Enter grams used`, 'info');
        return;
      }

      if (scanMode === 'AMS_LOAD') {
        if (matchedSpool.amsSlot) {
          setScannedSpoolModal({ spool: matchedSpool, highlightAction: 'UNLOAD' });
        } else {
          const occupiedSlots = new Set(spools.filter((s) => s.amsSlot).map((s) => s.amsSlot));
          const firstFree = AMS_SLOTS.find((slot) => !occupiedSlots.has(slot));
          setScannedSpoolModal({ spool: matchedSpool, highlightAction: 'LOAD', suggestedSlot: firstFree || 'A1' });
        }
        return;
      }

      const occupiedSlots = new Set(spools.filter((s) => s.amsSlot).map((s) => s.amsSlot));
      const firstFree = AMS_SLOTS.find((slot) => !occupiedSlots.has(slot));
      setScannedSpoolModal({ spool: matchedSpool, suggestedSlot: firstFree || 'A1' });
    },
    [batchModalOpen, batchConfig, batchSessionSpools.length, loadSlotModal, spools, owners, currentUser, scanMode, soundEnabled, showToast]
  );

  const keyBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      const now = performance.now();
      const delta = now - lastKeyTimeRef.current;
      if (delta > 120) keyBufferRef.current = '';

      if (e.key === 'Enter') {
        if (keyBufferRef.current.length >= 4 && !isInputFocused) {
          e.preventDefault();
          const scanned = keyBufferRef.current;
          keyBufferRef.current = '';
          handleBarcodeScanned(scanned);
        }
        return;
      }

      if (e.key.length === 1 && !isInputFocused) {
        keyBufferRef.current += e.key;
        lastKeyTimeRef.current = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBarcodeScanned]);

  const loadSpoolIntoSlot = async (spoolId, slot) => {
    const targetSpool = spools.find((s) => s.id === spoolId);
    if (!targetSpool) return;

    if (db) {
      for (const s of spools) {
        if (s.amsSlot === slot) {
          await setDoc(doc(db, 'spools', s.id), { ...s, amsSlot: null }, { merge: true }).catch(() => {});
        }
      }
      await setDoc(doc(db, 'spools', targetSpool.id), { ...targetSpool, amsSlot: slot }, { merge: true }).catch(() => {});
    }
    playZebraBeep('success', soundEnabled);
    showToast(`Loaded ${targetSpool.barcode} into AMS Slot ${slot}`, 'success');
    setScannedSpoolModal(null);
    setLoadSlotModal(null);
    setSlotScanBarcode('');
  };

  const unloadSpoolFromAms = async (spoolId) => {
    const targetSpool = spools.find((s) => s.id === spoolId);
    if (!targetSpool) return;
    const oldSlot = targetSpool.amsSlot;
    if (db) {
      await setDoc(doc(db, 'spools', targetSpool.id), { ...targetSpool, amsSlot: null }, { merge: true }).catch(() => {});
    }
    playZebraBeep('scan', soundEnabled);
    showToast(`Unloaded ${targetSpool.barcode} from Slot ${oldSlot}`, 'info');
    setScannedSpoolModal(null);
  };

  const amsSlotMap = useMemo(() => {
    const map = { A1: null, A2: null, A3: null, A4: null };
    spools.forEach((s) => {
      if (s.amsSlot && map.hasOwnProperty(s.amsSlot)) map[s.amsSlot] = s;
    });
    return map;
  }, [spools]);

  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  const filteredSpools = useMemo(() => {
    return spools.filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const ownerName = ownerMap[s.ownerId]?.name?.toLowerCase() || '';
        const match = s.barcode.toLowerCase().includes(q) || s.material.toLowerCase().includes(q) || s.colorName.toLowerCase().includes(q) || ownerName.includes(q);
        if (!match) return false;
      }
      if (materialFilter !== 'ALL' && s.material !== materialFilter) return false;
      if (ownerFilter !== 'ALL' && s.ownerId !== ownerFilter) return false;
      if (statusFilter === 'AMS' && !s.amsSlot) return false;
      if (statusFilter === 'STORAGE' && (s.amsSlot || s.remainingWeight <= 0)) return false;
      if (statusFilter === 'LOW' && (s.remainingWeight >= 200 || s.remainingWeight <= 0)) return false;
      if (statusFilter === 'EMPTY' && s.remainingWeight > 0) return false;
      return true;
    });
  }, [spools, searchQuery, materialFilter, ownerFilter, statusFilter, ownerMap]);

  const ownerLedger = useMemo(() => {
    return owners.map((owner) => {
      const ownedSpools = spools.filter((s) => s.ownerId === owner.id);
      const inAmsCount = ownedSpools.filter((s) => Boolean(s.amsSlot)).length;
      const totalRemainingGrams = ownedSpools.reduce((sum, s) => sum + Math.max(0, s.remainingWeight), 0);
      let consumedSuccess = 0;
      let consumedFailed = 0;
      logs.forEach((log) => {
        if (log.reverted) return;
        log.usages.forEach((u) => {
          if (u.ownerId === owner.id) {
            if (log.status === 'FAILED') consumedFailed += u.grams;
            else consumedSuccess += u.grams;
          }
        });
      });
      return { ...owner, spools: ownedSpools, spoolCount: ownedSpools.length, inAmsCount, totalRemainingGrams, consumedSuccess, consumedFailed };
    });
  }, [owners, spools, logs]);

  const activeCatalogList = bambuLabColors.length > 0 ? bambuLabColors : SEED_BAMBU_CATALOG;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-white">AMS 2 PRO TRACKER</h1>
            <p className="text-xs text-zinc-400">Sign in with your user credentials</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const uname = formData.get('username').trim().toLowerCase();
              const pin = formData.get('pin').trim();
              const found = owners.find((o) => (o.username || '').toLowerCase() === uname && String(o.pin) === pin);
              if (found) {
                setCurrentUser(found);
                playZebraBeep('success', soundEnabled);
                showToast(`Welcome back, ${found.name}!`, 'success');
              } else {
                playZebraBeep('error', soundEnabled);
                showToast('Invalid username or password.', 'error');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Username</label>
              <input name="username" defaultValue="admin" required className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl text-sm font-mono text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Password</label>
              <input type="password" name="pin" required className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl text-sm font-mono text-white focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition">
              Sign In
            </button>
          </form>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-400 font-mono space-y-1">
            <div>Contact Admin for a password reset!</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24 select-none">
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <ScanBarcode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase">
                    AMS 2 PRO <span className="text-amber-400">WEDGE</span>
                  </h1>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ☁️ CLOUD SYNCED ({bambuLabColors.length} Colors)
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  User: <strong className="text-amber-300">{currentUser.name}</strong> • {spools.length} Spools
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRequestModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Request Print</span>
              </button>
              <button
                onClick={() => { setBatchSessionSpools([]); setBatchModalOpen(true); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow transition active:scale-95"
              >
                <PackagePlus className="w-4 h-4" />
                <span className="hidden sm:inline">Batch Intake</span>
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border text-xs transition ${soundEnabled ? 'bg-zinc-800 border-zinc-700 text-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCurrentUser(null)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {[
              { id: 'AUTO', label: 'Quick Scan (Auto)' },
              { id: 'AMS_LOAD', label: 'AMS Load/Swap' },
              { id: 'LOG_USAGE', label: 'Log Print Usage' }
            ].map((m) => {
              const active = scanMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setScanMode(m.id)}
                  className={`py-1.5 px-2 rounded-lg text-center transition flex flex-col items-center justify-center ${active ? 'bg-amber-500 text-zinc-950 font-extrabold shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 font-medium'}`}
                >
                  <span className="text-[11px] sm:text-xs leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>

          {scannerDrawerOpen && (
            <div className="mt-2 pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!manualScanInput.trim()) return;
                  handleBarcodeScanned(manualScanInput);
                  setManualScanInput('');
                }}
                className="flex-1 flex items-center gap-1.5"
              >
                <div className="relative flex-1">
                  <ScanBarcode className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={manualScanInput}
                    onChange={(e) => setManualScanInput(e.target.value)}
                    placeholder="Pull Zebra trigger anywhere or type/paste barcode..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                <button type="submit" className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono font-bold shrink-0">
                  TRIGGER
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-none">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${toast.type === 'error' ? 'bg-rose-950/95 border-rose-500 text-rose-200' : toast.type === 'warning' ? 'bg-amber-950/95 border-amber-500 text-amber-200' : toast.type === 'success' ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200' : 'bg-zinc-900/95 border-cyan-500 text-cyan-200'}`}>
            <ScanBarcode className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Login Notification Popup */}
      {loginNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-indigo-500/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Print Request Updates!</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto text-left">
              {loginNotificationModal.map(req => (
                <div key={req.id} className={`p-3 rounded-xl border text-xs space-y-1 ${req.status === 'AWAITING_PICKUP' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'}`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>{req.title}</span>
                    <span className="uppercase">{req.status.replace('_', ' ')}</span>
                  </div>
                  {req.status === 'DENIED' && req.denyReason && (
                    <div className="text-[11px] text-zinc-300 italic">Reason: "{req.denyReason}"</div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={async () => {
                if (db) {
                  for (const req of loginNotificationModal) {
                    await setDoc(doc(db, 'printRequests', req.id), { ...req, notified: true }, { merge: true }).catch(() => {});
                  }
                }
                setLoginNotificationModal(null);
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase shadow"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-3 pt-4 space-y-4">
        {activeTab === 'ams' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-700 font-mono font-extrabold text-xs text-amber-400">
                    UNIT 01
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      Bambu Lab AMS 2 Pro <span className="text-[11px] font-mono font-normal text-zinc-400">4-Slot Active Feeder</span>
                    </h2>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="text-xs text-zinc-400">Scan any spool barcode with the Zebra trigger to load/unload, or tap a slot below.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {AMS_SLOTS.map((slotKey) => {
                const spool = amsSlotMap[slotKey];
                const owner = spool ? ownerMap[spool.ownerId] : null;
                const ownerStyle = spool ? getOwnerStyle(spool.ownerId) : null;
                const pct = spool ? Math.round((spool.remainingWeight / spool.initialWeight) * 100) : 0;
                const weightCfg = spool ? getWeightColorConfig(spool.remainingWeight) : null;

                return (
                  <div key={slotKey} className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${spool ? 'bg-zinc-900 border-zinc-700/90 shadow-lg' : 'bg-zinc-900/50 border-dashed border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono font-extrabold text-xs text-white">SLOT {slotKey}</span>
                        {spool ? <span className="text-xs font-mono text-zinc-300">{spool.barcode}</span> : <span className="text-xs font-mono text-zinc-500">EMPTY BAY</span>}
                      </div>
                      {spool && owner && <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${ownerStyle.bg} ${ownerStyle.text} ${ownerStyle.border}`}>{owner.name}</span>}
                    </div>

                    {spool ? (
                      <div className="p-4 space-y-3.5">
                        <div className="flex items-center gap-3.5">
                          <SpoolGaugeSVG hex={spool.colorHex || '#00AE42'} percentage={pct} size={62} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: getPrimaryHex(spool.colorHex) }} />
                              <h3 className="text-base font-extrabold text-white truncate">{spool.material}</h3>
                            </div>
                            <p className="text-xs text-zinc-300 font-medium truncate">{spool.colorName} • {spool.brand}</p>
                            <div className="mt-2.5">
                              <div className="flex items-baseline justify-between text-xs font-mono mb-1">
                                <span className={weightCfg.textClass}>{spool.remainingWeight}g left</span>
                                <span className="text-zinc-500">of {spool.initialWeight}g</span>
                              </div>
                              <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                <div className={`h-full rounded-full transition-all ${weightCfg.bgClass}`} style={{ width: `${Math.min(100, Math.max(3, pct))}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button onClick={() => setPrintModal({ mode: 'SINGLE', singleSpoolId: spool.id, initialSlot: slotKey })} className="py-2.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5">
                            <Printer className="w-3.5 h-3.5" /> Usage
                          </button>
                          <button onClick={() => setScaleModal({ spool })} className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-cyan-400" /> Scale
                          </button>
                          <button onClick={() => unloadSpoolFromAms(spool.id)} className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 border border-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5">
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Unload
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600">
                          <Disc className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-300">Slot {slotKey} is Empty</p>
                          <p className="text-[11px] text-zinc-500">Tap below to load spool</p>
                        </div>
                        <button onClick={() => setLoadSlotModal({ slot: slotKey })} className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2">
                          <ScanBarcode className="w-4 h-4" /> Load Spool into {slotKey}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" /> Print Requests & Production Queue ({printRequests.length})
                  </h2>
                  <p className="text-xs text-zinc-400">Manage incoming print jobs, co-op approvals, and production workflow</p>
                </div>
                <button onClick={() => setRequestModalOpen(true)} className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow">
                  <Send className="w-4 h-4" /> Submit Print Request
                </button>
              </div>

              {printRequests.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-zinc-300">No print requests in queue</p>
                  <p className="text-xs text-zinc-500">Submit a print request with a MakerWorld link and spool selections to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {printRequests.map((req) => {
                    const reqOwner = ownerMap[req.ownerId]?.name || 'Unknown';
                    const foreignSpoolItems = req.selectedSpoolIds.map(id => {
                      const sp = spools.find(s => s.id === id);
                      return { spool: sp, isForeign: sp && sp.ownerId !== req.ownerId, denied: req.deniedSpoolIds?.includes(id) };
                    }).filter(item => item.spool);

                    const unapprovedForeign = foreignSpoolItems.filter(item => item.isForeign && !req.approved && !item.denied);
                    const isDenied = req.status === 'DENIED';

                    return (
                      <div key={req.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              req.status === 'WAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              req.status === 'APPROVED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                              req.status === 'PREPARING' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                              req.status === 'AWAITING_PICKUP' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                              req.status === 'DENIED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {req.status.replace('_', ' ')}
                            </span>
                            <span className="text-base font-extrabold text-white truncate">{req.title}</span>
                          </div>

                          <div className="text-xs text-zinc-400 flex items-center gap-3 flex-wrap">
                            <span>Requested by: <strong className="text-amber-300">{reqOwner}</strong></span>
                            {req.makerWorldUrl && (
                              <a href={req.makerWorldUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono text-xs">
                                MakerWorld Link <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {isDenied && req.denyReason && (
                            <div className="text-xs text-rose-400 font-medium">Denial Reason: {req.denyReason}</div>
                          )}

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {foreignSpoolItems.map(({ spool, isForeign, denied }) => {
                              const spOwner = ownerMap[spool.ownerId]?.name;
                              const canDenyThis = (currentUser.id === spool.ownerId || currentUser.isAdmin) && req.status === 'WAITING_APPROVAL' && !denied;

                              return (
                                <div key={spool.id} className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] font-mono border ${denied ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 line-through' : isForeign ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
                                  <span>{spool.material} ({spool.colorName}) — Owner: {spOwner} {isForeign ? '(Co-op)' : ''}</span>
                                  {canDenyThis && (
                                    <button
                                      onClick={() => setDenyModal({ request: req, spoolId: spool.id })}
                                      className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]"
                                      title="Deny Spool"
                                    >
                                      Deny
                                    </button>
                                  )}
                                  {denied && <span className="text-[10px] text-rose-400 font-bold no-underline">[DENIED]</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {unapprovedForeign.length > 0 && (currentUser.isAdmin || unapprovedForeign.some(item => item.spool.ownerId === currentUser.id)) && (
                            <button
                              onClick={async () => {
                                if (db) {
                                  await setDoc(doc(db, 'printRequests', req.id), { ...req, approved: true, status: 'APPROVED' }, { merge: true }).catch(() => {});
                                }
                                showToast(`Approved print request for ${req.title}!`, 'success');
                              }}
                              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" /> Approve Spools
                            </button>
                          )}

                          {req.status === 'APPROVED' && currentUser.isAdmin && (
                            <button
                              onClick={async () => {
                                if (unapprovedForeign.length > 0) {
                                  showToast('Cannot accept: waiting for spool owner approval!', 'error');
                                  return;
                                }
                                if (db) {
                                  await setDoc(doc(db, 'printRequests', req.id), { ...req, status: 'PREPARING' }, { merge: true }).catch(() => {});
                                }
                                showToast(`Moved "${req.title}" to Preparing to print!`, 'success');
                              }}
                              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                            >
                              Accept & Prepare
                            </button>
                          )}

                          {req.status === 'PREPARING' && currentUser.isAdmin && (
                            <button
                              onClick={() => setCompleteRequestModal({ request: req })}
                              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow"
                            >
                              <PackageCheck className="w-3.5 h-3.5" /> Mark Completed
                            </button>
                          )}

                          {(req.status === 'AWAITING_PICKUP' || req.status === 'DENIED') && (
                            <button
                              onClick={async () => {
                                if (db) {
                                  await deleteDoc(doc(db, 'printRequests', req.id));
                                }
                                showToast(`Archived print request.`, 'info');
                              }}
                              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'spools' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">Filament Spool Registry ({spools.length})</h2>
                  <p className="text-xs text-zinc-400">Scan any official Bambu spool barcode or use Batch Intake</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setBatchSessionSpools([]); setBatchModalOpen(true); }} className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow">
                    <PackagePlus className="w-4 h-4" /> Batch Scan 29 Rolls
                  </button>
                  <button onClick={() => setSpoolFormModal({ isEdit: false, spool: { barcode: generateNextBarcode(), material: 'PLA Basic', colorName: 'Jade White (10100)', colorHex: '#FFFFFF', brand: 'Bambu Lab', ownerId: currentUser?.id || owners[0]?.id || 'own-1', initialWeight: 1000, remainingWeight: 1000, tareWeight: 250, amsSlot: null, notes: '' } })} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-400" /> New Spool
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search barcode, material, color, owner..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200">
                  <option value="ALL">All Materials</option>
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200">
                  <option value="ALL">All Owners ({owners.length})</option>
                  {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>

            {filteredSpools.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
                <Disc className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-zinc-300">No Spools in Inventory</p>
                <p className="text-xs text-zinc-500">Use "Batch Scan 29 Rolls" or "New Spool" to add your filament inventory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSpools.map((spool) => {
                  const owner = ownerMap[spool.ownerId];
                  const ownerStyle = getOwnerStyle(spool.ownerId);
                  const pct = Math.round((spool.remainingWeight / spool.initialWeight) * 100);
                  const weightCfg = getWeightColorConfig(spool.remainingWeight);

                  return (
                    <div key={spool.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <SpoolGaugeSVG hex={spool.colorHex || '#00AE42'} percentage={pct} size={52} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 font-mono font-bold text-[11px] text-amber-400">{spool.barcode}</span>
                              {spool.amsSlot ? <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 font-mono font-bold text-[11px] text-emerald-300">AMS {spool.amsSlot}</span> : <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">STORAGE</span>}
                            </div>
                            <h3 className="text-sm font-extrabold text-white mt-1 truncate">{spool.material} — {spool.colorName}</h3>
                            <p className="text-[11px] text-zinc-400 truncate">{spool.brand} • <span className={weightCfg.textClass}>{spool.remainingWeight}g</span> / {spool.initialWeight}g left</p>
                          </div>
                        </div>
                        {owner && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${ownerStyle.bg} ${ownerStyle.text} ${ownerStyle.border}`}>{owner.name}</span>}
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-800/80">
                        {spool.amsSlot ? (
                          <button onClick={() => unloadSpoolFromAms(spool.id)} className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" /> Unload {spool.amsSlot}
                          </button>
                        ) : (
                          <button onClick={() => {
                            const occupiedSlots = new Set(spools.filter((s) => s.amsSlot).map((s) => s.amsSlot));
                            const firstFree = AMS_SLOTS.find((slot) => !occupiedSlots.has(slot)) || 'A1';
                            setScannedSpoolModal({ spool, suggestedSlot: firstFree });
                          }} className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                            <Disc className="w-3.5 h-3.5" /> Load to AMS
                          </button>
                        )}
                        <button onClick={() => setPrintModal({ mode: 'SINGLE', singleSpoolId: spool.id, initialSlot: spool.amsSlot })} className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center gap-1">
                          <Printer className="w-3.5 h-3.5" /> Use
                        </button>
                        <button onClick={() => setLabelModal({ spool })} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300" title="Label Viewer">
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSpoolFormModal({ isEdit: true, spool: { ...spool } })} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300" title="Edit Spool">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'owners' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Filament Owners & Logins</h2>
                <p className="text-xs text-zinc-400">Manage member accounts, PIN codes, and individual consumption</p>
              </div>
              {currentUser.isAdmin && (
                <button onClick={() => setOwnerModal({ isEdit: false, owner: { name: '', username: '', pin: '', isAdmin: false, role: 'Co-Op Member', colorIdx: owners.length % OWNER_COLORS.length, notes: '' } })} className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow">
                  <UserPlus className="w-4 h-4" /> Add New User
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3.5">
              {ownerLedger.map((person) => {
                const style = OWNER_COLORS[(person.colorIdx ?? 0) % OWNER_COLORS.length];
                return (
                  <div key={person.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-extrabold text-sm ${style.bg} ${style.text} ${style.border}`}>
                          {person.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-white">{person.name}</h3>
                            <span className="text-xs text-zinc-400">({person.role})</span>
                            {person.isAdmin && <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">Admin</span>}
                          </div>
                          <p className="text-xs text-zinc-400 font-mono">Username: <span className="text-white">{person.username}</span> • Password: <span className="text-amber-400 font-bold">{person.pin}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setOwnerFilter(person.id); setActiveTab('spools'); }} className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200">
                          Filter Spools ({person.spoolCount})
                        </button>
                        {(currentUser.isAdmin || currentUser.id === person.id) && (
                          <button onClick={() => setOwnerModal({ isEdit: true, owner: { ...person } })} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300" title="Edit User">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" /> Print Usage & Deduction History ({logs.length})
              </h3>
              {logs.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">No print logs recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{log.status}</span>
                          <span className="text-sm font-bold text-white">{log.jobName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                      <span className="text-sm font-mono font-extrabold text-amber-400">-{log.totalGrams}g total</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-base font-bold text-white">System Admin & Cloud Catalog Controls</h2>
                  <p className="text-xs text-zinc-400">Manage Firestore 'catalog' seeding and system resets</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" /> Firestore 'catalog' Status
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Currently synced documents in Firestore <code className="text-amber-300">catalog</code> collection: <strong className="text-emerald-400">{bambuLabColors.length}</strong> / {SEED_BAMBU_CATALOG.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={seedFirestoreCatalog}
                  disabled={isSeedingCatalog}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow"
                >
                  <Upload className="w-4 h-4" />
                  {isSeedingCatalog ? 'Seeding 189 Filaments to Firestore...' : `Seed / Overwrite Full 189-Color Catalog to Firestore`}
                </button>
              </div>

              {currentUser.isAdmin && (
                <div className="pt-2">
                  <button onClick={() => { if (confirm('Clear local session?')) { localStorage.clear(); window.location.reload(); } }} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">
                    Clear Local Cache & Reload
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {scannedSpoolModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-mono font-extrabold text-sm text-white">BARCODE: {scannedSpoolModal.spool.barcode}</span>
              <button onClick={() => setScannedSpoolModal(null)} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {AMS_SLOTS.map((slot) => (
                  <button key={slot} onClick={() => loadSpoolIntoSlot(scannedSpoolModal.spool.id, slot)} className="p-2.5 rounded-xl border bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold text-xs">
                    Slot {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {denyModal && (
        <DenySpoolModal
          request={denyModal.request}
          spoolId={denyModal.spoolId}
          spools={spools}
          onClose={() => setDenyModal(null)}
          onDeny={async ({ request, spoolId, reason }) => {
            const updatedDenied = [...(request.deniedSpoolIds || []), spoolId];
            if (db) {
              await setDoc(doc(db, 'printRequests', request.id), {
                ...request,
                deniedSpoolIds: updatedDenied,
                status: 'DENIED',
                denyReason: reason || 'Spool owner denied request.'
              }, { merge: true }).catch(() => {});
            }
            setDenyModal(null);
            showToast('Spool request denied.', 'warning');
          }}
        />
      )}

      {loadSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-white uppercase">Load Spool into Slot {loadSlotModal.slot}</span>
              <button onClick={() => setLoadSlotModal(null)} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!slotScanBarcode.trim()) return;
                  handleBarcodeScanned(slotScanBarcode.trim());
                }}
                className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-2"
              >
                <label className="text-xs text-amber-300 font-bold block">Scan Barcode with Zebra Trigger or Type Below:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={slotScanBarcode}
                    onChange={(e) => setSlotScanBarcode(e.target.value)}
                    placeholder="Scan barcode for slot..."
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <button type="submit" className="px-3 py-2 bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-lg">
                    LOAD
                  </button>
                </div>
              </form>

              <div>
                <p className="text-xs text-zinc-400 mb-2">Or select an existing spool from storage:</p>
                {spools.filter(s => !s.amsSlot).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2 text-center">No available spools in storage.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {spools.filter(s => !s.amsSlot).map(sp => {
                      const wCfg = getWeightColorConfig(sp.remainingWeight);
                      return (
                        <button
                          key={sp.id}
                          onClick={() => loadSpoolIntoSlot(sp.id, loadSlotModal.slot)}
                          className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-left flex items-center justify-between transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: getPrimaryHex(sp.colorHex) }} />
                            <div className="min-w-0 text-xs">
                              <div className="font-bold text-white truncate">{sp.material} ({sp.colorName})</div>
                              <div className="font-mono text-[10px] text-zinc-400">{sp.barcode}</div>
                            </div>
                          </div>
                          <span className={`text-xs font-mono shrink-0 ${wCfg.textClass}`}>{sp.remainingWeight}g</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {batchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase">Batch Spool Intake (29-Roll Mode)</h3>
              <button onClick={() => setBatchModalOpen(false)} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Assigned Owner (Who Paid)</label>
                  <select value={batchConfig.ownerId} onChange={(e) => setBatchConfig({ ...batchConfig, ownerId: e.target.value })} className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white">
                    {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Select Material Type</label>
                  <select 
                    value={batchConfig.material} 
                    onChange={(e) => {
                      const newMat = e.target.value;
                      const availableColors = activeCatalogList.filter(c => c.material === newMat);
                      const defaultColor = availableColors[0] || { name: '', hex: '#FFFFFF' };
                      setBatchConfig({ 
                        ...batchConfig, 
                        material: newMat, 
                        colorName: defaultColor.name, 
                        colorHex: defaultColor.hex || '#FFFFFF'
                      });
                    }} 
                    className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                  >
                    {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5">Select Color: <strong className="text-white">{batchConfig.colorName}</strong></label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-zinc-900 rounded-lg">
                    {activeCatalogList
                      .filter(c => c.material === batchConfig.material)
                      .map((c) => (
                        <button key={c.name} type="button" onClick={() => setBatchConfig({ ...batchConfig, colorName: c.name, colorHex: c.hex || '#FFFFFF' })} className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 ${batchConfig.colorName === c.name ? 'bg-amber-500/25 border-amber-400 text-white font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                          <span className="w-3 h-3 rounded-full border border-white/25 shrink-0" style={{ backgroundColor: getPrimaryHex(c.hex) }} />
                          {c.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleBarcodeScanned(batchBarcodeInput.trim() || generateNextBarcode()); }} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2.5">
                <div className="flex gap-2">
                  <input type="text" value={batchBarcodeInput} onChange={(e) => setBatchBarcodeInput(e.target.value)} placeholder="Pull Zebra trigger or auto-generate..." className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white" />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-extrabold text-xs">Scan / Save</button>
                </div>
              </form>

              {batchSessionSpools.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-mono uppercase text-zinc-400">Scanned ({batchSessionSpools.length}):</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {batchSessionSpools.map((sp) => (
                      <div key={sp.id} className="px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-xs flex justify-between">
                        <span className="font-mono text-amber-300">{sp.barcode} - {sp.material} ({sp.colorName})</span>
                        <span className="text-zinc-400">{ownerMap[sp.ownerId]?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {requestModalOpen && (
        <PrintRequestModal
          owners={owners}
          spools={spools}
          currentUser={currentUser}
          onClose={() => setRequestModalOpen(false)}
          onSubmitRequest={async (newReq) => {
            if (db) {
              await setDoc(doc(db, 'printRequests', newReq.id), newReq).catch(() => {});
            }
            setRequestModalOpen(false);
            showToast('Print request submitted to queue!', 'success');
          }}
        />
      )}

      {completeRequestModal && (
        <CompleteRequestModal
          request={completeRequestModal.request}
          spools={spools}
          onClose={() => setCompleteRequestModal(null)}
          onComplete={async ({ usageGrams }) => {
            const req = completeRequestModal.request;
            if (req.selectedSpoolIds.length > 0) {
              const targetSpoolId = req.selectedSpoolIds[0];
              const targetSpool = spools.find(s => s.id === targetSpoolId);
              if (targetSpool && db) {
                const updatedWeight = Math.max(0, targetSpool.remainingWeight - usageGrams);
                await setDoc(doc(db, 'spools', targetSpoolId), { ...targetSpool, remainingWeight: updatedWeight }, { merge: true }).catch(() => {});
              }
            }
            if (db) {
              await setDoc(doc(db, 'printRequests', req.id), { ...req, status: 'AWAITING_PICKUP' }, { merge: true }).catch(() => {});
            }
            
            const logId = `log-${Date.now()}`;
            const newLog = {
              id: logId,
              timestamp: new Date().toISOString(),
              jobName: req.title,
              status: 'SUCCESS',
              totalGrams: usageGrams,
              reverted: false,
              usages: req.selectedSpoolIds.map(id => {
                const sp = spools.find(s => s.id === id);
                return {
                  spoolId: id,
                  barcode: sp?.barcode || 'BBL-XXX',
                  material: sp?.material || 'PLA Basic',
                  colorName: sp?.colorName || 'Color',
                  colorHex: sp?.colorHex || '#FFFFFF',
                  ownerId: sp?.ownerId || req.ownerId,
                  slot: sp?.amsSlot || null,
                  grams: usageGrams
                };
              })
            };
            if (db) {
              await setDoc(doc(db, 'logs', logId), newLog).catch(() => {});
            }

            setCompleteRequestModal(null);
            showToast(`Print marked completed (-${usageGrams}g). Moved to Awaiting Pickup!`, 'success');
          }}
        />
      )}

      {spoolFormModal && (
        <SpoolFormModal modalData={spoolFormModal} owners={owners} bambuLabColors={activeCatalogList} materials={MATERIALS} onClose={() => setSpoolFormModal(null)} onSave={async (sp) => {
          const spoolId = sp.id || `sp-${Date.now()}`;
          const finalSpool = { ...sp, id: spoolId };
          if (db) {
            await setDoc(doc(db, 'spools', spoolId), finalSpool).catch(() => {});
          }
          showToast(`Saved spool ${finalSpool.barcode}`, 'success');
          setSpoolFormModal(null);
        }} onDelete={async (id) => {
          if (db) {
            await deleteDoc(doc(db, 'spools', id)).catch(() => {});
          }
          setSpoolFormModal(null);
          showToast('Spool deleted', 'info');
        }} />
      )}

      {ownerModal && (
        <OwnerFormModal
          modalData={ownerModal}
          onClose={() => setOwnerModal(null)}
          onSave={async (savedOwner) => {
            const ownerId = savedOwner.id || `own-${owners.length + 1}`;
            const existingOwner = owners.find(o => o.id === ownerId);
            const finalIsAdmin = currentUser.isAdmin ? savedOwner.isAdmin : (existingOwner ? existingOwner.isAdmin : false);

            const finalOwner = {
              ...(existingOwner || {}),
              ...savedOwner,
              id: ownerId,
              isAdmin: finalIsAdmin
            };

            if (db) {
              await setDoc(doc(db, 'owners', ownerId), finalOwner, { merge: true }).catch(() => {});
            }
            showToast(`Saved user/owner ${finalOwner.name}`, 'success');
            if (currentUser.id === ownerId) setCurrentUser(finalOwner);
            setOwnerModal(null);
          }}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur border-t border-zinc-800">
        <div className="max-w-5xl mx-auto grid grid-cols-6 px-2 py-1.5 gap-1">
          {[
            { id: 'ams', label: 'AMS 2 Pro', icon: Layers, badge: `${spools.filter((s) => s.amsSlot).length}/4` },
            { id: 'queue', label: 'Queue', icon: Clock, badge: printRequests.filter(r => r.status !== 'AWAITING_PICKUP').length },
            { id: 'spools', label: 'Spools', icon: Disc, badge: spools.length },
            { id: 'owners', label: 'Owners', icon: Users, badge: owners.length },
            { id: 'logs', label: 'Logs', icon: History, badge: logs.filter((l) => !l.reverted).length },
            { id: 'admin', label: 'Admin', icon: ShieldCheck, badge: currentUser.isAdmin ? '★' : '' }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${active ? 'bg-amber-500/15 text-amber-400 font-extrabold border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'}`}>
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${active ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'}`}>{tab.badge}</span>
                </div>
                <span className="text-[10px] sm:text-[11px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function DenySpoolModal({ request, spoolId, spools, onClose, onDeny }) {
  const [reason, setReason] = useState('');
  const spool = spools.find(s => s.id === spoolId);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-rose-500/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white">Deny Spool Request</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onDeny({ request, spoolId, reason }); }} className="p-4 space-y-3">
          <p className="text-xs text-zinc-300">
            Deny use of your spool <strong className="text-amber-300">{spool?.material} ({spool?.colorName})</strong> for request "{request.title}"?
          </p>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Reason for Denial (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Saving this roll for a personal multi-color print..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 h-20 resize-none"
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase shadow">
            Confirm Denial
          </button>
        </form>
      </div>
    </div>
  );
}

function PrintRequestModal({ owners, spools, currentUser, onClose, onSubmitRequest }) {
  const [title, setTitle] = useState('');
  const [makerWorldUrl, setMakerWorldUrl] = useState('');
  const [selectedSpoolIds, setSelectedSpoolIds] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const foreignSpools = selectedSpoolIds.map(id => spools.find(s => s.id === id)).filter(s => s && s.ownerId !== currentUser.id);
    const initialStatus = foreignSpools.length > 0 ? 'WAITING_APPROVAL' : 'APPROVED';

    onSubmitRequest({
      id: `req-${Date.now()}`,
      title: title.trim(),
      makerWorldUrl: makerWorldUrl.trim(),
      ownerId: currentUser.id,
      selectedSpoolIds,
      deniedSpoolIds: [],
      status: initialStatus,
      approved: foreignSpools.length === 0,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10">
          <span className="font-extrabold text-sm text-white uppercase flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" /> Request 3D Print Job
          </span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Model / Print Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Gundam Strike Freedom Wall Art"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">MakerWorld Link / URL</label>
            <input
              type="url"
              value={makerWorldUrl}
              onChange={(e) => setMakerWorldUrl(e.target.value)}
              placeholder="https://makerworld.com/en/models/..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 block">Select Spools to Use (Including Co-Op Spools):</label>
            {spools.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No spools currently registered in inventory.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
                {spools.map((sp) => {
                  const spOwner = owners.find(o => o.id === sp.ownerId)?.name || 'Unknown';
                  const isChecked = selectedSpoolIds.includes(sp.id);
                  const isForeign = sp.ownerId !== currentUser.id;
                  const wCfg = getWeightColorConfig(sp.remainingWeight);

                  return (
                    <label key={sp.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border ${isChecked ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSpoolIds([...selectedSpoolIds, sp.id]);
                            else setSelectedSpoolIds(selectedSpoolIds.filter(id => id !== sp.id));
                          }}
                          className="rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-0"
                        />
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getPrimaryHex(sp.colorHex) }} />
                        <div className="min-w-0 text-xs">
                          <div className="font-bold truncate">{sp.material} ({sp.colorName})</div>
                          <div className="text-[10px] font-mono text-zinc-400">{sp.barcode} • Owner: {spOwner} {isForeign ? '(Requires Approval)' : ''}</div>
                        </div>
                      </div>
                      <span className={`text-xs font-mono ${wCfg.textClass}`}>{sp.remainingWeight}g</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg">
            Submit Print Request
          </button>
        </form>
      </div>
    </div>
  );
}

function CompleteRequestModal({ request, spools, onClose, onComplete }) {
  const [usageGrams, setUsageGrams] = useState(50);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white">Complete Print: {request.title}</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onComplete({ usageGrams: Number(usageGrams) || 0 }); }} className="p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Total Filament Consumed (Grams)</label>
            <input
              type="number"
              min="1"
              required
              value={usageGrams}
              onChange={(e) => setUsageGrams(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm font-mono font-bold text-amber-400 focus:outline-none"
            />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase shadow">
            Confirm & Mark Awaiting Pickup
          </button>
        </form>
      </div>
    </div>
  );
}

function SpoolFormModal({ modalData, owners, bambuLabColors, materials, onClose, spools, onSave, onDelete }) {
  const [form, setForm] = useState(modalData.spool);

  const availableColors = useMemo(() => {
    return bambuLabColors.filter(c => c.material === form.material);
  }, [form.material, bambuLabColors]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10">
          <span className="font-extrabold text-sm text-white uppercase">{modalData.isEdit ? 'Edit Spool' : 'Register Spool'}</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, id: form.id || `sp-${Date.now()}` }); }} className="p-4 space-y-3.5">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Spool Barcode ID</label>
            <input type="text" required value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value.toUpperCase() })} placeholder="e.g., BBL-100500" className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-amber-300" />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Owner (Who Paid)</label>
            <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white">
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Material Type</label>
            <select 
              value={form.material} 
              onChange={(e) => {
                const newMat = e.target.value;
                const filtered = bambuLabColors.filter(c => c.material === newMat);
                const defaultCol = filtered[0] || { name: '', hex: '#FFFFFF' };
                setForm({ 
                  ...form, 
                  material: newMat, 
                  colorName: defaultCol.name, 
                  colorHex: defaultCol.hex || '#FFFFFF'
                });
              }} 
              className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
            >
              {materials.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Color: <strong className="text-white">{form.colorName}</strong></label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-zinc-950 border border-zinc-800 rounded-lg mb-2">
              {availableColors.map((c) => (
                <button 
                  key={c.name} 
                  type="button" 
                  onClick={() => setForm({ ...form, colorName: c.name, colorHex: c.hex || '#FFFFFF' })} 
                  className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1.5 shrink-0 ${form.colorName === c.name ? 'bg-amber-500/25 border-amber-400 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                >
                  <span className="w-3 h-3 rounded-full border border-white/25 shrink-0" style={{ backgroundColor: getPrimaryHex(c.hex) }} />
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={form.colorName} onChange={(e) => setForm({ ...form, colorName: e.target.value })} placeholder="Custom Color Name" className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white" />
              <input type="color" value={getPrimaryHex(form.colorHex)} onChange={(e) => setForm({ ...form, colorHex: e.target.value })} className="w-10 h-8 bg-zinc-950 border border-zinc-700 rounded-lg cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Remaining (g)</label>
              <input type="number" value={form.remainingWeight} onChange={(e) => setForm({ ...form, remainingWeight: Number(e.target.value) })} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-emerald-400 font-bold" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Initial Net (g)</label>
              <input type="number" value={form.initialWeight} onChange={(e) => setForm({ ...form, initialWeight: Number(e.target.value) })} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {modalData.isEdit && (
              <button type="button" onClick={() => onDelete(form.id)} className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase shadow">
              {modalData.isEdit ? 'Save Changes' : 'Register Spool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OwnerFormModal({ modalData, onClose, onSave }) {
  const [form, setForm] = useState(modalData.owner);
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white">{modalData.isEdit ? 'Edit User / Owner' : 'Add New User & Login'}</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          if (!form.name.trim()) return; 
          onSave(form); 
        }} className="p-4 space-y-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Login Username</label>
              <input type="text" required value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value.trim() })} className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Login Password</label>
              <input type="text" required value={form.pin || ''} onChange={(e) => setForm({ ...form, pin: e.target.value.trim() })} className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Role / Group</label>
            <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Notes / Description</label>
            <input type="text" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isAdminCheck" checked={Boolean(form.isAdmin)} disabled={!form.isAdmin} onChange={(e) => {}} className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0 opacity-60 cursor-not-allowed" />
            <label htmlFor="isAdminCheck" className="text-xs text-zinc-400 select-none">Grant Administrator Privileges (Locked)</label>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase">
            Save User & Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
