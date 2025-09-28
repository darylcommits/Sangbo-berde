import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { QrCodeIcon, DownloadIcon } from '@heroicons/react/24/outline'

const QRCodeGenerator = ({ data, title = "QR Code" }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [data])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      const url = await QRCode.toDataURL(data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `${title.replace(/\s+/g, '_')}_QR.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="card text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Generating QR Code...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="text-center">
        <QrCodeIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        
        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="border border-gray-200 rounded-lg"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2">Scan this QR code for:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                {data}
              </p>
            </div>
            
            <button
              onClick={downloadQRCode}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download QR Code</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRCodeGenerator
