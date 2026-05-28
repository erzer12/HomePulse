import { create } from 'zustand';

interface NotificationState {
  scheduledIds: string[];
  setScheduledIds: (ids: string[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  scheduledIds: [],
  setScheduledIds: (ids) => set({ scheduledIds: ids }),
}));
