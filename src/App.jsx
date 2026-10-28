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
// OFFICIAL BAMBU LAB STORE CATALOG (MATERIALS & COLOR SWATCHES)
// ============================================================================

const MATERIALS = [
  'PLA Basic',
  'PLA Matte',
  'PLA Tough+',
  'PLA Silk',
  'PLA Silk Multi-Color',
  'PLA Sparkle',
  'PLA Galaxy',
  'PLA Marble',
  'PLA Metal',
  'PLA Translucent',
  'PLA Glow',
  'PLA Aero',
  'PLA-CF',
  'PETG Basic',
  'PETG HF',
  'PETG Translucent',
  'PETG-CF',
  'ABS',
  'ABS-CF',
  'ASA',
  'TPU 95A',
  'TPU 95A HF',
  'TPU 94A',
  'PC',
  'PAHT-CF',
  'PA6-CF',
  'PPA-CF',
  'PPA-GF',
  'PPS',
  'PVA',
  'Support G',
  'Support W'
];

const FILAMENT_COLORS = [
  { name: 'Jade White', hex: '#F8FAFC' },
  { name: 'Cloud White', hex: '#F1F5F9' },
  { name: 'Charcoal Black', hex: '#1E293B' },
  { name: 'Onyx Black', hex: '#09090B' },
  { name: 'Bambu Green', hex: '#00AE42' },
  { name: 'Lawn Green', hex: '#22C55E' },
  { name: 'Fire Engine Red', hex: '#EF4444' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Mandarin Orange', hex: '#F97316' },
  { name: 'Sunflower Yellow', hex: '#EAB308' },
  { name: 'Lemon Yellow', hex: '#FACC15' },
  { name: 'Cobalt Blue', hex: '#2563EB' },
  { name: 'Cyan Tough', hex: '#06B6D4' },
  { name: 'Azure Blue', hex: '#489FDF' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Galaxy Purple', hex: '#9333EA' },
  { name: 'Lilac Purple', hex: '#C084FC' },
  { name: 'Magenta Pop', hex: '#EC4899' },
  { name: 'Sakura Pink', hex: '#F472B6' },
  { name: 'Titanium Grey', hex: '#64748B' },
  { name: 'Silver Metallic', hex: '#94A3B8' },
  { name: 'Bronze Metallic', hex: '#B45309' },
  { name: 'Gold Metallic', hex: '#D97706' },
  { name: 'Desert Tan', hex: '#D6B88D' },
  { name: 'Carbon Matte', hex: '#27272A' },
  { name: 'Transparent Clear', hex: '#E2E8F0' },
  { name: 'Neon Green Glow', hex: '#4ADE80' },
  { name: 'Neon Pink Glow', hex: '#F43F5E' }
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

const INITIAL_SPOOLS = [];
const INITIAL_LOGS = [];

const AMS_SLOTS = ['A1', 'A2', 'A3', 'A4'];

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
// BARCODE RENDERER
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
    <svg viewBox={`0 0 ${totalUnits} ${height}`} className="w-full h-14 bg-white p-1.5 rounded" preserveAspectRatio="none">
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
// SPOOL GAUGE
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
    try { localStorage.setItem('zebra_ams_owners_v1', JSON.stringify(owners)); } catch (e) {}
  }, [owners]);

  useEffect(() => {
    try { localStorage.setItem('zebra_ams_spools_v1', JSON.stringify(spools)); } catch (e) {}
  }, [spools]);

  useEffect(() => {
    try { localStorage.setItem('zebra_ams_logs_v1', JSON.stringify(logs)); } catch (e) {}
  }, [logs]);

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
  const [toast, setToast] = useState(null);

  const [scannedSpoolModal, setScannedSpoolModal] = useState(null);
  const [loadSlotModal, setLoadSlotModal] = useState(null);
  const [printModal, setPrintModal] = useState(null);
  const [spoolFormModal, setSpoolFormModal] = useState(null);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [scaleModal, setScaleModal] = useState(null);
  const [labelModal, setLabelModal] = useState(null);
  const [ownerModal, setOwnerModal] = useState(null);
  const [zebraGuideOpen, setZebraGuideOpen] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

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
    colorName: 'Jade White',
    colorHex: '#F8FAFC',
    initialWeight: 1000,
    tareWeight: 250,
    targetCount: 29
  });
  const [batchSessionSpools, setBatchSessionSpools] = useState([]);
  const [batchBarcodeInput, setBatchBarcodeInput] = useState('');

  const handleBarcodeScanned = useCallback(
    (rawCode) => {
      const code = String(rawCode || '').trim().toUpperCase();
      if (!code) return;

      if (batchModalOpen) {
        const existing = spools.find((s) => s.barcode.toUpperCase() === code);
        if (existing) {
          playZebraBeep('error', soundEnabled);
          showToast(`Barcode ${code} is already registered!`, 'error');
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
        showToast(`Batch Scanned [${batchSessionSpools.length + 1}/${batchConfig.targetCount}]: ${code}`, 'success');
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
          showToast(`Loaded ${found.barcode} into AMS Slot ${targetSlot}!`, 'success');
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
              colorName: 'Jade White',
              colorHex: '#F8FAFC',
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
    showToast(`Loaded ${targetSpool.barcode} into AMS Slot ${slot}`, 'success');
    setScannedSpoolModal(null);
    setLoadSlotModal(null);
  };

  const unloadSpoolFromAms = (spoolId) => {
    const targetSpool = spools.find((s) => s.id === spoolId);
    if (!targetSpool) return;
    const oldSlot = targetSpool.amsSlot;
    setSpools((prev) => prev.map((s) => (s.id === spoolId ? { ...s, amsSlot: null } : s)));
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
              <input name="username" defaultValue="admin" required className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl text-sm font-mono text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">PIN / Password</label>
              <input type="password" name="pin" defaultValue="1234" required className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl text-sm font-mono text-white focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition">
              Sign In
            </button>
          </form>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-400 font-mono space-y-1">
            <div>Default Admin: <strong className="text-amber-400">admin</strong> / PIN: <strong className="text-amber-400">1234</strong></div>
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
                onClick={() => { setBatchSessionSpools([]); setBatchModalOpen(true); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow transition active:scale-95"
              >
                <PackagePlus className="w-4 h-4" />
                <span className="hidden sm:inline">Batch Intake (29)</span>
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
                const isLow = spool && spool.remainingWeight < 200;

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
                          <SpoolGaugeSVG hex={spool.colorHex} percentage={pct} size={62} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: spool.colorHex }} />
                              <h3 className="text-base font-extrabold text-white truncate">{spool.material}</h3>
                            </div>
                            <p className="text-xs text-zinc-300 font-medium truncate">{spool.colorName} • {spool.brand}</p>
                            <div className="mt-2.5">
                              <div className="flex items-baseline justify-between text-xs font-mono mb-1">
                                <span className={isLow ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{spool.remainingWeight}g left</span>
                                <span className="text-zinc-500">of {spool.initialWeight}g</span>
                              </div>
                              <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                                <div className={`h-full rounded-full transition-all ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(3, pct))}%` }} />
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
                          <p className="text-[11px] text-zinc-500">Tap below & pull Zebra trigger to load spool</p>
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
                  <button onClick={() => setSpoolFormModal({ isEdit: false, spool: { barcode: generateNextBarcode(), material: 'PLA Basic', colorName: 'Jade White', colorHex: '#F8FAFC', brand: 'Bambu Lab', ownerId: currentUser?.id || 'own-1', initialWeight: 1000, remainingWeight: 1000, tareWeight: 250, amsSlot: null, notes: '' } })} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs flex items-center gap-1.5">
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

                  return (
                    <div key={spool.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex flex-col justify-between gap-3 shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <SpoolGaugeSVG hex={spool.colorHex} percentage={pct} size={52} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 font-mono font-bold text-[11px] text-amber-400">{spool.barcode}</span>
                              {spool.amsSlot ? <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 font-mono font-bold text-[11px] text-emerald-300">AMS {spool.amsSlot}</span> : <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">STORAGE</span>}
                            </div>
                            <h3 className="text-sm font-extrabold text-white mt-1 truncate">{spool.material} — {spool.colorName}</h3>
                            <p className="text-[11px] text-zinc-400 truncate">{spool.brand} • {spool.remainingWeight}g / {spool.initialWeight}g left</p>
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
                          <p className="text-xs text-zinc-400 font-mono">Username: <span className="text-white">{person.username}</span></p>
                        </div>
                      </div>
                      <button onClick={() => { setOwnerFilter(person.id); setActiveTab('spools'); }} className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200">
                        Filter Spools ({person.spoolCount})
                      </button>
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
                  <h2 className="text-base font-bold text-white">System Admin Controls</h2>
                  <p className="text-xs text-zinc-400">Manage database resets and security</p>
                </div>
              </div>
              {currentUser.isAdmin && (
                <button onClick={() => { if (confirm('Factory reset all data?')) { localStorage.clear(); window.location.reload(); } }} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">
                  Factory Reset All Data
                </button>
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

      {batchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase">Batch Spool Intake (29-Roll Mode)</h3>
              <button onClick={() => setBatchModalOpen(false)} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <label className="text-[11px] text-zinc-400 block mb-1">Select Material Type</label>
                <select value={batchConfig.material} onChange={(e) => setBatchConfig({ ...batchConfig, material: e.target.value })} className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white">
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>

                <label className="text-[11px] text-zinc-400 block mb-1.5">Select Color: <strong className="text-white">{batchConfig.colorName}</strong></label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-zinc-900 rounded-lg">
                  {FILAMENT_COLORS.map((c) => (
                    <button key={c.name} type="button" onClick={() => setBatchConfig({ ...batchConfig, colorName: c.name, colorHex: c.hex })} className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 ${batchConfig.colorName === c.name ? 'bg-amber-500/25 border-amber-400 text-white font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {spoolFormModal && (
        <SpoolFormModal modalData={spoolFormModal} owners={owners} onClose={() => setSpoolFormModal(null)} onSave={(sp) => { setSpools((prev) => [sp, ...prev]); setSpoolFormModal(null); }} onDelete={(id) => setSpools((prev) => prev.filter(s => s.id !== id))} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur border-t border-zinc-800">
        <div className="max-w-5xl mx-auto grid grid-cols-5 px-2 py-1.5 gap-1">
          {[
            { id: 'ams', label: 'AMS 2 Pro', icon: Layers, badge: `${spools.filter((s) => s.amsSlot).length}/4` },
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

function SpoolFormModal({ modalData, owners, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(modalData.spool);
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-extrabold text-sm text-white uppercase">Register Spool</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {spoolFormModal && (
        <SpoolFormModal modalData={spoolFormModal} owners={owners} onClose={() => setSpoolFormModal(null)} onSave={(sp) => { setSpools((prev) => [sp, ...prev]); setSpoolFormModal(null); }} onDelete={(id) => setSpools((prev) => prev.filter(s => s.id !== id))} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur border-t border-zinc-800">
        <div className="max-w-5xl mx-auto grid grid-cols-5 px-2 py-1.5 gap-1">
          {[
            { id: 'ams', label: 'AMS 2 Pro', icon: Layers, badge: `${spools.filter((s) => s.amsSlot).length}/4` },
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

function SpoolFormModal({ modalData, owners, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(modalData.spool);
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-extrabold text-sm text-white uppercase">Register Spool</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, id: `sp-${Date.now()}` }); }} className="p-4 space-y-3.5">
          <input type="text" required value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-amber-300" />
          <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white">
            {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 font-extrabold text-xs uppercase text-zinc-950">Save Spool</button>
        </form>
      </div>
    </div>
  );
}
