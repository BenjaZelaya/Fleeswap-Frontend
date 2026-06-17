// Hook que gestiona la conexión Socket.IO para el chat de un intercambio.
import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../../../store/authStore'
import { getSocketBaseUrl } from '../../../services/runtimeConfig'

/**
 * exchangeId - ID del intercambio activo
 * onMessage - callback(msg) invocado al recibir un mensaje nuevo
 */
export function useChatSocket(exchangeId, onMessage) {
  const { token } = useAuthStore()
  const socketRef = useRef(null)

  // Estados de conexión para la UI
  const [connected, setConnected] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(false)
  const [connError, setConnError] = useState(null)

  useEffect(() => {
    if (!exchangeId || !token || token === 'undefined' || token === 'null' || typeof token !== 'string' || !token.trim()) {
      return
    }

    const socketURL = getSocketBaseUrl()

    // Crear socket con autoConnect:false para controlar el ciclo de vida manualmente
    const socket = io(socketURL, {
      auth: { token },
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'], // WebSocket primero, polling como fallback
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    })

    socketRef.current = socket

    // ── Eventos de conexión ──────────────────────────────────────────────────
    socket.on('connect', () => {
      setConnected(true)
      setChatEnabled(true)   // Habilitar escritura en cuanto conecta
      setConnError(null)

      // Unirse a la sala para RECIBIR mensajes
      // Si el servidor rechaza explícitamente, deshabilitar
      socket.emit('chat:join', { exchangeId }, (ack) => {
        if (ack?.ok === false) {
          setChatEnabled(false)
          setConnError(ack.error ?? 'No se pudo unir al chat')
        }
      })
    })

    socket.on('disconnect', (reason) => {
      setConnected(false)
      setChatEnabled(false)
      // Si fue por error del servidor, no intentar reconectar manualmente
      if (reason === 'io server disconnect') {
        socket.connect()
      }
    })

    socket.on('connect_error', (err) => {
      setConnected(false)
      setChatEnabled(false)
      setConnError(err.message ?? 'Error de conexión')
    })

    // Confirmación explícita de sala habilitada
    socket.on('chat:enabled', () => {
      setChatEnabled(true)
    })

    // ── Recepción de mensajes ────────────────────────────────────────────────
    // El backend emite "chat:message" con el mismo nombre que el evento de envío
    socket.on('chat:message', (msg) => {
      onMessage(msg)
    })

    // Iniciar la conexión
    socket.connect()

    // ── Cleanup al desmontar o cambiar de intercambio ────────────────────────
    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off('chat:enabled')
      socket.off('chat:message')
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
      setChatEnabled(false)
      setConnError(null)
    }
    // onMessage se pasa como referencia estable via useCallback en ChatView
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeId, token])

  // ── Función de envío ───────────────────────────────────────────────────────
  const sendMessage = useCallback((content) => {
    const socket = socketRef.current
    if (!socket?.connected || !chatEnabled) return Promise.resolve({ ok: false, error: 'Sin conexión' })

    return new Promise((resolve) => {
      socket.emit('chat:message', { exchangeId, content: content.trim() }, (ack) => {
        resolve(ack ?? { ok: false, error: 'Sin respuesta del servidor' })
      })
    })
  }, [exchangeId, chatEnabled])

  return { connected, chatEnabled, connError, sendMessage }
}
