export const ERROR_TRANSLATIONS = {
  'invalid credentials': 'Credenciales inválidas. Verifica tus datos.',
  'the username is incorrect': 'El usuario ingresado no existe.',
  'the password is incorrect': 'La contraseña es incorrecta.',
  'username is incorrect': 'El usuario no existe.',
  'password is incorrect': 'La contraseña es incorrecta.',
  'invalid username or password': 'Usuario o contraseña incorrectos.',
  'incorrect username or password': 'Usuario o contraseña incorrectos.',
  'wrong password': 'La contraseña es incorrecta.',
  'wrong username': 'El usuario no existe.',
  'the user has been blocked, please contact support.':
    'El usuario ha sido bloqueado. Por favor, contacta a soporte.',
  'user has been blocked':
    'El usuario ha sido bloqueado. Contacta a soporte o administrador.',
  'account blocked':
    'La cuenta ha sido bloqueada. Contacta a soporte o administrador.',

  'user not found': 'Usuario no encontrado.',
  'user does not exist': 'El usuario no existe.',
  'email not found': 'El correo electrónico no está registrado.',
  'the email is not registered': 'El correo no está registrado.',
  'email is not registered': 'El correo no está registrado.',

  'account is disabled': 'La cuenta está deshabilitada.',
  'account locked': 'La cuenta está bloqueada.',
  'account suspended': 'La cuenta está suspendida.',
  'account not verified': 'La cuenta no está verificada.',
  'email not verified': 'El correo electrónico no está verificado.',

  'email already exists': 'El correo ya está registrado.',
  'username already exists': 'El nombre de usuario ya está registrado.',
  'this email is already registered': 'El correo ya está registrado.',
  'this username is already registered':
    'El nombre de usuario ya está registrado.',
  'failed: this email is already registered': 'El correo ya está registrado.',
  'failed: this username is already registered':
    'El nombre de usuario ya está registrado.',
  'username taken': 'El nombre de usuario ya está en uso.',
  'email taken': 'El correo ya está en uso.',

  'validation error': 'Error de validación. Verifica los datos.',
  'invalid email': 'El correo electrónico no es válido.',
  'invalid email format': 'El formato del correo no es válido.',
  'invalid password': 'La contraseña no es válida.',
  'password too short': 'La contraseña es demasiado corta.',
  'password too weak': 'La contraseña es demasiado débil.',
  'passwords do not match': 'Las contraseñas no coinciden.',
  'invalid username': 'El nombre de usuario no es válido.',
  'username too short': 'El nombre de usuario es demasiado corto.',
  'username and password are required': 'Usuario y contraseña son requeridos.',
  'email is required': 'El correo electrónico es requerido.',

  'token expired': 'La sesión ha expirado. Inicia sesión nuevamente.',
  'invalid token': 'Token inválido. Inicia sesión nuevamente.',
  'token invalid': 'Token inválido. Inicia sesión nuevamente.',
  'token not found': 'Token no encontrado.',
  'refresh token expired': 'La sesión ha expirado. Inicia sesión nuevamente.',
  'invalid refresh token': 'Sesión inválida. Inicia sesión nuevamente.',
  'session expired': 'La sesión ha expirado. Inicia sesión nuevamente.',
  'invalid response: missing tokens':
    'Error de autenticación. Intenta nuevamente.',

  'invalid code': 'El código ingresado no es válido.',
  'code expired': 'El código ha expirado. Solicita uno nuevo.',
  'invalid or expired code': 'Código inválido o expirado.',
  'invalid verification response: missing token':
    'Error en la verificación. Intenta nuevamente.',

  'network error': 'Error de conexión. Verifica tu internet.',
  'network request failed': 'Error de conexión. Verifica tu internet.',
  'no internet connection': 'Sin conexión a internet.',
  'request timeout': 'Tiempo de espera agotado. Intenta nuevamente.',
  timeout: 'Tiempo de espera agotado.',
  'connection timeout': 'Tiempo de conexión agotado.',
  'no response': 'Sin respuesta del servidor.',
  'no response from server': 'Sin respuesta del servidor.',

  'server error': 'Error del servidor. Intenta más tarde.',
  'internal server error': 'Error interno del servidor. Intenta más tarde.',
  'service unavailable': 'Servicio no disponible. Intenta más tarde.',
  'backend error': 'Error del servidor. Intenta más tarde.',
  'database error': 'Error en la base de datos. Intenta más tarde.',

  'too many login attempts':
    'Demasiados intentos de inicio de sesión. Intenta más tarde.',
  'too many requests': 'Demasiadas solicitudes. Intenta más tarde.',
  'account temporarily locked': 'Cuenta bloqueada temporalmente por seguridad.',
  'suspicious activity detected': 'Actividad sospechosa detectada.',

  unauthorized: 'No autorizado. Inicia sesión nuevamente.',
  'access denied': 'Acceso denegado.',
  forbidden: 'Operación no permitida.',
  'permission denied': 'Permiso denegado.',

  'failed to load user data': 'Error al cargar datos del usuario.',
  'failed to load user data from storage': 'Error al cargar datos guardados.',
  'invalid stored user data format': 'Formato de datos inválido.',
  'no access token available': 'Token de acceso no disponible.',
  'refresh token is required': 'Token de actualización requerido.'
} as const;

export const ERROR_KEYWORDS = {
  username: ['username', 'usuario', 'user name', 'user'],
  password: ['password', 'contraseña', 'pwd'],
  email: ['email', 'correo', 'mail', 'e-mail'],
  token: ['token', 'jwt', 'bearer'],
  network: ['network', 'connection', 'timeout', 'inet'],
  server: ['server', 'backend', '500', '503', 'internal'],
  validation: ['validation', 'invalid', 'required', 'format'],
  registration: ['register', 'registro', 'signup', 'sign up'],
  exists: ['already', 'exists', 'taken', 'duplicate'],
  blocked: ['blocked', 'bloqueado', 'suspended', 'disabled', 'locked']
} as const;

export const GENERIC_ERROR_MESSAGES = {
  authentication: 'Error de autenticación. Verifica tus credenciales.',
  network: 'Error de conexión. Verifica tu internet.',
  server: 'Error del servidor. Intenta más tarde.',
  validation: 'Error de validación. Verifica los datos ingresados.',
  unknown: 'Ha ocurrido un error. Intenta nuevamente.'
} as const;

export const AUTH_CONTEXT_ERRORS = {
  SIGN_IN: 'Error al iniciar sesión',
  SIGN_OUT: 'Error al cerrar sesión',
  REGISTRATION: 'Error al registrar usuario',
  RESET_EMAIL: 'Error al enviar código de recuperación',
  RESET_CODE: 'Código inválido o expirado',
  RESET_PASSWORD: 'Error al cambiar contraseña',
  LOAD_USER: 'Error al cargar datos del usuario',
  INITIALIZATION: 'Error al inicializar la aplicación'
} as const;
