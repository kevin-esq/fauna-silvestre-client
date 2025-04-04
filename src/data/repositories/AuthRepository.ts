import IAuthRepository from '../../domain/interfaces/IAuthRepository';
import axios from 'axios';
import User from '../../domain/entities/User';

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
    private api: any;

  constructor() {
    super();
    this.api = axios.create({
      baseURL: 'https://api.tuapp.com',
    });
  }

  async login(credentials: Credentials) {
    const response = await this.api.post('/login', credentials);
    const { id, name, email, token } = response.data;
    return new User(id, name, email, token);
  }

  async register(userData: UserData) {
    const response = await this.api.post('/register', userData);
    const { id, name, email, token } = response.data;
    return new User(id, name, email, token);
  }

  async forgotPassword(email: string) {
    const response = await this.api.post('/forgot-password', { email });
    return response.data;
  }
}
