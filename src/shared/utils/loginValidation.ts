export const validateLoginFields = (
  username: string,
  password: string
): string | null => {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    return 'El nombre de usuario es obligatorio';
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(trimmedUsername)) {
    return 'El nombre de usuario incorrecto';
  }

  if (!password) {
    return 'La contraseña es obligatoria';
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  if (!passwordRegex.test(password)) {
    return 'Contraeña Incorrecta';
  }

  return null;
};
