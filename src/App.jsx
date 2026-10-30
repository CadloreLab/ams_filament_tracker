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
  Database,
  Eye,
  EyeOff,
  UserCog,
  KeyRound
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
  onSnapshot 
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
// RBAC ROLES DEFINITION & HELPERS
// ============================================================================
const ROLES = {
  ADMIN: { id: 'ADMIN', label: 'Admin', priorityWeight: 3, badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  OPERATOR: { id: 'OPERATOR', label: 'Print Operator', priorityWeight: 3, badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  SUPER_USER: { id: 'SUPER_USER', label: 'Super-User', priorityWeight: 2, badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  REQUESTER: { id: 'REQUESTER', label: 'Requester', priorityWeight: 1, badge: 'bg-zinc-800 text-zinc-300 border-zinc-700' }
};

const getUserRole = (user) => {
  if (!user) return ROLES.REQUESTER;
  if (user.isAdmin) return ROLES.ADMIN;
  return ROLES[user.accessRole] || ROLES.REQUESTER;
};

const OWNER_COLORS = [
  { name: 'Amber', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/50', hex: '#F59E0B' },
  { name: 'Emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/50', hex: '#10B981' },
  { name: 'Cyan', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/50', hex: '#06B6D4' },
  { name: 'Purple', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/50', hex: '#A855F7' },
  { name: 'Rose', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/50', hex: '#F43F5E' },
  { name: 'Blue', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/50', hex: '#3B82F6' }
];

const AMS_SLOTS = ['A1', 'A2', 'A3', 'A4'];

const getWeightColorConfig = (grams) => {
  if (grams > 250) {
    return { textClass: 'text-emerald-400 font-bold', bgClass: 'bg-emerald-500' };
  } else if (grams > 50) {
    return { textClass: 'text-yellow-400 font-bold', bgClass: 'bg-yellow-400' };
  } else {
    return { textClass: 'text-red-500 font-bold animate-pulse', bgClass: 'bg-red-500' };
  }
};

const getPrimaryHex = (hexStr) => {
  if (!hexStr) return '#FFFFFF';
  return String(hexStr).split('/')[0].trim() || '#FFFFFF';
};

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

export default function App() {
  // 1. ALL STATES DECLARED FIRST
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loginNotificationModal, setLoginNotificationModal] = useState(null);
  const [toast, setToast] = useState(null);

  const [activeTab, setActiveTab] = useState('queue');
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
  const [accountSettingsModalOpen, setAccountSettingsModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [completeRequestModal, setCompleteRequestModal] = useState(null);
  const [denyModal, setDenyModal] = useState(null);

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

  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');

  const keyBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  // 2. DERIVED VALUES & MEMOS DECLARED AFTER STATES
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const userRole = getUserRole(currentUser);
  const isAdminOrOperator = userRole.id === 'ADMIN' || userRole.id === 'OPERATOR';
  const isAdmin = userRole.id === 'ADMIN';

  const visibleTabs = useMemo(() => {
    const all = [
      { id: 'ams', label: 'AMS 2 Pro', icon: Layers, badge: `${spools.filter((s) => s.amsSlot).length}/4`, show: isAdminOrOperator },
      { id: 'queue', label: 'Queue', icon: Clock, badge: printRequests.filter(r => r.status !== 'AWAITING_PICKUP').length, show: true },
      { id: 'spools', label: 'Spools', icon: Disc, badge: spools.length, show: userRole.id !== 'REQUESTER' },
      { id: 'logs', label: 'Logs', icon: History, badge: logs.filter((l) => !l.reverted).length, show: true },
      { id: 'admin', label: 'Admin', icon: ShieldCheck, badge: isAdmin ? '★' : '', show: isAdmin }
    ];
    return all.filter(t => t.show);
  }, [spools, printRequests, logs, isAdminOrOperator, userRole.id, isAdmin]);

  const activeCatalogList = bambuLabColors;
  const MATERIALS = useMemo(() => {
    return Array.from(new Set(activeCatalogList.map(c => c.material)));
  }, [activeCatalogList]);

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

  const handleBarcodeScanned = useCallback(
    async (rawCode) => {
      if (!isAdminOrOperator) return;
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
    [batchModalOpen, batchConfig, batchSessionSpools.length, loadSlotModal, spools, owners, currentUser, scanMode, soundEnabled, showToast, isAdminOrOperator]
  );

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

  const sortedPrintRequests = useMemo(() => {
    return [...printRequests].sort((a, b) => {
      const activeStatus = ['WAITING_APPROVAL', 'APPROVED', 'PREPARING'];
      const aActive = activeStatus.includes(a.status);
      const bActive = activeStatus.includes(b.status);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      const ownerA = ownerMap[a.ownerId];
      const ownerB = ownerMap[b.ownerId];
      const weightA = getUserRole(ownerA).priorityWeight;
      const weightB = getUserRole(ownerB).priorityWeight;

      if (weightA !== weightB) return weightB - weightA;

      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [printRequests, ownerMap]);

  // 3. ALL USE-EFFECT HOOKS
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!db) return;

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
            accessRole: data.accessRole || (data.isAdmin ? 'ADMIN' : 'REQUESTER'),
            role: data.role || 'Member',
            colorIdx: Number(data.colorIdx ?? 0),
            notes: data.notes || '',
            ...data
          };
        });
        setOwners(list);
      }, (err) => console.error("Owners sync error:", err));

      const unsubCatalog = onSnapshot(collection(db, 'catalog'), (snapshot) => {
        const list = snapshot.docs
          .map(d => ({ ...d.data(), id: d.id }))
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        setBambuLabColors(list);
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
  }, []);

  useEffect(() => {
    if (!currentUser || owners.length === 0) return;
    const liveOwner = owners.find(o => o.id === currentUser.id);
    if (liveOwner) setCurrentUser(liveOwner);
  }, [owners]);

  useEffect(() => {
    if (!visibleTabs.some(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id || 'queue');
    }
  }, [activeTab, visibleTabs]);

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

  useEffect(() => {
    if (!isAdminOrOperator) return;
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
  }, [handleBarcodeScanned, isAdminOrOperator]);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-16 select-none">
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-3 py-2">
          {/* TOP TASKBAR (NAV) */}
          <div className="grid grid-cols-5 gap-1.5 pb-2.5 border-b border-zinc-800">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition ${active ? 'bg-amber-500 text-zinc-950 font-extrabold shadow' : 'bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'}`}
                >
                  <div className="flex items-center gap-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${active ? 'bg-zinc-950 text-amber-300 font-bold' : 'bg-zinc-800 text-zinc-400'}`}>{tab.badge}</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <ScanBarcode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase">
                    AMS 2 PRO <span className="text-amber-400">WEDGE</span>
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${userRole.badge}`}>
                    {userRole.label}
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
              {isAdminOrOperator && (
                <button
                  onClick={() => { setBatchSessionSpools([]); setBatchModalOpen(true); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow transition active:scale-95"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Batch Intake</span>
                </button>
              )}
              <button
                onClick={() => setAccountSettingsModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-1"
                title="Account Settings"
              >
                <UserCog className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Account</span>
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

          {isAdminOrOperator && (
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
          )}

          {isAdminOrOperator && scannerDrawerOpen && (
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
        {activeTab === 'ams' && isAdminOrOperator && (
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
                  <p className="text-xs text-zinc-400">Manage incoming print jobs, multi-owner approvals, and weighted priority workflow</p>
                </div>
                <button onClick={() => setRequestModalOpen(true)} className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow">
                  <Send className="w-4 h-4" /> Submit Print Request
                </button>
              </div>

              {sortedPrintRequests.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-zinc-300">No print requests in queue</p>
                  <p className="text-xs text-zinc-500">Submit a print request with a MakerWorld link and spool selections to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPrintRequests.map((req) => {
                    const reqOwner = ownerMap[req.ownerId];
                    const reqOwnerName = reqOwner?.name || 'Unknown';
                    const reqRole = getUserRole(reqOwner);
                    const foreignSpoolItems = (req.selectedSpoolIds || []).map(id => {
                      const sp = spools.find(s => s.id === id);
                      return { spool: sp, isForeign: sp && sp.ownerId !== req.ownerId, denied: req.deniedSpoolIds?.includes(id) };
                    }).filter(item => item.spool);

                    const isDenied = req.status === 'DENIED';
                    const isMyRequest = req.ownerId === currentUser.id;
                    const canDismiss = isMyRequest || isAdmin;

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
                            {reqRole.id === 'SUPER_USER' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                ⚡ PRIORITY BOOST
                              </span>
                            )}
                            <span className="text-base font-extrabold text-white truncate">{req.title}</span>
                          </div>

                          <div className="text-xs text-zinc-400 flex items-center gap-3 flex-wrap">
                            <span>Requested by: <strong className="text-amber-300">{reqOwnerName}</strong> ({reqRole.label})</span>
                            {req.makerWorldUrl && (
                              <a href={req.makerWorldUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono text-xs">
                                MakerWorld Link <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {isDenied && (
                            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 space-y-1">
                              <div className="font-bold flex items-center gap-1.5">
                                <Ban className="w-4 h-4 text-rose-400" /> Request Denied / Spool Declined:
                              </div>
                              <div className="text-zinc-300 italic">"{req.denyReason || 'Owner declined spool usage.'}"</div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {foreignSpoolItems.map(({ spool, isForeign, denied }) => {
                              const spOwnerName = ownerMap[spool.ownerId]?.name;
                              const isThisMySpool = spool.ownerId === currentUser.id;
                              const canDeclineThisSpool = (isThisMySpool || isAdmin) && req.status === 'WAITING_APPROVAL' && !denied;
                              const approvedByThisOwner = (req.approvedOwnerIds || []).includes(spool.ownerId);
                              const canApproveThisSpool = isThisMySpool && req.status === 'WAITING_APPROVAL' && !approvedByThisOwner && !denied;

                              return (
                                <div key={spool.id} className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] font-mono border ${denied ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 line-through' : approvedByThisOwner ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
                                  <span>{spool.material} ({spool.colorName}) — Owner: {spOwnerName}</span>
                                  {approvedByThisOwner && <span className="text-[10px] text-emerald-400 font-bold">[APPROVED]</span>}
                                  {canApproveThisSpool && (
                                    <button
                                      onClick={async () => {
                                        const updatedApprovals = [...(req.approvedOwnerIds || []), spool.ownerId];
                                        const allForeignOwners = Array.from(new Set(foreignSpoolItems.map(item => item.spool.ownerId)));
                                        const allApproved = allForeignOwners.every(oid => updatedApprovals.includes(oid));

                                        if (db) {
                                          await setDoc(doc(db, 'printRequests', req.id), {
                                            ...req,
                                            approvedOwnerIds: updatedApprovals,
                                            approved: allApproved,
                                            status: allApproved ? 'APPROVED' : req.status
                                          }, { merge: true }).catch(() => {});
                                        }
                                        showToast(`Approved your spool for "${req.title}"!`, 'success');
                                      }}
                                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                                    >
                                      <ThumbsUp className="w-3 h-3" /> Approve
                                    </button>
                                  )}
                                  {canDeclineThisSpool && !denied && (
                                    <button
                                      onClick={() => setDenyModal({ request: req, spoolId: spool.id })}
                                      className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                                      title="Decline Spool & Leave Comment"
                                    >
                                      <Ban className="w-3 h-3" /> Decline
                                    </button>
                                  )}
                                  {denied && <span className="text-[10px] text-rose-400 font-bold no-underline">[DECLINED]</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {isMyRequest && (
                            <button
                              onClick={async () => {
                                if (confirm(`Cancel your print request "${req.title}"?`)) {
                                  if (db) {
                                    await deleteDoc(doc(db, 'printRequests', req.id));
                                  }
                                  showToast('Print request cancelled.', 'info');
                                }
                              }}
                              className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1 shadow transition"
                            >
                              <XCircle className="w-4 h-4" /> Cancel Request
                            </button>
                          )}

                          {req.status === 'APPROVED' && isAdminOrOperator && (
                            <button
                              onClick={async () => {
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

                          {req.status === 'PREPARING' && isAdminOrOperator && (
                            <button
                              onClick={() => setCompleteRequestModal({ request: req })}
                              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow"
                            >
                              <PackageCheck className="w-3.5 h-3.5" /> Mark Completed
                            </button>
                          )}

                          {(req.status === 'AWAITING_PICKUP' || req.status === 'DENIED') && canDismiss && (
                            <button
                              onClick={async () => {
                                if (db) {
                                  await deleteDoc(doc(db, 'printRequests', req.id));
                                }
                                showToast(`Dismissed print request.`, 'info');
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

        {activeTab === 'spools' && userRole.id !== 'REQUESTER' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">Filament Spool Registry ({spools.length})</h2>
                  <p className="text-xs text-zinc-400">
                    {userRole.id === 'SUPER_USER' ? 'Viewing your own spools and co-op inventory' : 'Scan any official Bambu spool barcode or use Batch Intake'}
                  </p>
                </div>
                {isAdminOrOperator && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setBatchSessionSpools([]); setBatchModalOpen(true); }} className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow">
                      <PackagePlus className="w-4 h-4" /> Batch Scan 29 Rolls
                    </button>
                    <button onClick={() => setSpoolFormModal({ isEdit: false, spool: { barcode: generateNextBarcode(), material: 'PLA Basic', colorName: 'Jade White (10100)', colorHex: '#FFFFFF', brand: 'Bambu Lab', ownerId: currentUser?.id || owners[0]?.id || 'own-1', initialWeight: 1000, remainingWeight: 1000, tareWeight: 250, amsSlot: null, notes: '' } })} className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-400" /> New Spool
                    </button>
                  </div>
                )}
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
                <p className="text-xs text-zinc-500">No matching filament spools found.</p>
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
                        {isAdminOrOperator && (
                          <>
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
                          </>
                        )}
                        <button onClick={() => setLabelModal({ spool })} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300" title="Label Viewer">
                          <QrCode className="w-4 h-4" />
                        </button>
                        {isAdminOrOperator && (
                          <button onClick={() => setSpoolFormModal({ isEdit: true, spool: { ...spool } })} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300" title="Edit Spool">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                  {logs.map((log) => {
                    const isMyLog = userRole.id === 'REQUESTER' ? log.usages?.some(u => u.ownerId === currentUser.id) : true;
                    if (userRole.id === 'REQUESTER' && !isMyLog) return null;

                    return (
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            {/* User Accounts & RBAC Management */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <Users className="w-6 h-6 text-amber-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">User Accounts & RBAC Management ({ownerLedger.length})</h2>
                    <p className="text-xs text-zinc-400">Manage user roles, passwords, and member access</p>
                  </div>
                </div>
                <button
                  onClick={() => setOwnerModal({ isEdit: false, owner: { name: '', username: '', pin: '', accessRole: 'REQUESTER', role: 'Co-Op Member', colorIdx: owners.length % OWNER_COLORS.length, notes: '' } })}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
                >
                  <UserPlus className="w-4 h-4" /> Add User Account
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {ownerLedger.map((person) => {
                  const style = OWNER_COLORS[(person.colorIdx ?? 0) % OWNER_COLORS.length];
                  const pRole = getUserRole(person);

                  return (
                    <div key={person.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-extrabold text-sm ${style.bg} ${style.text} ${style.border}`}>
                          {person.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white">{person.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${pRole.badge}`}>
                              {pRole.label}
                            </span>
                            {person.notes && <span className="text-xs text-zinc-400">({person.notes})</span>}
                          </div>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            Username: <span className="text-white">{person.username}</span> • Spools: <span className="text-amber-400">{person.spoolCount}</span> • Consumed: <span className="text-emerald-400">{person.consumedSuccess}g</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={person.accessRole || (person.isAdmin ? 'ADMIN' : 'REQUESTER')}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            const updated = { ...person, accessRole: newRole, isAdmin: newRole === 'ADMIN' };
                            if (db) {
                              await setDoc(doc(db, 'owners', person.id), updated, { merge: true }).catch(() => {});
                            }
                            showToast(`Updated role for ${person.name} to ${ROLES[newRole]?.label}`, 'success');
                          }}
                          className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="OPERATOR">Print Operator</option>
                          <option value="SUPER_USER">Super-User</option>
                          <option value="REQUESTER">Requester</option>
                        </select>
                        <button
                          onClick={() => setOwnerModal({ isEdit: true, owner: { ...person } })}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Factory Reset */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-base font-bold text-white">System Controls</h2>
                  <p className="text-xs text-zinc-400">Manage database resets and local cache</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button onClick={() => { if (confirm('Clear local session?')) { localStorage.clear(); window.location.reload(); } }} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs border border-zinc-700">
                  Clear Local Cache & Reload
                </button>
              </div>
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
                denyReason: reason || 'Owner declined spool usage.'
              }, { merge: true }).catch(() => {});
            }
            setDenyModal(null);
            showToast('Spool declined with comment.', 'warning');
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
          currentUser={currentUser}
          onClose={() => setOwnerModal(null)}
          onSave={async (savedOwner) => {
            const ownerId = savedOwner.id || `own-${owners.length + 1}`;
            const existingOwner = owners.find(o => o.id === ownerId);
            
            const finalPin = (savedOwner.pin === '' || savedOwner.pin === undefined) && existingOwner ? existingOwner.pin : savedOwner.pin;
            const finalIsAdmin = savedOwner.accessRole === 'ADMIN';

            const finalOwner = {
              ...(existingOwner || {}),
              ...savedOwner,
              pin: finalPin,
              id: ownerId,
              isAdmin: finalIsAdmin
            };

            if (db) {
              await setDoc(doc(db, 'owners', ownerId), finalOwner, { merge: true }).catch(() => {});
            }
            showToast(`Saved user account ${finalOwner.name}`, 'success');
            if (currentUser.id === ownerId) setCurrentUser(finalOwner);
            setOwnerModal(null);
          }}
        />
      )}

      {accountSettingsModalOpen && (
        <AccountSettingsModal
          currentUser={currentUser}
          onClose={() => setAccountSettingsModalOpen(false)}
          onSave={async (updatedData) => {
            const finalUser = { ...currentUser, ...updatedData };
            if (db) {
              await setDoc(doc(db, 'owners', finalUser.id), finalUser, { merge: true }).catch(() => {});
            }
            setCurrentUser(finalUser);
            setAccountSettingsModalOpen(false);
            showToast('Account details updated successfully!', 'success');
          }}
        />
      )}
    </div>
  );
}

function AccountSettingsModal({ currentUser, onClose, onSave }) {
  const [name, setName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [newPin, setNewPin] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white flex items-center gap-1.5">
            <UserCog className="w-4 h-4 text-amber-400" /> Account Settings
          </span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !username.trim()) return;
          onSave({
            name: name.trim(),
            username: username.trim(),
            pin: newPin.trim() !== '' ? newPin.trim() : currentUser.pin
          });
        }} className="p-4 space-y-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">New Password / PIN (Leave blank to keep current)</label>
            <input
              type="text"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter new password..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase shadow">
            Save Changes
          </button>
        </form>
      </div>
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
          <span className="font-bold text-sm text-white">Decline Spool & Add Comment</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onDeny({ request, spoolId, reason }); }} className="p-4 space-y-3">
          <p className="text-xs text-zinc-300">
            Decline use of your spool <strong className="text-amber-300">{spool?.material} ({spool?.colorName})</strong> for request "{request.title}"?
          </p>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Reason / Comment for Requester (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Saving this specific roll for an upcoming multi-color print..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 h-24 resize-none"
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase shadow">
            Confirm Decline & Notify Requester
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
      approvedOwnerIds: [],
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

function OwnerFormModal({ modalData, currentUser, onClose, onSave }) {
  const [form, setForm] = useState(modalData.owner);
  const [newPin, setNewPin] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(!modalData.isEdit);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold text-sm text-white">{modalData.isEdit ? 'Edit User Account' : 'Add New User Account'}</span>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          if (!form.name.trim()) return; 
          onSave({ ...form, pin: newPin !== '' ? newPin : form.pin }); 
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
              <label className="text-xs text-zinc-400 block mb-1">Password / PIN</label>
              {modalData.isEdit && !showPasswordInput ? (
                <div className="flex items-center gap-1.5">
                  <input type="password" disabled value="********" className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-500 cursor-not-allowed" />
                  <button type="button" onClick={() => setShowPasswordInput(true)} className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-[10px] rounded-lg shrink-0" title="Change Password">
                    Change
                  </button>
                </div>
              ) : (
                <input type="text" required={!modalData.isEdit} value={newPin} onChange={(e) => setNewPin(e.target.value.trim())} placeholder={modalData.isEdit ? "Enter new password..." : "Password..."} className="w-full px-3 py-2 bg-zinc-950 border border-amber-500/60 rounded-lg text-xs font-mono text-amber-300 focus:outline-none" />
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Access Role</label>
            <select
              value={form.accessRole || 'REQUESTER'}
              onChange={(e) => setForm({ ...form, accessRole: e.target.value, isAdmin: e.target.value === 'ADMIN' })}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Print Operator</option>
              <option value="SUPER_USER">Super-User</option>
              <option value="REQUESTER">Requester</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Notes / Description</label>
            <input type="text" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase">
            Save User Account
          </button>
        </form>
      </div>
    </div>
  );
}
