export interface UserModel {
  id: string;
  name: string;
  userName: string;
  email: string;
  locality: string;
  role: 'Admin' | 'User';
  avatarUrl: string;
}

export const getAllUsers = (): UserModel[] => [
  {
    id: '1',
    name: 'Kevin Esquivel',
    userName: 'kevin03',
    email: 'kevin@email.com',
    locality: 'San José',
    role: 'Admin',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: '2',
    name: 'Laura Jiménez',
    userName: 'lauraj',
    email: 'laura@email.com',
    locality: 'Alajuela',
    role: 'Admin',
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: '3',
    name: 'Carlos Pérez',
    userName: 'cperez',
    email: 'carlos@email.com',
    locality: 'Cartago',
    role: 'User',
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: '4',
    name: 'Andrea Torres',
    userName: 'andrea_t',
    email: 'andrea@email.com',
    locality: 'Heredia',
    role: 'User',
    avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
  }
];
