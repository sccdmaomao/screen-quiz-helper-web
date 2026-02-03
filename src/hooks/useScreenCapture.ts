import { useCallback, useRef, useState } from 'react'

export function useScreenCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const startCapture = useCallback(async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      setStream(mediaStream)
      return mediaStream
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to capture screen'
      setError(msg)
      throw err
    }
  }, [])

  const stopCapture = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
  }, [stream])

  const captureFullFrame = useCallback(async (): Promise<string> => {
    const video = videoRef.current
    if (!video || !stream) throw new Error('No video stream')
    if (video.videoWidth === 0) throw new Error('Video not ready')

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context failed')

    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.9).split(',')[1] ?? ''
  }, [stream])

  return { stream, error, videoRef, startCapture, stopCapture, captureFullFrame }
}
