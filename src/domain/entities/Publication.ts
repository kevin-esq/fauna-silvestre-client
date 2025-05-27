export default class Publication {
    id: string
    title: string
    description: string
    imageUrl: string
    date: string
    status: string
    animalStatus: string
    reason?: string
    location: string

    constructor(
        id: string,
        title: string,
        description: string,
        imageUrl: string,
        date: string,
        status: string,
        animalStatus: string,
        location: string,
        reason?: string
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.date = date;
        this.status = status;
        this.animalStatus = animalStatus;
        this.location = location;
        this.reason = reason;
    }
}