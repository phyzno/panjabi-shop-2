'use client'
import { useState, useEffect } from 'react'

interface ColorPickerProps {
  name: string
  value?: string
  label?: string
}

export function ColorPicker({ name, value = '#000000', label = 'Color' }: ColorPickerProps) {
  const [hex, setHex] = useState(value || '#000000')
  const [color, setColor] = useState(value || '#000000')

  useEffect(() => {
    if (value) {
      setHex(value)
      setColor(value)
    }
  }, [value])

  function handleHexChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newHex = e.target.value
    setHex(newHex)
    if (/^#[0-9A-F]{6}$/i.test(newHex)) {
      setColor(newHex)
    }
  }

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newColor = e.target.value
    setColor(newColor)
    setHex(newColor)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          name={name}
          value={hex}
          onChange={handleHexChange}
          placeholder="#000000"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#6B1E2E] focus:border-transparent outline-none font-mono text-sm"
        />
      </div>
      <input type="hidden" name={name} value={hex} />
    </div>
  )
}
