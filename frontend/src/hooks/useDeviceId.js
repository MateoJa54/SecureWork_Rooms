import { useMemo } from 'react';
import { getDeviceId } from '../services/device.service.js';

export function useDeviceId() {
  return useMemo(() => getDeviceId(), []);
}
