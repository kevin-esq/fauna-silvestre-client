export interface UserModel {
  id: string;
  name: string;
  userName: string;
  email: string;
  locality: string;
  role: 'admin' | 'moderator' | 'user';
  avatarUrl: string;
}

export const getDashboardStats = (role: string | undefined) => {
  if (role === 'admin') {
    return {
      published: Math.floor(Math.random() * 100),
      pending: Math.floor(Math.random() * 50)
    };
  }
  return {
    published: Math.floor(Math.random() * 10),
    pending: Math.floor(Math.random() * 5)
  };
};

export const getAllAnimals = () => [
  {
    id: '1',
    commonName: 'Jaguar',
    englishName: 'Jaguar',
    scientificName: 'Panthera onca',
    species: 'Mammalia / Carnivora / Felidae',
    status: 'En peligro',
    statusColor: '#e74c3c',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/e9/Jaguar_%28Panthera_onca_palustris%29_female_Piquiri_River_2.JPG',
    description:
      'El jaguar es un gran felino nativo de América. Es el tercero más grande del mundo y tiene una de las mordidas más poderosas del reino animal.',
    habitat: 'Selvas tropicales, bosques húmedos, sabanas',
    diet: 'Carnívoro: ciervos, capibaras, tapires, peces, reptiles',
    averageHeight: '70-80 cm',
    averageWeight: '56-96 kg (puede llegar a 120 kg)',
    lifespan: '12-15 años en libertad',
    distribution: 'América Central y del Sur, especialmente la Amazonía',
    activity: 'Principalmente nocturno',
    reproduction:
      'Gestación de 90-110 días, nacen de 1 a 4 crías, que permanecen con la madre hasta los 2 años',
    behavior:
      'Solitario, territorial, excelente nadador y muy sigiloso para cazar'
  },
  {
    id: '2',
    commonName: 'Tucán Pico Arcoíris',
    englishName: 'Keel-billed Toucan',
    scientificName: 'Ramphastos sulfuratus',
    species: 'Aves / Piciformes / Ramphastidae',
    status: 'Preocupación menor',
    statusColor: '#27ae60',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/f/f6/Keel-billed_Toucan_%2816201157519%29.jpg',
    description:
      'El tucán pico arcoíris es una de las aves más coloridas del trópico. Su enorme pico no es pesado y le permite alcanzar frutas en ramas pequeñas.',
    habitat: 'Bosques húmedos tropicales y subtropicales',
    diet: 'Frutas, insectos, huevos, pequeños reptiles y anfibios',
    averageHeight: '50-60 cm',
    averageWeight: '400-500 g',
    lifespan: '15-20 años',
    distribution: 'Desde el sur de México hasta Colombia y Venezuela',
    activity: 'Diurno',
    reproduction:
      'Ponen de 2 a 4 huevos en cavidades de árboles, incuban por ~18 días',
    behavior:
      'Social, viven en pequeños grupos, vocalizan con sonidos graves y roncos'
  }
];

export const getAllUsers = (): UserModel[] => [
  {
    id: '1',
    name: 'Kevin Esquivel',
    userName: 'kevin03',
    email: 'kevin@email.com',
    locality: 'San José',
    role: 'admin',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '2',
    name: 'Laura Jiménez',
    userName: 'lauraj',
    email: 'laura@email.com',
    locality: 'Alajuela',
    role: 'moderator',
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: '3',
    name: 'Carlos Pérez',
    userName: 'cperez',
    email: 'carlos@email.com',
    locality: 'Cartago',
    role: 'user',
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: '4',
    name: 'Andrea Torres',
    userName: 'andrea_t',
    email: 'andrea@email.com',
    locality: 'Heredia',
    role: 'user',
    avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
  }
];
