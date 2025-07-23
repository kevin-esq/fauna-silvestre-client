import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Location from 'react-native-get-location';
import Geocoding from 'react-native-geocoding';
import { request, PERMISSIONS } from 'react-native-permissions';

interface LocationInfo { city: string; country: string; }

export function useLocationInfo(apiKey: string | undefined) {
  const [info, setInfo] = useState<LocationInfo>({ city: '', country: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiKey) return;
    (async () => {
      setLoading(true);
      try {
        const perm = Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        if ((await request(perm)) !== 'granted') throw new Error('Ubicación denegada');

        const loc = await Location.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
        Geocoding.init(apiKey);
        const res = await Geocoding.from(loc.latitude, loc.longitude);
        const comp = res.results?.[0]?.address_components || [];
        const city = comp.find(c => c.types.includes('locality'))?.long_name ?? 'N/A';
        const country = comp.find(c => c.types.includes('country'))?.long_name ?? 'N/A';
        setInfo({ city, country });
      } catch {
        setInfo({ city: 'Ubicación no disponible', country: '' });
      } finally {
        setLoading(false);
      }
    })();
  }, [apiKey]);

  return { ...info, loading };
}