'use client';

import React, { useState } from 'react';
import { Plus, Ruler, Trash2, Scissors, X, Star, AlertTriangle } from 'lucide-react';
import { addMeasurementProfile, deleteMeasurementProfile, setDefaultProfile } from '@/lib/actions/measurement.actions';

export default function MeasurementsClient({ userId, initialMeasurements }: { userId: string, initialMeasurements: any[] }) {
  // Add Profile States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Confirmation States
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    profile_name: '',
    length: '',
    chest: '',
    shoulder: '',
    sleeve: '',
    is_default: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      profile_name: formData.profile_name,
      is_default: formData.is_default || initialMeasurements.length === 0,
      measurements: {
        length: Number(formData.length),
        chest: Number(formData.chest),
        shoulder: Number(formData.shoulder),
        sleeve: Number(formData.sleeve),
      }
    };

    await addMeasurementProfile(userId, payload);
    setIsSubmitting(false);
    setIsModalOpen(false);
    
    setFormData({ profile_name: '', length: '', chest: '', shoulder: '', sleeve: '', is_default: false });
  };

  // ডিলিট কনফার্ম করার ফাংশন
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    await deleteMeasurementProfile(deleteModal.id);
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, id: null });
  };

  return (
    <div className="space-y-6">
      
      {/* Add New Profile Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4A5D23] text-white rounded-xl font-sans text-xs uppercase tracking-widest shadow-md hover:bg-[#3D4C1D] transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add New Profile
      </button>

      {/* Profiles Grid */}
      {initialMeasurements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {initialMeasurements.map((profile) => (
            <div 
              key={profile.id} 
              className={`relative bg-white rounded-2xl p-6 border transition-all duration-300 shadow-sm ${
                profile.is_default ? 'border-[#4A5D23] ring-1 ring-[#4A5D23]' : 'border-[#D4D7C9]/60 hover:border-[#4A5D23]/50'
              }`}
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-[#17210C] flex items-center gap-2">
                    {profile.profile_name}
                  </h3>
                  {profile.is_default && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white bg-[#4A5D23] px-2.5 py-1 rounded-full mt-2">
                      <Star className="w-3 h-3 fill-current" /> Primary Fit
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2.5">
                  {/* Updated: Clearer Set Default Button */}
                  {!profile.is_default && (
                    <button 
                      onClick={() => setDefaultProfile(profile.id, userId)}
                      className="p-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#4A5D23] border border-[#4A5D23]/30 hover:bg-[#4A5D23] hover:text-white bg-[#F8F9F5] rounded-lg transition-all cursor-pointer"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Updated: Triggers Delete Modal instead of direct deletion */}
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, id: profile.id })}
                    className="p-2 text-accent hover:text-red-500 border border-[#4A5D23]/30 bg-[#F8F9F5] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Measurements Display */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F9F5]/50 rounded-xl border border-[#D4D7C9]/40">
                <div className="flex flex-col">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/50 ">Length</span>
                  <span className="font-sans text-sm text-[#17210C]">{profile.measurements.length}"</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/50 ">Chest</span>
                  <span className="font-sans text-sm text-[#17210C]">{profile.measurements.chest}"</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/50 ">Shoulder</span>
                  <span className="font-sans text-sm text-[#17210C]">{profile.measurements.shoulder}"</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/50 ">Sleeve</span>
                  <span className="font-sans text-sm text-[#17210C]">{profile.measurements.sleeve}"</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#D4D7C9]/50">
          <Ruler className="w-12 h-12 text-[#D4D7C9] mx-auto mb-4" />
          <p className="font-heading text-sm font-bold uppercase tracking-wider text-[#17210C]">No profiles saved yet</p>
          <p className="font-sans text-[11px] text-[#1C221A]/60 mt-1">Add a profile to quickly checkout custom tailored items.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm" onClick={() => setDeleteModal({ isOpen: false, id: null })} />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#17210C] mb-2">Delete Profile?</h3>
              <p className="text-sm text-[#1C221A]/70 mb-6">
                Are you sure you want to delete this measurement profile? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-[#F8F9F5] text-[#1C221A] hover:bg-[#D4D7C9] rounded-xl font-sans text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-sans text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Measurement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#111410]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-heading text-lg font-bold uppercase tracking-widest text-[#17210C] flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[#4A5D23]" /> New Profile
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#F8F9F5] rounded-full text-[#1C221A]/60 hover:text-red-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Form fields remain exactly the same as your original code */}
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Profile Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. My Regular Fit, Brother's Fit" 
                  value={formData.profile_name}
                  onChange={(e) => setFormData({...formData, profile_name: e.target.value})}
                  className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Length (inch) *</label>
                  <input type="number" step="0.5" required value={formData.length} onChange={(e) => setFormData({...formData, length: e.target.value})} className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Chest (inch) *</label>
                  <input type="number" step="0.5" required value={formData.chest} onChange={(e) => setFormData({...formData, chest: e.target.value})} className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Shoulder (inch) *</label>
                  <input type="number" step="0.5" required value={formData.shoulder} onChange={(e) => setFormData({...formData, shoulder: e.target.value})} className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23]" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#1C221A]/70 mb-1.5">Sleeve (inch) *</label>
                  <input type="number" step="0.5" required value={formData.sleeve} onChange={(e) => setFormData({...formData, sleeve: e.target.value})} className="w-full bg-[#F8F9F5] border border-[#D4D7C9] px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#4A5D23]" />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="w-4 h-4 accent-[#4A5D23] rounded"
                  />
                  <span className="font-sans text-[11px] uppercase tracking-widest text-[#1C221A]/70 group-hover:text-[#17210C]">
                    Set as Default Profile
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-4 bg-[#4A5D23] text-white py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.15em] shadow-md hover:bg-[#3D4C1D] transition-colors disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving Profile...' : 'Save Measurements'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}