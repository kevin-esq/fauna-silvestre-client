import { RegisterFields } from '../../domain/types/RegisterFields';

export const validateRegisterFields = (fields: RegisterFields): string | null => {
  const {
    username, name, lastName, location, alternativeLocation,
    gender, age, email, password, confirmPassword
  } = fields;

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) return 'El nombre de usuario debe ser alfanumérico y menor a 20 caracteres';

  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,20}$/;
  if (!nameRegex.test(name)) return 'El nombre debe contener solo letras y máximo 20 caracteres';
  if (!nameRegex.test(lastName)) return 'El apellido debe contener solo letras y máximo 20 caracteres';

  if (!location.trim()) return 'La ubicación es obligatoria';
  if (alternativeLocation.length > 30) return 'La ubicación alternativa debe tener menos de 30 caracteres';

  if (!gender.trim()) return 'El género es obligatorio';

  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) return 'La edad debe estar entre 18 y 65';

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) return 'Correo electrónico inválido';
  if (email.length > 50) return 'El correo debe tener menos de 50 caracteres';

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  if (!passwordRegex.test(password)) return 'Contraseña inválida: minimo 8 caracteres, debe incluir letras y números';

  if (password !== confirmPassword) return 'Las contraseñas no coinciden';

  return null;
};