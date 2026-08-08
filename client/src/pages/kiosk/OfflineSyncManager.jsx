import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import React, { useEffect, useState } from 'react';
import { useKioskStore } from '../../store/useKioskStore';
import { toast } from 'sonner';

export default function OfflineSyncManager() {
  const { offlineQueue, kioskToken, clearOfflineQueue, setSession } = useKioskStore();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      if (offlineQueue.length === 0 || !kioskToken || isSyncing) return;
      
      setIsSyncing(true);
      toast.info(`Syncing ${offlineQueue.length} offline attendance records...`);
      
      let successCount = 0;
      let failedQueue = [];

      for (const action of offlineQueue) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${kioskToken}` }
          };
          
          // Try to execute the API call
          const res = await api('/api' + action.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${kioskToken}`
            },
            body: JSON.stringify({
              ...action.payload,
              offlineTimestamp: action.timestamp
            })
          });

          if (!res.data) {
            const errorData = res.data.catch(() => ({}));
            const error = new Error(errorData.message || 'API request failed');
            error.response = { status: res.status, data: errorData };
            throw error;
          }
          
          successCount++;
        } catch (error) {
          console.error('Offline Sync Error:', error);
          // If unauthorized (token expired), we can't sync the rest either
          if (error.response?.status === 401 || error.response?.status === 403) {
            toast.error('Kiosk Session expired. Unable to sync some records.');
            failedQueue = [...failedQueue, action, ...offlineQueue.slice(successCount + 1)];
            break;
          }
          // If it was a bad request (e.g., already checked in), we might want to just discard or log it.
          // For now, we'll discard it so it doesn't block the queue.
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully synced ${successCount} records.`);
      }

      if (failedQueue.length === 0) {
        clearOfflineQueue();
      } else {
        // We'd ideally need a specific store method to set the queue to failedQueue
        useKioskStore.setState({ offlineQueue: failedQueue });
      }

      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);

    // Initial check just in case we started online with queued items
    if (navigator.onLine && offlineQueue.length > 0) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [offlineQueue, kioskToken, isSyncing, clearOfflineQueue]);

  return null; // This is a logic-only component
}
