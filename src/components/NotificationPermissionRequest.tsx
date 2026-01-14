import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationPermissionRequest = () => {
  const { requestPermissions, permissionGranted } = useNotifications();

  useEffect(() => {
    // Request notification permission on app startup if not already granted
    if (!permissionGranted) {
      const timer = setTimeout(() => {
        requestPermissions();
      }, 1000); // Small delay to let app initialize first
      
      return () => clearTimeout(timer);
    }
  }, [permissionGranted, requestPermissions]);

  return null; // This component doesn't render anything
};
