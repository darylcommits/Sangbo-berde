import { useState, useRef, useEffect } from 'react'
import { QrCodeIcon, CameraIcon } from '@heroicons/react/24/outline'

const QRCodeScanner = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
        setHasPermission(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setHasPermission(false)
      if (onError) {
        onError('Camera access denied or not available')
      }
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const handleScan = (result) => {
    if (result && onScan) {
      onScan(result)
      stopScanning()
    }
  }

  if (hasPermission === false) {
    return (
      <div className="card text-center">
        <CameraIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Access Denied</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please allow camera access to scan QR codes
        </p>
        <button
          onClick={startScanning}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="card text-center">
          <QrCodeIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Scanner</h3>
          <p className="text-sm text-gray-600 mb-4">
            Scan QR codes for attendance check-in/check-out
          </p>
          <button
            onClick={startScanning}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <CameraIcon className="h-4 w-4" />
            <span>Start Scanning</span>
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={stopScanning}
              className="btn-secondary"
            >
              Stop Scanning
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRCodeScanner
