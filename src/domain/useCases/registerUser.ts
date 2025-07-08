export default async function registerUser(authRepository, userData) {
    try {
      const user = await authRepository.register(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }  