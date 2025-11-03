import { useState } from 'react';
import moment from 'moment';
import { useInterval } from '../utils/use-interval.hook';

export function useCurrentTime() {
  const [time, setTime] = useState(moment().format('h:mm A'));

  // Auto-start interval to update time every minute
  useInterval(() => {
    setTime(moment().format('h:mm A'));
  }, 60000, true);

  return time;
}
