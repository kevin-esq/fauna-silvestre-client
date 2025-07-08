export default async function forgotPassword(authRepository, email) {
    try {
      const result = await authRepository.forgotPassword(email);
      return result;
    } catch (error) {
      throw error;
    }
  }
  