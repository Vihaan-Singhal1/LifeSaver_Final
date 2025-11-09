import { useEffect, useState } from 'react';

export type GeolocationPermissionState = PermissionState | 'unsupported';

export function useGeolocationPermission() {
  const [state, setState] = useState<GeolocationPermissionState>(() => {
    if (typeof navigator === 'undefined') {
      return 'unsupported';
    }

    return 'permissions' in navigator ? 'prompt' : 'unsupported';
  });

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
      setState('unsupported');
      return;
    }

    let isActive = true;
    let permissionStatus: PermissionStatus | null = null;

    const handleChange = () => {
      if (permissionStatus) {
        setState(permissionStatus.state);
      }
    };

    navigator.permissions
      .query({ name: 'geolocation' })
      .then(status => {
        if (!isActive) {
          return;
        }
        permissionStatus = status;
        setState(status.state);
        status.addEventListener('change', handleChange);
      })
      .catch(() => {
        if (isActive) {
          setState('unsupported');
        }
      });

    return () => {
      isActive = false;
      permissionStatus?.removeEventListener('change', handleChange);
    };
  }, []);

  return state;
}

