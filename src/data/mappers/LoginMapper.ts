import { LoginResponseModel } from "../models/LoginResponse";

export const mapLoginModelToEntity = (data: LoginResponseModel): string => {
    const {token} = data;
    return token;
};