import { useState, useEffect, useRef } from 'react'
import { QrCodeIcon, CameraIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const QRScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (isScanning) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isScanning])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Camera access denied. Please allow camera permission.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleScan = (result) => {
    if (result) {
      try {
        const qrData = JSON.parse(result)
        
        // Validate QR code data
        if (qrData.type === 'attendance_checkin') {
          const now = new Date()
          const validUntil = new Date(qrData.valid_until)
          
          if (now > validUntil) {
            setError('QR code has expired. Please ask admin to generate a new one.')
            return
          }
          
          setScanResult(qrData)
          setIsScanning(false)
          
          // Call the onScan callback with the QR data
          if (onScan) {
            onScan(qrData)
          }
        } else {
          setError('Invalid QR code. Please scan an attendance QR code.')
        }
      } catch (err) {
        setError('Invalid QR code format. Please scan a valid attendance QR code.')
      }
    }
  }

  const handleManualInput = () => {
    const manualCode = prompt('Enter QR code data manually:')
    if (manualCode) {
      handleScan(manualCode)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setError(null)
    setIsScanning(true)
  }

  if (scanResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">QR Code Scanned</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Attendance Check-in</h4>
              <p className="text-gray-600">QR code scanned successfully!</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h5 className="font-semibold text-gray-900 mb-2">QR Code Details:</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Type:</strong> {scanResult.type}</p>
                <p><strong>Valid Until:</strong> {new Date(scanResult.valid_until).toLocaleString()}</p>
                <p><strong>Location:</strong> {scanResult.location.lat}, {scanResult.location.lng}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Scan Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Scan Error</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Scan Failed</h4>
              <p className="text-gray-600">{error}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={resetScanner}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={handleManualInput}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Manual Input
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Position the QR code within the camera view</p>
          </div>
          
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Point your camera at the QR code displayed by the admin
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                isScanning 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <CameraIcon className="h-4 w-4" />
              <span>{isScanning ? 'Stop Scanning' : 'Start Scanning'}</span>
            </button>
            <button
              onClick={handleManualInput}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Manual Input
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner
