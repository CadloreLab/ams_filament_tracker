import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, Package, Users, Settings, Plus, Trash2, Edit3, 
  RotateCcw, CheckCircle, AlertTriangle, Download, Upload, 
  ShieldCheck, UserPlus, Layers, Printer, RefreshCw, X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [owners, setOwners] = useState(() => {
    const saved = localStorage.getItem('ams_owners');
    return saved ? JSON.parse(saved) : [
      { id: 'owner-1', name: 'Charles (Self)', defaultColor: '#3b82f6' },
      { id: 'owner-2', name: 'Stephanie', defaultColor: '#ec4899' },
      { id: 'owner-3', name: 'Friend / Local Maker', defaultColor: '#10b981' }
    ];
  });

  const [spools, setSpools] = useState(() => {
    const saved = localStorage.getItem('ams_spools');
    return saved ? JSON.parse(saved) : [
      { id: 'ROLL-101', ownerId: 'owner-1', material: 'PLA Basic', color: 'Black', initialWeight: 1000, remainingWeight: 850, status: 'active', totalUsed: 150 },
      { id: 'ROLL-102', ownerId: 'owner-2', material: 'PLA-CF', color: 'Dark Gray', initialWeight: 1000, remainingWeight: 1000, status: 'storage', totalUsed: 0 },
      { id: 'ROLL-103', ownerId: 'owner-3', material: 'ABS', color: 'White', initialWeight: 1000, remainingWeight: 720, status: 'storage', totalUsed: 280 }
    ];
  });

  const [amsSlots, setAmsSlots] = useState(() => {
    const saved = localStorage.getItem('ams_slots');
    return saved ? JSON.parse(saved) : { A1: 'ROLL-101', A2: null, A3: null, A4: null };
  });

  const [scanBuffer, setScanBuffer] = useState('');
  const [scanMode, setScanMode] = useState('auto');
  const [batchOwner, setBatchOwner] = useState(owners[0]?.id || '');
  const [batchMaterial, setBatchMaterial] = useState('PLA Basic');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedSpoolForAction, setSelectedSpoolForAction] = useState(null);
  
  const [printSlotTarget, setPrintSlotTarget] = useState('A1');
  const [printGramsUsed, setPrintGramsUsed] = useState(25);
  const [printStatus, setPrintStatus] = useState('success');

  useEffect(() => {
    localStorage.setItem('ams_owners', JSON.stringify(owners));
    localStorage.setItem('ams_spools', JSON.stringify(spools));
    localStorage.setItem('ams_slots', JSON.stringify(amsSlots));
  }, [owners, spools, amsSlots]);

  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentTime = Date.now();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'Enter') {
        const scannedCode = barcodeBufferRef.current.trim();
        if (scannedCode.length > 0) processScannedBarcode(scannedCode);
        barcodeBufferRef.current = '';
      } else if (e.key.length === 1) {
        if (currentTime - lastKeyTimeRef.current > 100) barcodeBufferRef.current = '';
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

    if (scanMode === 'intake') {
      const existing = spools.find(s => s.id === cleanCode);
      if (!existing) {
        const newRoll = { id: cleanCode, ownerId: batchOwner, material: batchMaterial, color: 'Standard', initialWeight: 1000, remainingWeight: 1000, status: 'storage', totalUsed: 0 };
        setSpools(prev => [newRoll, ...prev]);
        alert(`Successfully registered new roll: ${cleanCode}`);
      } else {
        alert(`Barcode ${cleanCode} is already registered!`);
      }
      return;
    }

    if (scanMode === 'load') {
      const emptySlot = Object.keys(amsSlots).find(k => !amsSlots[k]) || 'A1';
      const roll = spools.find(s => s.id === cleanCode);
      if (roll) {
        setAmsSlots(prev => ({ ...prev, [emptySlot]: roll.id }));
        setSpools(prev => prev.map(s => s.id === cleanCode ? { ...s, status: 'active' } : s));
        alert(`Loaded roll ${cleanCode} into AMS Slot ${emptySlot}`);
      } else {
        alert(`Roll ${cleanCode} not found in inventory!`);
      }
      return;
    }

    const roll = spools.find(s => s.id === cleanCode);
    if (roll) {
      setSelectedSpoolForAction(roll);
      setActiveModal('edit-spool');
    } else {
      if (confirm(`Barcode "${cleanCode}" not found. Register it now as a new roll?`)) {
        setSelectedSpoolForAction({ id: cleanCode, ownerId: owners[0]?.id, material: 'PLA Basic', color: 'Unknown', initialWeight: 1000, remainingWeight: 1000, status: 'storage', totalUsed: 0 });
        setActiveModal('edit-spool');
      }
    }
  };

  const handleLogPrintSubmit = (e) => {
    e.preventDefault();
    const activeRollId = amsSlots[printSlotTarget];
    if (!activeRollId) { alert(`AMS Slot ${printSlotTarget} is empty!`); return; }
    const grams = parseFloat(printGramsUsed) || 0;
    setSpools(prev => prev.map(roll => roll.id === activeRollId ? { ...roll, remainingWeight: Math.max(0, roll.remainingWeight - grams), totalUsed: roll.totalUsed + grams } : roll));
    alert(`Logged ${grams}g usage on Slot ${printSlotTarget}.`);
    setActiveModal(null);
  };

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
    setSpools(prev => prev.some(s => s.id === updatedRoll.id) ? prev.map(s => s.id === updatedRoll.id ? updatedRoll : s) : [updatedRoll, ...prev]);
    setActiveModal(null);
  };

  const handleDeleteSpool = (rollId) => {
    if (confirm(`Delete spool ${rollId}?`)) {
      Object.keys(amsSlots).forEach(slot => { if (amsSlots[slot] === rollId) setAmsSlots(prev => ({ ...prev, [slot]: null })); });
      setSpools(prev => prev.filter(s => s.id !== rollId));
      setActiveModal(null);
    }
  };

  const handleAddOwner = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setOwners(prev => [...prev, { id: 'owner-' + Date.now(), name: formData.get('name'), defaultColor: '#3b82f6' }]);
    setActiveModal(null);
  };

  const handleDeleteOwner = (ownerId) => {
    if (spools.some(s => s.ownerId === ownerId)) { alert('Cannot delete owner with active spools.'); return; }
    if (confirm('Remove owner?')) setOwners(prev => prev.filter(o => o.id !== ownerId));
  };

  const getOwnerName = (ownerId) => owners.find(o => o.id === ownerId)?.name || 'Unassigned';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-2 rounded-lg text-cyan-400"><Printer className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">AMS 2 Pro Tracker <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">Zebra Ready</span></h1>
            <p className="text-xs text-slate-400">Last Scan: <span className="text-cyan-400 font-mono">{scanBuffer || 'Ready...'}</span></p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button onClick={() => setScanMode('auto')} className={`px-3 py-1 text-xs font-semibold rounded-lg ${scanMode === 'auto' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Auto</button>
          <button onClick={() => setScanMode('intake')} className={`px-3 py-1 text-xs font-semibold rounded-lg ${scanMode === 'intake' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Intake</button>
          <button onClick={() => setScanMode('load')} className={`px-3 py-1 text-xs font-semibold rounded-lg ${scanMode === 'load' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>Load</button>
        </div>
        <button onClick={() => setActiveModal('print-log')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Log Print</button>
      </header>

      <nav className="bg-slate-900/60 border-b border-slate-800 px-4 flex space-x-2">
        {[{ id: 'dashboard', label: 'AMS Live Slots', icon: Layers }, { id: 'inventory', label: 'Spool Inventory', icon: Package }, { id: 'owners', label: 'Owners Ledger', icon: Users }, { id: 'admin', label: '⚙️ Admin Panel', icon: ShieldCheck }].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 p-4 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['A1', 'A2', 'A3', 'A4'].map(slotKey => {
              const rollId = amsSlots[slotKey];
              const roll = spools.find(s => s.id === rollId);
              const percentage = roll ? Math.round((roll.remainingWeight / roll.initialWeight) * 100) : 0;
              return (
                <div key={slotKey} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-lg font-black bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-xl">Slot {slotKey}</span>
                    {roll && <button onClick={() => setAmsSlots(prev => ({ ...prev, [slotKey]: null }))} className="text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg">Unload</button>}
                  </div>
                  {roll ? (
                    <div className="space-y-3">
                      <div><p className="text-xs font-mono text-cyan-300">{roll.id}</p><h3 className="text-base font-bold text-white">{roll.material}</h3></div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                      <div className={`h-full ${percentage < 20 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  ) : <div className="py-10 text-center text-slate-600 text-xs">Empty Bay</div>}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs"><th className="p-4">ID</th><th className="p-4">Owner</th><th className="p-4">Material</th><th className="p-4">Remaining</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {spools.map(roll => (
                  <tr key={roll.id} className="hover:bg-slate-800/50">
                    <td className="p-4 font-mono font-bold text-cyan-400">{roll.id}</td>
                    <td className="p-4">{getOwnerName(roll.ownerId)}</td>
                    <td className="p-4">{roll.material}</td>
                    <td className="p-4">{roll.remainingWeight}g</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => { setSelectedSpoolForAction(roll); setActiveModal('edit-spool'); }} className="text-cyan-400"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteSpool(roll.id)} className="text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'owners' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {owners.map(owner => (
              <div key={owner.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-lg font-bold text-white">{owner.name}</h3>
                <button onClick={() => handleDeleteOwner(owner.id)} className="text-rose-400 text-xs">Remove Owner</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Admin Controls</h2>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs">Factory Reset</button>
          </div>
        )}
      </main>

      {activeModal === 'edit-spool' && selectedSpoolForAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Edit Spool</h3>
            <form onSubmit={handleSaveSpool} className="space-y-3">
              <input name="id" defaultValue={selectedSpoolForAction.id} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-400 font-mono" required />
              <select name="ownerId" defaultValue={selectedSpoolForAction.ownerId} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <input name="material" defaultValue={selectedSpoolForAction.material} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              <input name="color" defaultValue={selectedSpoolForAction.color} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              <input type="number" name="remainingWeight" defaultValue={selectedSpoolForAction.remainingWeight} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              <input type="hidden" name="initialWeight" defaultValue={selectedSpoolForAction.initialWeight} />
              <input type="hidden" name="status" defaultValue={selectedSpoolForAction.status} />
              <input type="hidden" name="totalUsed" defaultValue={selectedSpoolForAction.totalUsed} />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs bg-cyan-600 text-white rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
