import { useEffect, useState, useCallback, useRef } from 'react';
import Location from 'react-native-get-location';
import { useRequestPermissions } from './use-request-permissions.hook';

interface LocationInfo {
  city: string;
  state: string;
  country: string;
}

interface UseLocationInfoResult extends LocationInfo {
  loading: boolean;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'FaunaSilvestre/1.0 (fauna-silvestre-client)' }
  });
  if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
  const data = await res.json();
  const addr = data.address ?? {};

  const city = addr.city || addr.town || addr.village || addr.hamlet || 'N/A';

  const country = addr.country || 'N/A';

  const state = addr.state || addr.region || 'N/A';

  return { city, state, country };
}

export function useLocationInfo(): UseLocationInfoResult {
  const [info, setInfo] = useState<LocationInfo>({
    city: '',
    state: '',
    country: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const { requestAlertPermissions, checkPermissions } = useRequestPermissions();
  const didRequestRef = useRef(false);

  const fetchLocationInfo = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { missingPermissions } = await checkPermissions(['location']);

      if (missingPermissions.includes('location')) {
        const granted = await requestAlertPermissions(['location']);
        if (!granted) throw new Error('Permisos de ubicación no concedidos');
      }

      const loc = await Location.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15_000
      });
      const result = await reverseGeocode(loc.latitude, loc.longitude);
      setInfo(result);
    } catch (err) {
      console.error('Error al obtener ubicación:', err);
      setInfo({
        city: 'Ubicación no disponible',
        state: 'Ubicación no disponible',
        country: 'Ubicación no disponible'
      });
    } finally {
      setLoading(false);
    }
  }, [checkPermissions, requestAlertPermissions]);

  useEffect(() => {
    if (didRequestRef.current) return;
    didRequestRef.current = true;
    void fetchLocationInfo();
  }, [fetchLocationInfo]);

  return { ...info, loading };
}
