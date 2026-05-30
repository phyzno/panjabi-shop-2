import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getUserMeasurements } from '@/lib/actions/user.actions';
import MeasurementsClient from './MeasurementsClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Saved Measurements | My Atelier',
};

export default async function MeasurementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { success, data: measurements } = await getUserMeasurements(user.id);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-[#17210C]">
            Saved Measurements
          </h1>
          <p className="font-sans text-xs text-[#1C221A]/60 mt-1 tracking-wide">
            Manage your bespoke fitting profiles for a seamless tailoring experience.
          </p>
        </div>
      </div>

      <MeasurementsClient 
        userId={user.id} 
        initialMeasurements={success && measurements ? measurements : []} 
      />
    </div>
  );
}