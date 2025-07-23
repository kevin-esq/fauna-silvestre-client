import { useEffect, useState } from 'react';
import moment from 'moment';

export function useCurrentTime() {
  const [time, setTime] = useState(moment().format('h:mm A'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(moment().format('h:mm A'));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return time;
}