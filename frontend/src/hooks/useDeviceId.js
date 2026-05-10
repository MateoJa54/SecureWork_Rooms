import { useState, useEffect } from 'react';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const STORAGE_KEY = 'swr_device_id';
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}
