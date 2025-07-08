export default async function loginUser(authRepository, credentials) {
    try {
      const user = await authRepository.login(credentials);
      return user;
    } catch (error) {
      throw error;
    }
  }
  