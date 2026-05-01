import { getMeasurements } from '@/lib/actions/measurements'
import { Ruler, CheckCircle2 } from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import Link from 'next/link'
import { MeasurementForm } from './MeasurementForm'

export default async function MeasurementsPage() {
  const measurements = await getMeasurements()

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-[#6B1E2E] transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Measurements</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Ruler className="text-[#6B1E2E]" />
              My Measurements
            </h1>
            <p className="text-gray-600 mt-1">Save your body measurements for a perfect fit</p>
          </div>
          <MeasurementForm />
        </div>

        {measurements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {measurements.map((m) => (
              <Card key={m.id} className={m.is_default ? 'border-[#6B1E2E] border-2' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">{m.label}</CardTitle>
                    {m.is_default && (
                      <span className="bg-[#6B1E2E]/10 text-[#6B1E2E] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Default
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    Last updated {new Date(m.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="flex justify-between border-b border-gray-50 pb-1">
                      <span className="text-gray-500">Chest</span>
                      <span className="font-bold">{m.chest || '--'}&quot;</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1">
                      <span className="text-gray-500">Shoulder</span>
                      <span className="font-bold">{m.shoulder || '--'}&quot;</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1">
                      <span className="text-gray-500">Sleeve</span>
                      <span className="font-bold">{m.sleeve_length || '--'}&quot;</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1">
                      <span className="text-gray-500">Length</span>
                      <span className="font-bold">{m.body_length || '--'}&quot;</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1">
                      <span className="text-gray-500">Neck</span>
                      <span className="font-bold">{m.neck || '--'}&quot;</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1">
                      <span className="text-gray-500">Waist</span>
                      <span className="font-bold">{m.waist || '--'}&quot;</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                  <MeasurementForm measurement={m} mode="edit" />
                  <MeasurementForm measurement={m} mode="delete" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <Ruler size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No measurements yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Add your measurements now to make your next purchase seamless and perfectly fitted.
            </p>
            <MeasurementForm />
          </div>
        )}

        <div className="mt-12 bg-white rounded-xl p-6 border border-[#6B1E2E]/10 shadow-sm">
          <h2 className="font-heading text-xl font-bold mb-4">How to Measure?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-[#6B1E2E]">1. Chest</h3>
              <p className="text-gray-600">Measure around the fullest part of your chest, keeping the tape horizontal.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-[#6B1E2E]">2. Shoulder</h3>
              <p className="text-gray-600">Measure from the tip of one shoulder to the other across the back.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-[#6B1E2E]">3. Sleeve</h3>
              <p className="text-gray-600">Measure from the shoulder tip down to the wrist.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
