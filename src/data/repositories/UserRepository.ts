// src/data/repositories/UserRepository.ts
import { IUserRepository } from "../../domain/interfaces/IUserRepository";
import { AxiosInstance, AxiosResponse } from "axios";
import User from "../../domain/entities/User";

/**
 * Repositorio para manejo de datos de usuario autenticado.
 * Implementa métodos para interactuar con la API.
 */
export class UserRepository extends IUserRepository {
  /**
   * Construye el repositorio inyectando la instancia de Axios.
   * @param api Instancia de Axios preconfigurada con interceptors.
   */
  constructor(api: AxiosInstance) {
    super(api);
  }

  /**
   * @inheritdoc
   */
  async getUser(): Promise<User> {
    console.log("[UserRepository.getUser] Iniciando petición de datos de usuario");
    const response: AxiosResponse<User> = await this.api.get<User>(
      "/Users/user-information"
    );
    this.ensureSuccessStatus(response);
    console.log(
      "[UserRepository.getUser] Datos recibidos:",
      response.data
    );
    return response.data;
  }

  /**
   * Verifica que la respuesta HTTP tenga status 200.
   * @param response Respuesta de Axios
   * @throws {Error} Si el status no es 200.
   */
  private ensureSuccessStatus(response: AxiosResponse<any>): void {
    if (response.status !== 200) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  }
}