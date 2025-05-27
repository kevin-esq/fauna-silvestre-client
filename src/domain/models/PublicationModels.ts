
export interface PublicationData {
    commonNoun: string,
    animalState: number,
    description: string,
    location: string,
    img: string
}

export interface PublicationResponse {
    id: number;
    title: string;
    description: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}