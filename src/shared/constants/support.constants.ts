export type IconLibrary = 'ionicons' | 'material' | 'fontawesome5';

export interface ContactMethod {
  id: string;
  label: string;
  value: string;
  icon: string;
  iconLibrary: IconLibrary;
  color: string;
  url: (value: string) => string;
  errorMessage: string;
}

export const SUPPORT_CONTACT_METHODS: ContactMethod[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: '+529831374466',
    icon: 'logo-whatsapp',
    iconLibrary: 'ionicons',
    color: '#25D366',
    url: phone => {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        'Hola, necesito ayuda con la aplicación'
      );
      return `https://wa.me/${cleanPhone}?text=${message}`;
    },
    errorMessage: 'No se pudo abrir WhatsApp'
  },
  {
    id: 'email',
    label: 'Email',
    value: 'soporte@fototrampa.com',
    icon: 'mail-outline',
    iconLibrary: 'ionicons',
    color: '#007A33',
    url: email => `mailto:${email}?subject=Soporte App Fauna Silvestre`,
    errorMessage: 'No se pudo abrir el cliente de correo'
  }
];

export const SUPPORT_INFO = {
  workingHours: 'Lunes a Viernes, 8:00 AM - 6:00 PM',
  responseTime: '24-48 horas'
} as const;

export const SUPPORT_MESSAGES = {
  contactTitle: 'Contactar Soporte',
  contactDescription: 'Selecciona un método de contacto:'
} as const;
