import User from '../../domain/entities/User';
import api from '../../services/ApiClient';

export default class UserRepository {
    async getUser(): Promise<User> {
        const response = await api.get(`/Users/user-information`, {
            headers: {
                'Content-Type': 'application/json',
                'bearer': localStorage.getItem('token')
            },
        });
        return response.data;
    }
}