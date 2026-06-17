import { useState, useEffect } from 'react'

// El hook toma dos argumentos: `value`, que es el valor que queremos debilitar, y `delay`, que es el tiempo en milisegundos que queremos esperar antes de actualizar el valor debilitado. 
// El hook devuelve el valor debilitado, que se actualizará solo después de que el usuario haya dejado de cambiar el valor durante el período especificado.

export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
