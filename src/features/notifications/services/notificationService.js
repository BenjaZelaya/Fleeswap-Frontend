import api from '../../../services/api';

export async function getNotifications(params = {}) {
  const { data } = await api.get('/notifications', { params });
  return data;
}

export async function markAsRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await api.patch('/notifications/read-all');
  return data;
}
