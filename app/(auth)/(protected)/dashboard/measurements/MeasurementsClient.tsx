'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Ruler, Trash2, Scissors, X, Star, ChevronLeft, Edit2, AlertTriangle } from 'lucide-react';
import { MEASUREMENT_FIELDS } from '@/lib/config/measurementConfig';
import { 
  createPersonProfile, 
  updatePersonName, 
  deletePersonProfile, 
  setFeaturedPerson,
  addFitMeasurement,
  deleteFitMeasurement,
  setFeaturedFit
} from '@/lib/actions/measurement.actions';

const TABS = [
  { id: 'panjabi', label: 'Panjabi' },
  { id: 'jubba', label: 'Jubba' },
  { id: 'shirt', label: 'Shirt' },
  { id: 'pant', label: 'Pant' },
  { id: 'pajama', label: 'Pajama' }
];

export default function MeasurementsClient({ userId, initialMeasurements }: { userId: string, initialMeasurements: any[] }) {
  const [activePerson, setActivePerson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('panjabi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals State
  const [personModal, setPersonModal] = useState({ isOpen: false, editName: '' });
  const [personNameInput, setPersonNameInput] = useState('');
  
  const [fitModal, setFitModal] = useState(false);
  const [fitData, setFitData] = useState<any>({ fit_name: '', is_default: false });
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, type: 'person'|'fit', id?: number, name?: string }>({ isOpen: false, type: 'person' });

  // Data Formatting
  const personsMap = useMemo(() => {
    const map = new Map();
    initialMeasurements.forEach(m => {
      if (!map.has(m.person_name)) {
        map.set(m.person_name, { name: m.person_name, isFeatured: m.is_person_default, fits: [] });
      }
      if (m.product_type !== 'none') {
        map.get(m.person_name).fits.push(m);
      }
    });
    return Array.from(map.values());
  }, [initialMeasurements]);

  const activePersonData = personsMap.find(p => p.name === activePerson);
  const activeProductFits = activePersonData?.fits.filter((f: any) => f.product_type === activeTab) || [];

  // --- Handlers for Person ---
  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personNameInput.trim()) return;

    const exists = personsMap.some(p => p.name.toLowerCase() === personNameInput.trim().toLowerCase());
    if (exists && personNameInput.trim().toLowerCase() !== personModal.editName.toLowerCase()) {
      alert("A profile with this name already exists.");
      return;
    }

    setIsSubmitting(true);
    if (personModal.editName) {
      await updatePersonName(userId, personModal.editName, personNameInput.trim());
      if (activePerson === personModal.editName) setActivePerson(personNameInput.trim());
    } else {
      await createPersonProfile(userId, personNameInput.trim());
    }
    setIsSubmitting(false);
    setPersonModal({ isOpen: false, editName: '' });
    setPersonNameInput('');
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    if (deleteModal.type === 'person' && deleteModal.name) {
      await deletePersonProfile(userId, deleteModal.name);
      if (activePerson === deleteModal.name) setActivePerson(null);
    } else if (deleteModal.type === 'fit' && deleteModal.id) {
      await deleteFitMeasurement(deleteModal.id);
    }
    setIsSubmitting(false);
    setDeleteModal({ isOpen: false, type: 'person' });
  };

  // --- Handlers for Fit ---
  const handleSaveFit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fitData.fit_name.trim() || !activePerson) return;

    const isDuplicate = activeProductFits.some((f: any) => f.fit_name.toLowerCase() === fitData.fit_name.trim().toLowerCase());
    if (isDuplicate) {
      alert(`A fit named '${fitData.fit_name}' already exists for ${activeTab}.`);
      return;
    }

    setIsSubmitting(true);
    const numericMeasurements: Record<string, number> = {};
    Object.keys(dynamicValues).forEach(key => {
      numericMeasurements[key] = Number(dynamicValues[key]) || 0;
    });

    await addFitMeasurement(userId, {
      person_name: activePerson,
      fit_name: fitData.fit_name.trim(),
      product_type: activeTab,
      measurements: numericMeasurements,
      is_default: fitData.is_default || activeProductFits.length === 0,
      is_person_default: activePersonData?.isFeatured || false,
    });

    setIsSubmitting(false);
    setFitModal(false);
    setFitData({ fit_name: '', is_default: false });
    setDynamicValues({});
  };

  // --- RENDER: Person List View ---
  if (!activePerson) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button 
          onClick={() => { setPersonModal({ isOpen: true, editName: '' }); setPersonNameInput(''); }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4A5D23] text-white rounded-xl font-sans text-xs uppercase tracking-widest shadow-md hover:bg-[#3D4C1D] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Profile
        </button>

        {personsMap.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {personsMap.map((person) => (
              <div 
                key={person.name} 
                className={`group bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md ${
                  person.isFeatured ? 'border-[#4A5D23] ring-1 ring-[#4A5D23]' : 'border-[#D4D7C9]/60 hover:border-[#4A5D23]/50'
                }`}
                onClick={() => setActivePerson(person.name)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-[#17210C]">
                      {person.name}
                    </h3>
                    {person.isFeatured && (
                      <span className="w-fit inline-flex items-center gap-1 text-[9px] uppercase tracking-widest text-[#4A5D23] bg-[#4A5D23]/10 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-current" /> Featured Profile
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#D4D7C9]/40 pt-4 mt-2">
                  <p className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/50">
                    {person.fits.length} Saved Fits
                  </p>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {!person.isFeatured && (
                      <button onClick={() => setFeaturedPerson(userId, person.name)} className="p-2 text-[#1C221A]/40 hover:text-[#4A5D23] bg-[#F8F9F5] hover:bg-[#4A5D23]/10 rounded-lg transition-colors" title="Set Featured">
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => { setPersonModal({ isOpen: true, editName: person.name }); setPersonNameInput(person.name); }} className="p-2 text-[#1C221A]/40 hover:text-blue-600 bg-[#F8F9F5] hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteModal({ isOpen: true, type: 'person', name: person.name })} className="p-2 text-[#1C221A]/40 hover:text-red-500 bg-[#F8F9F5] hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#D4D7C9]/50">
            <Ruler className="w-12 h-12 text-[#D4D7C9] mx-auto mb-4" />
            <p className="font-heading text-sm font-bold uppercase tracking-wider text-[#17210C]">No Profiles Created</p>
            <p className="font-sans text-[11px] text-[#1C221A]/60 mt-1">Start by adding yourself or family members.</p>
          </div>
        )}

        {/* Person Modal */}
        {personModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPersonModal({ isOpen: false, editName: '' })} />
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 animate-in zoom-in-95">
              <h3 className="font-heading text-lg font-bold uppercase text-[#17210C] mb-4">
                {personModal.editName ? 'Rename Profile' : 'New Profile'}
              </h3>
              <form onSubmit={handleSavePerson}>
                <input 
                  type="text" required autoFocus
                  placeholder="e.g. Me, Abbu, Brother" 
                  value={personNameInput}
                  onChange={e => setPersonNameInput(e.target.value)}
                  className="w-full border border-[#D4D7C9] px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23]"
                />
                <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-[#4A5D23] text-white py-3 rounded-xl font-sans text-xs uppercase tracking-widest hover:bg-[#3D4C1D] disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: Detailed Product Fits View ---
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#D4D7C9]/50 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setActivePerson(null)} className="p-2 hover:bg-[#F8F9F5] rounded-full text-[#1C221A] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-[#17210C] flex items-center gap-2">
              {activePerson}
              {activePersonData?.isFeatured && <Star className="w-4 h-4 text-[#4A5D23] fill-current" />}
            </h2>
          </div>
        </div>
        <button 
          onClick={() => { setFitData({ fit_name: '', is_default: false }); setDynamicValues({}); setFitModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4A5D23] text-white rounded-xl font-sans text-[11px] uppercase tracking-widest shadow-sm hover:bg-[#3D4C1D] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add {activeTab} Fit
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-[#4A5D23] text-white shadow-md' : 'bg-white border border-[#D4D7C9]/60 text-[#1C221A]/60 hover:border-[#4A5D23]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fit Cards Grid */}
      {activeProductFits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {activeProductFits.map((fit: any) => (
            <div key={fit.id} className={`bg-white rounded-2xl p-5 border transition-all duration-300 shadow-sm ${
              fit.is_default ? 'border-[#4A5D23] ring-1 ring-[#4A5D23]' : 'border-[#D4D7C9]/60 hover:border-[#4A5D23]/50'
            }`}>
              <div className="flex justify-between items-start mb-4 border-b border-[#D4D7C9]/30 pb-3">
                <div>
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#17210C]">
                    {fit.fit_name}
                  </h3>
                  {fit.is_default && (
                    <span className="inline-block text-[9px] uppercase tracking-widest text-[#4A5D23] font-medium mt-1">
                      Featured Fit
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!fit.is_default && (
                    <button onClick={() => setFeaturedFit(userId, activePerson, activeTab, fit.id)} className="p-1.5 text-[#1C221A]/40 hover:text-[#4A5D23] bg-[#F8F9F5] rounded-lg transition-colors" title="Set Featured">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setDeleteModal({ isOpen: true, type: 'fit', id: fit.id })} className="p-1.5 text-[#1C221A]/40 hover:text-red-500 bg-[#F8F9F5] rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F8F9F5]/50 rounded-xl">
                {Object.entries(fit.measurements).map(([key, val]) => {
                  const labelDef = (MEASUREMENT_FIELDS as any)[activeTab]?.find((f: any) => f.id === key);
                  return (
                    <div key={key} className="flex flex-col p-2">
                      <span className="font-sans text-[10px] uppercase tracking-widest text-[#1C221A]/50">{labelDef?.label || key}</span>
                      <span className="font-sans text-sm font-medium text-[#17210C]">{String(val)}"</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-[#D4D7C9]">
          <Scissors className="w-8 h-8 text-[#D4D7C9] mx-auto mb-3" />
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-[#17210C]">No {activeTab} fits found</p>
          <p className="font-sans text-[11px] text-[#1C221A]/60 mt-1">Add a new fit to use it during customization.</p>
        </div>
      )}

      {/* Add Fit Modal */}
      {fitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFitModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold uppercase tracking-widest text-[#17210C]">
                New {activeTab} Fit
              </h3>
              <button onClick={() => setFitModal(false)} className="p-2 bg-[#F8F9F5] rounded-full hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFit} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Fit Name *</label>
                <input 
                  type="text" required placeholder="e.g. Slim Fit, Loose Eid Fit" 
                  value={fitData.fit_name} onChange={e => setFitData({...fitData, fit_name: e.target.value})}
                  className="w-full border border-[#D4D7C9] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {((MEASUREMENT_FIELDS as any)[activeTab] || []).map((field: any) => (
                  <div key={field.id}>
                    <label className="block text-[10px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">{field.label} *</label>
                    <input 
                      type="number" step="0.25" required 
                      value={dynamicValues[field.id] || ''} 
                      onChange={e => setDynamicValues({...dynamicValues, [field.id]: e.target.value})}
                      className="w-full border border-[#D4D7C9] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23]" 
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={fitData.is_default} onChange={e => setFitData({...fitData, is_default: e.target.checked})} className="w-4 h-4 accent-[#4A5D23] rounded" />
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/70">Set as Featured Fit</span>
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-[#4A5D23] text-white py-3 rounded-xl font-sans text-xs uppercase tracking-[0.15em] hover:bg-[#3D4C1D] disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Fit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, type: 'person' })} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#17210C] mb-2">Delete {deleteModal.type === 'person' ? 'Profile' : 'Fit'}?</h3>
            <p className="text-xs text-[#1C221A]/60 mb-6 px-2">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ isOpen: false, type: 'person' })} disabled={isSubmitting} className="flex-1 py-3 bg-[#F8F9F5] rounded-xl text-xs uppercase tracking-widest font-medium">Cancel</button>
              <button onClick={handleConfirmDelete} disabled={isSubmitting} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs uppercase tracking-widest font-medium shadow-md">{isSubmitting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}