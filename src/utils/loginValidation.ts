export const validateLoginFields = (email: string, password: string): string | null => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return 'El correo electrónico es obligatorio';
    }
  
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return 'Correo electrónico inválido';
    }
  
    if (!password) {
      return 'La contraseña es obligatoria';
    }
  
    return null;
  };
  