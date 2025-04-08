import { RegisterState } from '../types/RegisterState';

export const sanitizeRegisterFields = (state: RegisterState): RegisterState => ({
  ...state,
  username: state.username.replace(/\s+/g, ''),
  name: state.name.trim(),
  lastName: state.lastName.trim(),
  email: state.email.replace(/\s+/g, ''),
});