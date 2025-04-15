import { LoginResponseModel } from "../data/models/LoginResponse";

export const mapLoginModelToEntity = (data: LoginResponseModel): string => {
    const {token} = data;
    return token;
};