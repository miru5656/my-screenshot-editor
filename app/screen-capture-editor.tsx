'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ScreenCaptureEditor() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#FF0000') // Default color: red

  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.onloadedmetadata = () => {
        video.play()
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
        setCapturedImage(canvas.toDataURL('image/png'))
        stream.getTracks().forEach(track => track.stop())
      }
    } catch (err) {
      console.error("Error: " + err)
    }
  }

  useEffect(() => {
    if (capturedImage && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
      }
      img.src = capturedImage
    }
  }, [capturedImage])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.beginPath()
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const saveImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = 'screen-capture-edited.png'
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Screen Capture and Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={captureScreen}>Capture Screen</Button>
        {capturedImage && (
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              className="border border-gray-300 w-full"
            />
            <div className="flex space-x-4">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10"
              />
              <Button onClick={saveImage}>Save Image</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}