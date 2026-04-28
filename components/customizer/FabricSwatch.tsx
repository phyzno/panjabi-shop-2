'use client'
import { useEffect, useRef } from 'react'
import { generateFabricPattern } from '@/lib/canvas/fabricPatterns'

interface FabricSwatchProps {
  fabricType: string
  color?: string        // preview color, default neutral gray-blue
  size?: number         // canvas size in px, default 80
}

export function FabricSwatch({ 
  fabricType, 
  color = '#6B7FA3',   // neutral mid-tone for preview
  size = 80 
}: FabricSwatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    
    // Clear
    ctx.clearRect(0, 0, size, size)
    
    // Clip to circle shape
    ctx.save()
    ctx.beginPath()
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
    ctx.clip()
    
    // Fill base color
    ctx.fillStyle = color
    ctx.fillRect(0, 0, size, size)
    
    // Apply fabric pattern using multiply
    const pattern = generateFabricPattern(ctx, fabricType, color)
    if (pattern) {
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, size, size)
      ctx.globalCompositeOperation = 'source-over'
    }
    
    // Add subtle sheen — circular highlight top-left
    const shine = ctx.createRadialGradient(
      size * 0.35, size * 0.35, 0,
      size * 0.5, size * 0.5, size * 0.6
    )
    shine.addColorStop(0, 'rgba(255,255,255,0.18)')
    shine.addColorStop(0.5, 'rgba(255,255,255,0.05)')
    shine.addColorStop(1, 'rgba(0,0,0,0.12)')
    ctx.fillStyle = shine
    ctx.fillRect(0, 0, size, size)
    
    // Add circular border inside
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2)
    ctx.stroke()
    
    ctx.restore()
    
  }, [fabricType, color, size])
  
  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ 
        borderRadius: '50%',
        display: 'block',
      }}
    />
  )
}
