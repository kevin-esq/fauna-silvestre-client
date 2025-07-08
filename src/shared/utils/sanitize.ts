import { RegisterState } from '../../domain/types/register-state';

export const sanitizeRegisterFields = (state: RegisterState): RegisterState => ({
  ...state,
  name: state.name.trim(),
  lastName: state.lastName.trim(),
  email: state.email.replace(/\s+/g, ''),
});