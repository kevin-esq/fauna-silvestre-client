export type IconLibrary = 'ionicons' | 'material' | 'fontawesome5';

export interface ContactMethod {
  id: string;
  label: string;
  value: string;
  icon: string;
  iconLibrary: IconLibrary;
  color: string;
  url: (value: string, customMessage?: string) => string;
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
    url: (phone, customMessage) => {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        customMessage || 'Hola, necesito ayuda con la aplicación'
      );
      return `https://wa.me/${cleanPhone}?text=${message}`;
    },
    errorMessage: 'No se pudo abrir WhatsApp'
  },
  {
    id: 'email',
    label: 'Email Developers',
    value: 'mayasurtelecommunications@gmail.com',
    icon: 'mail-outline',
    iconLibrary: 'ionicons',
    color: '#007A33',
    url: (email, customMessage) => {
      const subject = encodeURIComponent('Soporte App');
      const body = customMessage ? encodeURIComponent(customMessage) : '';
      return `mailto:${email}?subject=${subject}${body ? `&body=${body}` : ''}`;
    },
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

export const createUnblockRequestMessage = (userData: {
  userName: string;
  name: string;
  lastName: string;
  email: string;
}): string => {
  return `Hola, necesito ayuda para desbloquear la siguiente cuenta:

👤 Usuario: ${userData.userName}
📧 Email: ${userData.email}
🏷️ Nombre: ${userData.name} ${userData.lastName}

Por favor, ayúdenme a resolver esta situación.`;
};

export const createDeletePublicationMessage = (
  publicationData: {
    recordId: number;
    commonNoun: string;
    userName?: string;
    createdDate?: string;
    status: string;
  },
  isAdmin: boolean,
  reason?: string
): string => {
  const baseInfo = `📋 ID de Registro: ${publicationData.recordId}
🐾 Animal: ${publicationData.commonNoun}
👤 Usuario: ${publicationData.userName || 'No especificado'}
📅 Fecha: ${publicationData.createdDate || 'No disponible'}
📊 Estado: ${publicationData.status}`;

  if (isAdmin) {
    return `🔴 ORDEN DE ELIMINACIÓN - PRIORIDAD ALTA

${baseInfo}

⚠️ Como administrador, solicito la eliminación inmediata de esta publicación.

${reason ? `📝 Motivo: ${reason}` : ''}

Por favor, proceder con la eliminación lo antes posible.`;
  } else {
    return `Hola, quisiera solicitar la eliminación de la siguiente publicación:

${baseInfo}

${reason ? `📝 Motivo de la solicitud:\n${reason}` : '📝 Motivo: No especificado'}

¿Sería posible eliminar esta publicación? Agradezco su atención.`;
  }
};

export const createSupportMessage = (
  message: string,
  context?: Record<string, string>
): string => {
  let finalMessage = message;

  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      finalMessage += `\n${key}: ${value}`;
    });
  }

  return finalMessage;
};
