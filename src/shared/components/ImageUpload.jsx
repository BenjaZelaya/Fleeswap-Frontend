import { useState } from 'react'
import useCloudinaryWidget from '../hooks/useCloudinaryWidget'
import { X } from 'lucide-react'
import { PHOTOS_MAX } from '../../utils/constants'

export default function ImageUpload({ images = [], onAddImage, onRemoveImage, error, disabled = false }) {
  const { openWidget, scriptReady } = useCloudinaryWidget()
  const [uploading, setUploading] = useState(false)

  const handleAddPhoto = () => {
    if (!scriptReady || uploading || images.length >= PHOTOS_MAX) return

    setUploading(true)
    openWidget(
      (url) => {
        onAddImage(url)
        setUploading(false)
      },
      (err) => {
        console.error('Upload error:', err)
        setUploading(false)
      }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-dark-warm">
          Fotos
          <span className="text-brand">*</span>
        </label>
        <span className="text-xs text-gray-500">
          {images.length} / {PHOTOS_MAX}
        </span>
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {images.map((url, index) => (
          <div key={url} className="relative aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100">
            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Botón agregar foto */}
        {images.length < PHOTOS_MAX && (
          <button
            type="button"
            onClick={handleAddPhoto}
            disabled={uploading || disabled || !scriptReady}
            className="aspect-square rounded-lg border-2 border-dashed border-brand-light hover:border-brand transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-brand-light/10 text-brand-light hover:bg-brand-light/20"
          >
            <div className="text-center">
              <div className="text-2xl">+</div>
              <div className="text-xs font-semibold">Agregar</div>
            </div>
          </button>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
