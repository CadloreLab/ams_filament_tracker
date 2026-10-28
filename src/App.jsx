import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, Package, Users, Settings, Plus, Trash2, Edit3, 
  RotateCcw, CheckCircle, AlertTriangle, Download, Upload, 
  ShieldCheck, UserPlus, Layers, Printer, RefreshCw, X, Lock, LogOut
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Authentication & Users State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ams_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [owners, setOwners] = useState(() => {
    const saved = localStorage.getItem('ams_owners');
    return saved ? JSON.parse(saved) : [
      { id: 'owner-1', name: 'Charles (Admin)', username: 'admin', pin: '1234', isAdmin: true, defaultColor: '#3b82f6' },
      { id: 'owner-2', name: 'Stephanie', username: 'steph', pin: '5678', isAdmin: false, defaultColor: '#ec4899' }
    ];
  });

  const [spools, setSpools] = useState(() => {
    const saved = localStorage.getItem('ams_spools');
    return saved ? JSON.parse(saved) : [
      { id: 'ROLL-101', ownerId: 'owner-1', material: 'PLA Basic', color: 'Black', initialWeight: 1000, remainingWeight: 850, status: 'active', totalUsed: 150 },
      { id: 'ROLL-102', ownerId: 'owner-2', material: 'PLA-CF', color: 'Dark Gray', initialWeight: 1000, remainingWeight: 1000, status: 'storage', totalUsed: 0 }
    ];
  });

  const [amsSlots, setAmsSlots] = useState(() => {
    const saved = localStorage.getItem('ams_slots');
    return saved ? JSON.parse(saved) : { A1: 'ROLL-101', A2: 'ROLL-102', A3: null, A4: null };
  });

  const [scanBuffer, setScanBuffer] = useState('');
  const [scanMode, setScanMode] = useState('auto');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedSpoolForAction, setSelectedSpoolForAction] = useState(null);
  
  const [printSlotTarget, setPrintSlotTarget] = useState('A1');
  const [printGramsUsed, setPrintGramsUsed] = useState(25);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('ams_owners', JSON.stringify(owners));
    localStorage.setItem('ams_spools', JSON.stringify(spools));
    localStorage.setItem('ams_slots', JSON.stringify(amsSlots));
    if (currentUser) {
      localStorage.setItem('ams_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ams_current_user');
    }
  }, [owners, spools, amsSlots, currentUser]);

  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  // Zebra Scanner & Hardware Barcode Listener
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
  }, [scanMode, amsSlots, spools, currentUser]);

  const processScannedBarcode = (code) => {
    const cleanCode = code.toUpperCase();
    setScanBuffer(cleanCode);

    if (scanMode === 'intake') {
      const existing = spools.find(s => s.id === cleanCode);
      if (!existing) {
        const newRoll = { 
          id: cleanCode, 
          ownerId: currentUser ? currentUser.id : owners[0].id, 
          material: 'PLA Basic', 
          color: 'Standard', 
          initialWeight: 1000, 
          remainingWeight: 1000, 
          status: 'storage', 
          totalUsed: 0 
        };
        setSpools(prev => [newRoll, ...prev]);
        alert(`Registered new roll: ${cleanCode}`);
      } else {
        alert(`Barcode ${cleanCode} already registered!`);
      }
      return;
    }

    if (scanMode === 'load') {
      const emptySlot = Object.keys(amsSlots).find(k => !amsSlots[k]) || 'A1';
      const roll = spools.find(s => s.id === cleanCode);
      if (roll) {
        setAmsSlots(prev => ({ ...prev, [emptySlot]: roll.id }));
        setSpools(prev => prev.map(s => s.id === cleanCode ? { ...s, status: 'active' } : s));
        alert(`Loaded roll ${cleanCode} into Slot ${emptySlot}`);
      } else {
        alert(`Roll ${cleanCode} not found!`);
      }
      return;
    }

    const roll = spools.find(s => s.id === cleanCode);
    if (roll) {
      setSelectedSpoolForAction(roll);
      setActiveModal('edit-spool');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username').trim();
    const pin = formData.get('pin').trim();

    const found = owners.find(o => o.username === username && o.pin === pin);
    if (found) {
      setCurrentUser(found);
    } else {
      alert('Invalid username or PIN code.');
    }
  };

  const handleAddOwner = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOwner = {
      id: 'owner-' + Date.now(),
      name: formData.get('name'),
      username: formData.get('username'),
      pin: formData.get('pin'),
      isAdmin: formData.get('isAdmin') === 'on',
      defaultColor: '#10b981'
    };
    setOwners(prev => [...prev, newOwner]);
    setActiveModal(null);
    alert(`Successfully added owner: ${newOwner.name}`);
  };

  const handleDeleteOwner = (ownerId) => {
    if (spools.some(s => s.ownerId === ownerId)) {
      alert('Cannot delete owner who currently owns active spools.');
      return;
    }
    if (owners.length <= 1) {
      alert('You must keep at least one owner/admin.');
      return;
    }
    if (confirm('Are you sure you want to remove this owner?')) {
      setOwners(prev => prev.filter(o => o.id !== ownerId));
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

  const getOwnerName = (ownerId) => owners.find(o => o.id === ownerId)?.name || 'Unassigned';

  // If not logged in, show login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="bg-cyan-500/10 border border-cyan-500/30 w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-cyan-400">
              <Printer className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">AMS 2 Pro Tracker</h1>
            <p className="text-xs text-slate-400">Please sign in with your user credentials</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Username</label>
              <input name="username" defaultValue="admin" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">PIN / Password</label>
              <input type="password" name="pin" defaultValue="1234" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono" required />
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-900/20">Sign In</button>
          </form>
          <div className="text-center text-xs text-slate-500 pt-2">
            Default Admin: username <span className="text-cyan-400 font-mono">admin</span> / PIN <span className="text-cyan-400 font-mono">1234</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-2 rounded-lg text-cyan-400"><Printer className="w-6 h-6" /></div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">AMS 2 Pro Tracker <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">Zebra Ready</span></h1>
            <p className="text-xs text-slate-400">User: <span className="text-cyan-400 font-semibold">{currentUser.name}</span> | Last Scan: <span className="text-cyan-400 font-mono">{scanBuffer || 'Ready...'}</span></p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button onClick={() => setScanMode('auto')} className={`px-3 py-1 text-xs font-semibold rounded-lg ${scanMode === 'auto' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Auto</button>
            <button onClick={() => setScanMode('intake')} className={`px-3 py-1 text-xs font-semibold rounded-lg ${scanMode === 'intake' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Intake</button>
            <button onClick={() => setScanMode('load')} className={`px-3 py-1 text-xs font-semibold rounded-lg ${scanMode === 'load' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>Load</button>
          </div>
          <button onClick={() => setActiveModal('print-log')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Log Print</button>
          <button onClick={() => setCurrentUser(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Logout</button>
        </div>
      </header>

      <nav className="bg-slate-900/60 border-b border-slate-800 px-4 flex space-x-2">
        {[
          { id: 'dashboard', label: 'AMS Live Slots', icon: Layers }, 
          { id: 'inventory', label: 'Spool Inventory', icon: Package }, 
          { id: 'owners', label: 'Owners & Logins', icon: Users }, 
          { id: 'admin', label: '⚙️ Admin Panel', icon: ShieldCheck }
        ].map(tab => {
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
                      <div>
                        <p className="text-xs font-mono text-cyan-300">{roll.id}</p>
                        <h3 className="text-base font-bold text-white">{roll.material}</h3>
                        <p className="text-xs text-slate-400">Owner: {getOwnerName(roll.ownerId)}</p>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div className={`h-full ${percentage < 20 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{roll.remainingWeight}g remaining</span>
                        <span>{percentage}%</span>
                      </div>
                    </div>
                  ) : <div className="py-10 text-center text-slate-600 text-xs">Empty Bay</div>}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-base font-bold text-white">Spool Inventory Ledger</h2>
              <button onClick={() => { setSelectedSpoolForAction({ id: 'ROLL-' + Math.floor(100 + Math.random() * 900), ownerId: currentUser.id, material: 'PLA Basic', color: 'Black', initialWeight: 1000, remainingWeight: 1000, status: 'storage', totalUsed: 0 }); setActiveModal('edit-spool'); }} className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Spool
              </button>
            </div>
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs"><th className="p-4">ID</th><th className="p-4">Owner</th><th className="p-4">Material</th><th className="p-4">Color</th><th className="p-4">Remaining</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-800">
                {spools.map(roll => (
                  <tr key={roll.id} className="hover:bg-slate-800/50">
                    <td className="p-4 font-mono font-bold text-cyan-400">{roll.id}</td>
                    <td className="p-4">{getOwnerName(roll.ownerId)}</td>
                    <td className="p-4">{roll.material}</td>
                    <td className="p-4">{roll.color}</td>
                    <td className="p-4">{roll.remainingWeight}g / {roll.initialWeight}g</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => { setSelectedSpoolForAction(roll); setActiveModal('edit-spool'); }} className="text-cyan-400 hover:text-cyan-300"><Edit3 className="w-4 h-4 inline" /></button>
                      <button onClick={() => handleDeleteSpool(roll.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'owners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Owners & Logins</h2>
                <p className="text-xs text-slate-400">Manage who has access to the app and spool inventory.</p>
              </div>
              {currentUser.isAdmin && (
                <button onClick={() => setActiveModal('add-owner')} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" /> Add New Owner / User
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {owners.map(owner => (
                <div key={owner.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-white">{owner.name}</h3>
                    {owner.isAdmin && <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full font-semibold">Admin</span>}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Username: <span className="text-white">{owner.username}</span></p>
                  <p className="text-xs text-slate-400">Spools owned: {spools.filter(s => s.ownerId === owner.id).length}</p>
                  {currentUser.isAdmin && owners.length > 1 && (
                    <button onClick={() => handleDeleteOwner(owner.id)} className="text-rose-400 hover:text-rose-300 text-xs pt-2 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove User
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-xl">
            <h2 className="text-lg font-bold text-white">System Admin Controls</h2>
            <p className="text-xs text-slate-400">Reset local storage or perform system maintenance.</p>
            {currentUser.isAdmin ? (
              <button onClick={() => { if(confirm('Factory reset will clear all local spools and logs. Proceed?')) { localStorage.clear(); window.location.reload(); } }} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold">
                Factory Reset All Data
              </button>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">Admin access required to perform system resets.</p>
            )}
          </div>
        )}
      </main>

      {/* Add Owner Modal */}
      {activeModal === 'add-owner' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add New Owner / Login</h3>
            <form onSubmit={handleAddOwner} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input name="name" placeholder="e.g. John Doe" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Login Username</label>
                <input name="username" placeholder="e.g. john" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Login PIN / Password</label>
                <input type="password" name="pin" placeholder="e.g. 1234" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono" required />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="isAdmin" id="isAdmin" className="rounded bg-slate-950 border-slate-800 text-cyan-600 focus:ring-0" />
                <label htmlFor="isAdmin" className="text-xs text-slate-300">Grant Admin privileges</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold">Save Owner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Spool Modal */}
      {activeModal === 'edit-spool' && selectedSpoolForAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Edit Spool</h3>
            <form onSubmit={handleSaveSpool} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Spool Barcode ID</label>
                <input name="id" defaultValue={selectedSpoolForAction.id} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-400 font-mono" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Spool Owner</label>
                <select name="ownerId" defaultValue={selectedSpoolForAction.ownerId} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Material</label>
                <input name="material" defaultValue={selectedSpoolForAction.material} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Color</label>
                <input name="color" defaultValue={selectedSpoolForAction.color} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Remaining Weight (grams)</label>
                <input type="number" name="remainingWeight" defaultValue={selectedSpoolForAction.remainingWeight} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" required />
              </div>
              <input type="hidden" name="initialWeight" defaultValue={selectedSpoolForAction.initialWeight} />
              <input type="hidden" name="status" defaultValue={selectedSpoolForAction.status} />
              <input type="hidden" name="totalUsed" defaultValue={selectedSpoolForAction.totalUsed} />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold">Save Spool</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Print Modal */}
      {activeModal === 'print-log' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Log Print Job Consumption</h3>
            <form onSubmit={handleLogPrintSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target AMS Slot</label>
                <select value={printSlotTarget} onChange={(e) => setPrintSlotTarget(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  {['A1', 'A2', 'A3', 'A4'].map(slot => (
                    <option key={slot} value={slot}>Slot {slot} ({amsSlots[slot] ? amsSlots[slot] : 'Empty'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Filament Used (Grams)</label>
                <input type="number" value={printGramsUsed} onChange={(e) => setPrintGramsUsed(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono" required />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-3 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold">Deduct Usage</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
