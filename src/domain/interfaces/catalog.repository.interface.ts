import Animal from "../entities/animal.entity";

export interface ICatalogRepository {
    getAllCatalogs(page: number, size: number): Promise<Animal[]>;
    getCatalogByCommonName(commonName: string): Promise<Animal>;
    createCatalog(animal: Animal): Promise<Animal>;
    updateCatalog(id: string, animal: Animal): Promise<Animal>;
    deleteCatalog(id: string): Promise<void>;
}
