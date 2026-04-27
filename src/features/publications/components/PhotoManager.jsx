import useCloudinaryWidget from '../../../shared/hooks/useCloudinaryWidget'

export default function PhotoManager({ photos = [], onAddPhoto, onRemovePhoto, error, maxPhotos = 5 }) {
  const { openWidget, uploading } = useCloudinaryWidget()

  const handleAddPhoto = async () => {
    if (photos.length >= maxPhotos) return

    openWidget((url) => {
      onAddPhoto(url)
    })
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-3">
        Fotos
        <span className="text-red-500 ml-1">*</span>
        <span className="text-xs text-gray-400 ml-2">({photos.length}/{maxPhotos})</span>
      </label>

      {/* Grid de fotos existentes */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden">
              <img
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemovePhoto(idx)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón agregar foto */}
      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={handleAddPhoto}
          disabled={uploading}
          className="w-full py-2.5 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-brand hover:text-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo foto...' : '+ Agregar foto'}
        </button>
      )}

      {/* Mensaje de error */}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  )
}
