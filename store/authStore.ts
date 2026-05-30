import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoaded: boolean; // লগ-ইন চেক করা শেষ হয়েছে কি না, তা বোঝার জন্য
  setUser: (user: User | null) => void;
  setLoaded: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,
  setUser: (user) => set({ user }),
  setLoaded: (status) => set({ isLoaded: status }),
}));