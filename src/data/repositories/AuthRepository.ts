import IAuthRepository from '../../domain/interfaces/IAuthRepository';
import axios, { AxiosInstance } from 'axios';
import User from '../../domain/entities/User';
import { mapUserModelToEntity } from '../../mappers/UserMapper';

interface Credentials {
  username: string;
  password: string;
}

interface UserData {
  name: string;
  email: string;
  password: string;
}

export default class AuthRepository extends IAuthRepository {
  private api: AxiosInstance;

  constructor() {
    super();
    this.api = axios.create({
      baseURL: 'https://api.tuapp.com',
      timeout: 10000,
    });
  }

  async login(credentials: Credentials): Promise<User> {
    const response = await this.api.post('/login', credentials);
    return mapUserModelToEntity(response.data);
  }

  async register(userData: UserData): Promise<User> {
    const response = await this.api.post('/register', userData);
    return mapUserModelToEntity(response.data);
  }

  async forgotPassword(email: string): Promise<any> {
    const response = await this.api.post('/forgot-password', { email });
    return response.data;
  }
}
