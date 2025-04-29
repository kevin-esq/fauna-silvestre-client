// src/domain/interfaces/IUserRepository.ts
import { AxiosInstance } from "axios";
import User from "../entities/User";

/**
 * Interfaz (clase abstracta) para repositorio de usuarios.
 * Define el contrato para obtener datos de usuario autenticado.
 */
export abstract class IUserRepository {
  /**
   * Instancia de Axios para realizar llamadas HTTP.
   */
  protected readonly api: AxiosInstance;

  /**
   * Constructor de repositorio de usuario.
   * @param api Instancia de Axios para peticiones.
   */
  constructor(api: AxiosInstance) {
    this.api = api;
  }

  /**
   * Obtiene la información del usuario autenticado.
   * @returns {Promise<User>} Datos del usuario.
   */
  abstract getUser(): Promise<User>;
}