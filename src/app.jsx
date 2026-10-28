import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, Package, Users, Settings, Plus, Trash2, Edit3, 
  RotateCcw, CheckCircle, AlertTriangle, Download, Upload, 
  ShieldCheck, UserPlus, Layers, Printer, RefreshCw, X
} from 'lucide-react';

export default function App() {
  // --- Persistent State ---
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'inventory' | 'owners' | 'admin' | 'backup'
  
  // Owners list
  const [owners, setOwners] = useState(() => {
    const saved = localStorage.getItem('ams_owners');
    return saved ? JSON.parse(saved) : [
      { id: 'owner-1', name: 'Charles (Self)', defaultColor: '#3b82f6' },
      { id: 'owner-2', name: 'Stephanie', defaultColor: '#ec4899' },
      { id: 'owner-3', name: 'Friend / Local Maker', defaultColor: '#10b981' }
    ];
  });

  // Master Filament Rolls Database (Tracks all 29+ rolls)
  const [spools, setSpools] = useState(() => {
    const saved = localStorage.getItem('ams_spools');
    return saved ? JSON.parse(saved) : [
      { id: 'ROLL-101', ownerId: 'owner-1', material: 'PLA Basic', color: 'Black', initialWeight: 1000, remainingWeight: 850, status: 'active', totalUsed: 150 },
      { id: 'ROLL-102', ownerId: 'owner-2', material: 'PLA-CF', color: 'Dark Gray', initialWeight: 1000, remainingWeight: 1000, status: 'storage', totalUsed: 0 },
      { id: 'ROLL-103', ownerId: 'owner-3', material: 'ABS', color: 'White', initialWeight: 1000, remainingWeight: 720, status: 'storage', totalUsed: 280 }
    ];
  });

  // AMS 2 Pro 4 Slots (A1, A2, A3, A4)
  const [amsSlots, അമسSlots] = useState(() => {
    const saved = localStorage.getItem('ams_slots');
    return saved ? JSON.parse(saved) : {
      A1: 'ROLL-101',
      A2: null,
      A3: null,
      A4: null
    };
  });

  // Print Job & Scanning Modals
  const [scanBuffer, setScanBuffer] = useState('');
  const [scanMode, setScanMode] = useState('auto'); // 'auto' | 'intake' | 'load' | 'print'
  const [batchOwner, setBatchOwner] = useState(owners[0]?.id || '');
  const [batchMaterial, setBatchMaterial] = useState('PLA Basic');
  const [activeModal, setActiveModal] = useState(null); // 'print-log' | 'edit-spool' | 'new-owner' | 'manual-scan'
  const [selectedSpoolForAction, setSelectedSpoolForAction] = useState(null);
  
  // Print Job Logging Form State
  const [printSlotTarget, setPrintSlotTarget] = useState('A1');
  const [printGramsUsed, setPrintGramsUsed] = useState(25);
  const [printStatus, setPrintStatus] = useState('success');

  // Save to localStorage automatically
  useEffect(() => {
    localStorage.setItem('ams_owners', JSON.stringify(owners));
    localStorage.setItem('ams_spools', JSON.stringify(spools));
    localStorage.setItem('ams_slots', JSON.stringify(amsSlots));
  }, [owners, spools, amsSlots]);

  // --- Zebra DataWedge Hardware Barcode Listener ---
  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      
      // If user is typing in a standard text input field, let them type normally
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.key === 'Enter') {
        const scannedCode = barcodeBufferRef.current.trim();
        if (scannedCode.length > 0) {
          processScannedBarcode(scannedCode);
        }
        barcodeBufferRef.current = '';
      } else if (e.key.length === 1) {
        // Rapid keystrokes from DataWedge hardware scanner come in under ~50ms per char
        if (currentTime - lastKeyTimeRef.current > 100) {
          barcodeBufferRef.current = ''; // Reset if slow manual typing
        }
        barcodeBufferRef.current += e.key;
        lastKeyTimeRef.current = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanMode, batchOwner, batchMaterial, amsSlots, spools]);

  const processScannedBarcode = (code) => {
    const cleanCode = code.toUpperCase();
    setScanBuffer(cleanCode);

    // 1. Batch Intake Mode (Registering new incoming rolls)
    if (scanMode === 'intake') {
      const existing = spools.find(s => s.id === cleanCode);
      if (!existing) {
        const newRoll = {
          id: cleanCode,
          ownerId: batchOwner,
          material: batchMaterial,
          color: 'Standard',
          initialWeight: 1000,
          remainingWeight: 1000,
          status: 'storage',
          totalUsed: 0
        };
        setSpools(prev => [newRoll, ...prev]);
        alert(`Successfully registered new roll: ${cleanCode}`);
      } else {
        alert(`Barcode ${cleanCode} is already registered in the database!`);
      }
      return;
    }

    // 2. Quick AMS Load Mode
    if (scanMode === 'load') {
      // Find first empty slot or default to A1
      const emptySlot = Object.keys(amsSlots).find(k => !amsSlots[k]) || 'A1';
      const roll = spools.find(s => s.id === cleanCode);
      if (roll) {
        setAmsSlots(prev => ({ ...prev, [emptySlot]: roll.id }));
        setSpools(prev => prev.map(s => s.id === cleanCode ? { ...s, status: 'active' } : s));
        alert(`Loaded roll ${cleanCode} into AMS Slot ${emptySlot}`);
      } else {
        alert(`Roll ${cleanCode} not found in inventory! Please intake it first.`);
      }
      return;
    }

    // 3. Auto Scan Mode (Default behavior)
    const roll = spools.find(s => s.id === cleanCode);
    if (roll) {
      setSelectedSpoolForAction(roll);
      setActiveModal('spool-detail');
    } else {
      // Prompt to quickly create a roll for this scanned barcode
      if (confirm(`Barcode "${cleanCode}" not found. Register it now as a new roll?`)) {
        setSelectedSpoolForAction({
          id: cleanCode,
          ownerId: owners[0]?.id,
          material: 'PLA Basic',
          color: 'Unknown',
          initialWeight: 1000,
          remainingWeight: 1000,
          status: 'storage',
          totalUsed: 0
        });
        setActiveModal('edit-spool');
      }
    }
  };

  // --- Print Usage Handler ---
  const handleLogPrintSubmit = (e) => {
    e.preventDefault();
    const activeRollId = amsSlots[printSlotTarget];
    if (!activeRollId) {
      alert(`AMS Slot ${printSlotTarget} is currently empty! Load a roll first.`);
      return;
    }

    const grams = parseFloat(printGramsUsed) || 0;

    setSpools(prev => prev.map(roll => {
      if (roll.id === activeRollId) {
        const newRemaining = Math.max(0, roll.remainingWeight - grams);
        return {
          ...roll,
          remainingWeight: newRemaining,
          totalUsed: roll.totalUsed + grams
        };
      }
      return roll;
    }));

    alert(`Logged ${grams}g usage on Slot ${printSlotTarget} (${activeRollId}). Print status: ${printStatus}`);
    setActiveModal(null);
    setPrintGramsUsed(25);
  };

  // --- Admin Actions: Spool Management ---
  const handleSaveSpool = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedRoll = {
      id: formData.get('id'),
      ownerId: formData.get('ownerId'),
      material: formData.get('material'),
      color: formData.get('color'),
      initialWeight: parseFloat(formData.get('initialWeight')) || 1000,
      remainingWeight: parseFloat(formData.get('remainingWeight')) || 1000,
      status: formData.get('status'),
      totalUsed: parseFloat(formData.get('totalUsed')) || 0
    };

    setSpools(prev => {
      const exists = prev.some(s => s.id === updatedRoll.id);
      if (exists) {
        return prev.map(s => s.id === updatedRoll.id ? updatedRoll : s);
      } else {
        return [updatedRoll, ...prev];
      }
    });

    setActiveModal(null);
    setSelectedSpoolForAction(null);
  };

  const handleDeleteSpool = (rollId) => {
    if (confirm(`Are you sure you want to delete spool ${rollId} from the database?`)) {
      // Unload from AMS if loaded
      Object.keys(amsSlots).forEach(slot => {
        if (amsSlots[slot] === rollId) {
          setAmsSlots(prev => ({ ...prev, [slot]: null }));
        }
      });
      setSpools(prev => prev.filter(s => s.id !== rollId));
      setActiveModal(null);
    }
  };

  // --- Admin Actions: Owner Management ---
  const handleAddOwner = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOwner = {
      id: 'owner-' + Date.now(),
      name: formData.get('name'),
      defaultColor: formData.get('defaultColor') || '#3b82f6'
    };
    setOwners(prev => [...prev, newOwner]);
    setActiveModal(null);
  };

  const handleDeleteOwner = (ownerId) => {
    const ownedSpoolsCount = spools.filter(s => s.ownerId === ownerId).length;
    if (ownedSpoolsCount > 0) {
      alert(`Cannot delete owner: There are still ${ownedSpoolsCount} spools registered to this person. Reassign or delete their spools first.`);
      return;
    }
    if (confirm('Are you sure you want to remove this owner?')) {
      setOwners(prev => prev.filter(o => o.id !== ownerId));
    }
  };

  const getOwnerName = (ownerId) => owners.find(o => o.id === ownerId)?.name || 'Unassigned';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Header & Zebra Scanner Status Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-2 rounded-lg text-cyan-400">
            <Printer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              AMS 2 Pro Tracker 
              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">Zebra Ready</span>
            </h1>
            <p className="text-xs text-slate-400">
              Last Scan: <span className="text-cyan-400 font-mono font-semibold">{scanBuffer || 'Ready for Trigger...'}</span>
            </p>
          </div>
        </div>

        {/* Quick Mode Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Scan Mode:</span>
          <button 
            onClick={() => setScanMode('auto')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${scanMode === 'auto' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            Auto
          </button>
          <button 
            onClick={() => setScanMode('intake')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${scanMode === 'intake' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            Batch Intake (29)
          </button>
          <button 
            onClick={() => setScanMode('load')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${scanMode === 'load' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            AMS Load
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setActiveModal('print-log')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all">
            <CheckCircle className="w-4 h-4" /> Log Print Job
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-4 flex space-x-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'AMS Live Slots', icon: Layers },
          { id: 'inventory', label: 'Spool Inventory', icon: Package },
          { id: 'owners', label: 'Owners Ledger', icon: Users },
          { id: 'admin', label: '⚙️ Admin Panel', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto space-y-6">

        {/* --- TAB 1: DASHBOARD (AMS 2 PRO SLOTS) --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Bambu Lab AMS 2 Pro Active Bays</h2>
                <p className="text-xs text-slate-400">Pull trigger on barcode scanner while in 'AMS Load' mode to instantly assign rolls.</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                  Total Active Spools: {Object.values(amsSlots).filter(Boolean).length} / 4
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['A1', 'A2', 'A3', 'A4'].map(slotKey => {
                const rollId = amsSlots[slotKey];
                const roll = spools.find(s => s.id === rollId);
                const owner = roll ? owners.find(o => o.id === roll.ownerId) : null;
                const percentage = roll ? Math.round((roll.remainingWeight / roll.initialWeight) * 100) : 0;

                return (
                  <div key={slotKey} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative shadow-lg">
                    {/* Slot Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-lg font-black bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-xl border border-cyan-500/30">
                        Slot {slotKey}
                      </span>
                      {roll ? (
                        <button 
                          onClick={() => setAmsSlots(prev => ({ ...prev, [slotKey]: null }))}
                          className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                          Unload
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Empty Bay</span>
                      )}
                    </div>

                    {roll ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-mono text-cyan-300">{roll.id}</p>
                          <h3 className="text-base font-bold text-white">{roll.material} - {roll.color}</h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Owner: <span className="text-slate-200">{owner?.name || 'Unknown'}</span></p>
                        </div>

                        {/* Filament Level Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-400">Remaining</span>
                            <span className={percentage < 20 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                              {roll.remainingWeight}g / {roll.initialWeight}g ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full transition-all duration-500 ${percentage < 20 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                              style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-slate-600">
                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">Scan a spool barcode to load this slot</p>
                      </div>
                    )}

                    <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                      <span>Used: {roll?.totalUsed || 0}g</span>
                      {roll && (
                        <button 
                          onClick={() => { setSelectedSpoolForAction(roll); setActiveModal('edit-spool'); }}
                          className="text-cyan-400 hover:underline flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 2: INVENTORY --- */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">All Spool Inventory ({spools.length} Rolls)</h2>
                <p className="text-xs text-slate-400">Manage all registered rolls, weights, and barcode assignments.</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedSpoolForAction({
                    id: 'ROLL-' + Math.floor(1000 + Math.random() * 9000),
                    ownerId: owners[0]?.id,
                    material: 'PLA Basic',
                    color: 'Black',
                    initialWeight: 1000,
                    remainingWeight: 1000,
                    status: 'storage',
                    totalUsed: 0
                  });
                  setActiveModal('edit-spool');
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Plus className="w-4 h-4" /> Add New Roll
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Barcode ID</th>
                      <th className="p-4 font-semibold">Owner</th>
                      <th className="p-4 font-semibold">Material / Color</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Remaining</th>
                      <th className="p-4 font-semibold">Total Consumed</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {spools.map(roll => {
                      const ownerName = getOwnerName(roll.ownerId);
                      const isLoaded = Object.values(amsSlots).includes(roll.id);
                      return (
                        <tr key={roll.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-cyan-400">{roll.id}</td>
                          <td className="p-4 font-medium">{ownerName}</td>
                          <td className="p-4">{roll.material} <span className="text-slate-400 text-xs">({roll.color})</span></td>
                          <td className="p-4">
                            {isLoaded ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-xs font-semibold">
                                Loaded in AMS
                              </span>
                            ) : (
                              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md text-xs">
                                In Storage
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-semibold text-slate-100">{roll.remainingWeight}g <span className="text-xs text-slate-400 font-normal">/ {roll.initialWeight}g</span></td>
                          <td className="p-4 text-cyan-300 font-medium">{roll.totalUsed}g</td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => { setSelectedSpoolForAction(roll); setActiveModal('edit-spool'); }}
                              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-2 rounded-lg border border-slate-700 transition-all inline-flex items-center">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSpool(roll.id)}
                              className="bg-slate-800 hover:bg-rose-900/40 text-rose-400 p-2 rounded-lg border border-slate-700 transition-all inline-flex items-center">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: OWNERS LEDGER --- */}
        {activeTab === 'owners' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Filament Owners Ledger</h2>
                <p className="text-xs text-slate-400">Track who owns which rolls and total filament usage by person.</p>
              </div>
              <button 
                onClick={() => setActiveModal('new-owner')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <UserPlus className="w-4 h-4" /> Add Owner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {owners.map(owner => {
                const ownerSpools = spools.filter(s => s.ownerId === owner.id);
                const totalGramsRemaining = ownerSpools.reduce((acc, s) => acc + s.remainingWeight, 0);
                const totalGramsUsed = ownerSpools.reduce((acc, s) => acc + s.totalUsed, 0);

                return (
                  <div key={owner.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{owner.name}</h3>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-xl border border-slate-700 font-mono">
                          {ownerSpools.length} Spools
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-300 mt-4">
                        <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400">Remaining Filament:</span>
                          <span className="font-bold text-emerald-400">{totalGramsRemaining}g</span>
                        </div>
                        <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400">Total Consumed:</span>
                          <span className="font-bold text-cyan-400">{totalGramsUsed}g</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-500">ID: {owner.id}</span>
                      <button 
                        onClick={() => handleDeleteOwner(owner.id)}
                        className="text-rose-400 hover:underline">
                        Remove Owner
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 4: ADMIN PANEL --- */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/30 text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">System Administration & Database Controls</h2>
                  <p className="text-xs text-slate-400">Manage backups, reset system states, or configure bulk rules.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                {/* Backup & Restore */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-400" /> Export / Import JSON Backup
                  </h3>
                  <p className="text-xs text-slate-400">
                    Download a full backup of all 29+ spools, owner stats, and AMS mappings to guard against Zebra device storage clears.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ owners, spools, amsSlots }, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `ams_filament_backup_${new Date().toISOString().slice(0,10)}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow">
                      Export JSON
                    </button>
                    <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer">
                      Import JSON
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const parsed = JSON.parse(event.target.result);
                              if (parsed.spools && parsed.owners) {
                                setSpools(parsed.spools);
                                setOwners(parsed.owners);
                                if (parsed.amsSlots) setAmsSlots(parsed.amsSlots);
                                alert('Successfully restored database from backup!');
                              } else {
                                alert('Invalid backup file structure.');
                              }
                            } catch (err) {
                              alert('Failed to parse JSON file.');
                            }
                          };
                          reader.readAsText(file);
                        }} 
                      />
                    </label>
                  </div>
                </div>

                {/* Factory Reset / Wipe */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone: Reset Database
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clear all customized spools, active AMS allocations, and reset to initial factory sample data.
                  </p>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        if (confirm('WARNING: This will wipe all inventory data and spools. Are you absolutely sure?')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all">
                      Wipe & Factory Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}

      {/* 1. Log Print Job Modal */}
      {activeModal === 'print-log' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Log Finished Print Job (AMS 2 Pro)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleLogPrintSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Active AMS Slot</label>
                <select 
                  value={printSlotTarget} 
                  onChange={(e) => setPrintSlotTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                  {['A1', 'A2', 'A3', 'A4'].map(slot => (
                    <option key={slot} value={slot}>
                      Slot {slot} ({amsSlots[slot] ? `${amsSlots[slot]}` : 'Empty'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Filament Consumed (Grams)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={printGramsUsed} 
                  onChange={(e) => setPrintGramsUsed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Print Result Status</label>
                <select 
                  value={printStatus} 
                  onChange={(e) => setPrintStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                  <option value="success">Success (Completed Normal)</option>
                  <option value="failed">Failed / Canceled (Spaghetti / Aborted)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">Deduct Grams</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit / Create Spool Modal */}
      {activeModal === 'edit-spool' && selectedSpoolForAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Edit Spool Details</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSpool} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Barcode ID</label>
                <input 
                  name="id" 
                  defaultValue={selectedSpoolForAction.id} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-cyan-400 focus:outline-none focus:border-cyan-500" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Owner</label>
                <select 
                  name="ownerId" 
                  defaultValue={selectedSpoolForAction.ownerId}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Material</label>
                  <input name="material" defaultValue={selectedSpoolForAction.material} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Color</label>
                  <input name="color" defaultValue={selectedSpoolForAction.color} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Weight (g)</label>
                  <input type="number" name="initialWeight" defaultValue={selectedSpoolForAction.initialWeight} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Remaining Weight (g)</label>
                  <input type="number" name="remainingWeight" defaultValue={selectedSpoolForAction.remainingWeight} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select name="status" defaultValue={selectedSpoolForAction.status} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                    <option value="storage">Storage</option>
                    <option value="active">Active AMS</option>
                    <option value="depleted">Depleted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Total Used (g)</label>
                  <input type="number" name="totalUsed" defaultValue={selectedSpoolForAction.totalUsed} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3">
                <button type="button" onClick={() => handleDeleteSpool(selectedSpoolForAction.id)} className="text-rose-400 text-xs hover:underline">Delete Spool</button>
                <div className="space-x-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-2 rounded-xl text-xs bg-slate-800 text-slate-300">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">Save Spool</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Owner Modal */}
      {activeModal === 'new-owner' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Add New Filament Owner</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddOwner} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Owner Name</label>
                <input name="name" placeholder="e.g. John Doe" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white">Add Owner</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}