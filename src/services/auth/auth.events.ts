import mitt from 'mitt';

export const authEventEmitter = mitt();

export enum AuthEvents {
  USER_SIGNED_IN = 'user_signed_in',
  USER_SIGNED_OUT = 'user_signed_out',
}