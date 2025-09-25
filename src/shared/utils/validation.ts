import { RegisterState } from '../../domain/types/register-state';

export const validateRegisterFields = (
  fields: RegisterState
): string | null => {
  const { name, lastName, gender, age, email, password } = fields;

  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,20}$/;
  if (!nameRegex.test(name))
    return 'El nombre debe contener solo letras y máximo 20 caracteres';
  if (!nameRegex.test(lastName))
    return 'El apellido debe contener solo letras y máximo 20 caracteres';

  if (!gender) return 'El género es obligatorio';

  if (isNaN(parseInt(age)) || parseInt(age) < 18 || parseInt(age) > 65)
    return 'La edad debe estar entre 18 y 65';

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) return 'Correo electrónico inválido';
  if (email.length > 50) return 'El correo debe tener menos de 50 caracteres';

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  if (!passwordRegex.test(password))
    return 'Contraseña inválida: minimo 8 caracteres, debe incluir letras y números';

  return null;
};
