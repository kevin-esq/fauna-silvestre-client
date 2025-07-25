
export interface PublicationData {
    commonNoun: string,
    animalState: number,
    description: string,
    location: string,
    img: string
}

export interface PublicationResponse {
    recordId: number;
    commonNoun: string;
    animalState: string;
    description: string;
    img: string;
    location: string;
}

export interface CountsResponse {
    users: number;
    records: number;
}

export type PublicationStatus = 'rejected' | 'pending' | 'accepted';

export interface PublicationsModel {
    recordId: number;
    commonNoun: string;
    animalState: string;
    description: string;
    img: string;
    location: string;
    status: PublicationStatus;
}