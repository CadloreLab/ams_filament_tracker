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
  LogOut
} from 'lucide-react';

// ============================================================================
// PRESETS & CONSTANTS
// ============================================================================

const MATERIALS = [
  'PLA Basic',
  'PLA Matte',
  'PLA Tough+',
  'PLA-CF',
  'PETG HF',
  'PETG-CF',
  'ABS',
  'ABS-CF',
  'ASA',
  'TPU 95A',
  'PAHT-CF'
];

const FILAMENT_COLORS = [
  { name: 'Jade White', hex: '#F8FAFC' },
  { name: 'Charcoal Black', hex: '#1E293B' },
  { name: 'Bambu Green', hex: '#00AE42' },
  { name: 'Fire Engine Red', hex: '#EF4444' },
  { name: 'Mandarin Orange', hex: '#F97316' },
  { name: 'Sunflower Yellow', hex: '#EAB308' },
  { name: 'Cobalt Blue', hex: '#2563EB' },
  { name: 'Cyan Tough', hex: '#06B6D4' },
  { name: 'Galaxy Purple', hex: '#9333EA' },
  { name: 'Magenta Pop', hex: '#EC4899' },
  { name: 'Titanium Grey', hex: '#64748B' },
  { name: 'Silver Metallic', hex: '#94A3B8' },
  { name: 'Desert Tan', hex: '#D6B88D' },
  { name: 'Carbon Matte', hex: '#27272A' }
];

const OWNER_COLORS = [
  { name: 'Amber', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/50', hex: '#F59E0B' },
  { name: 'Emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/50', hex: '#10B981' },
  { name: 'Cyan', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/50', hex: '#06B6D4' },
  { name: 'Purple', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/50', hex: '#A855F7' },
  { name: 'Rose', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/50', hex: '#F43F5E' },
  { name: 'Blue', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/50', hex: '#3B82F6' }
];

const INITIAL_OWNERS = [
  { id: 'own-1', name: 'Charles (Admin)', username: 'admin', pin: '1234', isAdmin: true, role: 'Printer Owner', colorIdx: 0, notes: 'Primary printer operator & host' },
  { id: 'own-2', name: 'Echo', username: 'Echo', pin: '3456', isAdmin: false, role: 'Friend / Co-op', colorIdx: 1, notes: 'Prints functional ABS/CF car parts' },
  { id: 'own-3', name: 'Luner89', username: 'Luner89', pin: '6789', isAdmin: false, role: 'Cosplay & Props', colorIdx: 2, notes: 'Mostly PLA Basic & Tough+ rolls' },
  { id: 'own-4', name: 'Tarken4789', username: 'Tarken4789', pin: '1478', isAdmin: false, role: 'Tabletop & Minis', colorIdx: 3, notes: 'High-detail PLA Matte & Grey spools' }
];

const INITIAL_SPOOLS = [
  {
    id: 'sp-1',
    barcode: 'BBL-100482',
    material: 'PLA Basic',
    colorName: 'Bambu Green',
    colorHex: '#00AE42',
    brand: 'Bambu Lab',
    ownerId: 'own-1',
    initialWeight: 1000,
    remainingWeight: 742,
    tareWeight: 250,
    amsSlot: 'A1',
    createdAt: '2025-02-10T12:00:00Z',
    notes: 'Primary prototype green'
  },
  {
    id: 'sp-2',
    barcode: 'BBL-100489',
    material: 'ABS-CF',
    colorName: 'Carbon Matte',
    colorHex: '#27272A',
    brand: 'Bambu Lab',
    ownerId: 'own-2',
    initialWeight: 1000,
    remainingWeight: 615,
    tareWeight: 250,
    amsSlot: 'A2',
    createdAt: '2025-02-11T15:30:00Z',
    notes: 'Marcus intake bracket filament'
  },
  {
    id: 'sp-3',
    barcode: 'BBL-100512',
    material: 'PLA Tough+',
    colorName: 'Cyan Tough',
    colorHex: '#06B6D4',
    brand: 'Bambu Lab',
    ownerId: 'own-3',
    initialWeight: 1000,
    remainingWeight: 890,
    tareWeight: 250,
    amsSlot: 'A3',
    createdAt: '2025-02-12T09:15:00Z',
    notes: 'Elena helmet Structural PLA'
  },
  {
    id: 'sp-4',
    barcode: 'BBL-100530',
    material: 'PLA Basic',
    colorName: 'Jade White',
    colorHex: '#F8FAFC',
    brand: 'Bambu Lab',
    ownerId: 'own-1',
    initialWeight: 1000,
    remainingWeight: 310,
    tareWeight: 250,
    amsSlot: 'A4',
    createdAt: '2025-02-14T18:20:00Z',
    notes: 'Multicolor lithophane & support white'
  },
  {
    id: 'sp-5',
    barcode: 'BBL-100601',
    material: 'PLA Matte',
    colorName: 'Titanium Grey',
    colorHex: '#64748B',
    brand: 'Bambu Lab',
    ownerId: 'own-4',
    initialWeight: 1000,
    remainingWeight: 945,
    tareWeight: 250,
    amsSlot: null,
    createdAt: '2025-02-15T10:00:00Z',
    notes: 'Devon dungeon terrain roll #1'
  },
  {
    id: 'sp-6',
    barcode: 'BBL-100608',
    material: 'PETG HF',
    colorName: 'Mandarin Orange',
    colorHex: '#F97316',
    brand: 'Bambu Lab',
    ownerId: 'own-5',
    initialWeight: 1000,
    remainingWeight: 1000,
    tareWeight: 250,
    amsSlot: null,
    createdAt: '2025-02-16T11:00:00Z',
    notes: 'Shop organizer bins'
  },
  {
    id: 'sp-7',
    barcode: 'BBL-100619',
    material: 'PLA-CF',
    colorName: 'Fire Engine Red',
    colorHex: '#EF4444',
    brand: 'Bambu Lab',
    ownerId: 'own-2',
    initialWeight: 1000,
    remainingWeight: 140,
    tareWeight: 250,
    amsSlot: null,
    createdAt: '2025-02-17T14:20:00Z',
    notes: 'Low spool - small fixtures only'
  },
  {
    id: 'sp-8',
    barcode: 'BBL-100644',
    material: 'ABS',
    colorName: 'Charcoal Black',
    colorHex: '#1E293B',
    brand: 'Polymaker',
    ownerId: 'own-3',
    initialWeight: 1000,
    remainingWeight: 1000,
    tareWeight: 220,
    amsSlot: null,
    createdAt: '2025-02-18T16:45:00Z',
    notes: 'Fresh unsealed roll'
  }
];

const INITIAL_LOGS = [
  {
    id: 'log-101',
    timestamp: '2025-02-22T19:40:00Z',
    jobName: 'AMS 2 Pro Riser & Desiccant Pods',
    status: 'SUCCESS',
    totalGrams: 258,
    reverted: false,
    usages: [
      { spoolId: 'sp-1', barcode: 'BBL-100482', material: 'PLA Basic', colorName: 'Bambu Green', colorHex: '#00AE42', ownerId: 'own-1', slot: 'A1', grams: 258 }
    ]
  },
  {
    id: 'log-102',
    timestamp: '2025-02-23T14:15:00Z',
    jobName: 'Turbo Intake Manifold Prototype v3',
    status: 'SUCCESS',
    totalGrams: 385,
    reverted: false,
    usages: [
      { spoolId: 'sp-2', barcode: 'BBL-100489', material: 'ABS-CF', colorName: 'Carbon Matte', colorHex: '#27272A', ownerId: 'own-2', slot: 'A2', grams: 385 }
    ]
  },
  {
    id: 'log-103',
    timestamp: '2025-02-24T09:10:00Z',
    jobName: 'Mandalorian Pauldron Left (Failed Bed Adhesion)',
    status: 'FAILED',
    totalGrams: 110,
    reverted: false,
    usages: [
      { spoolId: 'sp-3', barcode: 'BBL-100512', material: 'PLA Tough+', colorName: 'Cyan Tough', colorHex: '#06B6D4', ownerId: 'own-3', slot: 'A3', grams: 75 },
      { spoolId: 'sp-4', barcode: 'BBL-100530', material: 'PLA Basic', colorName: 'Jade White', colorHex: '#F8FAFC', ownerId: 'own-1', slot: 'A4', grams: 35 }
    ]
  }
];

const AMS_SLOTS = ['A1', 'A2', 'A3', 'A4'];

// ============================================================================
// SOUND / ZEBRA BEEP SYNTHESIZER (Web Audio API - No External Assets)
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
// HELPER: CODE-128 STYLE SVG BARCODE RENDERER
// ============================================================================
const BarcodeSVG = ({ value = 'BBL-100000', height = 48 }) => {
  const bars = useMemo(() => {
    const clean = String(value || 'SPOOL');
    const pattern = [2, 1, 1, 2, 3, 1];
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      pattern.push(((code >> 0) & 3) + 1);
      pattern.push(((code >> 2) & 2) + 1);
      pattern.push(((code >> 4) & 3) + 1);
      pattern.push(1);
    }
    pattern.push(2, 3, 1, 1, 2);
    return pattern;
  }, [value]);

  const totalUnits = bars.reduce((a, b) => a + b, 0);
  let currentX = 0;

  return (
    <svg
      viewBox={`0 0 ${totalUnits} ${height}`}
      className="w-full h-14 bg-white p-1.5 rounded"
      preserveAspectRatio="none"
    >
      {bars.map((width, idx) => {
        const x = currentX;
        currentX += width;
        if (idx % 2 === 0) {
          return <rect key={idx} x={x} y={0} width={width} height={height} fill="#09090B" />;
        }
        return null;
      })}
    </svg>
  );
};

// ============================================================================
// HELPER: SPOOL RING VISUALIZER SVG
// ============================================================================
const SpoolGaugeSVG = ({ hex = '#00AE42', percentage = 75, size = 54 }) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

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
          stroke={hex}
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
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // --- Authentication State ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zebra_ams_current_user_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // --- Persistent State ---
  const [owners, setOwners] = useState(() => {
    try {
      const saved = localStorage.getItem('zebra_ams_owners_v1');
      return saved ? JSON.parse(saved) : INITIAL_OWNERS;
    } catch {
      return INITIAL_OWNERS;
    }
  });

  const [spools, setSpools] = useState(() => {
    try {
      const saved = localStorage.getItem('zebra_ams_spools_v1');
      return saved ? JSON.parse(saved) : INITIAL_SPOOLS;
    } catch {
      return INITIAL_SPOOLS;
    }
  });

  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('zebra_ams_logs_v1');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem('zebra_ams_owners_v1', JSON.stringify(owners));
    } catch (e) {}
  }, [owners]);

  useEffect(() => {
    try {
      localStorage.setItem('zebra_ams_spools_v1', JSON.stringify(spools));
    } catch (e) {}
  }, [spools]);

  useEffect(() => {
    try {
      localStorage.setItem('zebra_ams_logs_v1', JSON.stringify(logs));
    } catch (e) {}
  }, [logs]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('zebra_ams_current_user_v1', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('zebra_ams_current_user_v1');
      }
    } catch (e) {}
  }, [currentUser]);

  // --- Navigation & Scanner States ---
  const [activeTab, setActiveTab] = useState('ams'); // 'ams' | 'spools' | 'owners' | 'logs' | 'admin'
  const [scanMode, setScanMode] = useState('AUTO'); // 'AUTO' | 'AMS_LOAD' | 'LOG_USAGE'
  const [manualScanInput, setManualScanInput] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scannerDrawerOpen, setScannerDrawerOpen] = useState(true);
  const [toast, setToast] = useState(null);

  // --- Modals State ---
  const [scannedSpoolModal, setScannedSpoolModal] = useState(null);
  const [loadSlotModal, setLoadSlotModal] = useState(null);
  const [printModal, setPrintModal] = useState(null);
  const [spoolFormModal, setSpoolFormModal] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [scaleModal, setScaleModal] = useState(null);
  const [labelModal, setLabelModal] = useState(null);
  const [ownerModal, setOwnerModal] = useState(null);
  const [zebraGuideOpen, setZebraGuideOpen] = useState(false);

  // --- Toast Helper ---
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  // --- Lookup Maps ---
  const ownerMap = useMemo(() => {
    const map = {};
    owners.forEach((o) => {
      map[o.id] = o;
    });
    return map;
  }, [owners]);

  const getOwnerStyle = useCallback(
    (ownerId) => {
      const owner = ownerMap[ownerId];
      const idx = owner ? (owner.colorIdx ?? 0) % OWNER_COLORS.length : 0;
      return OWNER_COLORS[idx];
    },
    [ownerMap]
  );

  // --- Next Sequential Barcode Helper ---
  const generateNextBarcode = useCallback(() => {
    let maxNum = 100650;
    spools.forEach((s) => {
      const match = String(s.barcode).match(/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum) maxNum = val;
      }
    });
    return `BBL-${maxNum + 1}`;
  }, [spools]);

  // ============================================================================
  // BATCH INTAKE STATE
  // ============================================================================
  const [batchConfig, setBatchConfig] = useState({
    ownerId: currentUser?.id || 'own-1',
    material: 'PLA Basic',
    brand: 'Bambu Lab',
    colorName: 'Bambu Green',
    colorHex: '#00AE42',
    initialWeight: 1000,
    tareWeight: 250,
    targetCount: 29
  });
  const [batchSessionSpools, setBatchSessionSpools] = useState([]);
  const [batchBarcodeInput, setBatchBarcodeInput] = useState('');

  // ============================================================================
  // CORE BARCODE ROUTER
  // ============================================================================
  const handleBarcodeScanned = useCallback(
    (rawCode) => {
      const code = String(rawCode || '').trim().toUpperCase();
      if (!code) return;

      setLastScannedCode({ code, time: new Date().toLocaleTimeString() });

      if (batchModalOpen) {
        const existing = spools.find((s) => s.barcode.toUpperCase() === code);
        if (existing) {
          playZebraBeep('error', soundEnabled);
          showToast(`Barcode ${code} is already registered (${existing.material} - ${existing.colorName})!`, 'error');
          return;
        }
        const newSpool = {
          id: `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
        setSpools((prev) => [newSpool, ...prev]);
        setBatchSessionSpools((prev) => [newSpool, ...prev]);
        setBatchBarcodeInput('');
        playZebraBeep('success', soundEnabled);
        showToast(
          `Batch Scanned [${batchSessionSpools.length + 1}/${batchConfig.targetCount}]: ${code} (${newSpool.material})`,
          'success'
        );
        return;
      }

      if (loadSlotModal && loadSlotModal.slot) {
        const targetSlot = loadSlotModal.slot;
        const found = spools.find((s) => s.barcode.toUpperCase() === code);
        if (found) {
          setSpools((prev) =>
            prev.map((s) => {
              if (s.id === found.id) return { ...s, amsSlot: targetSlot };
              if (s.amsSlot === targetSlot) return { ...s, amsSlot: null };
              return s;
            })
          );
          setLoadSlotModal(null);
          playZebraBeep('success', soundEnabled);
          showToast(`Loaded ${found.barcode} (${found.colorName} ${found.material}) into AMS Slot ${targetSlot}!`, 'success');
          return;
        } else {
          playZebraBeep('scan', soundEnabled);
          setLoadSlotModal(null);
          setSpoolFormModal({
            isEdit: false,
            targetAmsSlot: targetSlot,
            spool: {
              barcode: code,
              material: 'PLA Basic',
              colorName: 'Bambu Green',
              colorHex: '#00AE42',
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
            colorName: 'Jade White',
            colorHex: '#F8FAFC',
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
        setPrintModal({
          mode: 'SINGLE',
          singleSpoolId: matchedSpool.id,
          initialSlot: matchedSpool.amsSlot
        });
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
      setScannedSpoolModal({
        spool: matchedSpool,
        suggestedSlot: firstFree || 'A1'
      });
    },
    [
      batchModalOpen,
      batchConfig,
      batchSessionSpools.length,
      loadSlotModal,
      spools,
      owners,
      currentUser,
      scanMode,
      soundEnabled,
      showToast
    ]
  );

  // ============================================================================
  // HARDWARE KEYSTROKE LISTENER
  // ============================================================================
  const keyBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      const now = performance.now();
      const delta = now - lastKeyTimeRef.current;

      if (delta > 120) {
        keyBufferRef.current = '';
      }

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

  // ============================================================================
  // AMS & SPOOL OPERATIONS
  // ============================================================================
  const loadSpoolIntoSlot = (spoolId, slot) => {
    const targetSpool = spools.find((s) => s.id === spoolId);
    if (!targetSpool) return;

    setSpools((prev) =>
      prev.map((s) => {
        if (s.id === spoolId) return { ...s, amsSlot: slot };
        if (s.amsSlot === slot) return { ...s, amsSlot: null };
        return s;
      })
    );
    playZebraBeep('success', soundEnabled);
    showToast(`Loaded ${targetSpool.barcode} (${targetSpool.colorName}) into AMS Slot ${slot}`, 'success');
    setScannedSpoolModal(null);
    setLoadSlotModal(null);
  };

  const unloadSpoolFromAms = (spoolId) => {
    const targetSpool = spools.find((s) => s.id === spoolId);
    if (!targetSpool) return;
    const oldSlot = targetSpool.amsSlot;
    setSpools((prev) => prev.map((s) => (s.id === spoolId ? { ...s, amsSlot: null } : s)));
    playZebraBeep('scan', soundEnabled);
    showToast(`Unloaded ${targetSpool.barcode} from Slot ${oldSlot} back to Storage`, 'info');
    setScannedSpoolModal(null);
  };

  const handleUndoLog = (logId) => {
    const targetLog = logs.find((l) => l.id === logId);
    if (!targetLog || targetLog.reverted) return;

    setSpools((prev) =>
      prev.map((spool) => {
        const usage = targetLog.usages.find((u) => u.spoolId === spool.id);
        if (!usage) return spool;
        return {
          ...spool,
          remainingWeight: Math.min(spool.initialWeight, spool.remainingWeight + usage.grams)
        };
      })
    );

    setLogs((prev) => prev.map((l) => (l.id === logId ? { ...l, reverted: true } : l)));
    playZebraBeep('success', soundEnabled);
    showToast(`Reverted "${targetLog.jobName}" (+${targetLog.totalGrams}g restored to spools)`, 'success');
  };

  // ============================================================================
  // COMPUTED METRICS & FILTERS
  // ============================================================================
  const amsSlotMap = useMemo(() => {
    const map = { A1: null, A2: null, A3: null, A4: null };
    spools.forEach((s) => {
      if (s.amsSlot && map.hasOwnProperty(s.amsSlot)) {
        map[s.amsSlot] = s;
      }
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
        const match =
          s.barcode.toLowerCase().includes(q) ||
          s.material.toLowerCase().includes(q) ||
          s.colorName.toLowerCase().includes(q) ||
          (s.brand || '').toLowerCase().includes(q) ||
          (s.notes || '').toLowerCase().includes(q) ||
          ownerName.includes(q);
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
      const totalInitialGrams = ownedSpools.reduce((sum, s) => sum + s.initialWeight, 0);

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

      return {
        ...owner,
        spools: ownedSpools,
        spoolCount: ownedSpools.length,
        inAmsCount,
        totalRemainingGrams,
        totalInitialGrams,
        consumedSuccess,
        consumedFailed,
        totalConsumed: consumedSuccess + consumedFailed
      };
    });
  }, [owners, spools, logs]);

  // ============================================================================
  // LOGIN SCREEN (If not authenticated)
  // ============================================================================
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

              const found = owners.find((o) => (o.username || '').toLowerCase() === uname && o.pin === pin);
              if (found) {
                setCurrentUser(found);
                playZebraBeep('success', soundEnabled);
                showToast(`Welcome back, ${found.name}!`, 'success');
              } else {
                playZebraBeep('error', soundEnabled);
                showToast('Invalid username or PIN code.', 'error');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Username</label>
              <input
                name="username"
                defaultValue="admin"
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl text-sm font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">PIN / Password</label>
              <input
                type="password"
                name="pin"
                defaultValue="1234"
                required
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl text-sm font-mono text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              Sign In
            </button>
          </form>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-400 font-mono space-y-1">
            <div>Default Admin: <strong className="text-amber-400">admin</strong> / PIN: <strong className="text-amber-400">1234</strong></div>
            <div className="text-[10px] text-zinc-500">Other profiles: marcus / 5678, elena / 1111</div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER WITH AUTHENTICATED WORKSPACE
  // ============================================================================
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24 select-none">
      {/* ==================================================================== */}
      {/* TOP INDUSTRIAL HEADER & SCANNER BAR                                 */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-3 py-2">
          {/* Row 1: App Title, User & Hardware Status */}
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
                    WEDGE READY
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  User: <strong className="text-amber-300">{currentUser.name}</strong> • {spools.length} Spools
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setBatchSessionSpools([]);
                  setBatchModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow transition active:scale-95"
                title="Rapidly scan in your 29 new spools"
              >
                <PackagePlus className="w-4 h-4" />
                <span className="hidden sm:inline">Batch Intake (29)</span>
                <span className="sm:hidden">Batch+</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border text-xs transition ${
                  soundEnabled
                    ? 'bg-zinc-800 border-zinc-700 text-amber-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
                title="Toggle Zebra Laser Beep Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCurrentUser(null)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-1"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Row 2: Scan Mode Selector Pills */}
          <div className="grid grid-cols-3 gap-1.5 mt-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {[
              { id: 'AUTO', label: 'Quick Scan (Auto)', desc: 'Smart Context' },
              { id: 'AMS_LOAD', label: 'AMS Load/Swap', desc: 'Fast Slot Load' },
              { id: 'LOG_USAGE', label: 'Log Print Usage', desc: 'Deduct Grams' }
            ].map((m) => {
              const active = scanMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setScanMode(m.id)}
                  className={`py-1.5 px-2 rounded-lg text-center transition flex flex-col items-center justify-center ${
                    active
                      ? 'bg-amber-500 text-zinc-950 font-extrabold shadow'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 font-medium'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Collapsible Zebra Hardware Wedge Simulator / Manual Barcode Bar */}
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
                <button
                  type="submit"
                  className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono font-bold shrink-0 active:scale-95 transition"
                >
                  TRIGGER
                </button>
              </form>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
                <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0">Sim Scan:</span>
                <button
                  type="button"
                  onClick={() => handleBarcodeScanned(amsSlotMap.A1?.barcode || 'BBL-100482')}
                  className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-mono text-emerald-300 shrink-0"
                >
                  Slot A1 ({amsSlotMap.A1?.barcode || 'BBL-100482'})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const storageSpool = spools.find((s) => !s.amsSlot) || spools[0];
                    if (storageSpool) handleBarcodeScanned(storageSpool.barcode);
                  }}
                  className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-mono text-cyan-300 shrink-0"
                >
                  Storage Roll
                </button>
                <button
                  type="button"
                  onClick={() => handleBarcodeScanned(generateNextBarcode())}
                  className="px-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-mono text-amber-300 shrink-0"
                >
                  +Unrecognized Roll
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* FLOATING TOAST NOTIFICATION                                         */}
      {/* ==================================================================== */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-none">
          <div
            className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500 text-amber-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
                : 'bg-zinc-900/95 border-cyan-500 text-cyan-200'
            }`}
          >
            <ScanBarcode className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MAIN CONTENT CONTAINER                                              */}
      {/* ==================================================================== */}
      <main className="max-w-5xl mx-auto px-3 pt-4 space-y-4">
        {/* ================================================================== */}
        {/* TAB 1: AMS 2 PRO LIVE 4-SLOT DASHBOARD                              */}
        {/* ================================================================== */}
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
                      Bambu Lab AMS 2 Pro
                      <span className="text-[11px] font-mono font-normal text-zinc-400">4-Slot Active Feeder</span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-emerald-400">
                    <Droplets className="w-3.5 h-3.5" /> 14% RH
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-amber-300">
                    <Thermometer className="w-3.5 h-3.5" /> 45°C Dry
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="text-xs text-zinc-400">
                  Scan any spool barcode with the Zebra trigger to load/unload, or tap a slot below.
                </div>
                <button
                  onClick={() => setPrintModal({ mode: 'AMS', singleSpoolId: null, initialSlot: null })}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95 transition shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  Log Finished Print Job (AMS A1–A4)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {AMS_SLOTS.map((slotKey) => {
                const spool = amsSlotMap[slotKey];
                const owner = spool ? ownerMap[spool.ownerId] : null;
                const ownerStyle = spool ? getOwnerStyle(spool.ownerId) : null;
                const pct = spool ? Math.round((spool.remainingWeight / spool.initialWeight) * 100) : 0;
                const isLow = spool && spool.remainingWeight < 200;

                return (
                  <div
                    key={slotKey}
                    className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                      spool
                        ? 'bg-zinc-900 border-zinc-700/90 shadow-lg'
                        : 'bg-zinc-900/50 border-dashed border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono font-extrabold text-xs text-white">
                          SLOT {slotKey}
                        </span>
                        {spool ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                            <ScanBarcode className="w-3.5 h-3.5 text-amber-400" />
                            {spool.barcode}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-zinc-500">EMPTY BAY</span>
                        )}
                      </div>

                      {spool && owner && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${ownerStyle.bg} ${ownerStyle.text} ${ownerStyle.border}`}
                        >
                          {owner.name}
                        </span>
                      )}
                    </div>

                    {spool ? (
                      <div className="p-4 space-y-3.5">
                        <div className="flex items-center gap-3.5">
                          <SpoolGaugeSVG hex={spool.colorHex} percentage={pct} size={62} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                                style={{ backgroundColor: spool.colorHex }}
                              />
                              <h3 className="text-base font-extrabold text-white truncate">{spool.material}</h3>
                            </div>
                            <p className="text-xs text-zinc-300 font-medium truncate">
                              {spool.colorName} <span className="text-zinc-500">• {spool.brand}</span>
                            </p>

                            <div className="mt-2.5">
                              <div className="flex items-baseline justify-between text-xs font-mono mb-1">
                                <span className={isLow ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  {spool.remainingWeight}g left
                                </span>
                                <span className="text-zinc-500">of {spool.initialWeight}g</span>
                              </div>
                              <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isLow ? 'bg-rose-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            onClick={() =>
                              setPrintModal({
                                mode: 'SINGLE',
                                singleSpoolId: spool.id,
                                initialSlot: slotKey
                              })
                            }
                            className="py-2.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Log Usage</span>
                          </button>

                          <button
                            onClick={() => setScaleModal({ spool })}
                            className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                          >
                            <Scale className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Scale Sync</span>
                          </button>

                          <button
                            onClick={() => unloadSpoolFromAms(spool.id)}
                            className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-500/40 text-zinc-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Unload</span>
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
                          <p className="text-[11px] text-zinc-500">
                            Tap below & pull Zebra barcode trigger to load a spool
                          </p>
                        </div>
                        <button
                          onClick={() => setLoadSlotModal({ slot: slotKey })}
                          className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
                        >
                          <ScanBarcode className="w-4 h-4" />
                          Scan / Load Spool into {slotKey}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  Recent AMS Print Deductions
                </h3>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs text-amber-400 hover:underline font-medium flex items-center gap-1"
                >
                  Full History ({logs.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {logs.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">No prints logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 flex flex-wrap items-center justify-between gap-2 ${
                        log.reverted ? 'opacity-50 line-through' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{log.jobName}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {log.usages.map((u, idx) => {
                            const oName = ownerMap[u.ownerId]?.name || 'Owner';
                            return (
                              <span key={idx} className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block"
                                  style={{ backgroundColor: u.colorHex }}
                                />
                                {u.slot ? `[${u.slot}]` : ''} -{u.grams}g {u.material} ({oName})
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-amber-400">-{log.totalGrams}g</span>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: SPOOL INVENTORY & REGISTRY                                  */}
        {/* ================================================================== */}
        {activeTab === 'spools' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">Filament Spool Registry ({spools.length})</h2>
                  <p className="text-xs text-zinc-400">
                    Scan any barcode or use Batch Intake to register your 29 incoming rolls
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBatchSessionSpools([]);
                      setBatchModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                  >
                    <PackagePlus className="w-4 h-4" />
                    Batch Scan 29 Rolls
                  </button>

                  <button
                    onClick={() =>
                      setSpoolFormModal({
                        isEdit: false,
                        spool: {
                          barcode: generateNextBarcode(),
                          material: 'PLA Basic',
                          colorName: 'Bambu Green',
                          colorHex: '#00AE42',
                          brand: 'Bambu Lab',
                          ownerId: currentUser?.id || owners[0]?.id || 'own-1',
                          initialWeight: 1000,
                          remainingWeight: 1000,
                          tareWeight: 250,
                          amsSlot: null,
                          notes: ''
                        }
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    New Spool
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

                <select
                  value={materialFilter}
                  onChange={(e) => setMaterialFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Materials</option>
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL">All Owners ({owners.length})</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: 'ALL', label: `All (${spools.length})` },
                  { id: 'AMS', label: `In AMS 2 Pro (${spools.filter((s) => s.amsSlot).length})` },
                  {
                    id: 'STORAGE',
                    label: `In Storage (${spools.filter((s) => !s.amsSlot && s.remainingWeight > 0).length})`
                  },
                  {
                    id: 'LOW',
                    label: `Low <200g (${spools.filter((s) => s.remainingWeight > 0 && s.remainingWeight < 200).length})`
                  },
                  { id: 'EMPTY', label: `Empty (${spools.filter((s) => s.remainingWeight <= 0).length})` }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 border transition ${
                      statusFilter === st.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSpools.map((spool) => {
                const owner = ownerMap[spool.ownerId];
                const ownerStyle = getOwnerStyle(spool.ownerId);
                const pct = Math.round((spool.remainingWeight / spool.initialWeight) * 100);

                return (
                  <div
                    key={spool.id}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <SpoolGaugeSVG hex={spool.colorHex} percentage={pct} size={52} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 font-mono font-bold text-[11px] text-amber-400">
                              {spool.barcode}
                            </span>
                            {spool.amsSlot ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 font-mono font-bold text-[11px] text-emerald-300">
                                AMS {spool.amsSlot}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">
                                STORAGE
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-extrabold text-white mt-1 truncate">
                            {spool.material} — {spool.colorName}
                          </h3>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {spool.brand} • {spool.remainingWeight}g / {spool.initialWeight}g left
                          </p>
                        </div>
                      </div>

                      {owner && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${ownerStyle.bg} ${ownerStyle.text} ${ownerStyle.border}`}
                        >
                          {owner.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-zinc-800/80">
                      {spool.amsSlot ? (
                        <button
                          onClick={() => unloadSpoolFromAms(spool.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                          Unload {spool.amsSlot}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const occupiedSlots = new Set(spools.filter((s) => s.amsSlot).map((s) => s.amsSlot));
                            const firstFree = AMS_SLOTS.find((slot) => !occupiedSlots.has(slot)) || 'A1';
                            setScannedSpoolModal({ spool, suggestedSlot: firstFree });
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1"
                        >
                          <Disc className="w-3.5 h-3.5" />
                          Load to AMS
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setPrintModal({
                            mode: 'SINGLE',
                            singleSpoolId: spool.id,
                            initialSlot: spool.amsSlot
                          })
                        }
                        className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center gap-1"
                        title="Deduct print usage"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Use
                      </button>

                      <button
                        onClick={() => setLabelModal({ spool })}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="View / Print Barcode Label"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSpoolFormModal({ isEdit: true, spool: { ...spool } })}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Edit Spool"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: OWNERS & LOGINS (WITH SECURE USER MANAGEMENT)                */}
        {/* ================================================================== */}
        {activeTab === 'owners' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Filament Owners, Logins & Co-Op Ledger</h2>
                <p className="text-xs text-zinc-400">
                  Manage user accounts, PIN codes, and track filament usage per member
                </p>
              </div>
              {currentUser.isAdmin && (
                <button
                  onClick={() =>
                    setOwnerModal({
                      isEdit: false,
                      owner: { name: '', username: '', pin: '', isAdmin: false, role: 'Co-Op Member', colorIdx: owners.length % OWNER_COLORS.length, notes: '' }
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Add New User / Owner
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
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-extrabold text-sm ${style.bg} ${style.text} ${style.border}`}
                        >
                          {person.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-white">{person.name}</h3>
                            <span className="text-xs text-zinc-400">({person.role})</span>
                            {person.isAdmin && (
                              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 font-mono">
                            Username: <span className="text-white">{person.username || 'N/A'}</span>
                            {person.notes && <span className="text-zinc-500 ml-2">• {person.notes}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setOwnerFilter(person.id);
                            setActiveTab('spools');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
                        >
                          Filter Spools ({person.spoolCount})
                        </button>
                        {(currentUser.isAdmin || currentUser.id === person.id) && (
                          <button
                            onClick={() => setOwnerModal({ isEdit: true, owner: { ...person } })}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="Edit User"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">Owned Spools</span>
                        <span className="text-sm font-extrabold text-white">
                          {person.spoolCount} Rolls{' '}
                          <span className="text-xs text-emerald-400 font-normal">({person.inAmsCount} AMS)</span>
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">Remaining Filament</span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {person.totalRemainingGrams.toLocaleString()}g
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">Used (Successful)</span>
                        <span className="text-sm font-extrabold text-amber-300">
                          {person.consumedSuccess.toLocaleString()}g
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase block">Used (Failed Prints)</span>
                        <span className="text-sm font-extrabold text-rose-400">
                          {person.consumedFailed.toLocaleString()}g
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: LOGS & SYNC                                                 */}
        {/* ================================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">Zebra Device Backup & Print Ledger</h2>
                  <p className="text-xs text-zinc-400">
                    Export CSV/JSON backups or configure Zebra DataWedge hardware trigger settings
                  </p>
                </div>

                <button
                  onClick={() => setZebraGuideOpen(true)}
                  className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  Zebra Sideload & DataWedge Guide
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const payload = JSON.stringify({ owners, spools, logs, exportedAt: new Date().toISOString() }, null, 2);
                    const blob = new Blob([payload], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ams2pro-filament-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    showToast('Downloaded JSON database backup!', 'success');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  Export JSON Backup
                </button>

                <button
                  onClick={() => {
                    const headers = ['Barcode', 'Material', 'Color', 'Brand', 'Owner', 'AMS_Slot', 'Remaining_g', 'Initial_g', 'Tare_g'];
                    const rows = spools.map((s) => [
                      s.barcode,
                      s.material,
                      s.colorName,
                      s.brand,
                      ownerMap[s.ownerId]?.name || 'Unknown',
                      s.amsSlot || 'STORAGE',
                      s.remainingWeight,
                      s.initialWeight,
                      s.tareWeight
                    ]);
                    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `spools-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    showToast('Exported Spool Inventory CSV!', 'success');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Export Spools CSV
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Print Usage & Deduction History ({logs.length})
              </h3>

              <div className="space-y-2.5">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      log.reverted ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-sm font-bold text-white">{log.jobName}</span>
                        {log.reverted && (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                            REVERTED
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-zinc-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {log.usages.map((u, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-1.5"
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: u.colorHex }} />
                            <span>
                              {u.slot ? `Slot ${u.slot}: ` : ''}
                              <strong>-{u.grams}g</strong> {u.material} ({u.barcode}) •{' '}
                              <span className="text-amber-300">{ownerMap[u.ownerId]?.name || 'Owner'}</span>
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-sm font-mono font-extrabold text-amber-400">-{log.totalGrams}g total</span>
                      {!log.reverted && (
                        <button
                          onClick={() => handleUndoLog(log.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Undo / Restore Grams
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: ADMIN PANEL                                                 */}
        {/* ================================================================== */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-base font-bold text-white">System Admin Controls</h2>
                  <p className="text-xs text-zinc-400">Manage global system resets, database purging, and security configuration</p>
                </div>
              </div>

              {currentUser.isAdmin ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wide">Danger Zone: Factory Reset</h3>
                    <p className="text-xs text-zinc-300">
                      Clears all custom spool inventory, users, and print logs back to default factory state.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to completely wipe all local storage and factory reset?')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs active:scale-95 transition"
                    >
                      Factory Reset All Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  Administrator privileges are required to access advanced system maintenance controls. You are currently logged in as <strong className="text-white">{currentUser.name}</strong>.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: SCANNED SPOOL QUICK ACTION MODAL                           */}
      {/* ==================================================================== */}
      {scannedSpoolModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanBarcode className="w-5 h-5 text-amber-400" />
                <span className="font-mono font-extrabold text-sm text-white">
                  BARCODE SCANNED: {scannedSpoolModal.spool.barcode}
                </span>
              </div>
              <button onClick={() => setScannedSpoolModal(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3.5">
                <SpoolGaugeSVG
                  hex={scannedSpoolModal.spool.colorHex}
                  percentage={Math.round(
                    (scannedSpoolModal.spool.remainingWeight / scannedSpoolModal.spool.initialWeight) * 100
                  )}
                  size={60}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white truncate">
                      {scannedSpoolModal.spool.material}
                    </span>
                    {scannedSpoolModal.spool.amsSlot && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                        IN SLOT {scannedSpoolModal.spool.amsSlot}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300">
                    {scannedSpoolModal.spool.colorName} • Owner:{' '}
                    <strong className="text-amber-300">
                      {ownerMap[scannedSpoolModal.spool.ownerId]?.name || 'Unassigned'}
                    </strong>
                  </p>
                  <p className="text-xs font-mono text-emerald-400 font-bold mt-1">
                    {scannedSpoolModal.spool.remainingWeight}g / {scannedSpoolModal.spool.initialWeight}g remaining
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-zinc-400 block">
                  {scannedSpoolModal.spool.amsSlot
                    ? `Move from Slot ${scannedSpoolModal.spool.amsSlot} or Unload:`
                    : 'Tap AMS 2 Pro Slot to Load This Spool:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AMS_SLOTS.map((slot) => {
                    const occupant = amsSlotMap[slot];
                    const isCurrent = scannedSpoolModal.spool.amsSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => loadSpoolIntoSlot(scannedSpoolModal.spool.id, slot)}
                        className={`p-2.5 rounded-xl border text-center transition active:scale-95 ${
                          isCurrent
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-extrabold'
                            : occupant
                            ? 'bg-zinc-950 border-zinc-700 hover:border-amber-400 text-zinc-200'
                            : 'bg-amber-500/15 border-amber-500/50 hover:bg-amber-500/25 text-amber-300 font-bold'
                        }`}
                      >
                        <div className="text-xs font-mono font-extrabold">SLOT {slot}</div>
                        <div className="text-[10px] truncate mt-0.5 text-zinc-400">
                          {isCurrent ? 'Loaded' : occupant ? `Swap ${occupant.material}` : 'Empty'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    const sp = scannedSpoolModal.spool;
                    setScannedSpoolModal(null);
                    setPrintModal({
                      mode: 'SINGLE',
                      singleSpoolId: sp.id,
                      initialSlot: sp.amsSlot
                    });
                  }}
                  className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Printer className="w-4 h-4" />
                  Log Print Usage (-g)
                </button>

                {scannedSpoolModal.spool.amsSlot ? (
                  <button
                    onClick={() => unloadSpoolFromAms(scannedSpoolModal.spool.id)}
                    className="py-3 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Unload to Storage
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const sp = scannedSpoolModal.spool;
                      setScannedSpoolModal(null);
                      setScaleModal({ spool: sp });
                    }}
                    className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Scale className="w-4 h-4 text-cyan-400" />
                    Weigh on Scale
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: LOAD SPOOL INTO SPECIFIC AMS SLOT                          */}
      {/* ==================================================================== */}
      {loadSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc className="w-5 h-5 text-amber-400 animate-spin" />
                <span className="font-mono font-extrabold text-sm text-white">
                  LOAD SPOOL INTO AMS SLOT {loadSlotModal.slot}
                </span>
              </div>
              <button onClick={() => setLoadSlotModal(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-center space-y-1.5">
                <ScanBarcode className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs font-extrabold text-amber-300 uppercase tracking-wide">
                  Pull Zebra Hardware Trigger Now
                </p>
                <p className="text-[11px] text-zinc-300">
                  Scanning any spool barcode while this window is open will immediately load it into{' '}
                  <strong>Slot {loadSlotModal.slot}</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-zinc-400 block">
                  Or Tap a Storage Spool Below:
                </span>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {spools
                    .filter((s) => s.amsSlot !== loadSlotModal.slot && s.remainingWeight > 0)
                    .map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => loadSpoolIntoSlot(sp.id, loadSlotModal.slot)}
                        className="w-full p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between text-left transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: sp.colorHex }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {sp.material} — {sp.colorName}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400">
                              {sp.barcode} • {ownerMap[sp.ownerId]?.name}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                          {sp.remainingWeight}g
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: LOG PRINT USAGE                                            */}
      {/* ==================================================================== */}
      {printModal && (
        <PrintUsageModal
          printModal={printModal}
          onClose={() => setPrintModal(null)}
          spools={spools}
          amsSlotMap={amsSlotMap}
          ownerMap={ownerMap}
          onSubmitPrint={({ jobName, status, deductions }) => {
            let totalGrams = 0;
            const usages = [];

            deductions.forEach((d) => {
              const grams = Math.max(0, Number(d.grams) || 0);
              if (grams <= 0) return;
              const sp = spools.find((s) => s.id === d.spoolId);
              if (!sp) return;
              totalGrams += grams;
              usages.push({
                spoolId: sp.id,
                barcode: sp.barcode,
                material: sp.material,
                colorName: sp.colorName,
                colorHex: sp.colorHex,
                ownerId: sp.ownerId,
                slot: d.slot || sp.amsSlot,
                grams
              });
            });

            if (usages.length === 0) {
              showToast('Please enter at least 1g of filament used', 'warning');
              return;
            }

            setSpools((prev) =>
              prev.map((s) => {
                const used = usages.find((u) => u.spoolId === s.id);
                if (!used) return s;
                return {
                  ...s,
                  remainingWeight: Math.max(0, s.remainingWeight - used.grams)
                };
              })
            );

            const newLog = {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              jobName: jobName.trim() || (status === 'SUCCESS' ? 'Completed AMS Print' : 'Failed / Canceled Print'),
              status,
              totalGrams,
              reverted: false,
              usages
            };

            setLogs((prev) => [newLog, ...prev]);
            setPrintModal(null);
            playZebraBeep('success', soundEnabled);
            showToast(`Logged ${status} print: -${totalGrams}g deducted across ${usages.length} spool(s)!`, 'success');
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: BATCH INTAKE 29-ROLL RAPID SCANNER                         */}
      {/* ==================================================================== */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase">
                    Batch Spool Intake (29-Roll Rapid Mode)
                  </h3>
                  <p className="text-[11px] font-mono text-amber-400">
                    {batchSessionSpools.length} of {batchConfig.targetCount} Rolls Scanned This Session
                  </p>
                </div>
              </div>
              <button onClick={() => setBatchModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="text-xs font-mono font-bold text-zinc-300 uppercase">
                  1. Lock Default Owner, Material & Color for Next Scan:
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Assigned Owner (Who Paid)</label>
                    <select
                      value={batchConfig.ownerId}
                      onChange={(e) => setBatchConfig({ ...batchConfig, ownerId: e.target.value })}
                      className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                    >
                      {owners.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Filament Material</label>
                    <select
                      value={batchConfig.material}
                      onChange={(e) => setBatchConfig({ ...batchConfig, material: e.target.value })}
                      className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                    >
                      {MATERIALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1.5">
                    Active Color: <strong className="text-white">{batchConfig.colorName}</strong>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {FILAMENT_COLORS.map((c) => {
                      const active = batchConfig.colorName === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setBatchConfig({ ...batchConfig, colorName: c.name, colorHex: c.hex })}
                          className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 transition ${
                            active
                              ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.name.split(' ')[1] || c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const codeToUse = batchBarcodeInput.trim() || generateNextBarcode();
                  handleBarcodeScanned(codeToUse);
                }}
                className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-300 uppercase flex items-center gap-1.5">
                    <ScanBarcode className="w-4 h-4" />
                    2. Scan Roll Barcode (Auto-Saves Immediately)
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {batchSessionSpools.length}/{batchConfig.targetCount}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={batchBarcodeInput}
                    onChange={(e) => setBatchBarcodeInput(e.target.value)}
                    placeholder="Pull Zebra trigger or leave blank to auto-generate ID..."
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shrink-0 active:scale-95 transition"
                  >
                    + Scan Next Roll
                  </button>
                </div>
              </form>

              {batchSessionSpools.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-mono uppercase text-zinc-400">
                    Scanned in this session ({batchSessionSpools.length}):
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {batchSessionSpools.map((sp, i) => (
                      <div
                        key={sp.id}
                        className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-500">#{batchSessionSpools.length - i}</span>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sp.colorHex }} />
                          <span className="font-mono font-bold text-amber-300">{sp.barcode}</span>
                          <span className="text-white font-medium">
                            {sp.material} ({sp.colorName})
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">{ownerMap[sp.ownerId]?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: REGISTER / EDIT SINGLE SPOOL                                */}
      {/* ==================================================================== */}
      {spoolFormModal && (
        <SpoolFormModal
          modalData={spoolFormModal}
          owners={owners}
          onClose={() => setSpoolFormModal(null)}
          onSave={(savedSpool) => {
            if (spoolFormModal.isEdit) {
              setSpools((prev) => prev.map((s) => (s.id === savedSpool.id ? savedSpool : s)));
              showToast(`Updated spool ${savedSpool.barcode}`, 'success');
            } else {
              const newSpool = {
                ...savedSpool,
                id: `sp-${Date.now()}`,
                createdAt: new Date().toISOString()
              };
              setSpools((prev) => {
                const cleaned = newSpool.amsSlot
                  ? prev.map((s) => (s.amsSlot === newSpool.amsSlot ? { ...s, amsSlot: null } : s))
                  : prev;
                return [newSpool, ...cleaned];
              });
              showToast(
                `Registered new spool ${newSpool.barcode}${
                  newSpool.amsSlot ? ` into AMS Slot ${newSpool.amsSlot}` : ''
                }!`,
                'success'
              );
            }
            playZebraBeep('success', soundEnabled);
            setSpoolFormModal(null);
          }}
          onDelete={(spoolId) => {
            setSpools((prev) => prev.filter((s) => s.id !== spoolId));
            setSpoolFormModal(null);
            showToast('Spool removed from inventory', 'info');
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: SCALE CHECK / TARE WEIGHT SYNC                             */}
      {/* ==================================================================== */}
      {scaleModal && (
        <ScaleSyncModal
          spool={scaleModal.spool}
          onClose={() => setScaleModal(null)}
          onUpdateWeight={(newRemaining, newTare) => {
            setSpools((prev) =>
              prev.map((s) =>
                s.id === scaleModal.spool.id
                  ? { ...s, remainingWeight: Math.max(0, newRemaining), tareWeight: newTare }
                  : s
              )
            );
            playZebraBeep('success', soundEnabled);
            showToast(`Updated ${scaleModal.spool.barcode} weight to ${newRemaining}g via scale check!`, 'success');
            setScaleModal(null);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 7: 1D BARCODE LABEL VIEWER                                    */}
      {/* ==================================================================== */}
      {labelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-amber-400 uppercase">
                Spool Barcode Sticker Label
              </span>
              <button onClick={() => setLabelModal(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-white text-zinc-950 p-4 rounded-xl border-2 border-zinc-400 space-y-2 shadow-inner">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-1.5">
                  <span className="font-extrabold text-sm uppercase">{labelModal.spool.material}</span>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-zinc-900 text-white rounded">
                    {ownerMap[labelModal.spool.ownerId]?.name || 'Owner'}
                  </span>
                </div>
                <div className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                  <span>Color: {labelModal.spool.colorName}</span>
                  <span>Tare: {labelModal.spool.tareWeight}g</span>
                </div>
                <BarcodeSVG value={labelModal.spool.barcode} height={54} />
                <div className="text-center font-mono font-extrabold text-sm tracking-widest">
                  {labelModal.spool.barcode}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 text-center">
                Scan this screen directly with your Zebra scanner to test, or print onto 2"x1" thermal spool stickers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 8: OWNER ADD / EDIT & USER CREDENTIALS MODAL                  */}
      {/* ==================================================================== */}
      {ownerModal && (
        <OwnerFormModal
          modalData={ownerModal}
          onClose={() => setOwnerModal(null)}
          onSave={(savedOwner) => {
            if (ownerModal.isEdit) {
              setOwners((prev) => prev.map((o) => (o.id === savedOwner.id ? savedOwner : o)));
              showToast(`Updated user/owner ${savedOwner.name}`, 'success');
              if (currentUser.id === savedOwner.id) {
                setCurrentUser(savedOwner);
              }
            } else {
              setOwners((prev) => [...prev, { ...savedOwner, id: `own-${Date.now()}` }]);
              showToast(`Added ${savedOwner.name} to users ledger`, 'success');
            }
            setOwnerModal(null);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 9: ZEBRA ANDROID SIDELOAD & DATAWEDGE GUIDE                   */}
      {/* ==================================================================== */}
      {zebraGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-2">
                <ScanBarcode className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-white">Zebra Android Scanner & DataWedge Setup</span>
              </div>
              <button onClick={() => setZebraGuideOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <h4 className="font-bold text-amber-400 uppercase font-mono">
                  1. Zebra DataWedge Profile Configuration
                </h4>
                <p>
                  On your Zebra Android device (TC21, TC26, TC52, MC3300, etc.), open the pre-installed{' '}
                  <strong>DataWedge</strong> app and select <strong>Profile0 (Default)</strong>:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Enable <strong>Barcode Input</strong> (Hardware Laser / Imager).</li>
                  <li>Scroll down to <strong>Keystroke Output</strong> and ensure it is <strong>Enabled</strong>.</li>
                  <li>Tap <strong>Basic data formatting</strong> and check <strong>Send ENTER key</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BOTTOM THUMB-FRIENDLY NAVIGATION BAR                                 */}
      {/* ==================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur border-t border-zinc-800">
        <div className="max-w-5xl mx-auto grid grid-cols-5 px-2 py-1.5 gap-1">
          {[
            { id: 'ams', label: 'AMS 2 Pro', icon: Layers, badge: `${spools.filter((s) => s.amsSlot).length}/4` },
            { id: 'spools', label: 'Spools', icon: Disc, badge: spools.length },
            { id: 'owners', label: 'Owners', icon: Users, badge: owners.length },
            { id: 'logs', label: 'Logs & Sync', icon: History, badge: logs.filter((l) => !l.reverted).length },
            { id: 'admin', label: 'Admin', icon: ShieldCheck, badge: currentUser.isAdmin ? '★' : '' }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${
                  active
                    ? 'bg-amber-500/15 text-amber-400 font-extrabold border border-amber-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      active ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
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

// ============================================================================
// SUB-COMPONENT: PRINT USAGE DEDUCTION MODAL
// ============================================================================
function PrintUsageModal({ printModal, onClose, spools, amsSlotMap, ownerMap, onSubmitPrint }) {
  const [jobName, setJobName] = useState('');
  const [status, setStatus] = useState('SUCCESS');
  const [mode, setMode] = useState(printModal.mode || 'AMS');

  const [gramsBySpool, setGramsBySpool] = useState(() => {
    const init = {};
    if (printModal.singleSpoolId) {
      init[printModal.singleSpoolId] = '';
    }
    return init;
  });

  const handleGramChange = (spoolId, val) => {
    setGramsBySpool((prev) => ({ ...prev, [spoolId]: val }));
  };

  const addQuickGrams = (spoolId, delta) => {
    setGramsBySpool((prev) => {
      const curr = Number(prev[spoolId]) || 0;
      return { ...prev, [spoolId]: String(Math.max(0, curr + delta)) };
    });
  };

  const singleSpool = spools.find((s) => s.id === printModal.singleSpoolId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const deductions = Object.entries(gramsBySpool)
      .map(([spoolId, grams]) => ({
        spoolId,
        grams: Number(grams) || 0
      }))
      .filter((d) => d.grams > 0);

    onSubmitPrint({ jobName, status, deductions });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase">Log Print Filament Usage</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">Print Job Name / Slicer File</label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="e.g., Multicolor Helmet, Gridfinity Bin, Intake Duct..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('SUCCESS')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  status === 'SUCCESS'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Print Succeeded
              </button>

              <button
                type="button"
                onClick={() => setStatus('FAILED')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  status === 'FAILED'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Print Failed / Canceled
              </button>
            </div>
          </div>

          {singleSpool && (
            <div className="flex items-center justify-between text-xs bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">
                Logging for: <strong className="text-white">{singleSpool.barcode}</strong>
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'SINGLE' ? 'AMS' : 'SINGLE')}
                className="text-amber-400 font-bold underline"
              >
                {mode === 'SINGLE' ? 'Switch to Multi-Slot AMS View' : 'Single Spool View'}
              </button>
            </div>
          )}

          <div className="space-y-2.5">
            <label className="text-xs font-mono uppercase text-zinc-400 block">
              Enter Grams Used (From Bambu Studio / Handy Report):
            </label>

            {mode === 'SINGLE' && singleSpool ? (
              <SpoolGramInputCard
                spool={singleSpool}
                slotLabel={singleSpool.amsSlot ? `SLOT ${singleSpool.amsSlot}` : 'STORAGE'}
                ownerName={ownerMap[singleSpool.ownerId]?.name}
                value={gramsBySpool[singleSpool.id] || ''}
                onChange={(val) => handleGramChange(singleSpool.id, val)}
                onQuickAdd={(d) => addQuickGrams(singleSpool.id, d)}
                autoFocus
              />
            ) : (
              AMS_SLOTS.map((slot) => {
                const sp = amsSlotMap[slot];
                if (!sp) {
                  return (
                    <div
                      key={slot}
                      className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 font-mono"
                    >
                      <span>SLOT {slot}</span>
                      <span>EMPTY</span>
                    </div>
                  );
                }
                return (
                  <SpoolGramInputCard
                    key={slot}
                    spool={sp}
                    slotLabel={`SLOT ${slot}`}
                    ownerName={ownerMap[sp.ownerId]?.name}
                    value={gramsBySpool[sp.id] || ''}
                    onChange={(val) => handleGramChange(sp.id, val)}
                    onQuickAdd={(d) => addQuickGrams(sp.id, d)}
                  />
                );
              })
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
          >
            <Check className="w-5 h-5" />
            Deduct Filament & Save Print Log
          </button>
        </form>
      </div>
    </div>
  );
}

function SpoolGramInputCard({ spool, slotLabel, ownerName, value, onChange, onQuickAdd, autoFocus }) {
  const deducted = Number(value) || 0;
  const projectedRemaining = Math.max(0, spool.remainingWeight - deducted);

  return (
    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono font-bold text-[10px] text-amber-400">
            {slotLabel}
          </span>
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: spool.colorHex }} />
          <span className="text-xs font-bold text-white truncate">
            {spool.material} ({spool.colorName})
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 shrink-0">{ownerName}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min="0"
            max="5000"
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className="w-full pl-3 pr-10 py-2 bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-lg text-sm font-mono font-bold text-white focus:outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">grams</span>
        </div>

        <div className="flex items-center gap-1">
          {[10, 25, 50, 100].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onQuickAdd(amt)}
              className="px-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-mono font-bold text-amber-300 active:scale-95"
            >
              +{amt}g
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-zinc-500">Current: {spool.remainingWeight}g</span>
        <span className={deducted > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
          After Print: {projectedRemaining}g left
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: REGISTER / EDIT SPOOL FORM MODAL
// ============================================================================
function SpoolFormModal({ modalData, owners, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(modalData.spool);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.barcode.trim()) return;
    onSave({
      ...form,
      barcode: form.barcode.trim().toUpperCase(),
      initialWeight: Number(form.initialWeight) || 1000,
      remainingWeight: Number(form.remainingWeight) || 0,
      tareWeight: Number(form.tareWeight) || 250
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase">
              {modalData.isEdit ? `Edit Spool ${form.barcode}` : 'Register Filament Spool'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Spool Barcode ID</label>
              <input
                type="text"
                required
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-amber-300"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Owner (Who Paid)</label>
              <select
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Material Type</label>
              <select
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">AMS 2 Pro Location</label>
              <select
                value={form.amsSlot || ''}
                onChange={(e) => setForm({ ...form, amsSlot: e.target.value || null })}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-emerald-300 font-mono"
              >
                <option value="">In Storage (Unloaded)</option>
                {AMS_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    Loaded in AMS Slot {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-1.5">
              Color: <strong className="text-white">{form.colorName}</strong>
            </label>
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {FILAMENT_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setForm({ ...form, colorName: c.name, colorHex: c.hex })}
                  className={`h-7 rounded-lg border flex items-center justify-center ${
                    form.colorName === c.name ? 'ring-2 ring-amber-400 border-white' : 'border-zinc-700'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 block mb-1">Remaining (g)</label>
              <input
                type="number"
                value={form.remainingWeight}
                onChange={(e) => setForm({ ...form, remainingWeight: e.target.value })}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 block mb-1">Initial Net (g)</label>
              <input
                type="number"
                value={form.initialWeight}
                onChange={(e) => setForm({ ...form, initialWeight: e.target.value })}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 block mb-1">Empty Tare (g)</label>
              <input
                type="number"
                value={form.tareWeight}
                onChange={(e) => setForm({ ...form, tareWeight: e.target.value })}
                className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {modalData.isEdit && (
              <button
                type="button"
                onClick={() => onDelete(form.id)}
                className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400"
                title="Delete Spool"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider shadow"
            >
              {modalData.isEdit ? 'Save Changes' : 'Register Spool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: DIGITAL SCALE TARE SYNC MODAL
// ============================================================================
function ScaleSyncModal({ spool, onClose, onUpdateWeight }) {
  const [tare, setTare] = useState(spool.tareWeight || 250);
  const [grossWeight, setGrossWeight] = useState(spool.remainingWeight + (spool.tareWeight || 250));

  const calculatedNet = Math.max(0, Number(grossWeight) - Number(tare));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm text-white">Scale Check: {spool.barcode}</span>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-zinc-400">
            Place the spool on your digital scale and enter the total reading. We subtract the empty spool tare weight automatically.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Scale Gross Weight (g)</label>
              <input
                type="number"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-cyan-500/50 rounded-xl text-sm font-mono font-bold text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Empty Spool Tare (g)</label>
              <input
                type="number"
                value={tare}
                onChange={(e) => setTare(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm font-mono text-zinc-300"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between font-mono">
            <span className="text-xs text-zinc-400">Calculated Filament Left:</span>
            <span className="text-base font-extrabold text-emerald-400">{calculatedNet}g</span>
          </div>

          <button
            onClick={() => onUpdateWeight(calculatedNet, Number(tare) || 250)}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs uppercase shadow"
          >
            Sync Remaining Weight ({calculatedNet}g)
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: OWNER ADD / EDIT MODAL (WITH USERNAME & PIN SETUP)
// ============================================================================
function OwnerFormModal({ modalData, onClose, onSave }) {
  const [form, setForm] = useState(modalData.owner);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white">
            {modalData.isEdit ? 'Edit User / Owner' : 'Add New User & Login'}
          </span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            onSave(form);
          }}
          className="p-4 space-y-3"
        >
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Sam Rivera"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Login Username</label>
              <input
                type="text"
                required
                value={form.username || ''}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
                placeholder="e.g., sam"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Login PIN / Password</label>
              <input
                type="text"
                required
                value={form.pin || ''}
                onChange={(e) => setForm({ ...form, pin: e.target.value.trim() })}
                placeholder="e.g., 1234"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Role / Group</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g., Co-Op Friend"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAdminCheck"
              checked={Boolean(form.isAdmin)}
              onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
              className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0"
            />
            <label htmlFor="isAdminCheck" className="text-xs text-zinc-300">Grant Administrator Privileges</label>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">Badge Color Tag</label>
            <div className="flex gap-2">
              {OWNER_COLORS.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setForm({ ...form, colorIdx: idx })}
                  className={`w-8 h-8 rounded-lg border ${c.bg} ${c.border} flex items-center justify-center ${
                    form.colorIdx === idx ? 'ring-2 ring-white' : ''
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase"
          >
            Save User & Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
