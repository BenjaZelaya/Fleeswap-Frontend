import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import useAuthStore from '../../../store/authStore';
import useNotificationStore from '../store/notificationStore';
import MatchNotificationToast from '../components/MatchNotificationToast';
import { getSocketBaseUrl } from '../../../services/runtimeConfig';

export default function useNotificationSocket() {
  const token = useAuthStore((state) => state.token);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  useEffect(() => {
    if (!token) return;

    const socket = io(getSocketBaseUrl(), {
      auth: { token },
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      fetchNotifications();
    });

    socket.on('notification:new', (data) => {
      addNotification(data);
      toast.custom(
        (t) =>
          React.createElement(MatchNotificationToast, {
            notification: data,
            onClose: () => toast.dismiss(t),
          }),
        { duration: 6000 }
      );
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [token]);
}
