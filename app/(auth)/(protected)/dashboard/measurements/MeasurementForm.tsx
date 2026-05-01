'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { addMeasurement, updateMeasurement, deleteMeasurement } from '@/lib/actions/measurements';

interface Measurement {
  id: string;
  label: string;
  chest?: number;
  shoulder?: number;
  sleeve_length?: number;
  body_length?: number;
  neck?: number;
  waist?: number;
  is_default: boolean;
}

interface MeasurementFormProps {
  measurement?: Measurement;
  mode?: 'add' | 'edit' | 'delete';
}

export function MeasurementForm({ measurement, mode = 'add' }: MeasurementFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (mode === 'add') {
        await addMeasurement(formData);
      } else if (mode === 'edit' && measurement) {
        await updateMeasurement(measurement.id, formData);
      } else if (mode === 'delete' && measurement) {
        await deleteMeasurement(measurement.id);
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'delete') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></Button>} />
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Delete Measurement</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{measurement?.label}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        mode === 'add' ? (
          <Button className="bg-[#6B1E2E] hover:bg-[#5a1826] text-white flex items-center gap-2">
            <Plus size={18} />
            Add New
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#6B1E2E]">
            <Edit2 size={18} />
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === 'add' ? 'Add New Measurement' : 'Edit Measurement'}</DialogTitle>
            <DialogDescription>
              Enter your body measurements in inches for custom tailoring.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Label (e.g., My Measurements, Brother&apos;s Size)</Label>
              <Input id="label" name="label" defaultValue={measurement?.label} placeholder="My Measurements" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="chest">Chest (inches)</Label>
                <Input id="chest" name="chest" type="number" step="0.1" defaultValue={measurement?.chest} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shoulder">Shoulder (inches)</Label>
                <Input id="shoulder" name="shoulder" type="number" step="0.1" defaultValue={measurement?.shoulder} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sleeve_length">Sleeve Length (inches)</Label>
                <Input id="sleeve_length" name="sleeve_length" type="number" step="0.1" defaultValue={measurement?.sleeve_length} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body_length">Body Length (inches)</Label>
                <Input id="body_length" name="body_length" type="number" step="0.1" defaultValue={measurement?.body_length} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="neck">Neck (inches)</Label>
                <Input id="neck" name="neck" type="number" step="0.1" defaultValue={measurement?.neck} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="waist">Waist (inches)</Label>
                <Input id="waist" name="waist" type="number" step="0.1" defaultValue={measurement?.waist} />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="is_default" name="is_default" value="true" defaultChecked={measurement?.is_default} />
              <Label htmlFor="is_default">Set as default measurement</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-[#6B1E2E] hover:bg-[#5a1826]" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'add' ? 'Save Measurement' : 'Update Measurement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
