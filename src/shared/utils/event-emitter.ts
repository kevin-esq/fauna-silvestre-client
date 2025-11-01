import { DeviceEventEmitter, EmitterSubscription } from 'react-native';

export const AppEvents = {
  USER_BLOCKED: 'USER_BLOCKED',
  USER_LIST_REFRESH: 'USER_LIST_REFRESH',
  ANIMAL_UPDATED: 'ANIMAL_UPDATED',
  ANIMAL_DELETED: 'ANIMAL_DELETED',
  CATALOG_REFRESH: 'CATALOG_REFRESH'
} as const;

export type AppEventType = (typeof AppEvents)[keyof typeof AppEvents];

export const emitEvent = (eventName: AppEventType, data?: unknown) => {
  DeviceEventEmitter.emit(eventName, data);
};

export const addEventListener = (
  eventName: AppEventType,
  callback: (data?: unknown) => void
): EmitterSubscription => {
  return DeviceEventEmitter.addListener(eventName, callback);
};
