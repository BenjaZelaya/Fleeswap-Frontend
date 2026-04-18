/**
 * Hook para usar el widget de subida de imágenes de Cloudinary.
 *
 * Centraliza:
 * - La carga del script externo (evita duplicados si el hook se monta varias veces)
 * - La configuración del widget (cloudName, uploadPreset, carpeta, formatos, tamaño)
 *
 * Uso:
 *   const { openWidget, scriptReady } = useCloudinaryWidget()
 *   <button onClick={() => openWidget(onSuccess, onError)}>Subir foto</button>
 */

import { useEffect, useState } from 'react'

const CLOUDINARY_SCRIPT_URL = 'https://upload-widget.cloudinary.com/global/all.js'
const CLOUDINARY_SCRIPT_ID = 'cloudinary-widget-script'

export default function useCloudinaryWidget() {
  const [scriptReady, setScriptReady] = useState(!!window.cloudinary)

  useEffect(() => {
    // Si el widget ya está disponible (otro componente lo cargó antes), no hacemos nada
    if (window.cloudinary) {
      setScriptReady(true)
      return
    }

    // Si el script ya está en el DOM (montaje previo del hook), esperamos que cargue
    const existing = document.getElementById(CLOUDINARY_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true))
      return
    }

    // Primera carga: inyectamos el script con un id para poder detectarlo después
    const script = document.createElement('script')
    script.id = CLOUDINARY_SCRIPT_ID
    script.src = CLOUDINARY_SCRIPT_URL
    script.async = true
    script.onload = () => setScriptReady(true)
    document.body.appendChild(script)
  }, [])

  /**
   * Abre el widget de Cloudinary.
   * @param {(url: string) => void} onSuccess - Recibe la URL segura de la imagen subida
   * @param {(error: any) => void} onError    - Recibe el error si la subida falla
   */
  function openWidget(onSuccess, onError) {
    if (!window.cloudinary) {
      onError?.('El widget de Cloudinary no está disponible. Recargá la página.')
      return
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        resourceType: 'image',
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5242880, // 5 MB
        folder: 'fleeswap/profiles',
        tags: ['profile'],
      },
      (err, result) => {
        if (err) {
          onError?.(err)
        } else if (result?.event === 'success') {
          onSuccess?.(result.info.secure_url)
        }
      }
    )
  }

  return { openWidget, scriptReady }
}
