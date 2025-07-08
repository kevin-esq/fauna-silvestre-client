export default class Animal {
    id: string;
    commonName: string;
    scientificName: string;
    species: string;
    habitat: string;
    description: string;
    diet: string;
    conservationStatus: string;
    height: string;
    weight: string;
    lifespan: string;
    location: string;
    activity: string;
    reproduction: string;
    behavior: string;
    image: string;

    constructor(
        id: string,
        commonName: string,
        scientificName: string,
        species: string,
        habitat: string,
        description: string,
        diet: string,
        conservationStatus: string,
        height: string,
        weight: string,
        lifespan: string,
        location: string,
        activity: string,
        reproduction: string,
        behavior: string,
        image: string
    ) {
        this.id = id;
        this.commonName = commonName;
        this.scientificName = scientificName;
        this.species = species;
        this.habitat = habitat;
        this.description = description;
        this.diet = diet;
        this.conservationStatus = conservationStatus;
        this.height = height;
        this.weight = weight;
        this.lifespan = lifespan;
        this.location = location;
        this.activity = activity;
        this.reproduction = reproduction;
        this.behavior = behavior;
        this.image = image;
    }
}